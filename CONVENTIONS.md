# قواعد المشروع (Conventions)

**هذي القواعد لا تتغير حتى مع أي إعادة هيكلة (refactor) أو تحديث.** أي قسم جديد أو تعديل لازم يتبعها.

---

## 1. بنية الأقسام (Section Structure)

كل قسم في الموقع يلتزم بهذي البنية:

```html
<!-- ═══ N. SECTION NAME ═══ -->
<section class="X" id="optional-id">
  <div class="X-inner">
    <div class="section-header" data-animate="fade-up">
      <span class="section-eyebrow">عنوان فرعي صغير (اختياري)</span>
      <h2 class="section-title">العنوان الرئيسي</h2>
      <p class="section-subtitle">الوصف (اختياري)</p>
    </div>
    <!-- ... المحتوى الرئيسي ... -->
  </div>
</section>
```

### القواعد:
- ✅ كل `<section>` تحوي `.X-inner` (X = اسم القسم)
- ✅ الـ`.X-inner` تستخدم `max-width: var(--content-max)` و `margin: 0 auto`
- ✅ كل قسم في `index.html` يبدأ بـHTML comment `<!-- ═══ N. NAME ═══ -->`

---

## 2. المسافات والعرض (Spacing & Width)

### Tokens محددة:
```css
--content-max: 1200px;   /* عرض المحتوى الأقصى */
--content-pad: 16px;     /* edge safety على الموبايل */
```

### القاعدة الذهبية:
- 📐 **العرض الداخلي يأخذ كامل المساحة** (`width:100%` أو افتراضي flex)
- 📐 **الـmax-width موحد** (`var(--content-max)`) لكل الأقسام
- 📐 **الـpadding-inline على الموبايل** = `var(--content-pad)`
- 📐 **فوق 1232px** = `padding-inline: 0` (الـmargin auto يعطي الفراغ)

### مثال صحيح:
```css
.my-section-inner {
  max-width: var(--content-max);
  margin: 0 auto;
  padding-inline: var(--content-pad); /* mobile */
}
@media(min-width: 1232px) {
  .my-section-inner { padding-inline: 0; }
}
```

> **⚠️ مهم:** أي قسم جديد لازم يضاف لقائمة الـ`padding-inline` المركزية في أعلى `styles.css` (السطر 106) عشان يحصل على الـedge safety.

---

## 3. المسافات العمودية (Vertical Padding)

استخدمي قيم محددة فقط:

| الحجم | القيمة |
|---|---|
| قسم صغير | `padding: 32px 0` |
| قسم متوسط | `padding: 60px 0` أو `64px 0` |
| قسم كبير / featured | `padding: 80px 0` أو `100px 0` |

**القاعدة:** كل قيم الـspacing على شبكة الـ8pt: `4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 100`. **ممنوع** `13px`, `17px`, `25px`، إلخ.

---

## 4. الألوان (Colors)

### استخدام Tokens فقط:
```css
/* ✅ صح */
color: var(--gold);
background: var(--bg-primary);
border-color: var(--border-light);

/* ❌ غلط */
color: #d4884a;           /* لا تستخدمي hex مباشر */
background: #0e040d;      /* استخدمي var(--bg-primary) */
```

### الألوان الأساسية:
| Token | القيمة | الاستخدام |
|---|---|---|
| `--gold` | `#d4884a` | البرايمري accent، الأزرار، التظليل |
| `--purple` | `#461642` | البنفسجي العلامة، شريط الإعلان |
| `--bg-primary` | `#0e040d` | خلفية الصفحة |
| `--text-main` | `#f0eaef` | النص الأساسي |
| `--text-sub` | `#b8adb7` | النص الثانوي |

### Tokens خاصة:
- `--white` = نفس `--bg-primary` (alias قديم)
- لون أخضر `#63b3a5` = للكارد الخضراء في الهيرو فقط (مقصود، مش token)

---

## 5. الـTypography

### الخط:
```css
font-family: var(--font); /* IBM Plex Sans Arabic */
```

### Type scale:
| Token | الاستخدام |
|---|---|
| `--text-xs` | شيبس، إيبراو |
| `--text-sm` | نص ثانوي |
| `--text-base` | نص أساسي |
| `--text-lg` / `--text-xl` | عناوين فرعية |
| `--text-2xl` / `--text-3xl` / `--text-4xl` | عناوين قسمية وهيرو |

