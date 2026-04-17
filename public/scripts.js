/* ═══════ CLADDING COLOR CAROUSEL ═══════ */
(function(){
  var cards = document.querySelectorAll('[data-cladding-card]');
  if(!cards.length) return;
  cards.forEach(function(card){
    var slides = card.querySelectorAll('.cladding-slide');
    var dots = card.querySelectorAll('.cladding-dot');
    var viewer = card.querySelector('[data-cladding-viewer]');
    if(!slides.length || !dots.length || !viewer) return;
    function activate(i){
      slides.forEach(function(s,idx){ s.classList.toggle('is-active', idx===i); });
      dots.forEach(function(d,idx){
        d.classList.toggle('is-active', idx===i);
        d.setAttribute('aria-selected', idx===i ? 'true' : 'false');
      });
    }
    dots.forEach(function(dot, i){
      dot.addEventListener('click', function(e){
        e.stopPropagation();
        activate(i);
      });
    });
    viewer.addEventListener('click', function(e){
      if(e.target.closest('.cladding-dot')) return;
      if(typeof openLightbox !== 'function') return;
      var gallery = Array.prototype.map.call(slides, function(s){
        return { src: s.getAttribute('src'), alt: s.getAttribute('alt') || '' };
      });
      var activeIdx = 0;
      slides.forEach(function(s,i){ if(s.classList.contains('is-active')) activeIdx = i; });
      openLightbox(gallery[activeIdx].src, gallery[activeIdx].alt, gallery, activeIdx);
    });
  });
})();

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

/* ═══════ ANNOUNCEMENT CLOSE (no inline handler) ═══════ */
(function(){
  var btn = document.getElementById('announceClose');
  if(!btn) return;
  btn.addEventListener('click', function(){
    document.getElementById('announce').classList.add('hidden');
    document.getElementById('nav').classList.add('no-announce');
    document.querySelector('.hero').style.marginTop='0';
  });
})();

/* ═══════ SCROLL TOP (no inline handler) ═══════ */
(function(){
  var btn = document.getElementById('scrollTop');
  if(btn){
    btn.addEventListener('click', function(){
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }
})();

/* ═══════ SCROLL ANIMATION ENGINE ═══════ */
function checkVisible(){
  document.querySelectorAll('[data-animate]:not(.in-view)').forEach(function(el){
    var rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight * 1.15 && rect.bottom > -50){
      el.classList.add('in-view');
    }
  });
}
window.addEventListener('scroll', checkVisible, {passive:true});
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
    setTimeout(()=>animateCounter(el), 400);
    counterObs.unobserve(el);
  });
},{threshold:0.2});
document.querySelectorAll('.stat-value, .counter').forEach(el=>counterObs.observe(el));

/* ═══════ HERO PARALLAX (rAF-throttled) ═══════ */
const heroImg = document.getElementById('heroImg');
if(heroImg && window.innerWidth >= 768){
  var _parallaxTick = false;
  window.addEventListener('scroll',function(){
    if(_parallaxTick) return;
    _parallaxTick = true;
    requestAnimationFrame(function(){
      var y = window.scrollY;
      if(y < window.innerHeight * 1.2){
        heroImg.style.transform = 'translateY('+y*0.12+'px)';
      }
      _parallaxTick = false;
    });
  },{passive:true});
}

/* ═══════ PARTNERS (lazy loaded) ═══════ */
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
  for(var c=0;c<2;c++){
    partners.forEach(function(p){
      var cell = document.createElement('div');
      cell.className = 'partner-cell';
      var img = document.createElement('img');
      img.className = 'partner-logo';
      img.alt = p.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = p.logo;
      cell.appendChild(img);
      pTrack.appendChild(cell);
    });
  }
}

