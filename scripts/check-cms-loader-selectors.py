#!/usr/bin/env python3
"""
check-cms-loader-selectors.py
=============================
Static check: every CSS selector / element id referenced by cms-loader.js
still exists in public/index.html.

Why this exists
---------------
cms-loader.js patches the live DOM with content from Firestore.  When the
HTML structure is refactored (renamed class, removed section, restructured
markup) the corresponding selector in cms-loader silently stops matching
anything and the patch is a no-op.  The user sees stale defaults from the
HTML and never gets an error in the console.  This has happened multiple
times on this project.

This script catches that drift before deploy.

How it works
------------
1. Parse cms-loader.js as text.  Extract every literal argument passed to:
       document.querySelector('...')
       document.querySelectorAll('...')
       document.getElementById('...')
2. Read public/index.html with BeautifulSoup.
3. For each selector, run it against the parsed HTML.  Pass = >=1 match.
4. Print a summary table.  Exit 0 if all pass, 1 if any fail (so this can
   gate CI later).

Limitations
-----------
- Skips selectors built dynamically (string concat, template literals,
  variables).  Those are listed at the end as "skipped" so a human can
  eyeball them.
- Doesn't catch selectors used in scripts other than cms-loader.js.
  Run manually on scripts.js if needed.
- BS4's CSS selector engine is close to but not identical to a browser's.
  Common selectors (.class, #id, tag, descendants) work fine.

Usage
-----
  python scripts/check-cms-loader-selectors.py

  # exit code is non-zero if anything is broken, suitable for CI:
  python scripts/check-cms-loader-selectors.py || echo "FAILED"
"""
import re
import sys
from pathlib import Path

# Force UTF-8 output (Windows default cp1252 chokes on Arabic)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

REPO_ROOT = Path(__file__).resolve().parent.parent
CMS_LOADER = REPO_ROOT / 'public' / 'cms-loader.js'
INDEX_HTML = REPO_ROOT / 'public' / 'index.html'


def extract_selectors(js_source):
    """Pull literal-string arguments out of querySelector/querySelectorAll/
    getElementById calls.  Returns:
        - list of (kind, selector, line_number) for literal selectors
        - list of (kind, snippet, line_number) for non-literal selectors
          (built from variables, template literals, etc) which we can't
          check statically.
    """
    literals = []
    dynamic = []

    # We match on each line so we can report the line number, and so a
    # broken regex on one call doesn't sink the whole scan.
    for lineno, line in enumerate(js_source.splitlines(), start=1):
        # Find every querySelector / querySelectorAll / getElementById call.
        # The captured group is everything between the parens.
        for m in re.finditer(
            r'\.(querySelector|querySelectorAll|getElementById)\s*\(([^)]*)\)',
            line
        ):
            kind = m.group(1)
            arg = m.group(2).strip()
            lit = re.match(r"""^(?P<q>['"])(?P<s>.*)(?P=q)$""", arg)
            if lit:
                literals.append((kind, lit.group('s'), lineno))
            else:
                dynamic.append((kind, arg, lineno))

        # Also catch setText('selector', value) - it's the local helper
        # that wraps querySelector + textContent assignment.  Selector is
        # the first argument before the first comma.
        for m in re.finditer(r'\bsetText\s*\(([^)]*)\)', line):
            args = m.group(1).strip()
            # First arg up to the first top-level comma
            first = args.split(',', 1)[0].strip()
            lit = re.match(r"""^(?P<q>['"])(?P<s>.*)(?P=q)$""", first)
            if lit:
                literals.append(('setText', lit.group('s'), lineno))
            else:
                dynamic.append(('setText', first, lineno))

    return literals, dynamic


def check(html_path, selectors):
    """Return list of (kind, selector, line, matches, status) tuples."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html_path.read_text(encoding='utf-8'), 'html.parser')
    results = []
    for kind, sel, line in selectors:
        try:
            if kind == 'getElementById':
                el = soup.find(id=sel)
                count = 1 if el else 0
            else:
                # querySelector, querySelectorAll, setText - all use CSS
                # selector syntax; bs4's .select() returns a list.
                els = soup.select(sel)
                count = len(els)
        except Exception as e:
            results.append((kind, sel, line, 0, f'ERROR: {e}'))
            continue
        if count == 0:
            status = 'MISSING'
        elif kind == 'querySelector' and count > 1:
            status = f'OK ({count} matches; first is used)'
        else:
            status = 'OK'
        results.append((kind, sel, line, count, status))
    return results


def main():
    if not CMS_LOADER.exists():
        sys.exit(f'ERROR: {CMS_LOADER} not found')
    if not INDEX_HTML.exists():
        sys.exit(f'ERROR: {INDEX_HTML} not found')

    print(f'Scanning: {CMS_LOADER.relative_to(REPO_ROOT)}')
    print(f'Against:  {INDEX_HTML.relative_to(REPO_ROOT)}')
    print()

    literals, dynamic = extract_selectors(CMS_LOADER.read_text(encoding='utf-8'))
    print(f'Found {len(literals)} literal selectors, {len(dynamic)} dynamic.')
    print()

    results = check(INDEX_HTML, literals)

    # Sort: failures first, then by line number
    results.sort(key=lambda r: (r[4].startswith('OK'), r[2]))

    fails = [r for r in results if not r[4].startswith('OK')]
    passes = [r for r in results if r[4].startswith('OK')]

    if fails:
        print('=== FAILING SELECTORS ===')
        print(f'{"line":>4}  {"kind":18s}  {"selector":40s}  status')
        print('-' * 90)
        for kind, sel, line, count, status in fails:
            print(f'{line:>4}  {kind:18s}  {sel[:40]:40s}  {status}')
        print()

    print(f'=== PASSING ({len(passes)}/{len(results)}) ===')
    for kind, sel, line, count, status in passes:
        print(f'{line:>4}  {kind:18s}  {sel[:40]:40s}  {status}')
    print()

    if dynamic:
        print('=== DYNAMIC SELECTORS (skipped, eyeball these) ===')
        for kind, snippet, line in dynamic:
            print(f'  line {line}: {kind}({snippet})')
        print()

    print(f'Summary: {len(passes)} pass / {len(fails)} fail / {len(dynamic)} dynamic-skipped')

    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
