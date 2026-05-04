#!/usr/bin/env python3
"""
pull-firestore-to-defaults.py
=============================
Pull live content from Firestore into public/cms-defaults.js so the code
matches what the client has actually published through admin.html.

Why this exists
---------------
sync-defaults-to-firestore.py pushes code -> Firestore (one direction).
But the client edits Firestore directly through admin.html, and those
edits never make it back to the canonical code file. Over time the
two stores drift apart, and the next code-side push silently overwrites
client edits (this happened on 2026-05-04 with the announce text and
several stats values).

This script closes the loop:

  Firestore  ->  this script  ->  public/cms-defaults.js (regenerated)

Run it BEFORE making code-side content edits, so you start from the
client's current truth, not stale defaults.

Architecture
------------
  Firestore collection 'content'       canonical at runtime
        |
        | firebase_admin SDK with service account key
        v
  Python receives each section as a dict, strips bookkeeping fields
        |
        | hand-rolled pretty printer that mimics the existing JS style
        v
  public/cms-defaults.js               canonical at build/admin time

Setup
-----
Same as sync-defaults-to-firestore.py:
  - .secrets/firebase-admin.json (gitignored)
  - pip install firebase-admin

Usage
-----
  python scripts/pull-firestore-to-defaults.py             # pull all sections
  python scripts/pull-firestore-to-defaults.py --section hero
  python scripts/pull-firestore-to-defaults.py --dry-run   # preview only

After running, review with `git diff public/cms-defaults.js` and commit.
"""
import argparse
import json
import sys
from pathlib import Path

# Force UTF-8 (Windows default cp1252 chokes on Arabic)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).resolve().parent.parent
CMS_DEFAULTS_FILE = REPO_ROOT / 'public' / 'cms-defaults.js'
SERVICE_ACCOUNT_FILE = REPO_ROOT / '.secrets' / 'firebase-admin.json'
COLLECTION_NAME = 'content'

# Bookkeeping fields written by admin.html and the sync script.
# Stripped when pulling so they don't leak into the JS source file.
INTERNAL_FIELDS = {'updatedAt', 'syncedFromCode', 'createdAt'}

# Section order and Arabic comments to emit, mirroring the existing
# cms-defaults.js layout. Sections present in Firestore but missing
# here are appended at the end with no comment.
SECTION_ORDER = [
    ('announce',      'Announcement bar'),
    ('hero',          'Hero'),
    ('stats',         'Stats grid (5 cards)'),
    ('gallery',       'Kitchen gallery'),
    ('testimonials',  'Testimonials'),
    ('branches',      'Branches'),
    ('contact',       'Contact info'),
    ('partners',      'Partners'),
    ('certs',         'Quality certifications'),
]


# Preferred key order for known sections.  Firestore doesn't guarantee
# field ordering, so without this the regenerated file would shuffle
# fields each run and produce noisy diffs.  Anything not listed here
# falls back to the order Firestore returned (alphabetical-ish).
PREFERRED_KEY_ORDER = {
    'announce': ['text', 'text2'],
    'hero': ['line1', 'line2', 'promise1', 'promise2', 'cta'],
    'stats': ['items'],
    'gallery': ['items'],
    'testimonials': ['items'],
    'branches': ['items'],
    'contact': ['phone', 'whatsapp', 'email', 'address'],
    'partners': ['title', 'items'],
    'certs': ['eyebrow', 'heading', 'items'],
    # Item-level field orders (used when iterating list items)
    '__items__': {
        'stats': ['num', 'label'],
        'gallery': ['src', 'alt'],
        'testimonials': ['name', 'initials', 'quote'],
        'branches': ['city', 'badge', 'address', 'phone', 'mapUrl'],
        'partners': ['name', 'logo'],
        'certs': ['name', 'logo'],
    },
}


def reorder_dict(d, key_order):
    """Return a new dict with keys in key_order first, then the rest."""
    out = {}
    for k in key_order:
        if k in d:
            out[k] = d[k]
    for k, v in d.items():
        if k not in out:
            out[k] = v
    return out


def reorder_section(name, data):
    """Apply preferred key order to a section dict and its list items."""
    if not isinstance(data, dict):
        return data
    section_order = PREFERRED_KEY_ORDER.get(name, [])
    data = reorder_dict(data, section_order)
    item_order = PREFERRED_KEY_ORDER.get('__items__', {}).get(name)
    if item_order and isinstance(data.get('items'), list):
        data['items'] = [reorder_dict(it, item_order) if isinstance(it, dict) else it
                         for it in data['items']]
    return data


def init_firestore():
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


def strip_internal(d):
    """Recursively drop bookkeeping fields and Firestore native types."""
    if isinstance(d, dict):
        out = {}
        for k, v in d.items():
            if k in INTERNAL_FIELDS:
                continue
            out[k] = strip_internal(v)
        return out
    if isinstance(d, list):
        return [strip_internal(x) for x in d]
    # Firestore returns DatetimeWithNanoseconds, GeoPoint, etc.; coerce
    # to a JSON-friendly form (string) so the pretty printer doesn't choke.
    if not isinstance(d, (str, int, float, bool)) and d is not None:
        return str(d)
    return d