/* ═══════ TESTIMONIALS MARQUEE (DOM-safe, no innerHTML) ═══════ */
var row1Data = [
  {name:'أبو عبدالله',initials:'أ',quote:'من أفضل الشركات اللي تعاملت معهم. التصميم طلع أحلى من اللي تخيلته والتركيب كان سريع واحترافي.'},
  {name:'ليلى عبدالكريم',initials:'ل',quote:'اليوم تم انجاز المطبخ من شركة المطابخ الابيض المتحدة. سعدت جداً بالعمل مع المهندس المتميز عبد الله.'},
  {name:'ماجد الدويش',initials:'م',quote:'أحب أشكر المهندس فتح الله على شغله المميز في تصميم المطبخ. من أول اجتماع كان واضح حرصه على التفاصيل.'},
  {name:'سارة أبوزيد',initials:'س',quote:'مش عارفة أبدأ من فين عشان اشكرهم من اول المعاينة المجانية اللي شجعتنا نكمل معاهم ولا التصميم الجميل.'},
];
var row2Data = [
  {name:'أم سارة',initials:'أ',quote:'مطبخي صار تحفة! الخامات ممتازة والضمان أعطاني راحة بال. أنصح الكل يتعاملون معهم بدون تردد.'},
  {name:'خالد المطيري',initials:'خ',quote:'خدمة التتبع المباشر شيء مميز جداً. تابعت كل مرحلة من موبايلي وكان الموعد دقيق. تجربة ممتازة.'},
  {name:'نورة الحربي',initials:'ن',quote:'التركيب خلص بالضبط في 20 يوم زي ما قالوا. الفريق كان محترف ونظيف ويحترم البيت. شغل راقي.'},
  {name:'فهد العتيبي',initials:'ف',quote:'أخذت عروض من 5 شركات وكان عرضهم الأفضل من ناحية الجودة والسعر. الضمان 15 سنة أعطاني ثقة كاملة.'},
  {name:'عبدالرحمن السبيعي',initials:'ع',quote:'تعاملت معهم مرتين والمرتين نفس المستوى. ما يتغير شي لا بالجودة ولا بالخدمة. ناس محترمين.'},
  {name:'هند الشمري',initials:'ه',quote:'أجمل شي إنهم يسمعونك ويفهمون احتياجك. طلعت بمطبخ فوق توقعاتي والتسليم كان قبل الموعد.'},
];
function buildCardDOM(t){
  var card = document.createElement('div');
  card.className = 'test-card';
  // Stars
  var rating = document.createElement('div');
  rating.className = 'test-rating';
  for(var s=0;s<5;s++){
    var star = document.createElementNS('http://www.w3.org/2000/svg','svg');
    star.setAttribute('viewBox','0 0 24 24');
    var path = document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d','M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
    path.setAttribute('fill','var(--gold)');
    path.setAttribute('stroke','none');
    star.appendChild(path);
    rating.appendChild(star);
  }
  card.appendChild(rating);
  // Quote
  var quote = document.createElement('p');
  quote.className = 'test-quote';
  quote.textContent = t.quote;
  card.appendChild(quote);
  // Author
  var author = document.createElement('div');
  author.className = 'test-author';
  var avatar = document.createElement('div');
  avatar.className = 'test-avatar';
  avatar.textContent = t.initials;
  author.appendChild(avatar);
  var name = document.createElement('span');
  name.className = 'test-name';
  name.textContent = t.name;
  author.appendChild(name);
  card.appendChild(author);
  return card;
}
function fillRowDOM(id, data){
  var el = document.getElementById(id);
  if(!el) return;
  // Triple the cards for marquee effect
  for(var r=0;r<3;r++){
    data.forEach(function(t){ el.appendChild(buildCardDOM(t)); });
  }
}
fillRowDOM('testRow1', row1Data);
fillRowDOM('testRow2', row2Data);

