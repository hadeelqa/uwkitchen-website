#!/usr/bin/env python3
"""
audit-unused-css.py
===================
Find CSS classes defined in styles.css that aren't referenced anywhere
in the project's HTML, JS, or other source files.

Why this exists
---------------
styles.css has accumulated rules over many design iterations. Without
a check, dead CSS lingers forever, slowing first paint and confusing
maintainers.  This audit highlights candidates for deletion.

Approach
--------
1. Parse styles.css and pull every class selector (.foo, .foo:hover,
   .foo .bar, etc.).  Strip pseudo-classes, attribute selectors, and
   combinators down to the bare class names.
2. Build a corpus of every HTML/JS/MD file in public/ + repo root.
3. For each class, check if it's referenced anywhere in the corpus
   as a string literal.  Pass = >=1 hit.
4. Report classes with 0 hits as "potentially unused" (some may be
   added dynamically via concatenation; eyeball before deleting).

Limitations
-----------
- Doesn't follow JS template literals or string concatenation.  A
  class like `'kitchen-item' + suffix` would only flag `kitchen-item`,
  missing the suffix variants.
- Doesn't cross into Firestore-stored content (HTML strings stored
  in Firestore could reference classes).
- Conservative: better to false-positive (report a used class as
  unused) than to delete a class that's actually needed.

Usage
-----
  python scripts/audit-unused-css.py            # full report
  python scripts/audit-unused-css.py --short    # one line per class
"""
import argparse
import os
import re
import sys
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).resolve().parent.parent
CSS_FILE = REPO_ROOT / 'public' / 'styles.css'

SOURCE_EXTS = {'.html', '.js', '.css', '.md', '.json', '.toml', '.py'}
SKIP_DIRS = {'.git', '.claude', '_source', 'node_modules', '.firebase', '.secrets'}


def extract_class_names(css_source):
    """Pull every class name out of a CSS source.

    .foo { ... } -> 'foo'
    .foo .bar { ... } -> 'foo', 'bar'
    .foo:hover, .foo--mod { ... } -> 'foo', 'foo--mod'
    .foo[data-x="y"] { ... } -> 'foo'
    """
    # Strip comments first so we don't match selectors inside them.
    src = re.sub(r'/\*[\s\S]*?\*/', '', css_source)
    # Pull just the selector portion of each rule (before the {).
    selectors = re.findall(r'([^{}]+)\{[^{}]*\}', src)
    classes = set()
    for sel in selectors:
        # Each rule's selector list may be comma-separated.
        for part in sel.split(','):
            # Find every class token.
            for m in re.finditer(r'\.([a-zA-Z_][\w-]*)', part):
                classes.add(m.group(1))
    return classes


def collect_corpus():
    """Read every relevant source file under the repo into a single string."""
    parts = []
    files = []
    for base in [REPO_ROOT / 'public', REPO_ROOT]:
        for root, dirs, fns in os.walk(base):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith('.')]
            for f in fns:
                ext = Path(f).suffix.lower()
                if ext not in SOURCE_EXTS:
                    continue
                # Skip styles.css itself - we don't want a class to be
                # "used" just because it's defined.
                fp = Path(root) / f
                if fp.resolve() == CSS_FILE.resolve():
                    continue
                if fp not in files:
                    files.append(fp)
    for fp in files:
        try:
            parts.append(fp.read_text(encoding='utf-8'))
        except Exception:
            pass
    return '\n'.join(parts), files


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--short', action='store_true', help='One line per class.')
    args = parser.parse_args()

    if not CSS_FILE.exists():
        sys.exit(f'ERROR: {CSS_FILE} not found')

    print(f'Scanning: {CSS_FILE.relative_to(REPO_ROOT)}')
    classes = extract_class_names(CSS_FILE.read_text(encoding='utf-8'))
    print(f'  Found {len(classes)} unique class names.')
    print()

    corpus, files = collect_corpus()
    print(f'Corpus: {len(files)} files, {len(corpus):,} chars')
    print()

    unused = []
    used = []
    for cls in sorted(classes):
        # A class is "used" if it appears in the corpus as:
        #   class="... cls ..."
        #   class="cls"
        #   classList.add('cls'), .toggle('cls'), etc.
        #   className = 'cls'
        # The simple substring check below catches all of these because
        # the class name is distinctive enough.
        if cls in corpus:
            used.append(cls)
        else:
            unused.append(cls)

    print(f'Used:   {len(used):>4} classes')
    print(f'Unused: {len(unused):>4} classes (candidates for deletion)')
    print()

    if not unused:
        print('No unused classes found.')
        return

    if args.short:
        print('=== UNUSED CLASSES ===')
        for cls in unused:
            print(f'  .{cls}')
        return

    print('=== UNUSED CLASSES (review before deleting; some may be dynamic) ===')
    print()
    # Group by likely prefix for easier review
    by_prefix = {}
    for cls in unused:
        prefix = cls.split('-')[0].split('_')[0][:8]
        by_prefix.setdefault(prefix, []).append(cls)
    for prefix in sorted(by_prefix):
        print(f'\n[{prefix}-*]')
        for cls in by_prefix[prefix]:
            print(f'  .{cls}')

    print()
    print(f'Total unused: {len(unused)} of {len(classes)} ({len(unused)*100//len(classes)}%)')
    print()
    print('Next: review the list, manually delete obvious dead rules in')
    print('public/styles.css.  Re-run this script after each batch to')
    print('confirm nothing important got removed (the smoke test plus a')
    print('manual visual check on the live preview is the final gate).')


if __name__ == '__main__':
    main()