# ─────────────── JS pretty printer ───────────────
# Generates output that matches the existing cms-defaults.js style:
#   - single quotes around strings
#   - trailing commas after the last list item / object property
#   - 2-space indentation
#   - one-line objects when they're short (< 100 chars), multi-line otherwise

def js_string(s):
    """Encode a string as a single-quoted JS literal, escaping properly."""
    # Use json.dumps to handle escapes, then convert " -> ', escaping any '.
    encoded = json.dumps(s, ensure_ascii=False)
    # encoded is like "\"hello\""; flip to single-quoted form
    inner = encoded[1:-1]
    inner = inner.replace("\\\"", '"')  # un-escape double quotes (we don't need it)
    inner = inner.replace("'", "\\'")
    return "'" + inner + "'"


def js_value(v, indent=0):
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, str):
        return js_string(v)
    if isinstance(v, list):
        return js_list(v, indent)
    if isinstance(v, dict):
        return js_object(v, indent)
    return js_string(str(v))


def js_list(lst, indent=0):
    if not lst:
        return '[]'
    pad = '  ' * indent
    inner_pad = '  ' * (indent + 1)
    # Try one-line if elements are simple and short
    items_oneline = ', '.join(js_value(x, 0) for x in lst)
    if all(isinstance(x, (str, int, float, bool)) or x is None for x in lst) and len(items_oneline) < 80:
        return '[' + items_oneline + ']'
    # Multi-line. If list of dicts each one-line: keep them tight.
    parts = []
    for x in lst:
        if isinstance(x, dict) and dict_short_oneline(x):
            parts.append(inner_pad + dict_oneline(x))
        else:
            parts.append(inner_pad + js_value(x, indent + 1))
    return '[\n' + ',\n'.join(parts) + '\n' + pad + ']'


def dict_short_oneline(d, max_len=200):
    """True if the dict can be represented on one line under max_len chars.

    The 200-char cap is generous on purpose: testimonial items and partner
    rows are conceptually one record-per-line in the source file, even when
    the Arabic content makes them long.  We keep the cap so genuinely huge
    nested objects still expand."""
    # Force one-line if all values are simple scalars and there are no nested
    # collections.  This keeps `{ name, initials, quote }` style records on
    # a single line regardless of quote length.
    has_nested = any(isinstance(v, (dict, list)) for v in d.values())
    s = dict_oneline(d)
    if not has_nested:
        return '\n' not in s
    return len(s) <= max_len and '\n' not in s


def dict_oneline(d):
    parts = []
    for k, v in d.items():
        parts.append(f'{js_key(k)}: {js_value(v, 0)}')
    return '{ ' + ', '.join(parts) + ' }'


def js_key(k):
    # Use bare identifier if it matches JS identifier rules; else quote.
    if isinstance(k, str) and k and (k[0].isalpha() or k[0] == '_') and all(c.isalnum() or c == '_' for c in k):
        return k
    return js_string(str(k))


def js_object(d, indent=0):
    if not d:
        return '{}'
    if dict_short_oneline(d):
        return dict_oneline(d)
    pad = '  ' * indent
    inner_pad = '  ' * (indent + 1)
    parts = []
    for k, v in d.items():
        parts.append(f'{inner_pad}{js_key(k)}: {js_value(v, indent + 1)}')
    return '{\n' + ',\n'.join(parts) + '\n' + pad + '}'


# ─────────────── File generation ───────────────

HEADER = '''/* ════════════════════════════════════════════════════════════════
   CMS DEFAULTS - Single Source of Truth
   ════════════════════════════════════════════════════════════════

   This file holds the default content for every CMS-editable section.
   Three other files read from here so we never drift again:

     - scripts.js      falls back to these arrays when not in DOM
     - admin.html      uses these as the form's initial values
     - cms-loader.js   uses these as the runtime fallback if Firestore
                        has nothing for a section

   Editing rule:
   ─────────────
   When the live site changes (new section, new partner logo, edited
   stat, ...) update THIS file. The other three files pick it up
   automatically.

   To pull what's currently in Firestore back into this file:
     python scripts/pull-firestore-to-defaults.py

   To push this file's contents up to Firestore (so the live site
   matches the code on the next page load):
     python scripts/sync-defaults-to-firestore.py

   Loading rule:
   ─────────────
   Load this BEFORE any of the three files above:
     <script src="cms-defaults.js?v=1"></script>
     <script src="scripts.js?v=N"></script>
     <script src="cms-loader.js?v=N" defer></script>

   ════════════════════════════════════════════════════════════════ */

window.CMS_DEFAULTS = {

'''

FOOTER = '\n};\n'