/* ═══════ KITCHENS GALLERY ═══════ */
const kitchensGrid = document.getElementById('kitchensGrid');
if(kitchensGrid){
  const kitchenPhotos = [
    {src:'images/kitchens/featured/01-classic-white-gas.webp', alt:'مطبخ كلاسيكي أبيض'},
    {src:'images/kitchens/featured/02-modern-walnut-galley.webp', alt:'مطبخ خشب جوز مودرن'},
    {src:'images/kitchens/featured/03-dark-matte-island.webp', alt:'مطبخ داكن مات بجزيرة'},
    {src:'images/kitchens/featured/04-minimal-white-cooktop.webp', alt:'مطبخ أبيض مينيمال'},
    {src:'images/kitchens/featured/05-shaker-white-island.webp', alt:'مطبخ شيكر أبيض'},
    {src:'images/kitchens/featured/06-walnut-marble-barstools.webp', alt:'مطبخ جوز ورخام بكراسي بار'},
    {src:'images/kitchens/featured/07-grey-glass-cabinets.webp', alt:'مطبخ رمادي بخزائن زجاج'},
    {src:'images/kitchens/more/01.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/02.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/03.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/04.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/05.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/06.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/07.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/08.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/09.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/15.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/16.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/19.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/21.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/22.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/25.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/27.webp', alt:'مطبخ من تنفيذنا'},
    {src:'images/kitchens/more/28.webp', alt:'مطبخ من تنفيذنا'},
  ];
  var initialCount = 7;
  function buildItem(p, idx){
    var div = document.createElement('div');
    div.className = 'kitchen-item';
    if(idx >= initialCount) div.classList.add('kitchen-item--hidden');
    var img = document.createElement('img');
    img.alt = p.alt;
    img.decoding = 'async';
    if(idx < 3){
      img.src = p.src;
    } else {
      img.loading = 'lazy';
      img.src = p.src;
    }
    div.appendChild(img);
    return div;
  }
  kitchenPhotos.forEach(function(p, i){
    kitchensGrid.appendChild(buildItem(p, i));
  });
  var showAllBtn = document.getElementById('kitchensShowAll');
  if(showAllBtn && kitchenPhotos.length <= initialCount){
    showAllBtn.parentElement.style.display = 'none';
  }
  if(showAllBtn){
    var expanded = false;
    showAllBtn.addEventListener('click', function(){
      if(!expanded){
        var hidden = kitchensGrid.querySelectorAll('.kitchen-item--hidden');
        hidden.forEach(function(el){ el.classList.remove('kitchen-item--hidden') });
        showAllBtn.innerHTML = 'عرض أقل <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="18 15 12 9 6 15"/></svg>';
        expanded = true;
      } else {
        var items = kitchensGrid.querySelectorAll('.kitchen-item');
        items.forEach(function(el, i){ if(i >= initialCount) el.classList.add('kitchen-item--hidden') });
        showAllBtn.innerHTML = 'عرض الكل <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><polyline points="6 9 12 15 18 9"/></svg>';
        expanded = false;
        kitchensGrid.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  }
}

/* ═══════ SCROLL TOP + WHATSAPP FAB + NAV STATE ═══════ */
const scrollTopBtn = document.getElementById('scrollTop');
const waFab = document.getElementById('waFab');
var navEl = document.getElementById('nav');
window.addEventListener('scroll',function(){
  var y = window.scrollY;
  if(scrollTopBtn) scrollTopBtn.classList.toggle('show', y > 500);
  if(waFab) waFab.classList.toggle('show', y > 300);
  // Nav scroll state
  if(navEl) navEl.classList.toggle('scrolled', y > 80);
},{passive:true});

/* ═══════ GALLERY STAGGER ANIMATION ═══════ */
(function(){
  var grid = document.getElementById('kitchensGrid');
  if(!grid) return;
  var galObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      // Stagger reveal visible items
      var items = grid.querySelectorAll('.kitchen-item:not(.kitchen-item--hidden)');
      items.forEach(function(item, i){
        setTimeout(function(){ item.classList.add('kitchen-visible'); }, i * 60);
      });
      galObs.unobserve(entry.target);
    });
  },{threshold:0.1});
  galObs.observe(grid);
  // Also reveal items when "show all" is clicked
  var showBtn = document.getElementById('kitchensShowAll');
  if(showBtn){
    showBtn.addEventListener('click', function(){
      setTimeout(function(){
        var newItems = grid.querySelectorAll('.kitchen-item:not(.kitchen-visible):not(.kitchen-item--hidden)');
        newItems.forEach(function(item, i){
          setTimeout(function(){ item.classList.add('kitchen-visible'); }, i * 40);
        });
      }, 50);
    });
  }
})();

/* ═══════ FACTORY, MATERIALS & GALLERY IMAGES ═══════ */
(function(){
  const f1=document.getElementById('fac-img-1');
  const f2=document.getElementById('fac-img-2');
  const f3=document.getElementById('fac-img-3');
  if(f1) f1.src='images/20250128_165614880_iOS.webp';
  if(f2) f2.src='images/20250121_170225560_iOS.webp';
  if(f3) f3.src='images/20250128_165626190_iOS.webp';
  const matImg=document.getElementById('mat-visual-img');
  if(matImg) matImg.src='images/20250823_174436000_iOS.webp';
  const g1=document.getElementById('gallery-img-1');
  const g2=document.getElementById('gallery-img-2');
  const g3=document.getElementById('gallery-img-3');
  if(g1) g1.src='images/20250826_203824000_iOS.webp';
  if(g2) g2.src='images/20240318_232707000_iOS.webp';
  if(g3) g3.src='images/20250813_202444000_iOS.webp';
})();

/* ═══════ AUTO-HIDE ANNOUNCEMENT ON SCROLL ═══════ */
(function(){
  var announce = document.getElementById('announce');
  if(!announce) return;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    if(y > 200){
      announce.classList.add('scrolled');
      document.getElementById('nav').classList.add('no-announce');
    } else {
      announce.classList.remove('scrolled');
      document.getElementById('nav').classList.remove('no-announce');
    }
  }, {passive:true});
})();