### قواعد صارمة:
- 🚫 **لا `letter-spacing` على نص عربي** (يكسر الخط المتصل)
- 🚫 **لا `font-size: 17px`** أو أي قيمة برّا الـscale
- ✅ استخدمي `clamp()` للنصوص اللي تتغير مع الشاشة

---

## 6. المكونات والإعادة (Components & Reuse)

### قاعدة Reuse-First (الذهبية):
**قبل ما تنشئين كومبوننت جديد، تأكدي 100% إنه ما موجود.**

> طريقة التحقق:
> ```bash
> grep -rn "card\|button\|chip\|badge" public/styles.css
> ```
> لو لقيتي شي قريب، استخدميه أو وسّعيه. **لا تكرريه.**

```css
/* ❌ لا تسوي هذي */
.button-2 { ... }
.card-alt { ... }
.hero-new { ... }
.partner-card-2 { ... }

/* ✅ بدل، وسّعي الموجود بـmodifier */
.btn--secondary { ... }
.cladding-color-card--featured { ... }
.partner-cell--highlighted { ... }
```

### مكتبة المكونات الموجودة

| المكون | Class | الاستخدامات |
|---|---|---|
| **زر** | `.btn` + variant + size | كل الأزرار (3 variants × 3 sizes) |
| **شيب** | `.hero-chip` / `.warranty-compact-item` | معلومات صغيرة (pill shape) |
| **بادج/شارة** | `.hero-badge` / `.live-chip` / `.live-badge` | تصنيفات صغيرة |
| **كارد بطاقة** | `.process-card` / `.cladding-color-card` / `.test-card` / `.cert-card` | البطاقات الكبيرة |
| **ختم** | `.warranty-seal` / `.hero-warranty-stamp` | الأختام (warranty seals) |
| **input** | `.field-input` (في الفورم) | حقول الإدخال |
| **مودال/lightbox** | `.lightbox` | صور مكبرة |
| **shimmer/loader** | `.video-loader` / `.video-loader-spin` | loading states |
| **section-header** | `.section-header` + `.section-eyebrow` + `.section-title` + `.section-subtitle` | عناوين الأقسام |

### المكونات المشتركة على كل صفحة:
- شريط الإعلان (`.announce`)
- Navigation (`.nav`)
- Footer (`.footer`)
- WhatsApp FAB (`.wa-fab`)
- Scroll-to-top (`.scroll-top`)
- Lightbox (للصور)

**أي صفحة جديدة:** انسخي هذي العناصر **حرفياً** من `index.html` وحمّلي `scripts.js`.

### قاعدة الإنشاء الجديد

لو **حقاً** محتاج كومبوننت جديد:
1. تأكدي إن مفيش بديل قريب
2. سميّه بنفس الـpattern (`.X-card`, `.X-cell`, `.X-chip`...)
3. أضيفيه لجدول المكونات أعلاه
4. اتبعي الـtokens (لا hex، لا spacing برّا الـscale)
5. اختبري على ٣ مقاسات (مobile, tablet, desktop)

---

## 6.5. مكتبة الأيقونات (Icons Library)

