#!/usr/bin/env python3
"""
sync-defaults-to-firestore.py
=============================
Mirror public/cms-defaults.js into the Firestore `content/*` documents that
cms-loader.js reads on page load.

Why this exists
---------------
The site has TWO content sources:
  1. public/cms-defaults.js  - canonical, lives in the repo, edited by code
  2. Firestore `content/*`   - mutable, edited by the client via admin.html

cms-loader.js reads Firestore FIRST and only falls back to defaults when a
section's items array is empty. So if Firestore holds an old value for the
hero section, editing the code alone won't update the live site.

This script pushes any (or all) sections from cms-defaults.js into Firestore
so both stores match. After running it, the live site reflects the code.

Architecture (in case it confuses anyone reading later)
-------------------------------------------------------
  cms-defaults.js  (window.CMS_DEFAULTS = {...})   the source of truth
        |
        | Node.js parses the JS file and emits JSON
        v
  Python receives JSON, walks each top-level section
        |
        | firebase_admin SDK with a service account key
        v
  Firestore collection `content`  (one document per section)

Setup (one-time)
----------------
  1. Place service account JSON at:    .secrets/firebase-admin.json
     (download from Firebase Console > Project Settings > Service accounts)
  2. .secrets/ is already in .gitignore so the key never reaches GitHub.
  3. pip install firebase-admin

Usage
-----
  python scripts/sync-defaults-to-firestore.py                  # all sections
  python scripts/sync-defaults-to-firestore.py --section hero   # one section
  python scripts/sync-defaults-to-firestore.py --dry-run        # preview only
  python scripts/sync-defaults-to-firestore.py --diff           # show changes
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

# Force UTF-8 output (Windows default cp1252 chokes on Arabic)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).resolve().parent.parent
CMS_DEFAULTS_FILE = REPO_ROOT / 'public' / 'cms-defaults.js'
SERVICE_ACCOUNT_FILE = REPO_ROOT / '.secrets' / 'firebase-admin.json'
COLLECTION_NAME = 'content'  # matches cms-loader.js: db.collection('content')


def parse_cms_defaults():
    """Use Node.js to evaluate cms-defaults.js and emit its CMS_DEFAULTS as JSON.

    cms-defaults.js sets `window.CMS_DEFAULTS = {...}`, so we shim `window`
    inside Node and print JSON.stringify of the result. Node parses the JS
    natively which avoids fragile regex hacks for comments, trailing commas,
    single quotes, etc.
    """
    if not CMS_DEFAULTS_FILE.exists():
        sys.exit(f'ERROR: {CMS_DEFAULTS_FILE} not found')

    node_script = f'''
        const path = {json.dumps(str(CMS_DEFAULTS_FILE))};
        const fs = require('fs');
        const src = fs.readFileSync(path, 'utf8');
        const window = {{}};
        // Run cms-defaults.js so window.CMS_DEFAULTS is populated.
        // eslint-disable-next-line no-new-func
        new Function('window', src)(window);
        process.stdout.write(JSON.stringify(window.CMS_DEFAULTS, null, 2));
    '''
    try:
        out = subprocess.run(
            ['node', '-e', node_script],
            capture_output=True, text=True, encoding='utf-8', check=True
        )
    except subprocess.CalledProcessError as e:
        sys.exit(f'ERROR running Node to parse cms-defaults.js:\n{e.stderr}')
    except FileNotFoundError:
        sys.exit('ERROR: node not found on PATH. Install Node.js.')

    try:
        return json.loads(out.stdout)
    except json.JSONDecodeError as e:
        sys.exit(f'ERROR: Node produced non-JSON output:\n{out.stdout}\n\n{e}')


def init_firestore():
    """Authenticate using the service account key and return a Firestore client."""
    if not SERVICE_ACCOUNT_FILE.exists():
        sys.exit(
            f'ERROR: service account key not found at {SERVICE_ACCOUNT_FILE}\n'
            f'Download from Firebase Console > Project Settings > Service accounts.'
        )

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        sys.exit('ERROR: firebase-admin not installed. Run: pip install firebase-admin')

    if not firebase_admin._apps:
        cred = credentials.Certificate(str(SERVICE_ACCOUNT_FILE))
        firebase_admin.initialize_app(cred)
    return firestore.client()


def fetch_existing(db, section):
    doc = db.collection(COLLECTION_NAME).document(section).get()
    return doc.to_dict() if doc.exists else None


# Bookkeeping fields written by both admin.html and this script.
# Excluded from the diff display because they always change.
INTERNAL_FIELDS = {'updatedAt', 'syncedFromCode', 'createdAt'}


def diff_dicts(old, new, prefix=''):
    """Yield human-readable diff lines between two nested dicts/lists.
    Skips internal bookkeeping fields (updatedAt etc) at the top level."""
    if old == new:
        return
    if type(old) is not type(new):
        yield f'  {prefix}: {old!r}  ->  {new!r}'
        return
    if isinstance(new, dict):
        keys = set((old or {}).keys()) | set(new.keys())
        if not prefix:  # top level: filter bookkeeping
            keys = {k for k in keys if k not in INTERNAL_FIELDS}
        for k in sorted(keys):
            yield from diff_dicts((old or {}).get(k), new.get(k), f'{prefix}.{k}' if prefix else k)
    elif isinstance(new, list):
        if len(old or []) != len(new):
            yield f'  {prefix}: list length {len(old or [])}  ->  {len(new)}'
        for i, (a, b) in enumerate(zip(old or [], new)):
            yield from diff_dicts(a, b, f'{prefix}[{i}]')
    else:
        yield f'  {prefix}: {old!r}  ->  {new!r}'


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--section', help='Sync a single section (e.g. hero). Default: all sections.')
    parser.add_argument('--dry-run', action='store_true', help='Show what would change without writing.')
    parser.add_argument('--diff', action='store_true', help='Show field-level diff before writing.')
    args = parser.parse_args()

    print('Reading cms-defaults.js via Node...')
    defaults = parse_cms_defaults()
    print(f'  found {len(defaults)} sections: {", ".join(sorted(defaults.keys()))}')
    print()

    if args.section:
        if args.section not in defaults:
            sys.exit(f'ERROR: section "{args.section}" not in cms-defaults.js')
        sections = {args.section: defaults[args.section]}
    else:
        sections = defaults

    if not args.dry_run:
        print('Connecting to Firestore...')
        db = init_firestore()
        print(f'  project: {db.project}')
        print()
        from firebase_admin import firestore as _fs
        SERVER_TS = _fs.SERVER_TIMESTAMP

    for name, value in sections.items():
        print(f'[{name}]')
        if args.dry_run or args.diff:
            old = fetch_existing(db, name) if not args.dry_run else None
            if args.dry_run:
                print('  (dry-run) would write the following payload:')
                print('  ' + json.dumps(value, ensure_ascii=False, indent=2).replace('\n', '\n  ')[:500])
                print()
                continue
            if old is None:
                print('  no existing document - will create')
            else:
                changes = list(diff_dicts(old, value))
                if not changes:
                    print('  no changes (already in sync)')
                    print()
                    continue
                print(f'  {len(changes)} field(s) changing:')
                for line in changes[:20]:
                    print(line)
                if len(changes) > 20:
                    print(f'  ... and {len(changes) - 20} more')
        # Add updatedAt to match what admin.html writes (admin & code stay
        # consistent in the document shape).  Also add syncedFromCode so we
        # can tell at a glance which document was last touched by this script
        # vs. by the client through admin.html.
        payload = dict(value)
        payload['updatedAt'] = SERVER_TS
        payload['syncedFromCode'] = SERVER_TS
        db.collection(COLLECTION_NAME).document(name).set(payload)
        print('  written.')
        print()

    if args.dry_run:
        print('Dry run complete - no writes performed.')
    else:
        print('Sync complete. cms-loader.js will read these on the next page load.')


if __name__ == '__main__':
    main()
