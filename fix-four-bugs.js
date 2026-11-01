/**
 * fix-four-bugs.js (نسخه امن — شاخه fix)
 * اصل: هیچ تابع/مودال/صفحه‌ای حذف نمی‌شود؛ فقط روی قبلی wrap می‌شود.
 *
 * وابستگی‌های ریشه‌ای که نباید حذف شوند:
 * - window.closeModalGlass  → حدود ۲۷ مودال در index.html با onclick به آن وصل‌اند
 * - pageModals / pageTools  → صفحات سوایپ اصلی اپ (نه کد مرده)
 * - kafeChannelSupport      → اورلی حمایت کانال هنگام باز کردن مودال
 * - main.js بعد از closeModal → عمداً به pageModals برمی‌گردد
 */
(function () {
  'use strict';
  if (window.__KAFE_FOUR_BUGS_SAFE__) return;
  window.__KAFE_FOUR_BUGS_SAFE__ = true;

  function injectContrastCSS() {
    if (document.getElementById('kafe-four-bugs-css')) return;
    var css = document.createElement('style');
    css.id = 'kafe-four-bugs-css';
    css.textContent = [
      '.modal-glass .result-value, #hamzadNumber, #hamzadResult .result-value {',
      '  color: #F0D878 !important; -webkit-text-fill-color: #F0D878 !important;',
      '  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(116,236,255,0.10)) !important;',
      '  border: 1px solid rgba(201,168,76,0.45) !important; }',
      '.modal-glass .result-description, #hamzadDescription {',
      '  color: #F5F0E4 !important; -webkit-text-fill-color: #F5F0E4 !important; }',
      '.modal-glass .result-box, #hamzadResult {',
      '  background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(201,168,76,0.35) !important;',
      '  color: #F5F0E4 !important; }',
      '.user-notif-sheet-card, .user-notif-sheet-card * { color: #1a1a1a !important; -webkit-text-fill-color: #1a1a1a !important; }',
      '.user-notif-sheet-card { background: #fffaf2 !important; }',
      '.user-notif-item { background: #ffffff !important; }',
      '.admin-inbox-item { color: #F5F0E4 !important; -webkit-text-fill-color: #F5F0E4 !important; }',
      '.admin-inbox-item b, .admin-inbox-item strong { color: #F0D878 !important; }',
      '.admin-inbox-item button, .admin-item-actions button, #kafeAdminPurchaseDetail button {',
      '  color: #111 !important; -webkit-text-fill-color: #111 !important;',
      '  background: linear-gradient(135deg,#C9A84C,#E8D5A3) !important; border: 0 !important;',
      '  border-radius: 10px !important; padding: 8px 12px !important; font-weight: 700 !important; cursor: pointer !important; }',
      '#kafeAdminPurchaseDetail, #kafeAdminPurchaseDetail * { color: #111 !important; -webkit-text-fill-color: #111 !important; }',
      '#kafeAdminPurchaseDetail > div { background: #fff !important; }',
      '#notification { color: #fff !important; -webkit-text-fill-color: #fff !important; }'
    ].join('\n');
    document.head.appendChild(css);
  }

  function sessionTermsOk() {
    try { return sessionStorage.getItem('kafeTermsSession') === '1'; } catch (e) { return false; }
  }
  function setSessionTermsOk() {
    try { sessionStorage.setItem('kafeTermsSession', '1'); } catch (e) {}
    try { localStorage.setItem('kafeTermsAccepted', '1'); } catch (e) {}
  }

  function enforceTermsGate() {
    if (sessionTermsOk()) return;
    try {
      if (document.querySelector('.modal-glass.active')) return;
    } catch (e) {}
    try {
      var terms = document.getElementById('termsScreen');
      var splash = document.getElementById('splashScreen');
      var reg = document.getElementById('registerScreen');
      var app = document.getElementById('app');
      if (!terms) return;
      if (splash) { splash.style.display = 'none'; splash.classList.add('hidden', 'waiting'); }
      if (reg) { reg.style.display = 'none'; reg.classList.add('hidden'); }
      if (app) { app.style.display = 'none'; app.classList.add('hidden'); }
      terms.classList.remove('hidden');
      terms.style.display = 'flex';
    } catch (e2) {}
  }

  function patchCloseModalGlass() {
    var prev = window.closeModalGlass;
    if (typeof prev !== 'function') return;
    if (prev.__kafeSafeClose) return;

    function safeClose(modalId) {
      try {
        var support = document.getElementById('kafeChannelSupport');
        if (support) support.remove();
      } catch (e) {}
      try {
        prev.apply(this, arguments);
      } catch (e2) {
        try {
          var m = document.getElementById(modalId);
          if (m) m.classList.remove('active');
          document.body.style.overflow = '';
        } catch (e3) {}
      }
    }
    safeClose.__kafeSafeClose = true;
    window.closeModalGlass = safeClose;
  }

  function patchAcceptTerms() {
    var prev = window.acceptTermsAndContinue;
    if (typeof prev !== 'function') return;
    if (prev.__kafeSafeAccept) return;
    function safeAccept() {
      setSessionTermsOk();
      try {
        var bar = document.getElementById('splashLoaderBar');
        if (bar) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = 'loadBar 1.8s linear forwards';
        }
      } catch (e) {}
      try { return prev.apply(this, arguments); } catch (err) { console.warn(err); }
    }
    safeAccept.__kafeSafeAccept = true;
    window.acceptTermsAndContinue = safeAccept;
  }

  function patchHamzadResultDisplay() {
    var prev = window.calculateHamzad;
    if (typeof prev !== 'function') return;
    if (prev.__kafeSafeHamzad) return;
    function safeHamzad() {
      var ret = prev.apply(this, arguments);
      try {
        var box = document.getElementById('hamzadResult');
        var nEl = document.getElementById('hamzadNumber');
        var dEl = document.getElementById('hamzadDescription');
        if (box) { box.style.display = 'block'; box.classList.add('result-box'); }
        if (nEl) { nEl.style.display = 'block'; nEl.classList.add('result-value'); }
        if (dEl) dEl.classList.add('result-description');
      } catch (e) {}
      return ret;
    }
    safeHamzad.__kafeSafeHamzad = true;
    window.calculateHamzad = safeHamzad;
  }

  function patchAdminDetailContrast() {
    var prev = window.showAdminPurchaseDetail;
    if (typeof prev !== 'function') return;
    if (prev.__kafeSafeAdmin) return;
    function safeAdmin(kind, row) {
      var ret = prev.apply(this, arguments);
      try {
        var w = document.getElementById('kafeAdminPurchaseDetail');
        if (!w) return ret;
        w.style.zIndex = '99999';
        var card = w.firstElementChild;
        if (card) { card.style.background = '#fff'; card.style.color = '#111'; }
        w.querySelectorAll('button').forEach(function (btn) {
          btn.style.pointerEvents = 'auto';
          btn.style.cursor = 'pointer';
        });
      } catch (e) {}
      return ret;
    }
    safeAdmin.__kafeSafeAdmin = true;
    window.showAdminPurchaseDetail = safeAdmin;
  }

  function applyAll() {
    injectContrastCSS();
    patchCloseModalGlass();
    patchAcceptTerms();
    patchHamzadResultDisplay();
    patchAdminDetailContrast();
    if (!sessionTermsOk() && !document.querySelector('.modal-glass.active')) {
      enforceTermsGate();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(applyAll, 0);
      setTimeout(applyAll, 600);
    });
  } else {
    applyAll();
    setTimeout(applyAll, 600);
  }
  window.addEventListener('load', function () { setTimeout(applyAll, 300); });
})();