**كل الأيقونات SVG inline من [Feather Icons](https://feathericons.com)** (مكتبة مفتوحة المصدر، MIT License).

### الـPattern الموحّد:
```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
  <!-- path/polygon من feathericons.com -->
</svg>
```

### القواعد:
- ✅ كل الأيقونات بنفس `viewBox="0 0 24 24"`
- ✅ `stroke="currentColor"` (تأخذ لون النص الحاوي تلقائياً)
- ✅ `stroke-width="1.5"` (الافتراضي للأيقونات الصغيرة) أو `2` (للكبيرة)
- ✅ `fill="none"` (إلا إذا الأيقونة مصمتة مثل النجمة)
- ✅ `width` و `height` بالبكسل (14, 16, 20, 24)

### الأيقونات المستخدمة (مرجع سريع):

| الأيقونة | الاسم في Feather | الاستخدام |
|---|---|---|
| 🛡️ shield-check | `shield` + check inside | الضمان |
| 📞 phone | `phone` | أرقام الهاتف |
| ⭐ star | `star` (polygon) | التقييمات |
| 📍 map-pin | `map-pin` | المواقع، الفروع |
| 🏠 home | `home` | المطابخ، الإحصائيات |
| ✓ check-circle | `check-circle` | تأكيدات |
| 👁️ eye | `eye` | معاينة (في الأدمن) |
| 🔍 search | `search` | البحث |
| ▶️ play | `play` (polygon) | تشغيل الفيديو |
| ⬆️ arrow-up | `chevron-up` | scroll to top |
| ✕ x | `x` | إغلاق |
| 📅 calendar | `calendar` | تواريخ |
| 💬 message-circle | `message-circle` | شات/whatsapp |
| 📷 camera | `camera` | رفع صور (في الأدمن) |

### للأيقونات الخاصة (غير Feather):
- شعارات السوشال (Instagram، TikTok، X، Snapchat، WhatsApp): SVGs مخصصة من المنصة الرسمية
- لوقو الشركة: `images/Logo-white.png`

### كيف تضيفين أيقونة جديدة:
1. روحي [feathericons.com](https://feathericons.com)
2. اختاري الأيقونة → اضغطي **Copy SVG**
3. عدّلي الـattributes حسب الـpattern أعلاه
4. ضيفيها مباشرة في HTML (لا تحملي SVG file)

### قاعدة صارمة:
- 🚫 **لا تخلطي مكتبات أيقونات** (FontAwesome + Feather + Material). Feather فقط
- 🚫 **لا تستخدمي صور PNG** كأيقونات (إلا لوقو الشركة)

---

## 7. الأزرار (Buttons)

ثلاث variants فقط:
| Class | الاستخدام |
|---|---|
| `.btn .btn--primary` | الإجراء الأساسي (واحد فقط لكل قسم) |
| `.btn .btn--secondary` | إجراء ثانوي |
| `.btn .btn--tertiary` | روابط خارجية، إجراءات منخفضة الأهمية |

### Sizes:
- `.btn--sm` / `.btn--md` (الافتراضي) / `.btn--lg`

### Modifiers:
- `.btn--no-arrow` لإلغاء حركة السهم على hover
- `.btn--block` لـwidth 100%

### قاعدة صارمة:
- ⚠️ **زر `--primary` واحد فقط لكل قسم.** البقية secondary/tertiary.

---

## 8. الـRadius والـShadows

| Token | القيمة |
|---|---|
| `--radius-sm` | 8px |
| `--radius-md` | 12px |
| `--radius-lg` | 16px |
| `--radius-xl` | 12px (نفس md عمداً للبطاقات الكبيرة) |
| `--radius-full` | 999px (للـpill shapes) |

```css
/* Shadows */
--shadow-sm | --shadow-md | --shadow-lg | --shadow-xl
--shadow-glow-gold | --shadow-glow-purple
```

---

## 9. الـAnimations

```css
--ease-out: cubic-bezier(.22,1,.36,1);
--ease-bounce: cubic-bezier(.4,0,.2,1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-enter: 500ms;
```

**استخدمي `prefers-reduced-motion`** لإلغاء الحركة:
```css
@media (prefers-reduced-motion: reduce) {
  .my-element { animation: none; transform: none; }
}
```

---

## 10. الـRTL والاتجاه

- 🌍 **الموقع كله RTL** (`<html dir="rtl">`)
- 🚫 لا تستخدمي `left:` / `right:` ← استخدمي `inset-inline-start:` / `inset-inline-end:`
- 🚫 لا تستخدمي `margin-left:` ← استخدمي `margin-inline-start:`
- ✅ في السوايب: **يمين = التالي، يسار = السابق** (عكس LTR)

---

## 11. قائمة الرفض الفوري (Instant Rejection)

أي PR/تعديل يحتوي على هذي = نرفض فوراً:

- ❌ أكثر من زر `--primary` واحد في القسم
- ❌ عرض حاوية مختلف بين أقسام نفس الصفحة
- ❌ تكرار مكون (`Button2`, `CardAlt`, `HeroNew`)
- ❌ `font-size` أو `padding` خارج الـscale (`13px`, `17px`)
- ❌ `!important`
- ❌ `inline style` في HTML (إلا للـSVG fills المخصصة)
- ❌ `hex` مباشر بدون token
- ❌ `letter-spacing` على عربي
- ❌ em-dash `—` (في النص، الكود، الـcommits)
- ❌ تواريخ هجرية أو أرقام هندية (`١٢٣`)
- ❌ مسارات صور مكسورة (تأكدي ‍`ls` قبل الـcommit)
- ❌ تجاهل `prefers-reduced-motion` على animations كبيرة

---

## 12. عند إضافة قسم جديد (Checklist)

اتبعي هذي بالترتيب:

### في `public/index.html`:
- [ ] أضيفي `<!-- ═══ N. SECTION NAME ═══ -->` comment
- [ ] استخدمي بنية `<section class="X"><div class="X-inner">...`
- [ ] استخدمي `section-header` + `section-title` + `section-subtitle` (اختياري)

### في `public/styles.css`:
- [ ] أضيفي `.X-inner` لقائمة الـpadding المركزية (السطر 106)
- [ ] استخدمي `--content-max` و `--content-pad` فقط
- [ ] اتبعي قيم padding-block المحددة (32/60/80/100)
- [ ] استخدمي tokens للألوان والـradius والـshadows

### في `public/cms-loader.js` (لو القسم محتوى قابل للتعديل من الأدمن):
- [ ] أضيفي `applyX(d)` function
- [ ] سجّليها في `appliers` map
- [ ] استخدمي `setText` للنصوص (لا تستبدلي innerHTML بدون داعي)

### في `public/admin.html` (لو قابل للتعديل):
- [ ] أضيفي `<div class="nav-item" data-section="X">` في القائمة
- [ ] أضيفي `<div class="section-panel" id="panel-X">` بالحقول
- [ ] أضيفي `loadX(data)` و `saveSection('X')` المنطق
- [ ] أضيفي `DEFAULTS.X` بالقيم الحالية الموجودة في الموقع

### في `public/cms-defaults.js` (المصدر الواحد، لو موجود):
- [ ] أضيفي القيم الافتراضية هنا بدل ما تكون مكررة

### Cache busting:
- [ ] زيدي `?v=N+1` على `styles.css` و `scripts.js` و `cms-loader.js` لو غيّرتي فيها

---

## 13. عند تعديل قسم موجود

### بدون تغيير بنية HTML:
- ✅ آمن. عدّلي ودفعي.

### مع تغيير بنية HTML (selectors):
- ⚠️ راجعي `cms-loader.js` — أي selector يشير للقسم القديم لازم يتحدث
- ⚠️ راجعي `admin.html` — أي form يحفظ على الفايرستور لازم يطابق الـapplier الجديد
- 🔍 طريقة التحقق: ابحثي في الكود عن الـclass القديم `grep -rn "old-class" public/`

---

## 14. الـBranches وعملية النشر

- `master` = production = `uwkitchens.com`
- `preview` = ستيج/اختبار قبل الإنتاج
- **قبل أي تعديل كبير:** أنشئي tag للسلامة:
  ```
  git tag pre-X-2026-MM-DD origin/master
  git push origin pre-X-2026-MM-DD
  ```
- **التراجع:** `git revert HEAD && git push` لو الـcommit الأخير سبب مشكلة

---

## 15. القواعد التحريرية (Editorial)

- 🇸🇦 **اللغة:** عربي RTL
- 📅 **التواريخ:** ميلادي فقط، أرقام عربية (`123` مش `١٢٣`)
- 🚫 **بدون em-dash** `—` ← استخدمي `،` أو `.` أو `(أقواس)`
- 🚫 **بدون `&` أو `+` بدل و** ← استخدمي "و" مباشرة
- ✅ **اللهجة:** سعودية مهذّبة، احترافية، بدون عامية مفرطة

---

## 16. الـAccessibility (a11y)

- ✅ كل صورة لها `alt` (نص فعلي للمحتوى، أو `alt=""` للزخرفة)
- ✅ كل button له aria-label لو ما فيه نص
- ✅ التركيز (`:focus-visible`) ظاهر دائماً
- ✅ التباين (contrast) AA على الأقل
- ✅ الزرار touch target ≥ 44px (`var(--btn-h-md)`)

---

## 17. الأداء (Performance)

- ✅ الصور تستخدم `loading="lazy"` (إلا الهيرو)
- ✅ الفيديوهات تستخدم Cloudinary fetch URL
- ✅ `preload="auto"` فقط للفيديو الأول، الباقي `preload="metadata"`
- ✅ الصور > 200KB لازم تكون WebP
- ✅ الفيديوهات > 5MB لازم تمر عبر Cloudinary

---

## 🆘 لو مش متأكدة

اقرأي:
1. هذا الملف
2. `README.md` (نظرة عامة)
3. `CLAUDE.md` (دليل تطوير لـClaude Code)

أو شوفي قسم مشابه موجود واتبعي نفس النمط.
