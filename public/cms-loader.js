/*  cms-loader.js  - reads Firestore → patches live DOM
    Drop-in: non-blocking. If Firebase fails the static HTML stays intact. */
(function () {
  /* ── Firebase config (same project as admin.html) ── */
  var cfg = {
    apiKey: "AIzaSyAfOq1iR7HFRq15LDbtONAH7fqw1LGdMek",
    authDomain: "uwkitchen-c3279.firebaseapp.com",
    projectId: "uwkitchen-c3279",
    storageBucket: "uwkitchen-c3279.firebasestorage.app",
    messagingSenderId: "699589252553",
    appId: "1:699589252553:web:e967e5b46eb7ba5e980418"
  };

  /* Bail if Firebase SDK not loaded */
  if (typeof firebase === 'undefined') return;

  /* Only init once (admin.html may already have done it) */
  if (!firebase.apps.length) firebase.initializeApp(cfg);
  var db = firebase.firestore();

  /* Helper: safe text update */
  function setText(sel, val) {
    if (!val) return;
    var el = document.querySelector(sel);
    if (el) el.textContent = val;
  }

  /* ═══════ ANNOUNCE ═══════ */
  function applyAnnounce(d) {
    if (!d.text) return;
    var items = document.querySelectorAll('.marquee-item');
    items.forEach(function (el) {
      /* Keep dots structure, replace text content between dots */
      var dots = el.querySelectorAll('.marquee-dot');
      if (dots.length >= 2) {
        /* Rebuild: dot + text + dot + "احجز الآن" + dot + brand */
        el.innerHTML = '';
        var dot1 = document.createElement('span'); dot1.className = 'marquee-dot';
        var dot2 = document.createElement('span'); dot2.className = 'marquee-dot';
        var dot3 = document.createElement('span'); dot3.className = 'marquee-dot';
        el.appendChild(dot1);
        el.appendChild(document.createTextNode(d.text));
        el.appendChild(dot2);
        el.appendChild(document.createTextNode('احجز الآن'));
        el.appendChild(dot3);
        el.appendChild(document.createTextNode('مطابخ الأبيض المتحدة'));
      }
    });
  }

  /* ═══════ HERO ═══════ */
  function applyHero(d) {
    setText('.hero-title .line1', d.line1);
    setText('.hero-title .line2', d.line2);
    setText('.hero-promise-line1', d.promise1);
    setText('.hero-promise-line2', d.promise2);
    /* CTA button - keep the pulse dot */
    if (d.cta) {
      var btn = document.querySelector('.btn-hero--call');
      if (btn) {
        var dot = btn.querySelector('.pulse-dot');
        btn.textContent = '';
        if (dot) btn.appendChild(dot);
        btn.appendChild(document.createTextNode(' ' + d.cta));
      }
    }
  }

  /* ═══════ STATS ═══════ */
  function applyStats(d) {
    if (!d.items || !d.items.length) return;
    var grid = document.querySelector('.stats-v2-grid');
    if (!grid) return;
    grid.innerHTML = '';
    d.items.forEach(function (s, i) {
      var card = document.createElement('div');
      card.className = 'stats-v2-card';
      card.setAttribute('data-animate', 'fade-up');
      card.setAttribute('data-delay', String(i + 1));
      card.innerHTML =
        '<span class="stats-v2-num">' + escHtml(s.num) + '</span>' +
        '<span class="stats-v2-label">' + escHtml(s.label) + '</span>';
      grid.appendChild(card);
    });
  }

  /* ═══════ GALLERY (kitchen grid) ═══════ */
  function applyGallery(d) {
    if (!d.items || !d.items.length) return;
    var grid = document.getElementById('kitchensGrid');
    if (!grid) return;
    var initialCount = 8;
    grid.innerHTML = '';
    d.items.forEach(function (g, i) {
      var div = document.createElement('div');
      div.className = 'kitchen-item' + (i >= initialCount ? ' kitchen-item--hidden' : '');
      var img = document.createElement('img');
      img.src = g.src;
      img.alt = g.alt || '';
      img.decoding = 'async';
      if (i >= 3) img.loading = 'lazy';
      div.appendChild(img);
      grid.appendChild(div);
    });
    /* Update show-all button visibility */
    var showBtn = document.getElementById('kitchensShowAll');
    if (showBtn && d.items.length <= initialCount) {
      showBtn.parentElement.style.display = 'none';
    }
  }

  /* ═══════ TESTIMONIALS (marquee rows) ═══════ */
  function buildTestCard(t) {
    var card = document.createElement('div');
    card.className = 'test-card';
    var rating = document.createElement('div');
    rating.className = 'test-rating';
    for (var s = 0; s < 5; s++) {
      var star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      star.setAttribute('viewBox', '0 0 24 24');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
      path.setAttribute('fill', 'var(--gold)');
      path.setAttribute('stroke', 'none');
      star.appendChild(path);
      rating.appendChild(star);
    }
    card.appendChild(rating);
    var quote = document.createElement('p');
    quote.className = 'test-quote';
    quote.textContent = t.quote;
    card.appendChild(quote);
    var author = document.createElement('div');
    author.className = 'test-author';
    var avatar = document.createElement('div');
    avatar.className = 'test-avatar';
    avatar.textContent = (t.initials || t.name || '').charAt(0);
    author.appendChild(avatar);
    var name = document.createElement('span');
    name.className = 'test-name';
    name.textContent = t.name;
    author.appendChild(name);
    card.appendChild(author);
    return card;
  }
  function applyTestimonials(d) {
    if (!d.items || !d.items.length) return;
    /* Split items into two rows */
    var half = Math.ceil(d.items.length / 2);
    var row1Items = d.items.slice(0, half);
    var row2Items = d.items.slice(half);
    var row1 = document.getElementById('testRow1');
    var row2 = document.getElementById('testRow2');
    if (row1) {
      row1.innerHTML = '';
      for (var r = 0; r < 3; r++) {
        row1Items.forEach(function (t) { row1.appendChild(buildTestCard(t)); });
      }
    }
    if (row2 && row2Items.length) {
      row2.innerHTML = '';
      for (var r2 = 0; r2 < 3; r2++) {
        row2Items.forEach(function (t) { row2.appendChild(buildTestCard(t)); });
      }
    }
  }

  /* ═══════ BRANCHES ═══════ */
  function applyBranches(d) {
    if (!d.items || !d.items.length) return;
    var grid = document.querySelector('.branches-grid');
    if (!grid) return;
    grid.innerHTML = '';
    d.items.forEach(function (b) {
      var card = document.createElement('div');
      card.className = 'branch-card' + (b.badge ? ' branch-card--active' : '');
      card.setAttribute('data-animate', 'fade-up');
      card.innerHTML =
        (b.badge ? '<div class="branch-badge">' + escHtml(b.badge) + '</div>' : '') +
        '<h3 class="branch-city">' + escHtml(b.city) + '</h3>' +
        '<p class="branch-address">' + escHtml(b.address) + '</p>' +
        '<div class="branch-contacts">' +
          (b.phone ? '<a href="tel:' + escHtml(b.phone) + '" class="branch-contact-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span dir="ltr">' + escHtml(b.phone) + '</span></a>' : '') +
        '</div>' +
        (b.mapUrl ? '<a href="' + escHtml(b.mapUrl) + '" target="_blank" rel="noopener" class="branch-directions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>احصل على الاتجاهات</a>' : '');
      grid.appendChild(card);
    });
  }

  /* ═══════ CONTACT ═══════ */
  function applyContact(d) {
    /* Update phone links across the site */
    if (d.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
        a.href = 'tel:' + d.phone;
      });
    }
    if (d.whatsapp) {
      document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
        a.href = 'https://wa.me/' + d.whatsapp;
      });
    }
    if (d.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
        a.href = 'mailto:' + d.email;
        var span = a.querySelector('span') || a;
        if (span.dir === 'ltr' || !a.querySelector('svg')) span.textContent = d.email;
      });
    }
    if (d.address) {
      setText('.footer-address', d.address);
    }
  }

  /* ═══════ WARRANTY ═══════ */
  function applyWarranty(d) {
    if(d.heading) setText('.warranty-compact h2', d.heading);
    if(d.terms) setText('.warranty-note', d.terms);
    if(!d.items || !d.items.length) return;
    var list = document.querySelector('.warranty-compact-list');
    if(!list) return;
    list.innerHTML = '';
    d.items.forEach(function(item){
      var el = document.createElement('div');
      el.className = 'warranty-compact-item';
      el.setAttribute('data-animate','fade-up');
      el.innerHTML = '<span class="warranty-compact-years">' + escHtml(item.duration) + '</span><span class="warranty-compact-label">' + escHtml(item.name) + '</span>';
      list.appendChild(el);
    });
  }

  /* ═══════ PROCESS ═══════ */
  function applyProcess(d) {
    if(d.eyebrow) setText('.process .section-eyebrow', d.eyebrow);
    if(d.heading) setText('.process .section-title', d.heading);
    if(!d.steps || !d.steps.length) return;
    var grid = document.querySelector('.process-grid');
    if(!grid) return;
    grid.innerHTML = '';
    d.steps.forEach(function(s, i){
      var card = document.createElement('div');
      card.className = 'process-card';
      card.setAttribute('data-animate','fade-up');
      card.setAttribute('data-delay', String(i+1));
      card.innerHTML = '<span class="process-num">' + escHtml(s.number) + '</span><h3 class="process-title">' + escHtml(s.title) + '</h3><p class="process-desc">' + escHtml(s.description) + '</p>';
      grid.appendChild(card);
    });
  }

  /* ═══════ LIVE INSTALL ═══════ */
  function applyLive(d) {
    if(d.eyebrow) setText('.live-install .section-eyebrow', d.eyebrow);
    if(d.heading) setText('.live-install .section-title', d.heading);
    if(d.subtitle) setText('.live-install .section-subtitle', d.subtitle);
    if(d.video){
      var source = document.querySelector('.live-hero-visual video source');
      if(source){ source.src = d.video; source.parentElement.load(); }
    }
    if(d.poster){
      var vid = document.querySelector('.live-hero-visual video');
      if(vid) vid.poster = d.poster;
    }
    if(d.instagram){
      var igLink = document.querySelector('.live-install .btn--secondary[href*="instagram"]');
      if(!igLink) igLink = document.querySelector('.live-install a[href*="instagram"]');
      if(igLink){ igLink.href = d.instagram; }
    }
    if(d.igtext){
      var igBtn = document.querySelector('.live-install .btn--secondary');
      if(igBtn){
        var svg = igBtn.querySelector('svg');
        igBtn.textContent = '';
        if(svg) igBtn.appendChild(svg);
        igBtn.appendChild(document.createTextNode('\n        ' + d.igtext + '\n      '));
      }
    }
    if(d.tiktok){
      var ttLink = document.querySelector('.live-install .btn--tertiary[href*="tiktok"]');
      if(!ttLink) ttLink = document.querySelector('.live-install a[href*="tiktok"]');
      if(ttLink){ ttLink.href = d.tiktok; }
    }
    if(d.tttext){
      var ttBtn = document.querySelector('.live-install .btn--tertiary');
      if(ttBtn){
        var svg2 = ttBtn.querySelector('svg');
        ttBtn.textContent = '';
        if(svg2) ttBtn.appendChild(svg2);
        ttBtn.appendChild(document.createTextNode('\n        ' + d.tttext + '\n      '));
      }
    }
  }

  /* ═══════ KITCHENS ═══════ */
  function applyKitchens(d) {
    if(d.heading) setText('.kitchens-header .section-title', d.heading);
    if(d.tiktok){
      var ttLink = document.querySelector('.kitchens-gallery a[href*="tiktok"]');
      if(ttLink) ttLink.href = d.tiktok;
    }
    if(d.tttext){
      var ttEl = document.querySelector('.kitchens-tiktok-link span, .kitchens-gallery a[href*="tiktok"] span');
      if(ttEl) ttEl.textContent = d.tttext;
    }
    /* Kitchen images from CMS */
    if(d.items && d.items.length) applyGallery({ items: d.items });
  }

  /* ═══════ MATERIALS ═══════ */
  function applyMaterials(d) {
    if(d.heading) setText('.materials .section-title', d.heading);
    if(d.subtitle) setText('.materials .section-subtitle', d.subtitle);
    if(d.colors && d.colors.length){
      var grid = document.querySelector('.cladding-colors');
      if(grid){
        grid.innerHTML = '';
        d.colors.forEach(function(c){
          var card = document.createElement('div');
          card.className = 'cladding-color-card';
          card.setAttribute('data-animate','fade-up');
          card.innerHTML = '<div class="cladding-color-img"><img src="' + escHtml(c.image) + '" alt="' + escHtml(c.nameAr) + '" loading="lazy"></div><div class="cladding-color-name"><span>' + escHtml(c.nameAr) + '</span><span class="cladding-color-en">' + escHtml(c.nameEn) + '</span></div>';
          grid.appendChild(card);
        });
      }
    }
    if(d.stats && d.stats.length){
      var matGrid = document.querySelector('.mat-grid');
      if(matGrid){
        matGrid.innerHTML = '';
        d.stats.forEach(function(s){
          var el = document.createElement('div');
          el.className = 'mat-item';
          el.setAttribute('data-animate','fade-up');
          el.innerHTML = '<span class="mat-num">' + escHtml(s.value) + '</span><span class="mat-label">' + escHtml(s.label) + '</span><p class="mat-desc">' + escHtml(s.description) + '</p>';
          matGrid.appendChild(el);
        });
      }
    }
  }

  /* ═══════ PARTNERS ═══════ */
  function applyPartners(d) {
    if(d.title) setText('.partners .section-subtitle', d.title);
    if(!d.items || !d.items.length) return;
    var track = document.getElementById('partnersTrack');
    if(!track) return;
    track.innerHTML = '';
    // Triple for seamless marquee
    for(var r=0; r<3; r++){
      d.items.forEach(function(p){
        var el = document.createElement('div');
        el.className = 'partner-logo';
        el.innerHTML = '<img src="' + escHtml(p.logo) + '" alt="' + escHtml(p.name) + '" loading="lazy">';
        track.appendChild(el);
      });
    }
  }

  /* ═══════ CERTS ═══════ */
  function applyCerts(d) {
    if(d.eyebrow) setText('.certs-section .section-eyebrow', d.eyebrow);
    if(d.heading) setText('.certs-section .section-title', d.heading);
    if(!d.items || !d.items.length) return;
    var grid = document.querySelector('.cert-grid');
    if(!grid) return;
    grid.innerHTML = '';
    d.items.forEach(function(c){
      var card = document.createElement('div');
      card.className = 'cert-card';
      card.setAttribute('data-animate','fade-up');
      card.innerHTML = '<img src="' + escHtml(c.logo) + '" alt="' + escHtml(c.name) + '" loading="lazy">';
      grid.appendChild(card);
    });
  }

  /* ═══════ HELPERS ═══════ */
  function escHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  /* ═══════ LOAD ═══════ */
  var appliers = {
    announce: applyAnnounce,
    hero: applyHero,
    stats: applyStats,
    gallery: applyGallery,
    testimonials: applyTestimonials,
    branches: applyBranches,
    contact: applyContact,
    warranty: applyWarranty,
    process: applyProcess,
    live: applyLive,
    kitchens: applyKitchens,
    materials: applyMaterials,
    partners: applyPartners,
    certs: applyCerts
  };

  db.collection('content').get()
    .then(function (snap) {
      snap.forEach(function (doc) {
        var fn = appliers[doc.id];
        if (fn) fn(doc.data());
      });
    })
    .catch(function () {
      /* Silent fail - static HTML is the fallback */
    });
})();
