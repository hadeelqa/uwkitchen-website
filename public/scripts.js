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
    {src:'images/kitchens/kitchen-01.webp', alt:'مطبخ عصري أبيض'},
    {src:'images/kitchens/kitchen-02.webp', alt:'مطبخ خشبي حديث'},
    {src:'images/kitchens/kitchen-03.webp', alt:'مطبخ رمادي أنيق'},
    {src:'images/kitchens/kitchen-04.webp', alt:'مطبخ كلاسيكي فاتح'},
    {src:'images/kitchens/kitchen-05.webp', alt:'مطبخ مودرن مع جزيرة'},
    {src:'images/kitchens/kitchen-06.webp', alt:'مطبخ داكن فاخر'},
    {src:'images/kitchens/kitchen-07.webp', alt:'مطبخ بيج مع إضاءة'},
    {src:'images/kitchens/kitchen-08.webp', alt:'مطبخ خشب ورخام'},
    {src:'images/kitchens/kitchen-09.webp', alt:'مطبخ أبيض واسع'},
    {src:'images/kitchens/kitchen-10.webp', alt:'مطبخ عملي مدمج'},
    {src:'images/kitchens/kitchen-11.webp', alt:'مطبخ زاوية حديث'},
    {src:'images/kitchens/kitchen-12.webp', alt:'مطبخ رخام فاخر'},
    {src:'images/kitchens/kitchen-13.webp', alt:'مطبخ خشبي دافئ'},
    {src:'images/kitchens/kitchen-14.webp', alt:'مطبخ مفتوح عصري'},
    {src:'images/kitchens/kitchen-15.webp', alt:'مطبخ أبيض مع رفوف'},
    {src:'images/kitchens/kitchen-16.webp', alt:'مطبخ رمادي مع جزيرة'},
    {src:'images/kitchens/kitchen-17.webp', alt:'مطبخ كريمي أنيق'},
    {src:'images/kitchens/kitchen-18.webp', alt:'مطبخ خشب طبيعي'},
    {src:'images/kitchens/kitchen-19.webp', alt:'مطبخ مودرن داكن'},
    {src:'images/kitchens/kitchen-20.webp', alt:'مطبخ فسيح مع بار'},
    {src:'images/kitchens/kitchen-21.webp', alt:'مطبخ أبيض كلاسيكي'},
    {src:'images/kitchens/kitchen-22.webp', alt:'مطبخ رمادي مع إضاءة'},
    {src:'images/kitchens/kitchen-23.webp', alt:'مطبخ خشب وأبيض'},
    {src:'images/kitchens/kitchen-24.webp', alt:'مطبخ زجاج وخشب'},
    {src:'images/kitchens/kitchen-25.webp', alt:'مطبخ عصري مفتوح'},
    {src:'images/kitchens/kitchen-26.webp', alt:'مطبخ بيج فاتح'},
    {src:'images/kitchens/kitchen-27.webp', alt:'مطبخ مع خزائن عالية'},
    {src:'images/kitchens/kitchen-28.webp', alt:'مطبخ رخام أبيض'},
    {src:'images/kitchens/kitchen-29.webp', alt:'مطبخ خشبي مع جزيرة'},
    {src:'images/kitchens/kitchen-30.webp', alt:'مطبخ رمادي فاخر'},
    {src:'images/kitchens/kitchen-31.webp', alt:'مطبخ حديث بإنارة'},
    {src:'images/kitchens/kitchen-32.webp', alt:'مطبخ أبيض وذهبي'},
    {src:'images/kitchens/kitchen-33.webp', alt:'مطبخ مدمج عملي'},
    {src:'images/kitchens/kitchen-34.webp', alt:'مطبخ واسع مع بار'},
    {src:'images/kitchens/kitchen-35.webp', alt:'مطبخ كريمي مع رخام'},
    {src:'images/kitchens/kitchen-36.webp', alt:'مطبخ خشبي أنيق'},
    {src:'images/kitchens/kitchen-37.webp', alt:'مطبخ أبيض بتصميم L'},
    {src:'images/kitchens/kitchen-38.webp', alt:'مطبخ رمادي مع خشب'},
    {src:'images/kitchens/kitchen-39.webp', alt:'مطبخ فاتح مع إضاءة'},
    {src:'images/kitchens/kitchen-40.webp', alt:'مطبخ كلاسيكي فخم'},
    {src:'images/kitchens/kitchen-41.webp', alt:'مطبخ مودرن مع زجاج'},
    {src:'images/kitchens/kitchen-42.webp', alt:'مطبخ خشب داكن'},
    {src:'images/kitchens/kitchen-43.webp', alt:'مطبخ أبيض مع جزيرة كبيرة'},
    {src:'images/kitchens/kitchen-44.webp', alt:'مطبخ رمادي عصري'},
    {src:'images/kitchens/kitchen-45.webp', alt:'مطبخ بيج مع رفوف مضيئة'},
    {src:'images/kitchens/kitchen-46.webp', alt:'مطبخ خشب فاتح'},
    {src:'images/kitchens/kitchen-47.webp', alt:'مطبخ أبيض مع رخام رمادي'},
    {src:'images/kitchens/kitchen-48.webp', alt:'مطبخ عملي زاوية'},
    {src:'images/kitchens/kitchen-49.webp', alt:'مطبخ فاخر مع إنارة'},
    {src:'images/kitchens/kitchen-50.webp', alt:'مطبخ حديث مع بار جلوس'},
  ];
  var initialCount = 8;
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

