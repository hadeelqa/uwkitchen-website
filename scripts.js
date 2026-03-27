/* ═══════ MOBILE NAV ═══════ */
function closeNav(){
  const nl = document.getElementById('navLinks');
  const hb = document.getElementById('hamburger');
  if(nl) nl.classList.remove('open');
  if(hb) hb.classList.remove('open');
  document.body.classList.remove('nav-open');
}
function openNav(){
  const nl = document.getElementById('navLinks');
  const hb = document.getElementById('hamburger');
  if(nl) nl.classList.toggle('open');
  if(hb) hb.classList.toggle('open');
  document.body.classList.toggle('nav-open', nl && nl.classList.contains('open'));
}


/* ═══════ ANNOUNCEMENT CLOSE ═══════ */
function closeAnnounce(){
  document.getElementById('announce').classList.add('hidden');
  document.getElementById('nav').classList.add('no-announce');
  document.querySelector('.hero').style.marginTop='0';
}

/* ═══════ SCROLL ANIMATION ENGINE ═══════ */
function checkVisible(){
  document.querySelectorAll('[data-animate]:not(.in-view)').forEach(function(el){
    var rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight * 1.15 && rect.bottom > -50){
      el.classList.add('in-view');
    }
  });
}
// Run on scroll
window.addEventListener('scroll', checkVisible, {passive:true});
// Run on load and shortly after
checkVisible();
setTimeout(checkVisible, 300);
setTimeout(checkVisible, 800);

/* ═══════ ANIMATED COUNTERS ═══════ */
function animateCounter(el){
  const target = parseFloat(el.dataset.target);
  const prefix = el.dataset.prefix||'';
  const suffix = el.dataset.suffix||'';
  const isDecimal = el.hasAttribute('data-decimal');
  const useSeparator = el.hasAttribute('data-separator');
  const decimals = parseInt(el.dataset.decimals||(isDecimal?'1':'0'));
  const duration = 2000;
  const start = performance.now();
  function tick(now){
    const p = Math.min((now-start)/duration,1);
    const eased = 1-Math.pow(1-p,4);
    const val = target*eased;
    if(decimals>0||isDecimal){
      el.textContent = prefix+val.toFixed(decimals||1)+suffix;
    } else if(useSeparator){
      el.textContent = prefix+Math.floor(val).toLocaleString('en-US')+suffix;
    } else {
      el.textContent = prefix+Math.floor(val)+suffix;
    }
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(!e.isIntersecting) return;
    const el = e.target;
    // Wait for fade-in animation to complete before counting
    setTimeout(()=>animateCounter(el), 400);
    counterObs.unobserve(el);
  });
},{threshold:0.2});
document.querySelectorAll('.stat-value, .counter').forEach(el=>counterObs.observe(el));

/* ═══════ HERO PARALLAX ═══════ */
const heroImg = document.getElementById('heroImg');
if(heroImg && window.innerWidth >= 768){
  window.addEventListener('scroll',()=>{
    const y = window.scrollY;
    if(y < window.innerHeight * 1.2){
      heroImg.style.transform = 'translateY('+y*0.12+'px)';
    }
  },{passive:true});
}

/* ═══════ PARTNERS ═══════ */
const pTrack = document.getElementById('partnersTrack');
if(pTrack){
  const partners = [
    {name:'سابك', logo:'images/partners/Property 1=Sabic.svg'},
    {name:'روشن', logo:'images/partners/Property 1=Roshn.svg'},
    {name:'سنومي', logo:'images/partners/Property 1=Cenomi.svg'},
    {name:'رتال', logo:'images/partners/Property 1=Retal.svg'},
    {name:'المهيدب', logo:'images/partners/al-muhaidib.png'},
    {name:'تلال', logo:'images/partners/Telal-Real-Estate.png'},
    {name:'سمو العقارية', logo:'images/partners/Property 1=Somu.svg'},
    {name:'الماجدية', logo:'images/partners/Property 1=Almajdiah.svg'},
    {name:'الدرعية', logo:'images/partners/Property 1=Diriyah company 1.svg'},
    {name:'أساس مكين', logo:'images/partners/makeen.webp'},
    {name:'الهيئة السعودية للمقاولين', logo:'images/partners/20220513231301!شعار_الهيئة_السعودية_للمقاولين.png'}
  ];
  partners.forEach(p => {
    const cell = document.createElement('div');
    cell.className = 'partner-cell';
    const img = document.createElement('img');
    img.className = 'partner-logo';
    img.src = p.logo;
    img.alt = p.name;
    img.loading = 'lazy';
    img.decoding = 'async';
    cell.appendChild(img);
    pTrack.appendChild(cell);
  });
}


