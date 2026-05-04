#!/usr/bin/env python3
"""
Find image files in public/ that are not referenced anywhere in the
project's source files (HTML, JS, CSS, TOML, JSON, MD).

Run from repo root:
  python3 scripts/audit-orphan-images.py
"""
import os
import sys
from collections import defaultdict
from pathlib import Path

# Force UTF-8 output (Windows default cp1252 chokes on Arabic filenames)
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PUBLIC = Path('public')
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'}
SOURCE_EXTS = {'.html', '.js', '.css', '.toml', '.json', '.md'}

# 1. find all image files on disk
all_images = set()
for root, dirs, files in os.walk(PUBLIC):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        if Path(f).suffix.lower() in IMAGE_EXTS:
            rel = os.path.relpath(os.path.join(root, f), PUBLIC)
            rel = rel.replace(os.sep, '/')
            all_images.add(rel)

# 2. collect all source files (public/ + repo root)
search_files = []
for root, dirs, files in os.walk(PUBLIC):
    dirs[:] = [d for d in dirs if not d.startswith('.')]
    for f in files:
        if Path(f).suffix.lower() in SOURCE_EXTS:
            search_files.append(os.path.join(root, f))
for f in os.listdir('.'):
    if Path(f).suffix.lower() in SOURCE_EXTS and os.path.isfile(f):
        search_files.append(f)

# 3. read corpus
corpus = []
for fp in search_files:
    try:
        with open(fp, 'r', encoding='utf-8') as fh:
            corpus.append(fh.read())
    except Exception:
        pass
big = '\n'.join(corpus)

# 4. classify
orphans = []
for img in sorted(all_images):
    basename = os.path.basename(img)
    enc = img.replace(' ', '%20')
    if (img in big) or (basename in big) or (enc in big):
        continue
    orphans.append(img)

# 5. report
by_folder = defaultdict(list)
for o in orphans:
    folder = os.path.dirname(o) or '(root)'
    by_folder[folder].append(o)

total_orphan_size = 0
for o in orphans:
    try:
        total_orphan_size += os.path.getsize(PUBLIC / o)
    except Exception:
        pass

print(f"images on disk: {len(all_images)}")
print(f"source files scanned: {len(search_files)}")
print(f"orphans: {len(orphans)} ({len(orphans)*100//max(1,len(all_images))}%)")
print(f"total orphan size: {total_orphan_size//1024} KB ({total_orphan_size/1024/1024:.1f} MB)")
print()
print("=== orphans by folder ===")
for folder in sorted(by_folder):
    files = by_folder[folder]
    folder_size = 0
    for f in files:
        try:
            folder_size += os.path.getsize(PUBLIC / f)
        except Exception:
            pass
    print(f"\n{folder}/  ({len(files)} files, {folder_size//1024} KB)")
    for f in sorted(files)[:15]:
        try:
            size = os.path.getsize(PUBLIC / f) // 1024
        except Exception:
            size = 0
        print(f"  - {os.path.basename(f)}  ({size} KB)")
    if len(files) > 15:
        print(f"  ... and {len(files)-15} more")
