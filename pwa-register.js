/* SW + Manifest + field pattern + admin messages fix */
(function () {
  'use strict';

  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }

  var oldFp = document.querySelector('link[href*="field-pattern.css"]');
  if (oldFp) oldFp.remove();
  var fp = document.createElement('link');
  fp.rel = 'stylesheet';
  fp.href = './field-pattern.css?v=22.20-gloss';
  document.head.appendChild(fp);

  var oldSt = document.getElementById('kafeFieldPatternInline');
  if (oldSt) oldSt.remove();
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
    '  background:linear-gradient(165deg,rgba(245,236,250,.97),rgba(232,244,242,.95)) !important;',
    '  background-color:#F0EAF4 !important;',
    '  color:#1A1220 !important; -webkit-text-fill-color:#1A1220 !important; caret-color:#1A1220 !important;',
    '  border:1.5px solid rgba(110,70,130,.55) !important; border-radius:12px !important; opacity:1 !important;',
    '  box-shadow:inset 0 1px 0 rgba(255,255,255,.65),0 1px 2px rgba(40,20,60,.08) !important;',
    '}',
    'html body input::placeholder, html body textarea::placeholder { color:#7A5F8A !important; -webkit-text-fill-color:#7A5F8A !important; opacity:1 !important; }',
    'html body input:focus, html body textarea:focus, html body select:focus {',
    '  background:linear-gradient(165deg,rgba(250,246,252,.98),rgba(220,242,240,.96)) !important;',
    '  color:#1A1220 !important; -webkit-text-fill-color:#1A1220 !important;',
    '  border-color:rgba(32,160,150,.85) !important;',
    '  box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 0 0 3px rgba(32,160,150,.22),0 0 12px rgba(110,70,130,.15) !important;',
    '  outline:none !important;',
    '}',
    'html body select option { background:#F0EAF4 !important; color:#1A1220 !important; }'
  ].join('\n');
  document.head.appendChild(st);

  if (!document.querySelector('script[src*="brand-public-fix.js"]')) {
    var brand = document.createElement('script');
    brand.src = './brand-public-fix.js';
    brand.async = true;
    document.head.appendChild(brand);
  }

  if (!document.querySelector('script[src*="admin-messages-fix.js"]')) {
    var am = document.createElement('script');
    am.src = './admin-messages-fix.js?v=1';
    am.defer = true;
    document.body ? document.body.appendChild(am) : document.head.appendChild(am);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function (reg) {
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        if (reg.update) try { reg.update(); } catch (e) {}
      }).catch(function () {});
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) return;
        refreshing = true;
        try { location.reload(); } catch (e) {}
      });
    });
  }
})();