/* ═══════ TESTIMONIALS MARQUEE ═══════ */
const starSvg = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--gold)" stroke="none"/></svg>';
const row1Data = [
  {name:'أبو عبدالله',initials:'أع',quote:'من أفضل الشركات اللي تعاملت معهم. التصميم طلع أحلى من اللي تخيلته والتركيب كان سريع واحترافي.'},
  {name:'ليلى عبدالكريم',initials:'لع',quote:'اليوم تم انجاز المطبخ من شركة المطابخ الابيض المتحدة. سعدت جداً بالعمل مع المهندس المتميز عبد الله.'},
  {name:'ماجد الدويش',initials:'مد',quote:'أحب أشكر المهندس فتح الله على شغله المميز في تصميم المطبخ. من أول اجتماع كان واضح حرصه على التفاصيل.'},
  {name:'سارة أبوزيد',initials:'سأ',quote:'مش عارفة أبدأ من فين عشان اشكرهم من اول المعاينة المجانية اللي شجعتنا نكمل معاهم ولا التصميم الجميل.'},
];
const row2Data = [
  {name:'أم سارة',initials:'أس',quote:'مطبخي صار تحفة! الخامات ممتازة والضمان أعطاني راحة بال. أنصح الكل يتعاملون معهم بدون تردد.'},
  {name:'خالد المطيري',initials:'خم',quote:'خدمة التتبع المباشر شيء مميز جداً. تابعت كل مرحلة من موبايلي وكان الموعد دقيق. تجربة ممتازة.'},
  {name:'نورة الحربي',initials:'نح',quote:'التركيب خلص بالضبط في 20 يوم زي ما قالوا. الفريق كان محترف ونظيف ويحترم البيت. شغل راقي.'},
  {name:'فهد العتيبي',initials:'فع',quote:'أخذت عروض من 5 شركات وكان عرضهم الأفضل من ناحية الجودة والسعر. الضمان 15 سنة أعطاني ثقة كاملة.'},
  {name:'عبدالرحمن السبيعي',initials:'عس',quote:'تعاملت معهم مرتين والمرتين نفس المستوى. ما يتغير شي لا بالجودة ولا بالخدمة. ناس محترمين.'},
  {name:'هند الشمري',initials:'هش',quote:'أجمل شي إنهم يسمعونك ويفهمون احتياجك. طلعت بمطبخ فوق توقعاتي والتسليم كان قبل الموعد.'},
];
function buildCard(t){
  return '<div class="test-card"><div class="test-rating">'+starSvg.repeat(5)+'</div><p class="test-quote">'+t.quote+'</p><div class="test-author"><div class="test-avatar">'+t.initials+'</div><span class="test-name">'+t.name+'</span></div></div>';
}
function fillRow(id, data){
  var el = document.getElementById(id);
  if(!el) return;
  var html = data.map(buildCard).join('');
  el.innerHTML = html + html + html;
}
fillRow('testRow1', row1Data);
fillRow('testRow2', row2Data);

