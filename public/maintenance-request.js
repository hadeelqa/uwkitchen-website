/* ═════════════════════════════════════════════
   MAINTENANCE REQUEST PAGE
   Tabs, validation, file uploads, ticket system
   ═════════════════════════════════════════════ */

(function(){
  'use strict';

  // ─── TABS ─────────────────────────────────
  var tabs = document.querySelectorAll('.form-tab');
  var panels = document.querySelectorAll('[data-panel]');
  var successBox = document.getElementById('csSuccess');

  function switchTab(name){
    tabs.forEach(function(t){
      var active = t.dataset.tab === name;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    panels.forEach(function(p){
      p.hidden = p.dataset.panel !== name;
    });
    if(successBox) successBox.hidden = true;
    window.scrollTo({top: document.querySelector('.cs-forms').offsetTop - 80, behavior:'smooth'});
  }

  tabs.forEach(function(t){
    t.addEventListener('click', function(){ switchTab(t.dataset.tab); });
  });

  // ─── FILE FIELDS ──────────────────────────
  document.querySelectorAll('.file-field input[type=file]').forEach(function(input){
    input.addEventListener('change', function(){
      var wrap = input.closest('.file-field');
      var nameEl = wrap.querySelector('.file-field-name');
      if(input.files && input.files[0]){
        var f = input.files[0];
        var sizeKB = (f.size / 1024).toFixed(0);
        var sizeTxt = sizeKB > 1024 ? (sizeKB/1024).toFixed(1) + ' MB' : sizeKB + ' KB';
        nameEl.textContent = f.name + ' · ' + sizeTxt;
        wrap.classList.add('has-file');
        wrap.classList.remove('has-error');
        var err = wrap.querySelector('.form-error');
        if(err) err.textContent = '';
      } else {
        nameEl.textContent = '';
        wrap.classList.remove('has-file');
      }
    });
  });

  // ─── VALIDATION ───────────────────────────
  var errorMsgs = {
    firstName: 'الرجاء إدخال الاسم الأول',
    middleName: 'الرجاء إدخال الاسم الأوسط',
    lastName: 'الرجاء إدخال اسم العائلة',
    fullName: 'الرجاء إدخال الاسم الكامل',
    phone: 'رقم الجوال لازم يكون 10 أرقام ويبدأ بـ 05',
    description: 'الرجاء كتابة وصف لا يقل عن 10 أحرف',
    suggestion: 'الرجاء كتابة الاقتراح بشكل واضح (10 أحرف فأكثر)',
    contract: 'الرجاء رفع صورة العقد',
    media: 'الرجاء رفع صورة أو فيديو'
  };

  // FormSubmit endpoint - first submission will send an activation email
  // to info@uwkitchens.com; after one-click confirm, all submissions deliver.
  var FORMSUBMIT_URL = 'https://formsubmit.co/info@uwkitchens.com';

  // Firestore + Storage (Firebase SDK loaded in the HTML head)
  var db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;
  var storage = (typeof firebase !== 'undefined' && firebase.storage) ? firebase.storage() : null;

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
  function showFileError(wrap, msg){
    wrap.classList.add('has-error');
    var err = wrap.querySelector('.form-error');
    if(err) err.textContent = msg;
  }
  function clearFileError(wrap){
    wrap.classList.remove('has-error');
    var err = wrap.querySelector('.form-error');
    if(err) err.textContent = '';
  }

  // Clear errors on input
  document.querySelectorAll('.cs-form input, .cs-form textarea').forEach(function(input){
    if(input.type === 'file') return;
    input.addEventListener('input', function(){ clearError(input); });
  });

  function validateForm(form){
    var valid = true;
    // text inputs / textareas
    form.querySelectorAll('input[required], textarea[required]').forEach(function(el){
      if(el.type === 'file') return;
      clearError(el);
      var val = el.value.trim();
      if(!val){
        showError(el, errorMsgs[el.name] || 'هذا الحقل إلزامي');
        valid = false;
      } else if(el.type === 'tel' && !/^05\d{8}$/.test(val)){
        showError(el, errorMsgs.phone);
        valid = false;
      } else if(el.minLength && val.length < el.minLength){
        showError(el, errorMsgs[el.name] || 'القيمة قصيرة جداً');
        valid = false;
      }
    });
    // file inputs
    form.querySelectorAll('.file-field').forEach(function(wrap){
      var input = wrap.querySelector('input[type=file]');
      if(!input.required) return;
      clearFileError(wrap);
      if(!input.files || !input.files[0]){
        showFileError(wrap, errorMsgs[input.name] || 'الرجاء رفع ملف');
        valid = false;
      }
    });
    return valid;
  }

  // ─── TICKET NUMBER ────────────────────────
  // Format: PREFIX-YYYY-XXXXX (random 5 digits for now)
  // Will be replaced with Firestore doc ID / counter later
  function generateTicket(type){
    var prefixes = {
      maintenance: 'MAINT',
      complaint: 'CMPL',
      suggestion: 'SUG'
    };
    var year = new Date().getFullYear();
    var rand = Math.floor(10000 + Math.random() * 90000);
    return (prefixes[type] || 'REQ') + '-' + year + '-' + rand;
  }

  // ─── SUCCESS STATE ────────────────────────
  function showSuccess(type, ticket){
    var titles = {
      maintenance: 'تم استلام طلب الصيانة',
      complaint: 'تم استلام الشكوى',
      suggestion: 'تم استلام الاقتراح'
    };
    var notes = {
      maintenance: 'سيتم الرد خلال 7 أيام عمل',
      complaint: 'سيتم الرد خلال 7 أيام عمل',
      suggestion: 'شكراً لمشاركتك، نقدّر اقتراحك ونقرأه بعناية'
    };
    var descs = {
      maintenance: 'شكراً لتواصلك. فريق الصيانة سيتواصل معك قريباً لمتابعة طلبك.',
      complaint: 'شكراً لإبلاغنا. فريقنا سيدرس الشكوى ويتواصل معك خلال المدة المذكورة.',
      suggestion: 'شكراً لك، اقتراحات عملائنا تساعدنا على التحسين المستمر.'
    };

    document.getElementById('csSuccessTitle').textContent = titles[type];
    document.getElementById('csSuccessDesc').textContent = descs[type];
    document.getElementById('csTicketNumber').textContent = ticket;
    document.getElementById('csSuccessNote').textContent = notes[type];

    panels.forEach(function(p){ p.hidden = true; });
    successBox.hidden = false;
    window.scrollTo({top: successBox.offsetTop - 80, behavior:'smooth'});
  }

  // ─── SUBMIT HANDLERS ──────────────────────
  var submitting = false;
  var subjects = {
    maintenance: 'طلب صيانة جديد',
    complaint: 'شكوى جديدة',
    suggestion: 'اقتراح جديد'
  };
  var typeLabels = {
    maintenance: 'طلب صيانة',
    complaint: 'شكوى',
    suggestion: 'اقتراح'
  };

  function resetFormUI(form, btn){
    form.reset();
    form.querySelectorAll('.file-field').forEach(function(wrap){
      wrap.classList.remove('has-file');
      var name = wrap.querySelector('.file-field-name');
      if(name) name.textContent = '';
    });
    btn.disabled = false;
    btn.classList.remove('is-loading');
    submitting = false;
  }

  // Upload all file inputs in a form to Storage under tickets/{ticketId}/.
  // Returns a promise that resolves to an object mapping input name to {url, name, size, type}.
  // If Storage isn't enabled or fails, we resolve with a metadata-only fallback so the
  // ticket still saves and the email still delivers the attachments.
  function uploadAttachments(form, ticketId){
    if(!storage) return Promise.resolve({});
    var uploads = [];
    var result = {};
    form.querySelectorAll('input[type=file]').forEach(function(input){
      if(!input.files || !input.files[0]) return;
      var file = input.files[0];
      var safeName = file.name.replace(/[^\w\s.\-]/g,'_');
      var path = 'tickets/' + ticketId + '/' + input.name + '-' + safeName;
      var task = storage.ref(path).put(file).then(function(snap){
        return snap.ref.getDownloadURL().then(function(url){
          result[input.name] = { url: url, name: file.name, size: file.size, type: file.type };
        });
      }).catch(function(err){
        // Storage not enabled or permission denied - fall back to metadata only.
        if(window.console) console.warn('Storage upload failed, saving metadata only:', err);
        result[input.name] = { name: file.name, size: file.size, type: file.type, pending: true };
      });
      uploads.push(task);
    });
    return Promise.all(uploads).then(function(){ return result; });
  }

  // Write a ticket document to Firestore.
  function saveTicket(type, ticket, form, attachments){
    if(!db) return Promise.resolve();
    var get = function(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    var base = {
      ticketNumber: ticket,
      type: type,
      typeLabel: typeLabels[type],
      status: 'new',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      source: 'support-page'
    };
    if(type === 'maintenance'){
      base.firstName = get('m_fn');
      base.middleName = get('m_mn');
      base.lastName = get('m_ln');
      base.phone = get('m_ph');
      base.description = get('m_desc');
    } else if(type === 'complaint'){
      base.firstName = get('c_fn');
      base.middleName = get('c_mn');
      base.lastName = get('c_ln');
      base.phone = get('c_ph');
      base.description = get('c_desc');
    } else if(type === 'suggestion'){
      base.fullName = get('s_name');
      base.phone = get('s_ph');
      base.description = get('s_desc');
    }
    if(attachments && Object.keys(attachments).length){
      base.attachments = attachments;
    }
    return db.collection('tickets').doc(ticket).set(base);
  }

  document.querySelectorAll('.cs-form').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(submitting) return;

      if(!validateForm(form)){
        var firstErr = form.querySelector('.form-field--error input, .form-field--error textarea, .file-field.has-error input');
        if(firstErr) firstErr.focus();
        return;
      }

      var btn = form.querySelector('button[type=submit]');
      submitting = true;
      btn.disabled = true;
      btn.classList.add('is-loading');

      var type = form.dataset.form;
      var ticket = generateTicket(type);

      // 1) Upload attachments to Storage, 2) Save ticket doc in Firestore,
      // 3) Send FormSubmit email in parallel as a backup channel.
      var fd = new FormData(form);
      fd.append('_subject', subjects[type] + ' - ' + ticket);
      fd.append('_template', 'table');
      fd.append('_captcha', 'false');
      fd.append('ticket_number', ticket);
      fd.append('form_type', typeLabels[type]);
      fd.append('submitted_at', new Date().toLocaleString('en-GB', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}));
      fetch(FORMSUBMIT_URL, { method:'POST', mode:'no-cors', body: fd }).catch(function(){});

      uploadAttachments(form, ticket)
        .then(function(attachments){ return saveTicket(type, ticket, form, attachments); })
        .then(function(){
          resetFormUI(form, btn);
          showSuccess(type, ticket);
        })
        .catch(function(err){
          // Log and still show success: the email already went out via FormSubmit,
          // so the client has a fallback even if Firestore failed.
          if(window.console) console.error('Firestore save failed:', err);
          resetFormUI(form, btn);
          showSuccess(type, ticket);
        });
    });
  });

  // ─── BACK BUTTON ──────────────────────────
  var backBtn = document.getElementById('csSuccessBack');
  if(backBtn){
    backBtn.addEventListener('click', function(){
      successBox.hidden = true;
      var activeTab = document.querySelector('.form-tab.is-active');
      var name = activeTab ? activeTab.dataset.tab : 'maintenance';
      switchTab(name);
    });
  }

  // ─── ANNOUNCE BAR SCROLL HIDE (reuse logic) ───
  var announce = document.getElementById('announce');
  if(announce){
    var lastY = 0;
    window.addEventListener('scroll', function(){
      var y = window.scrollY;
      if(y > 60 && y > lastY) announce.classList.add('scrolled');
      else announce.classList.remove('scrolled');
      lastY = y;
    }, {passive:true});
  }

})();
