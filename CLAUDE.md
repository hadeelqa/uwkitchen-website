# UW Kitchens Website (مطابخ الأبيض المتحدة)

Production site: **uwkitchens.com**
GitHub: **github.com/hadeelqa/uwkitchen-website** (private)
Netlify production: `master` branch
Netlify deploy preview: opens on every PR (`deploy-preview-N--uwkitchen.netlify.app`)

Static site. Arabic RTL. No build step. HTML + CSS + vanilla JS. Firebase CMS loader on top.

---

## 1. Branches

| Branch | Role | Deploys to |
|---|---|---|
| `master` | Production. **Current source of truth for what's live.** | uwkitchens.com |
| `preview` | Working branch where new commits land before review. | (per-PR deploy preview when a PR is open) |

### Recent safety tags
We tag master before each merge so any deploy can be rolled back fast. Most recent:
- `snapshot-pre-PR9-2026-05-05`
- `snapshot-pre-PR8-2026-05-05`
- `snapshot-pre-PR7-2026-05-05`

To roll master back: `git reset --hard <tag>` then force-push (only with explicit user consent).

### Rule
> **Master is what the visitor sees.** Push work to `preview`, open a PR, review on the deploy-preview URL, then merge.
> Never force-push to `preview` or `master`. Never merge a PR without confirming the deploy-preview looks right.

---

## 2. Local development

The repo is a static site, so any HTTP server pointing at `public/` works.

### Recommended: Claude Preview MCP (if available)
```
preview_start name=uwkitchen-preview
```
Serves on **http://localhost:8090**. Config at `.claude/launch.json` uses Python's `ThreadingHTTPServer` with an absolute path (`os.chdir(...)`) because the user path has spaces.

### Fallback: any static server
```bash
cd public && python -m http.server 8090
# or
cd public && npx serve .
```

### Don't use git worktrees
They duplicate `.claude/launch.json` and cause the local server to serve stale content. Clone into a sibling folder if you need an isolated copy.

---

## 3. File structure

```
UWKitchen Website/
├── public/                          ← deployed folder
│   ├── index.html                   ← home
│   ├── maintenance-request.html     ← served at /support
│   ├── maintenance-request.js
│   ├── admin.html                   ← CMS editor (Firebase Auth gated)
│   ├── styles.css                   ← single stylesheet
│   ├── scripts.js                   ← home-page interactions
│   ├── cms-loader.js                ← Firebase content patcher
│   ├── cms-defaults.js              ← canonical CMS content
│   ├── images/                      ← static images
│   ├── Videos/                      ← .mp4 assets (also via Cloudinary)
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/                         ← Python helpers
│   ├── sync-defaults-to-firestore.py    ← code -> Firestore
│   ├── pull-firestore-to-defaults.py    ← Firestore -> code
│   ├── check-cms-loader-selectors.py    ← smoke test
│   ├── audit-unused-css.py              ← CSS dead-code finder
│   ├── audit-orphan-images.py           ← image audit
│   ├── archive-orphan-images.py
│   └── generate-og-card.py
├── tests/admin.spec.js              ← Playwright E2E
├── .github/workflows/
│   ├── sync-cms-defaults.yml        ← auto-sync CMS on push
│   ├── lighthouse.yml               ← perf check on PRs
│   ├── firebase-hosting-merge.yml
│   └── firebase-hosting-pull-request.yml
├── .secrets/                        ← gitignored, holds firebase-admin.json
├── netlify.toml                     ← active hosting config
├── firestore.rules                  ← CMS data rules
├── storage.rules                    ← media upload rules
├── package.json                     ← npm scripts
├── playwright.config.js
├── lighthouserc.json                ← Lighthouse CI thresholds
├── README.md                        ← human-readable handover doc
├── ADMIN-GUIDE.md                   ← Arabic user guide for admin panel
├── CONVENTIONS.md                   ← design system rules
└── CLAUDE.md                        ← this file
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

### Core color tokens
| Token | Value | Used for |
|---|---|---|
| `--gold` | `#d4884a` | primary accent, buttons, highlights |
| `--gold-hover`, `--gold-dark` | brand variants | button states |
| `--gold-bright`, `--gold-deep`, `--gold-warm`, `--gold-shimmer` | `#f3c58a`, `#b5773e`, `#e8b275`, `#f5c97e` | warranty seal accents, hero gradient |
| `--purple` (burgundy) | `#461642` | theme-color, gradients |
| `--bg-primary`, `--bg-dark`, `--white` (legacy alias) | `#0e040d` | page background |
| `--bg-secondary`, `--bg-section-alt` | `#160b15`, `#130a12` | section variants |
| `--text-on-dark` | `#fff` | foreground text/icons on dark bg |
| `--black-pure` | `#000` | pure black for specific contrast needs |
| `--green-success` | `#22c55e` | form success, pulse-dot |
| `--red-error`, `--red-live` | `#ef4444` | form errors, live pulse |
| `--text-main`, `--text-sub`, `--text-muted` | text shades | body content hierarchy |

