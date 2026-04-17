/* ==============================================
   MAINTENANCE REQUEST PAGE
   Tabs, validation, Cloudinary uploads, tickets
   ============================================== */

(function(){
  'use strict';

  // ─── CLOUDINARY CONFIG ────────────────────
  var CLOUD_NAME = 'dbj4aba8i';
  var UPLOAD_PRESET = 'uwkitchen_uploads';
  var CLOUD_URL = 'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/auto/upload';
  var MAX_FILE_MB = 100;

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

  // ─── CLOUDINARY UPLOAD STATE ──────────────
  // Each file field stores its upload result here, keyed by input id.
  var uploadResults = {};
  // Track active XHR requests so we can abort on delete.
  var activeUploads = {};

  function formatSize(bytes){
    var kb = bytes / 1024;
    return kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : Math.round(kb) + ' KB';
  }

  function uploadToCloudinary(input){
    var file = input.files[0];
    if(!file) return;

    var wrap = input.closest('.file-field');
    var nameEl = wrap.querySelector('.file-field-name');
    var fill = wrap.querySelector('.file-progress-fill');
    var pText = wrap.querySelector('.file-progress-text');
    var inputId = input.id;

    // Check file size
    if(file.size > MAX_FILE_MB * 1024 * 1024){
      showFileError(wrap, 'حجم الملف يتجاوز ' + MAX_FILE_MB + 'MB');
      input.value = '';
      return;
    }

    // Show file name and uploading state
    nameEl.textContent = file.name + ' \u00B7 ' + formatSize(file.size);
    wrap.classList.add('has-file', 'is-uploading');
    wrap.classList.remove('has-error');
    var err = wrap.querySelector('.form-error');
    if(err) err.textContent = '';
    fill.style.width = '0%';
    pText.textContent = '\u062C\u0627\u0631\u064A \u0627\u0644\u0631\u0641\u0639...';

    // Build form data for Cloudinary
    var fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    fd.append('folder', 'tickets');

    var xhr = new XMLHttpRequest();
    activeUploads[inputId] = xhr;

    xhr.upload.addEventListener('progress', function(e){
      if(e.lengthComputable){
        var pct = Math.round((e.loaded / e.total) * 100);
        fill.style.width = pct + '%';
        if(pct >= 100){
          pText.textContent = '\u062C\u0627\u0631\u064A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629...';
        } else {
          pText.textContent = pct + '%';
        }
      }
    });

    xhr.addEventListener('load', function(){
      delete activeUploads[inputId];
      wrap.classList.remove('is-uploading');
      if(xhr.status >= 200 && xhr.status < 300){
        try {
          var res = JSON.parse(xhr.responseText);
          uploadResults[inputId] = {
            url: res.secure_url,
            publicId: res.public_id,
            name: file.name,
            size: file.size,
            type: file.type,
            format: res.format
          };
          fill.style.width = '100%';
          pText.textContent = '\u062A\u0645 \u0627\u0644\u0631\u0641\u0639 \u0628\u0646\u062C\u0627\u062D';
        } catch(e){
          uploadFailed(wrap, fill, pText, inputId);
        }
      } else {
        uploadFailed(wrap, fill, pText, inputId);
      }
    });

    xhr.addEventListener('error', function(){
      delete activeUploads[inputId];
      uploadFailed(wrap, fill, pText, inputId);
    });

    xhr.addEventListener('abort', function(){
      delete activeUploads[inputId];
      wrap.classList.remove('is-uploading');
    });

    xhr.open('POST', CLOUD_URL);
    xhr.send(fd);
  }

  function uploadFailed(wrap, fill, pText, inputId){
    wrap.classList.remove('is-uploading');
    fill.style.width = '0%';
    pText.textContent = '\u0641\u0634\u0644 \u0627\u0644\u0631\u0641\u0639\u060C \u0627\u0636\u063A\u0637 \u0644\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629';
    delete uploadResults[inputId];
  }

  function clearFileField(wrap){
    var input = wrap.querySelector('input[type=file]');
    var inputId = input.id;
    // Abort active upload if any
    if(activeUploads[inputId]){
      activeUploads[inputId].abort();
      delete activeUploads[inputId];
    }
    // Clear state
    delete uploadResults[inputId];
    input.value = '';
    wrap.classList.remove('has-file', 'is-uploading', 'has-error');
    var nameEl = wrap.querySelector('.file-field-name');
    if(nameEl) nameEl.textContent = '';
    var fill = wrap.querySelector('.file-progress-fill');
    if(fill) fill.style.width = '0%';
    var pText = wrap.querySelector('.file-progress-text');
    if(pText) pText.textContent = '';
    var err = wrap.querySelector('.form-error');
    if(err) err.textContent = '';
  }

  // ─── FILE FIELD EVENT LISTENERS ───────────
  document.querySelectorAll('.file-field').forEach(function(wrap){
    var input = wrap.querySelector('input[type=file]');
    var delBtn = wrap.querySelector('.file-delete');

    // On file select: start Cloudinary upload immediately
    input.addEventListener('change', function(){
      if(input.files && input.files[0]){
        uploadToCloudinary(input);
      } else {
        clearFileField(wrap);
      }
    });

    // Delete button: abort upload and clear
    if(delBtn){
      delBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        clearFileField(wrap);
      });
    }
  });

  // ─── VALIDATION ───────────────────────────
  var errorMsgs = {
    firstName: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644',
    middleName: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0633\u0637',
    lastName: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0639\u0627\u0626\u0644\u0629',
    fullName: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644',
    phone: '\u0631\u0642\u0645 \u0627\u0644\u062C\u0648\u0627\u0644 \u0644\u0627\u0632\u0645 \u064A\u0643\u0648\u0646 10 \u0623\u0631\u0642\u0627\u0645 \u0648\u064A\u0628\u062F\u0623 \u0628\u0640 05',
    description: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0643\u062A\u0627\u0628\u0629 \u0648\u0635\u0641 \u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 10 \u0623\u062D\u0631\u0641',
    suggestion: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D \u0628\u0634\u0643\u0644 \u0648\u0627\u0636\u062D (10 \u0623\u062D\u0631\u0641 \u0641\u0623\u0643\u062B\u0631)',
    contract: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0642\u062F',
    media: '\u0627\u0644\u0631\u062C\u0627\u0621 \u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u0623\u0648 \u0641\u064A\u062F\u064A\u0648'
  };

  var FORMSUBMIT_URL = 'https://formsubmit.co/ajax/info@uwkitchens.com';
  var db = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;

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

  document.querySelectorAll('.cs-form input, .cs-form textarea').forEach(function(input){
    if(input.type === 'file') return;
    input.addEventListener('input', function(){ clearError(input); });
  });

  function validateForm(form){
    var valid = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(function(el){
      if(el.type === 'file') return;
      clearError(el);
      var val = el.value.trim();
      if(!val){
        showError(el, errorMsgs[el.name] || '\u0647\u0630\u0627 \u0627\u0644\u062D\u0642\u0644 \u0625\u0644\u0632\u0627\u0645\u064A');
        valid = false;
      } else if(el.type === 'tel' && !/^05\d{8}$/.test(val)){
        showError(el, errorMsgs.phone);
        valid = false;
      } else if(el.minLength && val.length < el.minLength){
        showError(el, errorMsgs[el.name] || '\u0627\u0644\u0642\u064A\u0645\u0629 \u0642\u0635\u064A\u0631\u0629 \u062C\u062F\u0627\u064B');
        valid = false;
      }
    });
    // File validation: required fields must have a completed upload
    form.querySelectorAll('.file-field').forEach(function(wrap){
      var input = wrap.querySelector('input[type=file]');
      if(!input.required) return;
      clearFileError(wrap);
      if(wrap.classList.contains('is-uploading')){
        showFileError(wrap, '\u0627\u0644\u0645\u0644\u0641 \u0642\u064A\u062F \u0627\u0644\u0631\u0641\u0639\u060C \u0627\u0646\u062A\u0638\u0631 \u062D\u062A\u0649 \u064A\u0643\u062A\u0645\u0644');
        valid = false;
      } else if(!uploadResults[input.id]){
        showFileError(wrap, errorMsgs[input.name] || '\u0627\u0644\u0631\u062C\u0627\u0621 \u0631\u0641\u0639 \u0645\u0644\u0641');
        valid = false;
      }
    });
    return valid;
  }

  // ─── TICKET NUMBER ────────────────────────
  function generateTicket(type){
    var prefixes = { maintenance: 'MAINT', complaint: 'CMPL', suggestion: 'SUG' };
    var year = new Date().getFullYear();
    var rand = Math.floor(10000 + Math.random() * 90000);
    return (prefixes[type] || 'REQ') + '-' + year + '-' + rand;
  }

  // ─── SUCCESS STATE ────────────────────────
  function showSuccess(type, ticket){
    var titles = {
      maintenance: '\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628 \u0627\u0644\u0635\u064A\u0627\u0646\u0629',
      complaint: '\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0634\u0643\u0648\u0649',
      suggestion: '\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D'
    };
    var notes = {
      maintenance: '\u0633\u064A\u062A\u0645 \u0627\u0644\u0631\u062F \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644',
      complaint: '\u0633\u064A\u062A\u0645 \u0627\u0644\u0631\u062F \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644',
      suggestion: '\u0634\u0643\u0631\u0627\u064B \u0644\u0645\u0634\u0627\u0631\u0643\u062A\u0643\u060C \u0646\u0642\u062F\u0651\u0631 \u0627\u0642\u062A\u0631\u0627\u062D\u0643 \u0648\u0646\u0642\u0631\u0623\u0647 \u0628\u0639\u0646\u0627\u064A\u0629'
    };
    var descs = {
      maintenance: '\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0648\u0627\u0635\u0644\u0643. \u0641\u0631\u064A\u0642 \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0633\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u0642\u0631\u064A\u0628\u0627\u064B \u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0637\u0644\u0628\u0643.',
      complaint: '\u0634\u0643\u0631\u0627\u064B \u0644\u0625\u0628\u0644\u0627\u063A\u0646\u0627. \u0641\u0631\u064A\u0642\u0646\u0627 \u0633\u064A\u062F\u0631\u0633 \u0627\u0644\u0634\u0643\u0648\u0649 \u0648\u064A\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0643 \u062E\u0644\u0627\u0644 \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u0645\u0630\u0643\u0648\u0631\u0629.',
      suggestion: '\u0634\u0643\u0631\u0627\u064B \u0644\u0643\u060C \u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u0639\u0645\u0644\u0627\u0626\u0646\u0627 \u062A\u0633\u0627\u0639\u062F\u0646\u0627 \u0639\u0644\u0649 \u0627\u0644\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0645\u0633\u062A\u0645\u0631.'
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
  var subjects = { maintenance: '\u0637\u0644\u0628 \u0635\u064A\u0627\u0646\u0629 \u062C\u062F\u064A\u062F', complaint: '\u0634\u0643\u0648\u0649 \u062C\u062F\u064A\u062F\u0629', suggestion: '\u0627\u0642\u062A\u0631\u0627\u062D \u062C\u062F\u064A\u062F' };
  var typeLabels = { maintenance: '\u0637\u0644\u0628 \u0635\u064A\u0627\u0646\u0629', complaint: '\u0634\u0643\u0648\u0649', suggestion: '\u0627\u0642\u062A\u0631\u0627\u062D' };

  function resetFormUI(form, btn){
    form.reset();
    form.querySelectorAll('.file-field').forEach(function(wrap){
      clearFileField(wrap);
    });
    btn.disabled = false;
    btn.classList.remove('is-loading');
    submitting = false;
  }

  // Collect Cloudinary URLs for all file inputs in the form
  function getAttachments(form){
    var attachments = {};
    form.querySelectorAll('input[type=file]').forEach(function(input){
      if(uploadResults[input.id]){
        attachments[input.name] = uploadResults[input.id];
      }
    });
    return attachments;
  }

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
      var attachments = getAttachments(form);

      // Build JSON payload for FormSubmit AJAX endpoint
      var emailData = {};
      var fieldLabels = {
        firstName: 'الاسم الأول',
        middleName: 'الاسم الأوسط',
        lastName: 'اسم العائلة',
        fullName: 'الاسم الكامل',
        phone: 'رقم الجوال',
        description: 'الوصف',
        suggestion: 'الاقتراح'
      };
      Array.prototype.forEach.call(form.elements, function(el){
        if(!el.name || el.type === 'file' || el.type === 'submit' || el.type === 'button') return;
        var label = fieldLabels[el.name] || el.name;
        emailData[label] = el.value;
      });
      emailData['نوع الطلب'] = typeLabels[type];
      emailData['رقم التذكرة'] = ticket;
      emailData['تاريخ الإرسال'] = new Date().toLocaleString('en-GB', {year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
      var attachLabels = { contract: 'رابط العقد', media: 'رابط الصورة / الفيديو' };
      Object.keys(attachments).forEach(function(key){
        emailData[attachLabels[key] || (key + ' URL')] = attachments[key].url;
      });
      emailData['_subject'] = subjects[type] + ' - ' + ticket;
      emailData['_template'] = 'table';
      emailData['_captcha'] = 'false';
      fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(emailData)
      }).catch(function(){});

      // Save to Firestore (files already uploaded to Cloudinary)
      saveTicket(type, ticket, form, attachments)
        .then(function(){
          resetFormUI(form, btn);
          showSuccess(type, ticket);
        })
        .catch(function(err){
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

  // ─── ANNOUNCE BAR SCROLL HIDE ─────────────
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
