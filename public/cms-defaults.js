/* ════════════════════════════════════════════════════════════════
   CMS DEFAULTS — Single Source of Truth
   ════════════════════════════════════════════════════════════════

   This file holds the default content for every CMS-editable section.
   Three other files read from here so we never drift again:

     • scripts.js      — falls back to these arrays when not in DOM
     • admin.html      — uses these as the form's initial values
     • cms-loader.js   — uses these as the runtime fallback if Firestore
                          has nothing for a section

   Editing rule:
   ─────────────
   When the live site changes (new section, new partner logo, edited
   stat, …) update THIS file. The other three files pick it up
   automatically.

   Loading rule:
   ─────────────
   Load this BEFORE any of the three files above:
     <script src="cms-defaults.js?v=1"></script>
     <script src="scripts.js?v=N"></script>
     <script src="cms-loader.js?v=N" defer></script>

   Phase status (2026-05):
   ───────────────────────
     [✓] Phase 1: file created, exported as window.CMS_DEFAULTS
     [✓] Phase 2: scripts.js partners list reads from here
     [✓] Phase 3: admin.html DEFAULTS reads from here
     [ ] Phase 4: cms-loader.js fallback reads from here

   Editing any block in this file now updates BOTH:
   - what visitors see on the live site (via scripts.js + cms-loader)
   - what the admin panel pre-fills when no Firestore data exists.

   No more drift. Edit once, propagated everywhere on next deploy.
   ════════════════════════════════════════════════════════════════ */