> **Naming gotcha:** `--white` is an alias for the brand's dark background (`#0e040d`). Use `--text-on-dark` when you actually need `#fff`.

### Type scale and spacing
- Body font: **IBM Plex Sans Arabic** (400/500/600/700) via Google Fonts
- Spacing grid: **8pt** (4, 8, 12, 16, 24, 32, 40, 48, 64). Do not invent `13px`, `17px`.
- One container width per page: `--content-max` (1200px)
- Single stylesheet is `public/styles.css`. Do not create `styles-v2.css` or `styles-admin.css`.

### Touch targets (WCAG 2.5.5)
Interactive elements should be ≥44×44 px. When the visible control must be smaller (e.g. `.cladding-dot` 8x8, `.file-delete` 26x26), extend the tap area with an invisible `::before` overlay:
```css
.tiny-button::before{content:'';position:absolute;inset:-18px;border-radius:50%}
```

### Reuse-first rule
Shared across every page: announcement bar, nav, footer, WhatsApp FAB, scroll-to-top, lightbox. When adding a new page, copy these verbatim from `index.html`. Never fork (`nav2`, `footer-cs`). Load `scripts.js` on every page or the shared components die.

### Instant-rejection list
- More than one Primary button per section
- Different container widths between sections on the same page
- Duplicate components (`Button2`, `CardAlt`, `HeroNew`)
- Font sizes or spacing off the type/8pt scale
- `!important` / inline values / raw hex codes in components (use tokens)
- `letter-spacing` on Arabic text (breaks connected script)
- Em dashes `—` anywhere (copy, commits, code comments)
- Sub-44px tap targets without an invisible hit-area extension

---

## 5. Content & brand voice

- **Language:** Arabic (RTL). The site's user-facing content is Arabic.
- **Dates:** Gregorian only (ميلادي). No Hijri, no Hindi digits (`١٢٣`).
- **No em dashes.** Use `،` in Arabic, `.` or `(parentheses)` in English.
- **Cache-bust:** bump `?v=NN` on `styles.css` and `scripts.js` on every visual change. Current: `styles.css?v=96`, `scripts.js?v=35`. Bump in BOTH `index.html` and `maintenance-request.html`.

---

## 6. Common operations

### Verify local matches what's expected
```bash
curl -s http://localhost:8090/ | grep -E "marquee-item" | head -3
```

### Ship a content change to preview branch
1. Commit on `preview`
2. `git push origin preview`
3. Open a PR via `gh pr create` if you need a deploy-preview URL
4. Netlify builds the deploy-preview in ~30-60s

### Ship to production
1. Verify the deploy-preview URL looks right
2. Tag a master snapshot: `git tag -a snapshot-pre-PRn-YYYY-MM-DD origin/master ...`
3. Merge the PR via `gh pr merge N --merge`
4. Netlify rebuilds `uwkitchens.com` from `master` automatically

### Snapshot before a risky change
```bash
git tag -a snapshot-before-X origin/master -m "Before X"
git push origin snapshot-before-X
```
Recovery: `git reset --hard snapshot-before-X` then force-push (with consent).

---

## 7. Known gotchas

- **Arabic folder/file names** exist in `public/images/april21changes/` (شعارات الشراكات, مصنعنا.mp4 etc). Quote paths and expect UTF-8 in git output.
- **`.claude/settings.local.json`** has accumulated ~120 allow entries over time. Project-level `.claude/settings.json` is the clean shared copy.
- **Netlify injects an analytics `<script>`** into served HTML (`/.netlify/scripts/cdp`). That is not in source; ignore when diffing.
- **Firebase CMS** writes to `content/` collection (NOT `cms/`). The admin UI is `public/admin.html` (auth-gated). The loader is `public/cms-loader.js` - runs on every page load, reads Firestore, falls back to `cms-defaults.js` only when a section is empty.
- **Cloudinary** hosts the heavy videos (Live.mp4, factory). Uploads from the maintenance form go through the preset `uwkitchen_uploads` on account `dbj4aba8i`.
- **The `branches` section has special handling.** `index.html` has hand-rolled `.branch-pair` markup with an embedded Google Maps iframe. `cms-loader.js applyBranches()` updates only the text/link fields in place; it must NEVER do `grid.innerHTML = ''` again.

---

## 8. Content edit protocol (MANDATORY)

The site stores CMS content in **two places** that must stay in sync:

1. **Code**: `public/cms-defaults.js` exports `window.CMS_DEFAULTS`. Canonical source, lives in git.
2. **Firestore** `content/<section>` documents. Edited by the client through `admin.html`. Read first by `cms-loader.js`, falling back to `CMS_DEFAULTS` only when empty.

