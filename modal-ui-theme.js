/** modal-ui-theme.js V12 — استاندارد نهایی طبق نمونه
 * پس‌زمینه سرمه‌ای #0b1120 | حاشیه طلایی | راهنما فیروزه‌ای
 * فیلد تیره + متن سفید | دکمه طلایی | بدون شفافیت
 */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_UI_THEME_V12__) return;
  window.__KAFE_MODAL_UI_THEME_V12__ = true;

  var CARD_BG = '#0b1120';
  var OVERLAY_BG = 'rgba(0,0,0,0.8)';

  function injectThemeCSS() {
    var id = 'kafe-modal-ui-theme-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    try { document.head.appendChild(st); } catch (e) {}
    st.textContent = [
      '#appVersionBadge{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;height:0!important;overflow:hidden!important;}',
      'body.kafe-modal-open #pageModals,',
      'body.kafe-modal-open #modalsHomeGrid,',
      'body.kafe-modal-open .modals-home-grid,',
      'body.kafe-modal-open .modals-home-hero{',
      '  opacity:0!important;visibility:hidden!important;pointer-events:none!important;',
      '}',

      /* اوورلی تیره مات */
      '.modal-glass,.modal-glass.active,div.modal-glass,div.modal-glass.active{',
      '  background:' + OVERLAY_BG + '!important;',
      '  background-color:' + OVERLAY_BG + '!important;',
      '  background-image:none!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  align-items:center!important;justify-content:center!important;',
      '  padding:16px 14px calc(var(--bottom-nav-height,64px) + 16px)!important;',
      '  box-sizing:border-box!important;border:none!important;outline:none!important;',
      '}',

      /* کارت سرمه‌ای + حاشیه طلایی */
      '.modal-glass .modal-glass-content,',
      '.modal-glass > .modal-glass-content,',
      'div.modal-glass .modal-glass-content,',
      '.modal-glass-content{',
      '  background:' + CARD_BG + '!important;',
      '  background-color:' + CARD_BG + '!important;',
      '  border:2px solid #c9a84c!important;',
      '  outline:none!important;',
      '  border-radius:24px!important;',
      '  box-shadow:0 10px 30px rgba(0,0,0,.8)!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  max-height:min(86vh,720px)!important;',
      '  width:calc(100% - 8px)!important;max-width:420px!important;',
      '  margin:0 auto!important;padding:0!important;',
      '  overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;',
      '  color:#fff!important;',
      '}',

      /* هدر */
      '.modal-glass .modal-glass-header{',
      '  display:flex!important;align-items:center!important;gap:10px!important;',
      '  padding:16px 18px 12px!important;',
      '  border-bottom:1px dashed #c9a84c!important;',
      '  background:transparent!important;',
      '}',
      '.modal-glass .modal-glass-logo{',
      '  width:40px!important;height:40px!important;flex-shrink:0!important;',
      '  display:flex!important;align-items:center!important;justify-content:center!important;',
      '  font-size:0!important;overflow:hidden!important;border-radius:50%!important;',
      '  border:2px solid #c9a84c!important;',
      '}',
      '.modal-glass .modal-glass-logo img{',
      '  width:36px!important;height:36px!important;object-fit:contain!important;',
      '  border-radius:50%!important;display:block!important;',
      '}',
      '.modal-glass .modal-glass-title{',
      '  flex:1!important;color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-size:1.05rem!important;font-weight:700!important;line-height:1.3!important;',
      '  text-align:right!important;margin:0!important;',
      '}',
      '.modal-glass .modal-glass-close{',
      '  width:36px!important;height:36px!important;border-radius:10px!important;',
      '  background:transparent!important;border:none!important;',
      '  color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-size:1.4rem!important;flex-shrink:0!important;cursor:pointer!important;',
      '}',
      '.modal-glass .modal-glass-header button:not(.modal-glass-close){',
      '  width:32px!important;height:32px!important;border-radius:10px!important;',
      '  padding:0!important;font-size:.85rem!important;',
      '}',
      '.modal-glass .modal-glass-body{padding:14px 18px 18px!important;background:transparent!important;}',

      /* کادر راهنما فیروزه‌ای */
      '.modal-glass .modal-guide,',
      '.modal-glass .modal-guide-box,',
      '.modal-glass [class*="guide"]{',
      '  background:#1e3a45!important;',
      '  border:none!important;',
      '  border-right:4px solid #2dd4bf!important;',
      '  border-radius:8px!important;',
      '  padding:12px!important;margin:0 0 18px!important;',
      '  color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;',
      '  font-size:.85rem!important;line-height:1.8!important;font-weight:500!important;',
      '}',
      '.modal-glass .modal-guide i,.modal-glass .modal-guide *{',
      '  color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;font-size:inherit!important;',
      '}',

      /* تب‌ها */
      '.modal-glass .tab-buttons,.modal-glass .tabs,.modal-glass [class*="tab-row"]{',
      '  display:flex!important;gap:8px!important;margin-bottom:14px!important;',
      '}',
      '.modal-glass .tab-btn{',
      '  flex:1!important;padding:10px 8px!important;border-radius:12px!important;',
      '  border:1px solid rgba(201,168,76,.4)!important;background:#111827!important;',
      '  color:#E8E0D0!important;-webkit-text-fill-color:#E8E0D0!important;',
      '  font-size:.8rem!important;font-weight:700!important;cursor:pointer!important;',
      '}',
      '.modal-glass .tab-btn.active{',
      '  background:#c9a84c!important;border-color:#c9a84c!important;',
      '  color:#0f172a!important;-webkit-text-fill-color:#0f172a!important;',
      '}',

      /* لیبل طلایی */
      '.modal-glass .input-group label,',
      '.modal-glass .form-group label,',
      '.modal-glass label{',
      '  display:block!important;margin:0 0 6px!important;',
      '  color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-weight:700!important;font-size:.9rem!important;',
      '}',

      /* فیلدها: سرمه‌ای تیره + متن سفید + حاشیه طلایی نازک */
      '.modal-glass input[type=text],.modal-glass input[type=number],.modal-glass input[type=tel],',
      '.modal-glass input[type=email],.modal-glass input[type=password],.modal-glass input[type=date],',
      '.modal-glass input[type=search],.modal-glass textarea,.modal-glass select,',
      '.modal-glass .input-group input,.modal-glass .input-group select,.modal-glass .input-group textarea,',
      '.modal-glass .form-group input,.modal-glass .form-group select,.modal-glass .form-group textarea,',
      '#hamzadModal input,#hamzadModal select,#hamzadModal select.hamzad-date-select,#hamzadModal #calendar{',
      '  width:100%!important;box-sizing:border-box!important;',
      '  background:#111827!important;',
      '  color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;',
      '  border:1px solid rgba(201,168,76,.4)!important;',
      '  border-radius:12px!important;',
      '  font-weight:600!important;font-size:1rem!important;',
      '  padding:12px 15px!important;font-family:inherit!important;',
      '  min-height:44px!important;',
      '  appearance:auto!important;-webkit-appearance:menulist!important;',
      '  outline:none!important;',
      '}',
      '.modal-glass input::placeholder,.modal-glass textarea::placeholder{',
      '  color:rgba(255,255,255,.45)!important;-webkit-text-fill-color:rgba(255,255,255,.45)!important;',
      '  font-weight:500!important;opacity:1!important;',
      '}',
      '.modal-glass input:focus,.modal-glass textarea:focus,.modal-glass select:focus{',
      '  outline:none!important;',
      '  border-color:#c9a84c!important;',
      '  box-shadow:0 0 0 2px rgba(201,168,76,.25)!important;',
      '  background:#111827!important;',
      '}',
      '.modal-glass select option{background:#0b1120!important;color:#fff!important;}',
      '.modal-glass .input-group,.modal-glass .form-group{margin-bottom:15px!important;}',

      /* دکمه طلایی */
      '.modal-glass .btn,.modal-glass button.btn{',
      '  width:100%!important;padding:14px!important;margin-top:4px!important;',
      '  border:none!important;border-radius:12px!important;',
      '  background:#c9a84c!important;',
      '  color:#0f172a!important;-webkit-text-fill-color:#0f172a!important;',
      '  font-size:1.05rem!important;font-weight:800!important;',
      '  box-shadow:0 5px 15px rgba(201,168,76,.4)!important;',
      '}',

      /* نتیجه */
      '.modal-glass .result-box[style*="display: none"],',
      '.modal-glass .result-box[style*="display:none"]{',
      '  display:none!important;margin:0!important;padding:0!important;height:0!important;border:none!important;',
      '}',
      '.modal-glass .result-box,.modal-glass .result-card{',
      '  background:#111827!important;',
      '  border:1px solid rgba(201,168,76,.25)!important;',
      '  border-radius:12px!important;',
      '  padding:12px!important;margin-top:14px!important;',
      '}',
      '.modal-glass .result-description,.modal-glass .result-value,.modal-glass .result-text{',
      '  color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;',
      '  line-height:1.75!important;font-size:.9rem!important;',
      '  max-height:none!important;overflow:visible!important;',
      '  white-space:pre-wrap!important;word-wrap:break-word!important;',
      '  -webkit-line-clamp:unset!important;line-clamp:unset!important;',
      '}',

      '#hamzadModal .date-row,#hamzadModal .hamzad-date-row{',
      '  display:grid!important;grid-template-columns:1fr 1fr 1fr!important;',
      '  gap:8px!important;margin-bottom:12px!important;',
      '}',

      /* راهنمای پنجره — جمع‌وجور، فونت ریز، تا فرم دیده بماند */
      'html body .modal-glass .kafe-modal-detailed-guide,',
      'html body .kafe-modal-detailed-guide{',
      '  padding:6px 9px!important;margin:4px 0 8px!important;',
      '  max-height:88px!important;overflow:auto!important;',
      '  font-size:.7rem!important;line-height:1.45!important;',
      '  border-radius:10px!important;',
      '}',
      'html body .kafe-modal-detailed-guide .kafe-modal-guide-title{',
      '  font-size:.72rem!important;line-height:1.3!important;margin:0 0 2px!important;',
      '  font-weight:800!important;color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '}',
      'html body .kafe-modal-detailed-guide p,',
      'html body .kafe-modal-detailed-guide p *{',
      '  font-size:.68rem!important;line-height:1.45!important;margin:0!important;font-weight:500!important;',
      '}'
    ].join('\n');
  }

  function hideVersionBadge() {
    try {
      var b = document.getElementById('appVersionBadge');
      if (b) {
        b.style.setProperty('display', 'none', 'important');
        b.style.setProperty('visibility', 'hidden', 'important');
        b.style.setProperty('opacity', '0', 'important');
        b.style.setProperty('height', '0', 'important');
      }
    } catch (e) {}
  }

  function applyInline() {
    try {
      document.querySelectorAll('.modal-glass').forEach(function (modal) {
        modal.style.setProperty('background', OVERLAY_BG, 'important');
        modal.style.setProperty('backdrop-filter', 'none', 'important');
        var c = modal.querySelector('.modal-glass-content');
        if (!c) return;
        c.style.setProperty('background', CARD_BG, 'important');
        c.style.setProperty('background-color', CARD_BG, 'important');
        c.style.setProperty('border', '2px solid #c9a84c', 'important');
        c.style.setProperty('border-radius', '24px', 'important');
        c.style.setProperty('backdrop-filter', 'none', 'important');
        c.style.setProperty('box-shadow', '0 10px 30px rgba(0,0,0,.8)', 'important');
      });
    } catch (e) {}
  }

  function syncOpen() {
    try {
      if (document.querySelector('.modal-glass.active')) document.body.classList.add('kafe-modal-open');
      else document.body.classList.remove('kafe-modal-open');
    } catch (e) {}
  }

  function applyLogo() {
    var src = './icon192.png';
    try {
      var img = document.getElementById('headerLogoImg');
      if (img && img.src) src = img.src;
    } catch (e) {}
    try {
      document.querySelectorAll('.modal-glass').forEach(function (modal) {
        var header = modal.querySelector('.modal-glass-header');
        if (!header) return;
        var logo = header.querySelector('.modal-glass-logo');
        if (!logo) {
          logo = document.createElement('div');
          logo.className = 'modal-glass-logo';
          var title = header.querySelector('.modal-glass-title');
          if (title) header.insertBefore(logo, title);
          else header.insertBefore(logo, header.firstChild);
        }
        var im = logo.querySelector('img');
        if (!im) {
          logo.textContent = '';
          im = document.createElement('img');
          im.alt = '\u0644\u0648\u06af\u0648';
          logo.appendChild(im);
        }
        if (im.getAttribute('src') !== src) im.src = src;
      });
    } catch (e) {}
  }

  function patch() {
    var prevOpen = window.openModalGlass;
    if (typeof prevOpen === 'function' && !prevOpen.__kafeV12) {
      window.openModalGlass = function () {
        var r = prevOpen.apply(this, arguments);
        setTimeout(function () {
          injectThemeCSS(); applyInline(); syncOpen(); applyLogo(); hideVersionBadge();
        }, 20);
        setTimeout(applyInline, 150);
        return r;
      };
      window.openModalGlass.__kafeV12 = true;
    }
    var prevClose = window.closeModalGlass;
    if (typeof prevClose === 'function' && !prevClose.__kafeV12) {
      window.closeModalGlass = function () {
        var r = prevClose.apply(this, arguments);
        setTimeout(syncOpen, 30);
        return r;
      };
      window.closeModalGlass.__kafeV12 = true;
    }
  }

  function run() {
    injectThemeCSS();
    hideVersionBadge();
    applyInline();
    patch();
    syncOpen();
    applyLogo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0); setTimeout(run, 500); setTimeout(run, 1500);
    });
  } else {
    run(); setTimeout(run, 500); setTimeout(run, 1500);
  }
  window.addEventListener('load', function () { setTimeout(run, 400); });
  document.addEventListener('click', function () {
    setTimeout(function () { hideVersionBadge(); applyInline(); syncOpen(); applyLogo(); }, 40);
  }, true);
})();
