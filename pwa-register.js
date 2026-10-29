/* SW + Manifest + الگوی سراسری فیلدها (شیری + متن تیره) */
(function () {
  'use strict';

  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }

  /* CSS فایل */
  if (!document.querySelector('link[href*="field-pattern.css"]')) {
    var fp = document.createElement('link');
    fp.rel = 'stylesheet';
    fp.href = './field-pattern.css?v=22.18';
    document.head.appendChild(fp);
  }

  /* همان قانون به‌صورت inline در انتها — تضمین غلبه بر theme-lock */
  if (!document.getElementById('kafeFieldPatternInline')) {
    var st = document.createElement('style');
    st.id = 'kafeFieldPatternInline';
    st.textContent = [
      'html body input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]),',
      'html body textarea, html body select,',
      'html body .modal-glass-content input, html body .modal-glass-content textarea, html body .modal-glass-content select,',
      'html body .register-box input, html body .register-box textarea, html body .register-box select,',
      'html body #settingsPanel input, html body #settingsPanel textarea, html body #settingsPanel select,',
      'html body #adminPanel input, html body #adminPanel textarea, html body #adminPanel select,',
      'html body #registerScreen input, html body #productDetailModal input, html body #productDetailModal textarea, html body #productDetailModal select,',
      'html body .input-group input, html body .input-group textarea, html body .hub-input, html body .register-input,',
      'html body .settings-field input, html body .admin-card input, html body .admin-card textarea, html body .search-input-wrap input {',
      '  background:#F3EDE3 !important; background-color:#F3EDE3 !important;',
      '  color:#1A1A1A !important; -webkit-text-fill-color:#1A1A1A !important; caret-color:#1A1A1A !important;',
      '  border:1px solid rgba(26,26,26,0.22) !important; border-radius:12px !important; opacity:1 !important;',
      '}',
      'html body input::placeholder, html body textarea::placeholder { color:#6B6560 !important; -webkit-text-fill-color:#6B6560 !important; opacity:1 !important; }',
      'html body input:focus, html body textarea:focus, html body select:focus {',
      '  background:#FFFBF5 !important; color:#1A1A1A !important; -webkit-text-fill-color:#1A1A1A !important;',
      '  border-color:#C9A84C !important; box-shadow:0 0 0 3px rgba(201,168,76,0.28) !important; outline:none !important;',
      '}',
      'html body select option { background:#F3EDE3 !important; color:#1A1A1A !important; }'
    ].join('\n');
    document.head.appendChild(st);
  }

  if (!document.querySelector('script[src*="brand-public-fix.js"]')) {
    var brand = document.createElement('script');
    brand.src = './brand-public-fix.js';
    brand.async = true;
    document.head.appendChild(brand);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then(function (reg) {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        })
        .catch(function (err) { console.warn('SW', err); });
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        try { location.reload(); } catch (e) {}
      });
    });
  }
})();
