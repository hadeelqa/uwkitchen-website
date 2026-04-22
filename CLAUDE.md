# UW Kitchens Website (مطابخ الأبيض المتحدة)

Production site: **uwkitchens.com**
GitHub: **github.com/hadeelqa/uwkitchen-website**
Netlify production: `master` branch
Netlify deploy preview: `preview` branch (PR #1) → `deploy-preview-1--uwkitchen.netlify.app`

Static site. Arabic RTL. No build step. HTML + CSS + vanilla JS. Firebase CMS loader on top.

---

## 1. Branches — read before touching anything

| Branch | What it is | Deploys to |
|---|---|---|
| `master` | Production. **Stale**, behind preview by many commits. | uwkitchens.com |
| `preview` | Client-approved content. **Current source of truth.** | deploy-preview-1--uwkitchen.netlify.app |
| `netlify-snapshot-2026-04-22` | Frozen backup of preview at the point the client approved it | (not deployed, safety net) |

### Tags
- `netlify-live-2026-04-22` — permanent reference to the commit that was live on Netlify when the client signed off on the current content.

### Open PRs
- **PR #1**: `preview` → `master`. Do NOT merge without client confirmation; merging will flip production to the preview content.

### Rule
> **`preview` is the truth.** Treat it like production. Never force-push to it. Never reset it without creating a new safety tag first.

---

## 2. Local development

### Start the preview server
```
python -m claude_preview_start uwkitchen-preview
```
Or via the Claude Preview MCP: `preview_start name=uwkitchen-preview`.
Serves on **http://localhost:8090**.

Config: `.claude/launch.json` uses `python` + `ThreadingHTTPServer` with an **absolute path** to `public/` (the path has spaces, which break `-d public` via CLI args — that is why the config uses `os.chdir` inside a `python -c` script).

### Why not `-d public`?
The Windows user path is `C:\Users\hadee\Downloads\UWKitchen Website\public`. Spaces break `-d` arg parsing in Python's http.server when launched through the MCP spawner. Keep the `os.chdir(r'…')` pattern.

### Single source of launch config
There must be **one** `launch.json` only: `.claude/launch.json` in the repo root. Do NOT recreate per-worktree configs — duplicate configs caused the server to serve the wrong branch on 2026-04-21.

### Git worktrees
Do not use worktrees for this project. They silently duplicate `.claude/launch.json` and cause the local server to serve stale content. If you need an isolated working copy, clone into a sibling folder instead.

---

## 3. File structure

```
UWKitchen Website/
├── public/                       ← deployed folder
│   ├── index.html                ← home
│   ├── maintenance-request.html  ← served at /support
│   ├── maintenance-request.js
│   ├── admin.html                ← CMS editor
│   ├── styles.css                ← single stylesheet
│   ├── scripts.js                ← home-page interactions
│   ├── cms-loader.js             ← Firebase CMS content loader
│   ├── images/                   ← static images
│   ├── Videos/                   ← .mp4 assets
│   ├── Cladding Photos/
│   ├── partner-logos/
│   ├── customer-reviews/
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/                      ← build helpers (og-card generator, etc.)
├── firebase.json                 ← legacy Firebase Hosting config
├── firestore.rules               ← CMS data read/write rules
├── storage.rules                 ← media upload rules
├── netlify.toml                  ← active Netlify config (mirrors firebase.json)
└── CLAUDE.md                     ← this file
```

### Routes (see `netlify.toml`)
- `/` → `index.html`
- `/ar`, `/ar/` → `index.html` (200 rewrite)
- `/support`, `/support/` → `maintenance-request.html`
- `/home`, `/index.html`, `/maintenance-request`, `/ar/maintenance-request` → 301 to canonical

### Cache headers
- Images, fonts, videos, svg: immutable, 1 year
- CSS, JS: 1 hour, must-revalidate
- HTML: must-revalidate every request

---

## 4. Design system

Tokens live in `public/styles.css` under `:root`. Never hardcode raw values in components.

### Core colors
| Token | Value | Used for |
|---|---|---|
| `--gold` / primary accent | `#d4884a` | buttons, highlights, seal, badge rings |
| brand burgundy | `#461642` | theme-color, gradients |
| `--bg-primary` / `--bg-dark` / `--white` (legacy alias) | `#0e040d` | page background (dark theme) |
| hero promise green | `#63b3a5` | the green warranty card icon in the hero only |

### Type scale and spacing
- Body font: **IBM Plex Sans Arabic** (400/500/600/700) via Google Fonts
- Spacing grid: **8pt** — use 4, 8, 12, 16, 24, 32, 40, 48, 64. Do not invent `13px`, `17px`, etc.
- One container width per section: `--container-max` / `--content-max`
- Single stylesheet is `public/styles.css` — do not create `styles-v2.css` or `styles-admin.css`

### Reuse-first rule
Shared across every page: announcement bar, nav, footer, WhatsApp FAB, scroll-to-top, lightbox. When adding a new page, copy these verbatim from `index.html`. Never fork (`nav2`, `footer-cs`). Load `scripts.js` on every page or the shared components die.

### Instant-rejection list
- More than one Primary button per section
- Different container widths between sections on the same page
- Duplicate components (`Button2`, `CardAlt`, `HeroNew`)
- Font sizes or spacing off the type/8pt scale
- `!important` / inline values / raw hex codes in components
- `letter-spacing` on Arabic text (breaks connected script)
- Em dashes `—` anywhere (copy, commits, code comments)

---

## 5. Content & brand voice

- **Language:** Arabic (RTL). The site's user-facing content is Arabic.
- **Dates:** Gregorian only (ميلادي). No Hijri, no Hindi digits (`١٢٣`).
- **No em dashes.** Use `،` in Arabic, `.` or `(parentheses)` in English.
- **Version/cache-bust:** bump `?v=NNN` on `styles.css` and `scripts.js` when you ship a change so returning visitors fetch fresh assets. Current: `styles.css?v=64`, `scripts.js` unversioned.

---

## 6. Common operations

### Verify local == Netlify preview
```bash
curl -s http://localhost:8090/ | grep -E "marquee-item|warranty-section" | head -3
```
Should return the current announce bar text ("خصم 1,500 ريال باستخدام كوبون UW30") and `warranty-section` (not `warranty-compact`).

### Ship a content change to Netlify preview
1. Commit on `preview`
2. `git push origin preview`
3. Netlify rebuilds `deploy-preview-1` in ~30s

### Ship to production
1. Merge PR #1 (`preview` → `master`) via GitHub UI after client sign-off
2. Netlify rebuilds `uwkitchens.com` from `master`

### Snapshot before a risky change
```bash
git tag -a snapshot-before-X origin/preview -m "Before X"
git push origin snapshot-before-X
```
Then work. If something breaks, `git reset --hard snapshot-before-X`.

---

## 7. Known gotchas

- **Arabic folder/file names** exist in `public/images/april21changes/` (client-supplied assets: شعارات الشراكات, فيديو وصورة ستيكر الضمان 15 سنة, مصنعنا.mp4). Quote paths and expect UTF-8 in git output.
- **`.claude/settings.local.json`** has accumulated ~120 allow entries over time. Project-level `.claude/settings.json` is the clean shared copy — prefer that when adding new permissions.
- **Netlify injects an analytics `<script>`** into served HTML (`/.netlify/scripts/cdp`). That is not in source; ignore when diffing.
- **Firebase CMS** writes to `/cms` collection. The admin UI is `public/admin.html` (auth-gated). The loader is `public/cms-loader.js` — runs on every page load and fetches content.
- **Cloudinary** hosts the heavy videos (Live.mp4, Taking Notes). Uploads go through the preset `uwkitchen_uploads` on account `dbj4aba8i`.

---

## 8. Priorities when in doubt

1. **Do not break the Netlify preview** — the client is reviewing it.
2. **Match the design system** — consistency over creativity.
3. **Reuse** before rebuilding.
4. **Ask** before merging to `master`.