Because Firestore is read first, editing only the code does NOT update the live site if Firestore already holds an older value. Both stores must change together.

### When the user asks Claude to edit any CMS section copy

Claude MUST execute this **Pull → Edit → Sync → Push** sequence before reporting done:

1. **Pull first.** Refresh `cms-defaults.js` with whatever the client edited via admin.html since the last code update:
   ```bash
   python scripts/pull-firestore-to-defaults.py --dry-run
   python scripts/pull-firestore-to-defaults.py
   ```
   If the dry-run shows client edits Claude wasn't aware of, accept them as the new baseline before applying any further changes.

2. **Edit `public/cms-defaults.js`** with the new value on top of the freshly-pulled baseline.

3. **Sync** the change back to Firestore:
   ```bash
   python scripts/sync-defaults-to-firestore.py --section <name> --diff
   python scripts/sync-defaults-to-firestore.py --section <name>
   ```
   Sections: `announce`, `hero`, `stats`, `gallery`, `testimonials`, `branches`, `contact`, `partners`, `certs`.

4. **Push.** Commit `cms-defaults.js` to `preview` and push. The GitHub Action `sync-cms-defaults.yml` re-syncs Firestore automatically on push, but local sync in step 3 is faster for verification.

5. **Confirm** to the user that both code and Firestore hold the new value.

