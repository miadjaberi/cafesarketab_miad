/**
 * fix-four-bugs.js — کافه سرکتاب میعاد
 * 1) همزاد — نمایش نتیجه یکدست
 * 2) اسپلش گیر کرده (بدون رد کردن شرایط)
 * 3) دکمه ✕ مودال — برگشت امن به منو
 * 4) کنتراست اعلان‌ها و صندوق مدیر
 * 5) شرایط استفاده: هر بار ورود باید قبول شود (نه رد خودکار)
 */
(function () {
  'use strict';

  function injectContrastCSS() {
    if (document.getElementById('kafe-four-bugs-css')) return;
    var css = document.createElement('style');
    css.id = 'kafe-four-bugs-css';
    css.textContent = [
      '.modal-glass .result-value, #hamzadNumber, #hamzadResult .result-value {',
      '  color: #F0D878 !important;',
      '  -webkit-text-fill-color: #F0D878 !important;',
      '  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(116,236,255,0.10)) !important;',
      '  border: 1px solid rgba(201,168,76,0.45) !important;',
      '}',
      '.modal-glass .result-description, #hamzadDescription {',
      '  color: #F5F0E4 !important;',
      '  -webkit-text-fill-color: #F5F0E4 !important;',
      '}',
      '.modal-glass .result-box, #hamzadResult {',
      '  background: rgba(255,255,255,0.06) !important;',
      '  border: 1px solid rgba(201,168,76,0.35) !important;',
      '  color: #F5F0E4 !important;',
      '}',
      '.user-notif-sheet-card, .user-notif-sheet-card * {',
      '  color: #1a1a1a !important;',
      '  -webkit-text-fill-color: #1a1a1a !important;',
      '}',
      '.user-notif-sheet-card { background: #fffaf2 !important; }',
      '.user-notif-item { background: #ffffff !important; border-color: rgba(0,0,0,0.12) !important; }',
      '.user-notif-item.unread { border-color: rgba(22,163,74,0.55) !important; }',
      '.admin-inbox-item { color: #F5F0E4 !important; -webkit-text-fill-color: #F5F0E4 !important; }',
      '.admin-inbox-item b, .admin-inbox-item strong { color: #F0D878 !important; -webkit-text-fill-color: #F0D878 !important; }',
      '.admin-inbox-item button, .admin-item-actions button {',
      '  color: #111 !important; -webkit-text-fill-color: #111 !important;',
      '  background: linear-gradient(135deg,#C9A84C,#E8D5A3) !important;',
      '  border: 0 !important; border-radius: 10px !important; padding: 8px 12px !important;',
      '  font-weight: 700 !important; cursor: pointer !important;',
      '}',
      '.admin-inbox-item button.danger, .admin-item-actions button.danger {',
      '  background: linear-gradient(135deg,#b91c1c,#ef4444) !important; color: #fff !important;',
      '  -webkit-text-fill-color: #fff !important;',
      '}',
      '#kafeAdminPurchaseDetail, #kafeAdminPurchaseDetail * {',
      '  color: #111 !important; -webkit-text-fill-color: #111 !important;',
      '}',
      '#kafeAdminPurchaseDetail > div { background: #fff !important; color: #111 !important; }',
      '#kafeAdminPurchaseDetail button {',
      '  color: #111 !important; -webkit-text-fill-color: #111 !important;',
      '  background: linear-gradient(135deg,#C9A84C,#E8D5A3) !important;',
      '  border: 0 !important; border-radius: 10px !important; padding: 8px 12px !important;',
      '  font-weight: 700 !important; cursor: pointer !important;',
      '}',
      '#kafeAdminPurchaseDetail button.danger {',
      '  background: linear-gradient(135deg,#b91c1c,#ef4444) !important; color: #fff !important;',
      '  -webkit-text-fill-color: #fff !important;',
      '}',
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
      var terms = document.getElementById('termsScreen');
      var splash = document.getElementById('splashScreen');
      var reg = document.getElementById('registerScreen');
      var app = document.getElementById('app');
      if (!terms) return;
      if (splash) {
        splash.style.display = 'none';
        splash.classList.add('hidden', 'waiting');
        splash.classList.remove('active');
      }
      if (reg) {
        reg.style.display = 'none';
        reg.classList.add('hidden');
        reg.classList.remove('active');
      }
      if (app) {
        app.style.display = 'none';
        app.classList.add('hidden');
      }
      terms.classList.remove('hidden');
      terms.style.display = 'flex';
    } catch (e) {}
  }

  function patchCloseModalGlass() {
    var prev = window.closeModalGlass;
    window.closeModalGlass = function (modalId) {
      try {
        var support = document.getElementById('kafeChannelSupport');
        if (support) support.remove();
      } catch (e) {}
      try {
        if (typeof prev === 'function') prev.apply(this, arguments);
        else {
          var m = document.getElementById(modalId);
          if (m) { m.classList.remove('active'); m.style.display = 'none'; }
        }
      } catch (e2) {
        var m2 = document.getElementById(modalId);
        if (m2) { m2.classList.remove('active'); m2.style.display = 'none'; }
      }
      document.body.style.overflow = '';
      document.body.style.position = '';
      if (!sessionTermsOk()) {
        enforceTermsGate();
        return;
      }
      try {
        var terms = document.getElementById('termsScreen');
        var reg = document.getElementById('registerScreen');
        var splash = document.getElementById('splashScreen');
        var app = document.getElementById('app');
        if (app && (app.style.display === 'block' || app.style.display === 'flex')) {
          if (terms) { terms.style.display = 'none'; terms.classList.add('hidden'); }
          if (splash) { splash.style.display = 'none'; splash.classList.add('hidden'); }
          if (reg) { reg.style.display = 'none'; reg.classList.add('hidden'); }
        }
      } catch (e3) {}
    };
  }

  function patchAcceptTerms() {
    var prev = window.acceptTermsAndContinue;
    if (typeof prev !== 'function') return;
    window.acceptTermsAndContinue = function () {
      setSessionTermsOk();
      try {
        var bar = document.getElementById('splashLoaderBar') ||
          (document.getElementById('splashScreen') &&
            document.getElementById('splashScreen').querySelector('.splash-loader-bar'));
        if (bar) {
          bar.style.animation = 'none';
          void bar.offsetWidth;
          bar.style.animation = 'loadBar 1.8s linear forwards';
        }
      } catch (eBar) {}
      setTimeout(function () {
        try {
          var splash = document.getElementById('splashScreen');
          var still = splash && splash.style.display !== 'none' && !splash.classList.contains('hidden');
          if (still) {
            var bar2 = document.getElementById('splashLoaderBar');
            if (bar2) { bar2.style.animation = 'none'; bar2.style.width = '100%'; }
          }
        } catch (e) {}
      }, 8000);
      try { return prev.apply(this, arguments); }
      catch (err) { console.warn('acceptTermsAndContinue error', err); }
    };
  }

  function patchHamzadResultDisplay() {
    var prev = window.calculateHamzad;
    if (typeof prev !== 'function') return;
    window.calculateHamzad = function () {
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
    };
  }

  function patchAdminDetailContrast() {
    var prev = window.showAdminPurchaseDetail;
    if (typeof prev !== 'function') return;
    window.showAdminPurchaseDetail = function (kind, row) {
      var ret = prev.apply(this, arguments);
      try {
        var w = document.getElementById('kafeAdminPurchaseDetail');
        if (!w) return ret;
        w.style.zIndex = '99999';
        var card = w.firstElementChild;
        if (card) { card.style.background = '#ffffff'; card.style.color = '#111111'; }
        w.querySelectorAll('button').forEach(function (btn) {
          btn.style.pointerEvents = 'auto';
          btn.style.cursor = 'pointer';
          if (!btn.classList.contains('danger')) {
            btn.style.background = 'linear-gradient(135deg,#C9A84C,#E8D5A3)';
            btn.style.color = '#111';
          }
        });
      } catch (e) {}
      return ret;
    };
  }

  function applyAll() {
    injectContrastCSS();
    patchCloseModalGlass();
    patchAcceptTerms();
    patchHamzadResultDisplay();
    patchAdminDetailContrast();
    enforceTermsGate();
  }

  try {
    if (!sessionTermsOk()) {
      setTimeout(enforceTermsGate, 50);
      setTimeout(enforceTermsGate, 300);
      setTimeout(enforceTermsGate, 800);
      setTimeout(enforceTermsGate, 1500);
    }
  } catch (e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(applyAll, 0);
      setTimeout(applyAll, 500);
      setTimeout(applyAll, 1200);
    });
  } else {
    applyAll();
    setTimeout(applyAll, 500);
  }

  window.addEventListener('load', function () {
    setTimeout(applyAll, 200);
    if (!sessionTermsOk()) setTimeout(enforceTermsGate, 400);
  });
})();
