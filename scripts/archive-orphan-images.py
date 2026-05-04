#!/usr/bin/env python3
"""
Move orphan image files (those not referenced anywhere in the project)
from public/ to _source/orphans-YYYY-MM-DD/, preserving folder structure.

`_source/` is in `.gitignore`, so this effectively removes the files
from the deployed site while keeping a local backup.

Run from repo root:
  python3 scripts/archive-orphan-images.py            # dry-run, prints plan
  python3 scripts/archive-orphan-images.py --execute  # actually moves
"""
import os
import sys
import shutil
from collections import defaultdict
from datetime import datetime
from pathlib import Path

# Force UTF-8 output (Windows default cp1252 chokes on Arabic filenames)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PUBLIC = Path('public')
PARTNER_LOGOS = Path('partner-logos')  # also at repo root, separate scan
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'}
SOURCE_EXTS = {'.html', '.js', '.css', '.toml', '.json', '.md', '.py'}

DATE = datetime.now().strftime('%Y-%m-%d')
ARCHIVE_ROOT = Path('_source') / f'orphans-{DATE}'

EXECUTE = '--execute' in sys.argv

# 1. find all image files on disk (under public/ AND partner-logos/)
all_images = []  # list of (path-from-repo-root, key-for-lookup)
for base in [PUBLIC, PARTNER_LOGOS]:
    if not base.exists():
        continue
    for root, dirs, files in os.walk(base):
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        for f in files:
            if Path(f).suffix.lower() in IMAGE_EXTS:
                full = Path(root) / f
                all_images.append(full)

# 2. corpus of source file contents
search_files = []
for base in ['.', PUBLIC]:
    base_path = Path(base)
    if not base_path.exists():
        continue
    for root, dirs, files in os.walk(base_path):
        dirs[:] = [d for d in dirs if not (d.startswith('.') or d == '_source' or d == 'node_modules')]
        for f in files:
            if Path(f).suffix.lower() in SOURCE_EXTS:
                fp = Path(root) / f
                if fp not in search_files:
                    search_files.append(fp)

corpus_parts = []
for fp in search_files:
    try:
        with open(fp, 'r', encoding='utf-8') as fh:
            corpus_parts.append(fh.read())
    except Exception:
        pass
big = '\n'.join(corpus_parts)

# 3. classify
orphans = []
for img_path in all_images:
    # check by basename (covers most refs)
    basename = img_path.name
    # also try the path-from-public
    try:
        rel_to_public = img_path.relative_to(PUBLIC).as_posix()
    except ValueError:
        rel_to_public = None
    enc_basename = basename.replace(' ', '%20')

    found = (basename in big) or (enc_basename in big)
    if not found and rel_to_public:
        if rel_to_public in big or rel_to_public.replace(' ', '%20') in big:
            found = True
    if not found:
        orphans.append(img_path)

# 4. plan
total_size = sum(o.stat().st_size for o in orphans)
print(f"images on disk:       {len(all_images)}")
print(f"orphans:              {len(orphans)} ({len(orphans)*100//max(1,len(all_images))}%)")
print(f"total orphan size:    {total_size//1024} KB ({total_size/1024/1024:.1f} MB)")
print(f"archive destination:  {ARCHIVE_ROOT}/")
print()

if not EXECUTE:
    print("DRY RUN — no files moved. Re-run with --execute to perform the move.")
    print()
    by_folder = defaultdict(int)
    by_folder_size = defaultdict(int)
    for o in orphans:
        folder = str(o.parent)
        by_folder[folder] += 1
        by_folder_size[folder] += o.stat().st_size
    print("=== plan: files-to-move per folder ===")
    for folder in sorted(by_folder):
        print(f"  {by_folder[folder]:4d} files  {by_folder_size[folder]//1024:6d} KB   {folder}/")
    sys.exit(0)

# 5. execute
moved = 0
errors = 0
for src in orphans:
    # Compute destination path under archive root, preserving structure from repo root
    dest = ARCHIVE_ROOT / src
    dest.parent.mkdir(parents=True, exist_ok=True)
    try:
        shutil.move(str(src), str(dest))
        moved += 1
    except Exception as e:
        print(f"  FAIL  {src}: {e}")
        errors += 1

print(f"\nmoved: {moved}")
print(f"errors: {errors}")
print(f"\nNext: git status to review, then commit the deletions.")
print("(_source/ is gitignored, so the archive folder is local-only.)")
