# UW Kitchens Website (مطابخ الأبيض المتحدة)

**Production:** https://uwkitchens.com
**Repo:** https://github.com/hadeelqa/uwkitchen-website

موقع رسمي لشركة مطابخ الأبيض المتحدة، عربي/RTL، static site بـ HTML + CSS + Vanilla JS، مع لوحة تحكم بسيطة (CMS) مبنية على Firebase. الإنشاء والاستضافة عبر Netlify.

---

## محتوى هذا الدليل

1. [نظرة عامة](#نظرة-عامة)
2. [التقنيات والخدمات المستخدمة](#التقنيات-والخدمات-المستخدمة)
3. [الحسابات المطلوبة](#الحسابات-المطلوبة)
4. [البدء السريع (Quick Start)](#البدء-السريع-quick-start)
5. [التطوير المحلي](#التطوير-المحلي)
6. [الـBranches وعملية النشر](#الـbranches-وعملية-النشر)
7. [بنية الملفات](#بنية-الملفات)
8. [لوحة التحكم (Admin)](#لوحة-التحكم-admin)
9. [الهوية البصرية وقواعد التصميم](#الهوية-البصرية-وقواعد-التصميم)
10. [قواعد الكتابة والمحتوى](#قواعد-الكتابة-والمحتوى)
11. [استكشاف الأخطاء (Troubleshooting)](#استكشاف-الأخطاء-troubleshooting)
12. [العمل مع AI assistants (Claude/Cursor/...)](#العمل-مع-ai-assistants)

---

## نظرة عامة

موقع تسويقي لشركة مطابخ سعودية، يعرض:

- معرض المطابخ المنفذة
- شعارات الشركاء والشهادات
- نظام طلب صيانة (form يرسل لـ FormSubmit + يرفع المرفقات على Cloudinary)
- لوحة تحكم محتوى (تعدل النصوص، الأرقام، الفروع، التقييمات، إلخ)

**Static site** = ما فيه backend، ما فيه build step. كل شي HTML+CSS+JS مباشر من المتصفح.

---

## التقنيات والخدمات المستخدمة

### Core (لا غنى عنها)

| التقنية | الاستخدام | السبب |
|---|---|---|
| **HTML / CSS / Vanilla JS** | الموقع نفسه | بدون build step، أداء عالي، بساطة الصيانة، شغّال على أي host |
| **Netlify** | الاستضافة + CI/CD + CDN | يبني تلقائياً عند `git push`، CDN عالمي، حدود سخية، redirects/headers بـ`netlify.toml` |
| **GitHub** | إدارة الكود | تتبع التغييرات، PR-based deploy previews مع Netlify |
| **Firebase Firestore** | قاعدة بيانات الـCMS + tickets | NoSQL مدارة، realtime، تكامل مباشر من المتصفح بدون backend |
| **Firebase Storage** | تخزين الصور المرفوعة من الأدمن | متكامل مع Firestore، rules بسيطة |
| **Firebase Auth** | تسجيل دخول الأدمن | مجاني، آمن، email/password |
| **Cloudinary** | استضافة + تحسين الصور والفيديوهات | يقلل bandwidth على Netlify، يعرض الصور بصيغ حديثة (WebP/AVIF) تلقائياً، يدعم رفع المرفقات من فورم الصيانة |
| **FormSubmit** | إرسال إيميلات فورم الصيانة | بدون backend، مجاني، honeypot anti-spam |

### Plugins / Integrations

- **netlify-plugin-cloudinary** — يعيد كتابة روابط الصور تلقائياً وقت البناء لتمر عبر CDN كلاودنري (مذكور في `netlify.toml`)
- **Google Fonts** — IBM Plex Sans Arabic للنص

### What's NOT used (وعن قصد)

- ما فيه React/Vue/Angular ولا framework — لتقليل الـbundle size والتعقيد
- ما فيه webpack/vite — ما يحتاج build step
- ما فيه Node server — كل الـbackend عبر Firebase وCloudinary وFormSubmit

---

## الحسابات المطلوبة

أي شخص يكمل المشروع يحتاج صلاحية على هذي الحسابات:

### 1. **GitHub** (الكود)
- **Repo:** `hadeelqa/uwkitchen-website`
- **الصلاحية:** Push على `master` و`preview`

### 2. **Netlify** (الاستضافة)
- **Site:** `uwkitchens` (أو `uwkitchens.com`)
- **Plan:** Pro (3,000 credits/شهر)
- **Production:** يبني من branch `master` → `uwkitchens.com`
- **Branch deploys:** كل PR يولّد رابط `deploy-preview-N--uwkitchen.netlify.app`
- **Domain:** `uwkitchens.com` متصل عبر DNS (مسجل Netlify nameservers)

### 3. **Firebase** (CMS + Auth + Storage)
- **Project ID:** `uwkitchen-c3279`
- **Console:** https://console.firebase.google.com/project/uwkitchen-c3279
- **الخدمات المُفعّلة:**
  - **Authentication** (Email/Password): مستخدم واحد للأدمن
  - **Firestore Database**: collections = `content`, `tickets`
  - **Storage**: bucket = `uwkitchen-c3279.firebasestorage.app`
- **API key (public, آمن):** `AIzaSyAfOq1iR7HFRq15LDbtONAH7fqw1LGdMek`
  - مفتاح Firebase الأمامي مكشوف بالطبيعة. الحماية تجي من Firestore Security Rules وStorage Rules (موجودة في الجذر).

### 4. **Cloudinary** (CDN صور وفيديوهات + رفع المرفقات)
- **Cloud name:** `dbj4aba8i`
- **Console:** https://console.cloudinary.com
- **الإعدادات المُفعّلة:**
  - **PDF and ZIP delivery:** Enabled (Settings → Security)
  - **Upload preset:** `uwkitchen_uploads` (unsigned)، يستخدمه فورم الصيانة لرفع مرفقات العميل
- **Plan:** Free tier (25GB bandwidth/شهر، يكفي حالياً)

### 5. **FormSubmit** (إرسال إيميلات الفورم)
- **Endpoint:** يُرسل لـ `info@uwkitchens.com`
- **ما يحتاج تسجيل** — الإيميل مفعّل من زمان

### 6. **Domain (uwkitchens.com)**
- مسجّل عند مزود الدومين (تأكدي من الفاتورة)
- Nameservers: Netlify

---

## البدء السريع (Quick Start)

```bash
# 1. clone الريبو
git clone https://github.com/hadeelqa/uwkitchen-website.git
cd uwkitchen-website

# 2. شغّل سيرفر محلي
python -m http.server 8090 -d public
# أو
npx serve public -l 8090

# 3. افتحي
http://localhost:8090
```

ما يحتاج `npm install` ولا أي شي. الكود static.

---

## التطوير المحلي

### السيرفر المحلي

استخدمي أي static server:

**Python (موجود في ويندوز/ماك/لينكس):**
```bash
python -m http.server 8090 -d public
```

**Node:**
```bash
npx serve public -l 8090
```

**Netlify CLI** (يحاكي redirects/headers من `netlify.toml`):
```bash
npm i -g netlify-cli
netlify dev --dir public --port 8888
```

**ملف Claude Preview:** `.claude/launch.json` فيه إعدادات جاهزة لو تستخدمين Claude Code.

### اختبار التغييرات

1. عدّلي ملفات في `public/`
2. حدّثي السيرفر المحلي مع `Ctrl+Shift+R` (هارد ريفريش، يتجاهل الكاش)
3. لما تخلصي، commit + push:

```bash
git add -A
git commit -m "وصف التعديل"
git push origin master
```

Netlify يبني تلقائياً ويرفع لـ`uwkitchens.com` خلال ~30 ثانية.

### Cache busting

CSS/JS فيهم رقم نسخة لتجنب الكاش (`styles.css?v=82`). كل ما تعدّلين CSS/JS المهم، **زيدي الرقم +1** في `index.html` (وفي `maintenance-request.html` لو غيّرتي شي يخصها). هذا يجبر المتصفح يجيب الجديد.

---

## الـBranches وعملية النشر

| Branch | للـوظيفة | يُنشر على |
|---|---|---|
| `master` | الإنتاج | uwkitchens.com |
| `preview` | تجارب وعرض على العميل | branch deploy عند فتح PR |

### الـTags (نقاط رجوع آمنة)

- `netlify-live-2026-04-22` — صورة من حالة الإنتاج بعد إقرار العميل
- `pre-live-2026-04-24` — قبل أول دمج كبير
- `pre-factory-fix-2026-04-24` — قبل تعديل فيديو المصنع

**للتراجع لأي tag:**
```bash
git checkout master
git reset --hard pre-live-2026-04-24
git push --force origin master
```

### العادة الموصى بها

1. **تعديلات صغيرة:** push مباشرة على `master`
2. **تعديلات كبيرة أو حساسة:** push على `preview` → افتحي PR (`preview → master`) → اختبري على رابط `deploy-preview-N` → ادمجي بعد ما تتأكدي
3. **قبل أي دمج كبير:** أنشئي tag للسلامة `git tag pre-X-2026-MM-DD origin/master && git push origin pre-X-2026-MM-DD`

---

## بنية الملفات

```
uwkitchen-website/
├── public/                       ← المجلد المنشور
│   ├── index.html                ← الصفحة الرئيسية
│   ├── maintenance-request.html  ← يفتح على /support
│   ├── maintenance-request.js    ← منطق فورم الصيانة (validation, Cloudinary upload, FormSubmit)
│   ├── admin.html                ← لوحة الإدارة (auth-gated)
│   ├── styles.css                ← Stylesheet وحيد (لا تنشئي styles-v2)
│   ├── scripts.js                ← تفاعلات الصفحة الرئيسية
│   ├── cms-loader.js             ← يقرأ Firestore ويلصق على DOM
│   ├── images/                   ← الصور
│   │   ├── kitchens/featured/   ← مطابخ بارزة (7)
│   │   ├── kitchens/more/       ← باقي المطابخ (17)
│   │   ├── cladding-plus/       ← شرائح الكلادينج (4 ألوان × 4 facades)
│   │   ├── partners/             ← شعارات الشركاء (~20)
│   │   ├── Quality/              ← شعارات شهادات الجودة (8)
│   │   └── warranty/             ← أصول قسم الضمان
│   ├── Videos/                   ← فيديوهات (مخدومة عبر Cloudinary fetch)
│   ├── Cladding Photos/          ← صور خام
│   ├── customer-reviews/         ← لقطات تجارب العملاء
│   ├── robots.txt
│   └── sitemap.xml
├── scripts/                      ← أدوات بناء (مولّد بطاقة OG، إلخ)
├── firebase.json                 ← إعداد Firebase Hosting قديم (لا يُستخدم، Netlify هو الاستضافة)
├── firestore.rules               ← قواعد قراءة/كتابة الـCMS
├── storage.rules                 ← قواعد رفع الوسائط
├── netlify.toml                  ← الإعداد الفعلي لـNetlify (redirects, headers, plugins)
├── CLAUDE.md                     ← دليل خاص بـClaude Code
└── README.md                     ← هذا الملف
```

### الروابط (من `netlify.toml`)

- `/` → `index.html`
- `/support`, `/support/` → `maintenance-request.html`
- `/ar`, `/ar/` → `index.html` (rewrite)
- `/index.html`, `/home`, `/maintenance-request` → 301 لـcanonical

### Cache headers

- صور/فيديوهات/svg/خطوط: 1 سنة immutable
- CSS/JS: 1 ساعة (`must-revalidate`)
- HTML: تحديث كل طلب

---

## لوحة التحكم (Admin)

**الرابط:** https://uwkitchens.com/admin.html
**التسجيل:** Firebase Auth (Email/Password). مستخدم واحد فقط.

### الأقسام القابلة للتعديل

| القسم | إيش تعدّل |
|---|---|
| 🎟️ التذاكر | يعرض طلبات الصيانة الواردة |
| 📢 الإعلان | السطرين في الشريط العلوي |
| 🏆 الهيرو | السطر 1، السطر 2، نص الـchips، نص الزر |
| 📊 الإحصائيات | الأرقام والتسميات |
| 🖼️ المعرض | إضافة/حذف صور المطابخ |
| 💬 التقييمات | آراء العملاء (شريط متحرك) |
| 📍 الفروع | عناوين الفروع وأرقامها |
| ☎️ الاتصال | هاتف، إيميل، واتساب، عنوان |
| 🛡️ الضمان | عنوان وتفاصيل قسم الضمان |
| ⚙️ كيف نشتغل | خطوات العمل (4 كروت) |
| 📺 تابع مطبخك | نص قسم البث الحي + رابط انستقرام |
| 🍳 المطابخ | عناوين قسم المعرض |
| 🎨 الكلادينج | عنوان وعنوان فرعي فقط (الألوان كود) |
| 🤝 الشركاء | إضافة/حذف شعارات |
| 🏅 الشهادات | إضافة/حذف شهادات الجودة |

### كيف يشتغل تحت السطح

1. الأدمن يكتب التعديلات في الفورم
2. يضغط **حفظ** → ينحفظ في Firestore (`collection: content`)
3. الموقع لما يفتح يقرأ من `cms-loader.js` ويلصق التعديلات على DOM
4. الزائر يحتاج هارد ريفريش (Ctrl+Shift+R) عشان يشوف الجديد

### رفع الصور

- **من المعرض/التقييمات/الفروع:** يرفع مباشر لـFirebase Storage بصيغة WebP بعد الضغط (max 1200px width, 75% quality)
- **من فورم الصيانة (للعميل النهائي):** يرفع لـCloudinary preset `uwkitchen_uploads`

---

## مسارات تعديل المحتوى (Dual update workflow)

في الموقع طبقتان للمحتوى لازم تظلون متطابقتين:

| المصدر | المسار |
|---|---|
| **الكود** (canonical) | `public/cms-defaults.js` في الـrepo |
| **قاعدة البيانات** (live) | Firestore `content/<section>` |

`cms-loader.js` يقرأ من Firestore أولاً، فلو فيه قيمة محفوظة فيه → الكود يطنش. لذلك أي تعديل لازم ينعكس في الجانبين.

### المسار 1: العميل يعدّل من الـAdmin

```
admin.html  →  Save  →  Firestore  →  live (refresh)
```

هذا المسار للعميل (هديل) لما تبي تعدّل بسرعة بدون مبرمج. ما يحدّث الكود.

### المسار 2: الـAI assistant (أو مبرمج) يعدّل

```
edit cms-defaults.js  →  python scripts/sync-defaults-to-firestore.py
                     →  git commit + push  →  Netlify rebuild
                     ↓
                Firestore + Code in sync
```

#### الإعداد لمرة واحدة (already done — موثّق هنا للمرجع)

1. حمّلي Service Account JSON من Firebase Console:
   - Project Settings → Service accounts → Generate new private key
2. خزنيه في `.secrets/firebase-admin.json` (محظور في `.gitignore`)
3. ركّبي SDK:
   ```bash
   pip install firebase-admin
   ```

#### الاستخدام

```bash
# اعرض الفروقات بين الكود وFirestore بدون كتابة
python scripts/sync-defaults-to-firestore.py --section hero --diff

# تشغيل dry-run يعرض الـpayload بدون اتصال بـFirestore
python scripts/sync-defaults-to-firestore.py --section hero --dry-run

# انشر قسم واحد لـFirestore
python scripts/sync-defaults-to-firestore.py --section hero

# انشر كل الأقسام (احذر: يستبدل اللي عدّله العميل من admin)
python scripts/sync-defaults-to-firestore.py
```

#### قاعدة ذهبية

الـAI assistant يجب يحدّث **الجانبين في نفس commit**:
1. عدّل `cms-defaults.js`
2. شغّل `python scripts/sync-defaults-to-firestore.py --section <name>`
3. commit + push

كذا التعديلات تظهر فوراً (Firestore) وتبقى في تاريخ الكود (Git). هذي القاعدة موثّقة في `CLAUDE.md` كبروتوكول إلزامي.

### المسار 3: سحب تعديلات العميل من Firestore لـ الكود

لما العميل يعدّل من admin.html، التعديل ينحفظ في Firestore فقط. الكود يبقى على القيم القديمة. لو AI assistant جا بعدها وعدّل نفس القسم بدون ما يعرف، التعديلات الجديدة من العميل تنضرب بـ overwrite.

عشان نمنع هذا، قبل أي تعديل code-side على قسم محتوى، شغّلي:

```bash
# اسحب آخر القيم من Firestore واكتب public/cms-defaults.js
python scripts/pull-firestore-to-defaults.py

# أو dry-run يعرض المحتوى الجديد بدون كتابة
python scripts/pull-firestore-to-defaults.py --dry-run
```

السكربت يقوم بـ:
- يقرأ كل المستندات من `content/` collection
- ينظّف الحقول الداخلية (`updatedAt`, `syncedFromCode`)
- يعيد ترتيب الحقول بترتيب ثابت (لتقليل ضوضاء الـ diff)
- يتحقق من النتيجة بعمل round-trip عبر Node
- يحفظ نسخة احتياطية `cms-defaults.js.bak` قبل الكتابة

بعد التشغيل، راجعي `git diff public/cms-defaults.js`، اعتمدي التغييرات لو زينة، وكمّلي تعديلاتك على نسخة أحدث.

#### قاعدة ذهبية موسّعة (Pull → Edit → Sync → Push)

```
1. pull-firestore-to-defaults.py     ← اجلب آخر تعديلات العميل
2. عدّل cms-defaults.js              ← أضف تعديلاتك على الأساس الجديد
3. sync-defaults-to-firestore.py     ← انشر للـFirestore
4. git commit + push                 ← الكود يطابق Firestore يطابق الموقع
```

---

## فحص الـ Selectors (Smoke test)

`cms-loader.js` يحتوي على ~44 CSS selector وid عشان يلصق المحتوى من Firestore على الـ DOM. لما يصير UI redesign وتنغيّر أسماء classes، الـ selector يصير ما يطابق شي في الصفحة ويفشل بصمت. النتيجة: تعديلات admin ما تظهر ولا في خطأ في الكونسول.

`scripts/check-cms-loader-selectors.py` يفحص كل selector ضد `public/index.html` ويطلع تقرير. شغّليه قبل أي push على ملفات HTML أو cms-loader.js:

```bash
python scripts/check-cms-loader-selectors.py
```

النتيجة:
- Exit code 0 = كل الـ selectors تشتغل
- Exit code 1 = فيه selector فاشل (مع ذكر السطر بالضبط)

السكربت اكتشف bug فعلي أول مرة شغّلناه (line 284 كان يبحث عن `<span>` غير موجود)، فالفائدة منه ثابتة.

---

## المزامنة التلقائية (GitHub Action)

`.github/workflows/sync-cms-defaults.yml` يشغّل السكربت أوتوماتيكياً كل ما `public/cms-defaults.js` يتغيّر على فرع `preview` أو `master`. النتيجة: تعديلات الكود تنزل على الموقع بدون ما تشغّلين السكربت يدوياً.

### الإعداد لمرة وحدة

محتاج تضيفين Service Account JSON كـ GitHub Secret:

1. افتحي https://github.com/hadeelqa/uwkitchen-website/settings/secrets/actions
2. اضغطي **New repository secret**
3. الاسم: `FIREBASE_SERVICE_ACCOUNT_JSON`
4. القيمة: انسخي محتوى `.secrets/firebase-admin.json` كاملاً والصقيه
5. **Add secret**

### كيف يشتغل

```
push يلمس cms-defaults.js  →  GitHub Action تشتغل  →
السكربت يشغّل --diff  →  Firestore يتحدّث  →  الموقع
```

تقدرين كمان تشغّلينها يدوياً من **Actions** tab → اختاري workflow → **Run workflow** مع section محدد لو حبيتي.

### الأمان

- `.secrets/firebase-admin.json` المحلي ما يندفع لـ GitHub (محظور في `.gitignore`)
- المفتاح في GitHub Secrets مشفّر، ما يتوسّخ في الـ logs
- بعد كل run، الـ workflow يمسح الملف المؤقت من الـ runner

---

## E2E tests (Playwright)

اختبارات automated للـ admin panel تكشف لو فيه regression بصمت (الفورم مكسور، زر الحفظ ما يشتغل، الـ login flow تغيّر).

### الإعداد لمرة وحدة

```bash
npm install
npx playwright install chromium
```

### التشغيل

شغّلي السيرفر المحلي أول (port 8090)، ثم:

```bash
npm test                    # كل الاختبارات
npm run test:ui             # وضع تفاعلي
npm run test:headed         # يفتح المتصفح
```

اختبارات `tests/admin.spec.js` تتحقق:
- الفورم يظهر بكل الحقول
- البيانات الخاطئة ترفض الدخول
- Firebase SDK يحمل بدون أخطاء كونسول
- `window.CMS_DEFAULTS` يحتوي كل الأقسام المتوقعة

> **خارج النطاق متعمد:** Login حقيقي + حفظ. ذاك يدخل Firestore الفعلي ويلوّث محتوى العميل. اختبريها يدوياً بعد كل تغيير على admin.html.

---

## Lighthouse CI

`.github/workflows/lighthouse.yml` يشغّل Lighthouse على Netlify deploy preview لكل PR، ويرفع تقرير في PR comment. يفحص:

- **Performance** ≥ 0.85 (تحذير)
- **Accessibility** ≥ 0.90 (إجباري)
- **Best Practices** ≥ 0.90 (تحذير)
- **SEO** ≥ 0.95 (إجباري)

العتبات في `lighthouserc.json`. الـ assertions الصارمة تكسر الـ CI لو السكور نزل تحتها.

---

## الهوية البصرية وقواعد التصميم

### الألوان

| Token | القيمة | الاستخدام |
|---|---|---|
| `--gold` | `#d4884a` | الأزرار، التظليل، الشعار، البادج |
| `--purple` (`#461642`) | البنفسجي العلامة | شريط الإعلان، theme-color، gradients |
| `--bg-primary` (`#0e040d`) | خلفية الصفحة (داكن) |
| `--text-main` (`#f0eaef`) | لون النص الرئيسي |

### الخط

**IBM Plex Sans Arabic** (400/500/600/700) عبر Google Fonts.
⚠️ **لا تستخدمي `letter-spacing` على النص العربي** — يفصل الحروف ويكسر الخط المتصل.

### Spacing (8pt grid)

استخدمي فقط: `4, 8, 12, 16, 24, 32, 40, 48, 64`. لا تخترعي `13px` أو `17px`.

### Reuse-first rule

العناصر المشتركة بين الصفحات: شريط الإعلان، النّاف، الفوتر، WhatsApp FAB، scroll-to-top، lightbox.
لما تنشئين صفحة جديدة، **انسخي هذي العناصر حرفياً** من `index.html`. لا تعملي `nav2` أو `footer-cs`. لازم تحمّلي `scripts.js` على كل صفحة وإلا الـnav الموبايل ينكسر.

### قائمة الرفض الفوري

- أكثر من زر Primary واحد في القسم
- عرض حاوية مختلف بين أقسام نفس الصفحة
- عناصر مكررة (`Button2`, `CardAlt`, `HeroNew`)
- أحجام خط/spacing برّا الـscale
- `!important` / inline values / hex مباشر بدون token
- `letter-spacing` على عربي
- em dashes `—` (في الكتابة، الكود، الـcommits)

---

## قواعد الكتابة والمحتوى

- **اللغة:** عربي (RTL). كل المحتوى المرئي للزائر بالعربي
- **التواريخ:** ميلادي فقط. لا هجري، لا أرقام هندية (`١٢٣`)
- **بدون em dashes (—).** استخدمي `،` (فاصلة عربية) أو `.` أو `(أقواس)`
- **Cache bust:** زيدي `?v=NNN` على `styles.css` و`scripts.js` بعد أي تعديل مهم

---

## استكشاف الأخطاء (Troubleshooting)

### "اللي يظهر على نتفلاي مختلف عن اللوكال"

عادة كاش متصفح. جربي:
1. `Ctrl+Shift+R` (hard refresh)
2. DevTools → Network → علّمي "Disable cache"
3. افتحي في incognito

### "الأدمن يحفظ بس التعديل ما يظهر على الموقع"

تأكدي من:
1. الـcms-loader.js يستخدم نفس selectors اللي في HTML
2. لو غيّرتي بنية HTML، حدّثي `cms-loader.js` بنفس الـselectors الجديدة
3. زيدي رقم `cms-loader.js?v=N+1` في `index.html` بعد التعديل

### "البناء فشل في نتفلاي بسبب Secrets Scanning"

في `netlify.toml`:
```toml
[build.environment]
  SECRETS_SCAN_SMART_DETECTION_ENABLED = "false"
```
هذا موجود في المشروع، لو انحذف يصير مشكلة.

### "Cloudinary plugin يفشل في البناء"

تأكدي إنه ما هو enabled من **Build plugins UI** بنفس الوقت. لازم يكون في **`netlify.toml` فقط**:
```toml
[[plugins]]
  package = "netlify-plugin-cloudinary"
  [plugins.inputs]
  cloudName = "dbj4aba8i"
  deliveryType = "fetch"
```

### "الفيديوهات بطيئة"

لازم تشاور على Cloudinary fetch URL، مثال:
```
https://res.cloudinary.com/dbj4aba8i/video/fetch/q_auto/https://uwkitchens.com/Videos/factory-tour.mp4
```

### "صور الكلادينج تطلع 'مربع أبيض' في الموبايل"

PNG بخلفية بيضاء + filter `brightness(0) invert(1)` = مربع أبيض. الحل: شيلي الخلفية البيضاء من الـPNG (يدوياً أو عبر PIL):
```python
from PIL import Image
im = Image.open('logo.png').convert('RGBA')
data = list(im.getdata())
new = [(r,g,b,0) if (r>=235 and g>=235 and b>=235) else (r,g,b,a) for r,g,b,a in data]
im.putdata(new)
im.save('logo.png', 'PNG')
```

---

## العمل مع AI assistants

### Claude Code

في `CLAUDE.md` بالجذر دليل خاص. Claude Code يقراه تلقائياً ويفهم السياق.

```bash
claude code .
```

### Cursor

يقرا `README.md` تلقائياً. لزيادة الدقة، أنشئي `.cursorrules` بنفس محتوى `CLAUDE.md` المختصر.

### أي AI assistant ثاني

اعطيه `README.md` هذا. فيه كل اللي يحتاجه ليفهم:
- الهدف
- التقنيات
- الحسابات
- نقاط الخطر
- القواعد

---

## الأولويات عند الشك

1. **لا تكسري بريفيو نتفلاي** — العميل يراجعه
2. **تطابق الـdesign system** — الاتساق فوق الإبداع
3. **أعد الاستخدام قبل البناء**
4. **اسألي قبل أي merge على master**