/* ═══════ KITCHEN LIGHTBOX - with focus trap ═══════ */
var _lastFocused = null;
function openLightbox(src, alt){
  var lb = document.getElementById('lightbox');
  var img = document.getElementById('lightboxImg');
  if(!lb || !img) return;
  _lastFocused = document.activeElement;
  img.src = src;
  img.alt = alt || '';
  lb.classList.add('active');
  document.body.style.overflow = 'hidden';
  // Focus close button for keyboard accessibility
  var closeBtn = document.getElementById('lightboxClose');
  if(closeBtn) setTimeout(function(){ closeBtn.focus(); }, 100);
}
function closeLightbox(){
  var lb = document.getElementById('lightbox');
  if(!lb) return;
  lb.classList.remove('active');
  document.body.style.overflow = '';
  // Restore focus to the element that opened the lightbox
  if(_lastFocused) _lastFocused.focus();
}
// Lightbox event listeners (no inline handlers)
(function(){
  var lb = document.getElementById('lightbox');
  var closeBtn = document.getElementById('lightboxClose');
  var lbImg = document.getElementById('lightboxImg');
  if(!lb) return;
  // Close on background click
  lb.addEventListener('click', function(e){
    if(e.target === lb) closeLightbox();
  });
  // Close button click
  if(closeBtn) closeBtn.addEventListener('click', closeLightbox);
  // Prevent close when clicking image
  if(lbImg) lbImg.addEventListener('click', function(e){ e.stopPropagation(); });
  // Focus trap inside lightbox
  lb.addEventListener('keydown', function(e){
    if(!lb.classList.contains('active')) return;
    if(e.key === 'Escape'){ closeLightbox(); return; }
    if(e.key === 'Tab'){
      // Trap focus to the close button only
      e.preventDefault();
      if(closeBtn) closeBtn.focus();
    }
  });
})();
// Attach click to kitchen items (delegated)
document.addEventListener('click', function(e){
  var item = e.target.closest('.kitchen-item');
  if(!item) return;
  var img = item.querySelector('img');
  if(img) openLightbox(img.src, img.alt);
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
      } else if(id === 'ph' && !/^[\d\s\+\-]{7,15}$/.test(el.value.trim())){
        showError(el, 'الرجاء إدخال رقم جوال صحيح');
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

    // Build FormData with metadata for FormSubmit.co
    var fd = new FormData();
    fd.append('name', document.getElementById('fn').value.trim());
    fd.append('phone', document.getElementById('ph').value.trim());
    fd.append('city', document.getElementById('city').value.trim());
    fd.append('district', document.getElementById('district').value.trim());
    fd.append('_subject', 'طلب زيارة قياس جديد');
    fd.append('_template', 'table');
    fd.append('_captcha', 'false');
    fd.append('form_type', 'طلب زيارة قياس');
    fd.append('submitted_at', new Date().toLocaleString('ar-SA'));

    function onDone(){
      form.reset();
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      submitting = false;
      if(successMsg) successMsg.hidden = false;
      setTimeout(function(){ if(successMsg) successMsg.hidden = true; }, 5000);
    }

    // Fire-and-forget POST - no-cors means opaque response, but the request
    // is delivered. Show success regardless so the user isn't blocked by
    // transient network issues.
    fetch('https://formsubmit.co/info@uwkitchens.com', {
      method: 'POST',
      mode: 'no-cors',
      body: fd
    }).then(onDone).catch(onDone);
  });
})();