window.CMS_DEFAULTS = {

  /* ───────── Announcement bar ───────── */
  announce: {
    text:  'عرض شهر أبريل: خصم 30%',
    text2: 'عملاء الموقع كود 1,200 ريال: UW12'
  },

  /* ───────── Hero ───────── */
  hero: {
    line1:    '+30 عام من الخبرة',
    line2:    'في تصميم المطابخ',
    promise1: 'تركيب 20 يوم أو تعويض',
    promise2: '100 ر.س تعويض عن كل يوم تأخير - بالعقد',
    cta:      'استشاري المبيعات متاح الآن'
  },

  /* ───────── Stats grid (5 cards) ───────── */
  stats: {
    items: [
      { num: '4.8',     label: 'تقييم عملائنا' },
      { num: '+17,500', label: 'مطبخ منفّذ' },
      { num: '25',      label: 'قطاع' },
      { num: '24/7',    label: 'صيانة' },
      { num: '100%',    label: 'كلادينج' }
    ]
  },

  /* ───────── Kitchen gallery (24 photos) ───────── */
  gallery: {
    items: [
      { src: 'images/kitchens/featured/01-classic-white-gas.webp',     alt: 'مطبخ كلاسيكي أبيض' },
      { src: 'images/kitchens/featured/02-modern-walnut-galley.webp',  alt: 'مطبخ خشب جوز مودرن' },
      { src: 'images/kitchens/featured/03-dark-matte-island.webp',     alt: 'مطبخ داكن مات بجزيرة' },
      { src: 'images/kitchens/featured/04-minimal-white-cooktop.webp', alt: 'مطبخ أبيض مينيمال' },
      { src: 'images/kitchens/featured/05-shaker-white-island.webp',   alt: 'مطبخ شيكر أبيض' },
      { src: 'images/kitchens/featured/06-walnut-marble-barstools.webp', alt: 'مطبخ جوز ورخام بكراسي بار' },
      { src: 'images/kitchens/featured/07-grey-glass-cabinets.webp',   alt: 'مطبخ رمادي بخزائن زجاج' },
      { src: 'images/kitchens/more/01.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/02.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/03.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/04.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/05.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/06.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/07.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/08.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/09.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/15.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/16.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/19.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/21.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/22.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/25.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/27.webp', alt: 'مطبخ من تنفيذنا' },
      { src: 'images/kitchens/more/28.webp', alt: 'مطبخ من تنفيذنا' }
    ]
  },

  /* ───────── Testimonials ───────── */
  testimonials: {
    items: [
      { name: 'أبو عبدالله',       initials: 'أ', quote: 'من أفضل الشركات اللي تعاملت معهم. التصميم طلع أحلى من اللي تخيلته والتركيب كان سريع واحترافي.' },
      { name: 'ليلى عبدالكريم',    initials: 'ل', quote: 'اليوم تم انجاز المطبخ من شركة المطابخ الابيض المتحدة. سعدت جداً بالعمل مع المهندس المتميز عبد الله.' },
      { name: 'ماجد الدويش',       initials: 'م', quote: 'أحب أشكر المهندس فتح الله على شغله المميز في تصميم المطبخ. من أول اجتماع كان واضح حرصه على التفاصيل.' },
      { name: 'سارة أبوزيد',       initials: 'س', quote: 'مش عارفة أبدأ من فين عشان اشكرهم من اول المعاينة المجانية اللي شجعتنا نكمل معاهم ولا التصميم الجميل.' },
      { name: 'أم سارة',            initials: 'أ', quote: 'مطبخي صار تحفة! الخامات ممتازة والضمان أعطاني راحة بال. أنصح الكل يتعاملون معهم بدون تردد.' },
      { name: 'خالد المطيري',      initials: 'خ', quote: 'خدمة التتبع المباشر شيء مميز جداً. تابعت كل مرحلة من موبايلي وكان الموعد دقيق. تجربة ممتازة.' },
      { name: 'نورة الحربي',       initials: 'ن', quote: 'التركيب خلص بالضبط في 20 يوم زي ما قالوا. الفريق كان محترف ونظيف ويحترم البيت. شغل راقي.' },
      { name: 'فهد العتيبي',        initials: 'ف', quote: 'أخذت عروض من 5 شركات وكان عرضهم الأفضل من ناحية الجودة والسعر. الضمان 15 سنة أعطاني ثقة كاملة.' },
      { name: 'عبدالرحمن السبيعي', initials: 'ع', quote: 'تعاملت معهم مرتين والمرتين نفس المستوى. ما يتغير شي لا بالجودة ولا بالخدمة. ناس محترمين.' },
      { name: 'هند الشمري',         initials: 'ه', quote: 'أجمل شي إنهم يسمعونك ويفهمون احتياجك. طلعت بمطبخ فوق توقعاتي والتسليم كان قبل الموعد.' }
    ]
  },

  /* ───────── Branches ───────── */
  branches: {
    items: [
      {
        city:    'الرياض',
        badge:   'المعرض الرئيسي',
        address: 'طريق الإمام سعود بن عبدالعزيز، حي التعاون',
        phone:   '920031000',
        mapUrl:  'https://maps.app.goo.gl/AcM6F4wgarnTKvQ99'
      }
    ]
  },

  /* ───────── Contact info ───────── */
  contact: {
    phone:    '920031000',
    whatsapp: '966920031000',
    email:    'info@uwkitchens.com',
    address:  'طريق الإمام سعود بن عبدالعزيز، حي التعاون، الرياض'
  },

  /* ───────── Partners (20 logos) ───────── */
  partners: {
    title: 'يثقون في جودتنا',
    items: [
      { name: 'روشن',             logo: 'images/partners/Property 1=Roshn.svg' },
      { name: 'سنومي',            logo: 'images/partners/Property 1=Cenomi.svg' },
      { name: 'رتال',              logo: 'images/partners/Property 1=Retal.svg' },
      { name: 'المهيدب',           logo: 'images/partners/al-muhaidib.png' },
      { name: 'تلال',              logo: 'images/partners/Telal-Real-Estate.png' },
      { name: 'سمو العقارية',     logo: 'images/partners/Property 1=Somu.svg' },
      { name: 'الماجدية',          logo: 'images/partners/Property 1=Almajdiah.svg' },
      { name: 'الدرعية',           logo: 'images/partners/Property 1=Diriyah company 1.svg' },
      { name: 'أساس مكين',        logo: 'images/partners/makeen.webp' },
      { name: 'عبد اللطيف جميل', logo: 'images/partners/abdul-latif-jameel.png' },
      { name: 'دار الأركان',       logo: 'images/partners/dar-arkan.png' },
      { name: 'إعمار',             logo: 'images/partners/emaar.png' },
      { name: 'أجدان',             logo: 'images/partners/ajdan.png' },
      { name: 'العجلان',          logo: 'images/partners/alajlan.png' },
      { name: 'منازل',             logo: 'images/partners/manazel.png' },
      { name: 'كالما',             logo: 'images/partners/calma.png' },
      { name: 'الوان',             logo: 'images/partners/alwan.png' },
      { name: 'تالكو',             logo: 'images/partners/talco.png' },
      { name: 'إلبا',              logo: 'images/partners/elba.png' },
      { name: 'بلوم',              logo: 'images/partners/blum.png' }
    ]
  },

  /* ───────── Quality certifications (8 logos) ───────── */
  certs: {
    eyebrow: 'معتمدون ومرخّصون',
    heading: 'نلتزم بأعلى معايير الجودة والسلامة العالمية',
    items: [
      { name: 'SASO',                            logo: 'images/Quality/Logo=SASO.png' },
      { name: 'CE',                              logo: 'images/Quality/Logo=CE.png' },
      { name: 'BSI',                             logo: 'images/Quality/Logo=bsi.png' },
      { name: 'ASTM',                            logo: 'images/Quality/Logo=ATSM.png' },
      { name: 'CEN',                             logo: 'images/Quality/Logo=CEN.png' },
      { name: 'German Quality',                  logo: 'images/Quality/Logo=german.png' },
      { name: 'شهادة CE للجودة',                logo: 'images/Quality/Logo=CE-Quality.jpg' },
      { name: 'المركز السعودي لكفاءة الطاقة', logo: 'images/Quality/Logo=Kafaah.png' }
    ]
  }

};