/* ═══════ KITCHEN LIGHTBOX - with focus trap + gallery nav ═══════ */
var _lastFocused = null;
var _lbGallery = null;
var _lbIndex = 0;
function _lbRenderDots(){
  var dotsEl = document.getElementById('lightboxDots');
  if(!dotsEl) return;
  if(!_lbGallery || _lbGallery.length < 2){ dotsEl.hidden = true; dotsEl.innerHTML=''; return; }
  dotsEl.hidden = false;
  dotsEl.innerHTML='';
  _lbGallery.forEach(function(item, i){
    var b = document.createElement('button');
    b.type='button';
    b.setAttribute('aria-label','صورة '+(i+1));
    if(i===_lbIndex) b.className='is-active';
    b.addEventListener('click', function(e){ e.stopPropagation(); lightboxGoto(i); });
    dotsEl.appendChild(b);
  });
}
function _lbShowIndex(i){
  if(!_lbGallery || !_lbGallery.length) return;
  _lbIndex = (i + _lbGallery.length) % _lbGallery.length;
  var img = document.getElementById('lightboxImg');
  var item = _lbGallery[_lbIndex];
  if(img && item){ img.src = item.src; img.alt = item.alt || ''; }
  var dotsEl = document.getElementById('lightboxDots');
  if(dotsEl){
    var dots = dotsEl.querySelectorAll('button');
    dots.forEach(function(d,idx){ d.classList.toggle('is-active', idx===_lbIndex); });
  }
}
function lightboxGoto(i){ _lbShowIndex(i); }
function lightboxNav(dir){ _lbShowIndex(_lbIndex + dir); }
function openLightbox(src, alt, gallery, startIndex){
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  if(!lb || !img) return;
  _lastFocused = document.activeElement;
  if(Array.isArray(gallery) && gallery.length){
    _lbGallery = gallery;
    _lbIndex = typeof startIndex === 'number' ? startIndex : 0;
  } else {
    _lbGallery = null;
    _lbIndex = 0;
  }
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  var hasGallery = _lbGallery && _lbGallery.length > 1;
  if(prevBtn) prevBtn.hidden = !hasGallery;
  if(nextBtn) nextBtn.hidden = !hasGallery;
  _lbRenderDots();
  if(hasGallery){
    _lbShowIndex(_lbIndex);
  } else {
    img.src = src;
    img.alt = alt || '';
  }
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
  var closeBtn = document.getElementById('lightboxClose');
  if(closeBtn) setTimeout(function(){ closeBtn.focus(); }, 100);
}
function closeLightbox(){
  var lb = document.getElementById('lightbox');
  if(!lb) return;
  lb.classList.remove('active');
  document.body.style.overflow = '';
  _lbGallery = null;
  if(_lastFocused) _lastFocused.focus();
}
(function(){
  var lb = document.getElementById('lightbox');
  var closeBtn = document.getElementById('lightboxClose');
  var lbImg = document.getElementById('lightboxImg');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  if(!lb) return;
  lb.addEventListener('click', function(e){
    if(e.target === lb) closeLightbox();
  });
  if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if(prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); lightboxNav(-1); });
  if(nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); lightboxNav(1); });
  if(lbImg) lbImg.addEventListener('click', function(e){ e.stopPropagation(); });
  // Swipe support for gallery navigation
  var touchStartX = 0, touchStartY = 0, touchMoved = false;
  lb.addEventListener('touchstart', function(e){
    if(!_lbGallery || _lbGallery.length < 2) return;
    var t = e.changedTouches[0];
    touchStartX = t.clientX; touchStartY = t.clientY; touchMoved = false;
  }, {passive:true});
  lb.addEventListener('touchmove', function(){ touchMoved = true; }, {passive:true});
  lb.addEventListener('touchend', function(e){
    if(!_lbGallery || _lbGallery.length < 2 || !touchMoved) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - touchStartX;
    var dy = t.clientY - touchStartY;
    if(Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    var isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
    // swipe-left (dx<0) in LTR = next; in RTL = prev
    var dir = dx < 0 ? 1 : -1;
    if(isRTL) dir = -dir;
    lightboxNav(dir);
  }, {passive:true});
  lb.addEventListener('keydown', function(e){
    if(!lb.classList.contains('active')) return;
    if(e.key === 'Escape'){ closeLightbox(); return; }
    if(_lbGallery && _lbGallery.length > 1){
      var isRTL = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
      if(e.key === 'ArrowLeft'){ e.preventDefault(); lightboxNav(isRTL ? 1 : -1); return; }
      if(e.key === 'ArrowRight'){ e.preventDefault(); lightboxNav(isRTL ? -1 : 1); return; }
    }
    if(e.key === 'Tab'){
      e.preventDefault();
      if(closeBtn) closeBtn.focus();
    }
  });
})();
// Attach click to kitchen items (delegated) — build gallery from currently-visible kitchens
document.addEventListener('click', function(e){
  var item = e.target.closest('.kitchen-item');
  if(!item) return;
  var grid = item.parentElement;
  if(!grid) return;
  var visible = Array.prototype.filter.call(
    grid.querySelectorAll('.kitchen-item'),
    function(el){ return !el.classList.contains('kitchen-item--hidden'); }
  );
  var gallery = visible.map(function(el){
    var im = el.querySelector('img');
    return im ? { src: im.src, alt: im.alt || '' } : null;
  }).filter(Boolean);
  var idx = visible.indexOf(item);
  if(idx < 0) idx = 0;
  if(gallery.length){
    openLightbox(gallery[idx].src, gallery[idx].alt, gallery, idx);
  } else {
    var im2 = item.querySelector('img');
    if(im2) openLightbox(im2.src, im2.alt);
  }
});