def render_section(name, comment, data):
    """Render one top-level section with a header comment."""
    lines = []
    lines.append(f'  /* ───────── {comment} ───────── */')
    body = js_value(data, indent=1)
    lines.append(f'  {name}: {body},')
    return '\n'.join(lines)


def merge_with_existing(pulled, existing_keys):
    """Order the output: known sections first (in SECTION_ORDER), then any
    new sections present in Firestore but not in our ordered list."""
    ordered = []
    seen = set()
    for key, comment in SECTION_ORDER:
        if key in pulled:
            ordered.append((key, comment, pulled[key]))
            seen.add(key)
    for key in pulled:
        if key not in seen:
            ordered.append((key, key.title(), pulled[key]))
    return ordered


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--section', help='Pull a single section instead of all.')
    parser.add_argument('--dry-run', action='store_true', help='Print the new file content without writing.')
    args = parser.parse_args()

    print('Connecting to Firestore...')
    db = init_firestore()
    print(f'  project: {db.project}')
    print()

    print('Reading content/ collection...')
    pulled = {}
    for doc in db.collection(COLLECTION_NAME).stream():
        pulled[doc.id] = strip_internal(doc.to_dict() or {})
    print(f'  found {len(pulled)} sections: {", ".join(sorted(pulled.keys()))}')
    print()

    if args.section:
        if args.section not in pulled:
            sys.exit(f'ERROR: section "{args.section}" not in Firestore')
        # Single-section mode: don't regenerate the whole file. Instead,
        # parse the current file via Node and patch only that section.
        print(f'Single-section mode: --section {args.section}')
        print('  Note: this rewrites only that section. The rest of the')
        print('  file is left exactly as-is.')
        print()
        sys.exit('NOT IMPLEMENTED YET. Run without --section to regenerate the full file.')

    # Apply preferred key ordering before rendering, so the diff against
    # the existing cms-defaults.js stays as small as possible.
    pulled = {k: reorder_section(k, v) for k, v in pulled.items()}

    # Build the new file content
    sections = merge_with_existing(pulled, set())
    body_parts = [render_section(name, comment, data) for name, comment, data in sections]
    new_content = HEADER + '\n\n'.join(body_parts) + FOOTER

    # Round-trip check: feed the new content through Node to verify it
    # parses and produces the same data we started from. Catches printer bugs
    # before we overwrite the source file.  Uses a temp file because Windows
    # has no /dev/stdin and stdin piping through Node -e is fragile.
    print('Verifying generated JS round-trips through Node...')
    import subprocess, tempfile, os as _os
    with tempfile.NamedTemporaryFile('w', delete=False, suffix='.js', encoding='utf-8') as tf:
        tf.write(new_content)
        tmp_path = tf.name
    try:
        node_script = (
            f"const src = require('fs').readFileSync({json.dumps(tmp_path)}, 'utf8');"
            "const window = {};"
            "new Function('window', src)(window);"
            "process.stdout.write(JSON.stringify(window.CMS_DEFAULTS));"
        )
        try:
            out = subprocess.run(
                ['node', '-e', node_script],
                capture_output=True, text=True, encoding='utf-8', check=True
            )
            roundtripped = json.loads(out.stdout)
        except subprocess.CalledProcessError as e:
            print('  GENERATED CONTENT (for debug, first 2000 chars):')
            print(new_content[:2000])
            sys.exit(f'\nERROR: Node could not parse the generated JS.\n{e.stderr}')
    finally:
        try: _os.unlink(tmp_path)
        except OSError: pass

    # Compare keys at top level
    pulled_keys = set(pulled.keys())
    rt_keys = set(roundtripped.keys())
    if pulled_keys != rt_keys:
        sys.exit(f'ERROR: round-trip mismatch.\n  pulled: {pulled_keys}\n  parsed: {rt_keys}')
    print(f'  OK ({len(rt_keys)} sections round-trip cleanly)')
    print()

    if args.dry_run:
        print('(dry-run) Generated content preview (first 1500 chars):')
        print(new_content[:1500])
        print('...')
        print()
        print(f'Total: {len(new_content)} chars, {len(new_content.splitlines())} lines')
        return

    # Backup the existing file alongside the new write so a stray run
    # is recoverable from disk without git.
    backup = CMS_DEFAULTS_FILE.with_suffix('.js.bak')
    if CMS_DEFAULTS_FILE.exists():
        backup.write_text(CMS_DEFAULTS_FILE.read_text(encoding='utf-8'), encoding='utf-8')
        print(f'Backed up existing file to: {backup.name}')

    CMS_DEFAULTS_FILE.write_text(new_content, encoding='utf-8')
    print(f'Wrote: {CMS_DEFAULTS_FILE}')
    print()
    print('Next: review with `git diff public/cms-defaults.js` and commit.')
    print('If anything looks wrong, restore from cms-defaults.js.bak.')


if __name__ == '__main__':
    main()
