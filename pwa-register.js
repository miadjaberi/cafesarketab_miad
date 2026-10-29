/* SW + Manifest + فیلدهای سراسری (شیری + تیره + حاشیه گرم) */
(function () {
  'use strict';

  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }

  if (!document.querySelector('link[href*="field-pattern.css"]')) {
    var fp = document.createElement('link');
    fp.rel = 'stylesheet';
    fp.href = './field-pattern.css?v=22.19-warm';
    document.head.appendChild(fp);
  }

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
      '  border:1.5px solid #C4B5A0 !important; border-radius:12px !important; opacity:1 !important; box-shadow:none !important;',
      '}',
      'html body input::placeholder, html body textarea::placeholder { color:#8B7355 !important; -webkit-text-fill-color:#8B7355 !important; opacity:1 !important; }',
      'html body input:focus, html body textarea:focus, html body select:focus {',
      '  background:#FAF6EF !important; color:#1A1A1A !important; -webkit-text-fill-color:#1A1A1A !important;',
      '  border-color:#6B5344 !important; box-shadow:0 0 0 3px rgba(107,83,68,0.18) !important; outline:none !important;',
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
