/* font-stability-fix.js v1 — قفل فونت + ماندگاری شرایط + جلوگیری از گیر لود */
(function () {
  'use strict';
  if (window.__KAFE_FONT_STAB_V1__) return;
  window.__KAFE_FONT_STAB_V1__ = true;

  try {
    var st = document.createElement('style');
    st.id = 'kafeFontStabilityCss';
    st.textContent = [
      'html{font-size:16px!important;-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}',
      'body,button,input,textarea,select,#termsScreen,#termsScreen *,#registerScreen,#registerScreen *{',
      'font-family:Tahoma,Vazirmatn,sans-serif!important;font-synthesis:none;',
      '-webkit-text-size-adjust:100%!important;text-size-adjust:100%!important}',
      '#termsScreen .terms-card,#termsScreen .terms-card p,#termsScreen .terms-inner p{',
      'font-size:0.88rem!important;font-weight:400!important;line-height:1.85!important;',
      'letter-spacing:0!important;word-spacing:0!important}',
      '#termsScreen .terms-card h3{font-size:0.95rem!important;font-weight:800!important}',
      '#termsScreen .terms-header h1{font-size:1.25rem!important;font-weight:800!important}',
      '#termsScreen .terms-agree-btn{font-size:1rem!important;font-weight:800!important}',
      'html.kafe-font-ready body,html.kafe-font-ready button,html.kafe-font-ready input,',
      'html.kafe-font-ready textarea,html.kafe-font-ready select,',
      'html.kafe-font-ready #termsScreen,html.kafe-font-ready #termsScreen *{',
      'font-family:Vazirmatn,Tahoma,sans-serif!important}'
    ].join('');
    (document.head || document.documentElement).appendChild(st);
  } catch (e) {}

  function markFontReady() {
    try { document.documentElement.classList.add('kafe-font-ready'); } catch (e) {}
  }
  try {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(markFontReady).catch(markFontReady);
    }
  } catch (e2) {}
  setTimeout(markFontReady, 1500);
  setTimeout(markFontReady, 3000);

  try {
    if (localStorage.getItem('kafeTermsAccepted') === '1') {
      sessionStorage.setItem('kafeTermsSeenThisSessionV4', '1');
      localStorage.setItem('kafeTermsSeenThisSessionV4', '1');
    }
  } catch (e3) {}

  function bindTermsBtn() {
    try {
      var btn = document.querySelector('#termsScreen .terms-agree-btn, #termsScreen button');
      if (!btn || btn.__kafeFontStab) return;
      btn.__kafeFontStab = true;
      btn.addEventListener('click', function () {
        try {
          sessionStorage.setItem('kafeTermsSeenThisSessionV4', '1');
          localStorage.setItem('kafeTermsSeenThisSessionV4', '1');
          localStorage.setItem('kafeTermsAccepted', '1');
        } catch (e) {}
      }, true);
    } catch (e4) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindTermsBtn);
  } else bindTermsBtn();
  setTimeout(bindTermsBtn, 800);
  setTimeout(bindTermsBtn, 2000);

  try {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (r) { try { r.unregister(); } catch (e) {} });
      }).catch(function () {});
    }
    if (window.caches && caches.keys) {
      caches.keys().then(function (keys) {
        keys.forEach(function (k) { try { caches.delete(k); } catch (e) {} });
      }).catch(function () {});
    }
  } catch (e5) {}
})();