/* ═══════ FORM VALIDATION ═══════ */
(function(){
  var form = document.getElementById('contactForm');
  if(!form) return;
  var submitBtn = document.getElementById('submitBtn');
  var successMsg = document.getElementById('formSuccess');
  var errorMsgs = {
    fn: 'الرجاء إدخال الاسم',
    ph: 'الرجاء إدخال رقم جوال صحيح',
    city: 'الرجاء إدخال المدينة',
    district: 'الرجاء إدخال الحي'
  };
  function showError(field, msg){
    field.classList.add('form-field--error');
    field.setAttribute('aria-invalid','true');
    var err = field.parentElement.querySelector('.form-error');
    if(err) err.textContent = msg;
  }
  function clearError(field){
    field.classList.remove('form-field--error');
    field.removeAttribute('aria-invalid');
    var err = field.parentElement.querySelector('.form-error');
    if(err) err.textContent = '';
  }
  // Clear errors on input
  form.querySelectorAll('input').forEach(function(input){
    input.addEventListener('input', function(){ clearError(input); });
  });
  // Prevent double submit
  var submitting = false;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(submitting) return;
    var valid = true;
    var fields = ['fn','ph','city','district'];
    fields.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      clearError(el);
      if(!el.value.trim()){
        showError(el, errorMsgs[id]);
        valid = false;
      } else if(id === 'ph' && !/^05\d{8}$/.test(el.value.trim())){
        showError(el, 'رقم الجوال لازم يكون 10 أرقام ويبدأ بـ 05');
        valid = false;
      }
    });
    if(!valid){
      // Focus first error
      var firstErr = form.querySelector('.form-field--error');
      if(firstErr) firstErr.focus();
      return;
    }
    // Disable button to prevent double submit
    submitting = true;
    submitBtn.disabled = true;
    submitBtn.classList.add('is-loading');

    var fullName = document.getElementById('fn').value.trim();
    var phone = document.getElementById('ph').value.trim();
    var city = document.getElementById('city').value.trim();
    var district = document.getElementById('district').value.trim();
    var ticket = 'INQ-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random()*90000);

    // Build FormData for FormSubmit (email backup)
    var fd = new FormData();
    fd.append('الاسم', fullName);
    fd.append('رقم الجوال', phone);
    fd.append('المدينة', city);
    fd.append('الحي', district);
    fd.append('نوع الطلب', 'طلب زيارة قياس');
    fd.append('رقم التذكرة', ticket);
    fd.append('تاريخ الإرسال', new Date().toLocaleString('en-GB', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}));
    fd.append('_subject', 'طلب زيارة قياس جديد - ' + ticket);
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');

    function onDone(){
      form.reset();
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitting = false;
      if(successMsg) successMsg.hidden = false;
      setTimeout(function(){ if(successMsg) successMsg.hidden = true; }, 5000);
    }

    // Fire-and-forget email via FormSubmit (backup channel).
    fetch('https://formsubmit.co/info@uwkitchens.com', {
      method: 'POST',
      mode: 'no-cors',
      body: fd
    }).catch(function(){});

    // Save ticket to Firestore (primary channel).
    var db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;
    if(db){
      db.collection('tickets').doc(ticket).set({
        ticketNumber: ticket,
        type: 'inquiry',
        typeLabel: 'طلب زيارة قياس',
        status: 'new',
        fullName: fullName,
        phone: phone,
        city: city,
        district: district,
        source: 'home-contact',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(onDone).catch(function(err){
        if(window.console) console.error('Firestore save failed:', err);
        onDone();
      });
    } else {
      onDone();
    }
  });
})();