/* ═══════ KITCHENS GALLERY ═══════ */
const kitchensGrid = document.getElementById('kitchensGrid');
if(kitchensGrid){
  const kitchenPhotos = [
    {src:'images/20250826_203824000_iOS.jpg', alt:'مطبخ عصري - إضاءة مدمجة'},
    {src:'images/20250823_174436000_iOS.jpg', alt:'مطبخ رمادي - تصميم حديث'},
    {src:'images/20250813_202444000_iOS.jpg', alt:'مطبخ بني - رفوف مضيئة'},
    {src:'images/20250817_173820000_iOS.jpg', alt:'مطبخ خشبي - أسطح بيضاء'},
    {src:'images/20240318_232707000_iOS.jpg', alt:'مطبخ كلاسيكي أبيض مع جزيرة'},
    {src:'images/20230812_170209000_iOS.jpg', alt:'مطبخ خشب فاتح - تشطيب رخام'},
    {src:'images/20230726_172206000_iOS.jpg', alt:'مطبخ كلاسيكي - خشب وأبيض'},
    {src:'images/20250127_170907920_iOS.jpg', alt:'مطبخ مودرن - إنارة سقف'},
    {src:'images/20250127_171041700_iOS.jpg', alt:'مطبخ عملي - خشب ورمادي'},
    {src:'images/20250119_162350160_iOS.jpg', alt:'مطبخ رمادي أنيق'},
    {src:'images/20250122_163006800_iOS.jpg', alt:'مطبخ داكن - خزائن زجاجية'},
    {src:'images/20250128_165614880_iOS.jpg', alt:'مطبخ واسع - تصميم L'},
  ];
  kitchenPhotos.forEach(function(p, i){
    var div = document.createElement('div');
    div.className = 'kitchen-item';
    div.style.transitionDelay = (i * 0.1) + 's';
    var img = document.createElement('img');
    img.src = p.src;
    img.alt = p.alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    div.appendChild(img);
    kitchensGrid.appendChild(div);
  });
  // Staggered scroll-triggered animation
  var kitchenObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        kitchenObs.unobserve(e.target);
      }
    });
  },{threshold:0.15,rootMargin:'-20px 0px'});
  kitchensGrid.querySelectorAll('.kitchen-item').forEach(function(el){kitchenObs.observe(el)});
  // Scroll progress bar
  var progressBar = document.querySelector('.scroll-progress-bar');
  if(progressBar){
    kitchensGrid.addEventListener('scroll', function(){
      var maxScroll = kitchensGrid.scrollWidth - kitchensGrid.clientWidth;
      var pct = maxScroll > 0 ? (kitchensGrid.scrollLeft / maxScroll) * 100 : 0;
      progressBar.style.width = Math.max(10, pct) + '%';
    }, {passive:true});
  }
}

/* ═══════ SCROLL TOP + WHATSAPP FAB ═══════ */
const scrollTopBtn = document.getElementById('scrollTop');
const waFab = document.getElementById('waFab');
if(scrollTopBtn || waFab){
  window.addEventListener('scroll',()=>{
    var y = window.scrollY;
    if(scrollTopBtn) scrollTopBtn.classList.toggle('show', y > 500);
    if(waFab) waFab.classList.toggle('show', y > 300);
  },{passive:true});
}

/* ═══════ FACTORY, MATERIALS & GALLERY IMAGES ═══════ */
(function(){
  const f1=document.getElementById('fac-img-1');
  const f2=document.getElementById('fac-img-2');
  const f3=document.getElementById('fac-img-3');
  if(f1) f1.src='images/20250128_165614880_iOS.jpg';
  if(f2) f2.src='images/20250121_170225560_iOS.jpg';
  if(f3) f3.src='images/20250128_165626190_iOS.jpg';
  const matImg=document.getElementById('mat-visual-img');
  if(matImg) matImg.src='images/20250823_174436000_iOS.jpg';
  const g1=document.getElementById('gallery-img-1');
  const g2=document.getElementById('gallery-img-2');
  const g3=document.getElementById('gallery-img-3');
  if(g1) g1.src='images/20250826_203824000_iOS.jpg';
  if(g2) g2.src='images/20240318_232707000_iOS.jpg';
  if(g3) g3.src='images/20250813_202444000_iOS.jpg';
})();

/* ═══════ AUTO-HIDE ANNOUNCEMENT ON SCROLL ═══════ */
(function(){
  var announce = document.getElementById('announce');
  if(!announce) return;
  var lastY = 0;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if(y > 200){
      announce.classList.add('scrolled');
      document.getElementById('nav').classList.add('no-announce');
    } else {
      announce.classList.remove('scrolled');
      document.getElementById('nav').classList.remove('no-announce');
    }
    lastY = y;
  }, {passive:true});
})();

/* ═══════ KITCHEN LIGHTBOX ═══════ */
function openLightbox(src, alt){
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  if(!lb || !img) return;
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox(){
  var lb = document.getElementById('lightbox');
  if(!lb) return;
  lb.classList.remove('active');
  document.body.style.overflow = '';
}
// Close on Escape key
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') closeLightbox();
});
// Attach click to kitchen items
document.addEventListener('click', function(e){
  var item = e.target.closest('.kitchen-item');
  if(!item) return;
  var img = item.querySelector('img');
  if(img) openLightbox(img.src, img.alt);
});