Never edit only one store. Never skip the pull step (that's how the 2026-05-04 announce/stats/testimonials drift happened). Never rely on Netlify rebuild alone for content changes - Firestore wins on read.

### Setup requirements (one-time, already done)

- `.secrets/firebase-admin.json` holds the Firebase service account key. The folder is in `.gitignore`. Never commit, never expose in chat.
- `pip install firebase-admin` provides the SDK.
- Node.js is required because the script uses Node to evaluate `cms-defaults.js`.
- GitHub repo secret `FIREBASE_ADMINSDK_JSON` mirrors the local key for the GitHub Action.

If the local key is missing or expired, the script prints a clear error pointing to Firebase Console > Project Settings > Service accounts > Generate new private key.

### Admin panel and code coexist safely

`admin.html` writes to Firestore via the Firebase client SDK with the user's auth. The sync script writes via the admin SDK with the service account. Both write the same field shape (including `updatedAt: serverTimestamp()`). The sync script also writes `syncedFromCode: serverTimestamp()` so a glance at the doc tells who touched it last.

If the client edits in admin and Claude later edits in code, run sync with `--diff` first to confirm you're not overwriting client work.

---

## 9. Smoke tests (MANDATORY before pushing UI changes)

`cms-loader.js` reaches into the DOM via ~50 CSS selectors and ids. When the HTML structure changes (renamed class, removed section, restructured markup), the corresponding selector silently stops matching anything and the patch becomes a no-op. The user sees stale defaults from the static HTML and never gets a console error. This has happened multiple times on this project.

`scripts/check-cms-loader-selectors.py` catches that drift by parsing every literal selector out of `cms-loader.js` (covers `querySelector`, `querySelectorAll`, `getElementById`, and the local `setText()` helper) and asserting each one matches at least one element in `public/index.html`.

Run before any push that touches `index.html`, `scripts.js`, `cms-loader.js`, or `styles.css`:
```bash
python scripts/check-cms-loader-selectors.py
# or
npm run check:selectors
```

Exit code is 1 on any failure, suitable for CI gating. The script found a real bug on first run (line 284 selector targeting a non-existent `<span>` in the kitchens-tiktok area), proving the value of the check.

### CSS dead-code audit
```bash
python scripts/audit-unused-css.py --short
# or
npm run check:css
```
Flags class names defined in `styles.css` but not referenced anywhere in HTML/JS source. False-positive aware (some classes are toggled via JS string concat, eyeball before deletion).

---

## 10. Documentation map

- **README.md** - human-readable handover doc, covers infra and accounts
- **ADMIN-GUIDE.md** - Arabic guide for the client's admin panel users
- **CONVENTIONS.md** - design system specifics (spacing, typography, layouts)
- **CLAUDE.md** (this file) - operational rules for Claude / AI sessions

---

## 11. Working with the project owner (MANDATORY behavioral protocol)

This section captures how Hadeel and Claude work together on this project. Any AI session (Claude Code, Cursor, ChatGPT, anything else) MUST follow this protocol so the experience stays consistent and safe.

### Communication style
- **Reply in Arabic** when she writes in Arabic. Use the same Saudi/Gulf register she uses ("شوفي / تبين / زين / ضروري"). Don't switch to formal MSA unless she does.
- **Mixed script:** code, file paths, commands, and English technical terms (PR, deploy, commit, branch) stay in English. Arabic prose flows around them.
- **No em dashes (—) ever.** Anywhere. Use `،` or `.` or parentheses. This is a hard brand rule.
- **No Hindi digits (`١٢٣`).** Use Western Arabic numerals (123). Dates Gregorian only.
- **Be transparent about risk.** When proposing a change that could break something, say so up front. Offer the rollback path in the same message.

### The safe-merge pattern (always)
For any user-visible change to the site:

```
1. Edit on `preview` branch locally
2. Run: python scripts/check-cms-loader-selectors.py
3. Commit + push to origin/preview
4. gh pr create --base master --head preview ...
5. Wait for Netlify deploy-preview-N to come up (~30-60s)
6. Send the deploy-preview URL to the user
7. WAIT for explicit confirmation ("زين" / "تمام" / "OK to merge")
8. Tag master snapshot: git tag -a snapshot-pre-PRn-YYYY-MM-DD origin/master
9. gh pr merge N --merge
10. Confirm to user that master is updated
```

**Never skip step 7.** Even small fixes go through deploy-preview review. Small fixes are exactly when bugs slip in unnoticed.

### One change at a time
The user prefers to see audit fixes / refactors land **one at a time**, not all at once. After each fix:
1. Show what changed and why
2. Show the deploy-preview URL
3. Wait for OK
4. Merge
5. Move to the next item

Do NOT batch 5 fixes into one giant PR unless the user explicitly asks for it.

### When in doubt, ask
The user has said this directly: "خاف اشياء تخرب واندم". She would rather pause and verify than ship broken work. Lean toward asking before doing anything that:
- Could change the visual layout in a way she didn't ask for
- Could affect content the client edits via admin
- Is irreversible without git surgery
- Touches secrets, billing, or account ownership
- Makes the repo public or transfers ownership

### Smoke test before every push
```bash
python scripts/check-cms-loader-selectors.py
```
This script catches the single most common silent-failure mode on this project (cms-loader selector drift after HTML rename). Pre-push gating is non-negotiable.

### Tag before merge to master
```bash
git tag -a snapshot-pre-PRn-YYYY-MM-DD origin/master -m "..."
git push origin snapshot-pre-PRn-YYYY-MM-DD
```
Recovery is `git reset --hard <tag>` + force-push (with explicit consent).

### Cache-bust both pages on every visual change
`styles.css?v=NN` and `scripts.js?v=NN` must be bumped in BOTH `index.html` AND `maintenance-request.html` whenever the corresponding file changes. Returning visitors fetch the new file only when the version param differs.

### The Pull → Edit → Sync → Push rule for content
Section 8 covers this in detail. To repeat the headline: never edit `cms-defaults.js` without first running `pull-firestore-to-defaults.py` to absorb any client edits made via admin. Sync back after editing. Both stores must match before pushing.

### Documentation must stay current
If a refactor adds new tokens, scripts, conventions, or workflows, update the relevant doc in the SAME PR:
- New token → mention it in this file's section 4
- New script → list it in section 3 (file structure) and explain its purpose where used
- New workflow → document in section 8 or 9 as appropriate
- New conventions → CONVENTIONS.md
- Anything client-facing → ADMIN-GUIDE.md

A doc that lies (says master is stale when it isn't, names a cache version that doesn't exist) is worse than no doc at all because it makes a future session ship wrong code with confidence.

### Recap: the shortlist of "always do this"

Before any code change:
- ☐ Read CLAUDE.md (this file). It's the operating manual.
- ☐ Pull latest preview branch.
- ☐ For CMS content: pull from Firestore first.

Before any commit:
- ☐ `python scripts/check-cms-loader-selectors.py` passes.

Before any push:
- ☐ Visual change → bump cache versions in both pages.
- ☐ Commit message follows the project style (descriptive, multi-line, mentions /audit category if applicable).

Before any merge to master:
- ☐ Deploy-preview URL shared with the user.
- ☐ User said "OK to merge" (or equivalent in Arabic).
- ☐ Tagged master snapshot.

After merge:
- ☐ Confirm to user that master is updated.
- ☐ Move to the next item on the todo list.

---

## 12. Priorities when in doubt

1. **Do not break what's live.** Master is what visitors see.
2. **Match the design system** - consistency over creativity (CONVENTIONS.md).
3. **Reuse** before rebuilding (CONVENTIONS.md "Reuse-first rule").
4. **Pull before editing CMS content** - section 8.
5. **Both stores in sync** after any CMS content edit - section 8.
6. **Run the selector smoke test** after any HTML/CSS rename - section 9.
7. **Tag master** before merging any PR - section 11.
8. **Open a PR** for review; do not push directly to master.
9. **Ask** before merging anything the user hasn't explicitly approved.
10. **Wait for "OK"** before merging - section 11 step 7.
