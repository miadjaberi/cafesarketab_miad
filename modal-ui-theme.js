/** modal-ui-theme.js V9 — تمیز، مرتب؛ پس‌زمینه اپ کاملاً مات؛ کارت پنجره پررنگ‌تر */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_UI_THEME_V9__) return;
  window.__KAFE_MODAL_UI_THEME_V9__ = true;

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
      'body.kafe-modal-open #pageModals,',
      'body.kafe-modal-open #modalsHomeGrid,',
      'body.kafe-modal-open .modals-home-grid,',
      'body.kafe-modal-open .modals-home-hero{',
      '  opacity:0!important;visibility:hidden!important;pointer-events:none!important;',
      '}',
      /* اوورلی کاملاً مات — تصویر اصلی دیده نشود / تار نباشد */
      '.modal-glass,.modal-glass.active,div.modal-glass,div.modal-glass.active{',
      '  background:#0B0E16!important;',
      '  background-color:#0B0E16!important;',
      '  background-image:none!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  align-items:center!important;justify-content:center!important;',
      '  padding:16px 14px calc(var(--bottom-nav-height,64px) + 16px)!important;',
      '  box-sizing:border-box!important;border:none!important;outline:none!important;',
      '}',
      /* کارت پنجره — پررنگ‌تر و کاملاً جدا */
      '.modal-glass .modal-glass-content,',
      '.modal-glass > .modal-glass-content,',
      'div.modal-glass .modal-glass-content,',
      '.modal-glass-content{',
      '  background:#161B2A!important;',
      '  background-color:#161B2A!important;',
      '  border:none!important;border-width:0!important;outline:none!important;',
      '  border-radius:20px!important;',
      '  box-shadow:0 16px 48px rgba(0,0,0,.55)!important;',
      '  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;',
      '  max-height:min(86vh,720px)!important;',
      '  width:calc(100% - 8px)!important;max-width:400px!important;',
      '  margin:0 auto!important;padding:0!important;',
      '  overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;',
      '}',
      '.modal-glass .modal-glass-header{',
      '  display:flex!important;align-items:center!important;gap:10px!important;',
      '  padding:14px 16px 12px!important;',
      '  border-bottom:1px solid rgba(255,255,255,.08)!important;',
      '  background:transparent!important;',
      '}',
      '.modal-glass .modal-glass-logo{',
      '  width:32px!important;height:32px!important;flex-shrink:0!important;',
      '  display:flex!important;align-items:center!important;justify-content:center!important;',
      '  font-size:0!important;overflow:hidden!important;border-radius:50%!important;',
      '}',
      '.modal-glass .modal-glass-logo img{',
      '  width:32px!important;height:32px!important;object-fit:contain!important;border-radius:50%!important;display:block!important;',
      '}',
      '.modal-glass .modal-glass-title{',
      '  flex:1!important;color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-size:.92rem!important;font-weight:800!important;line-height:1.3!important;',
      '  text-align:right!important;margin:0!important;',
      '}',
      '.modal-glass .modal-glass-close{',
      '  width:32px!important;height:32px!important;border-radius:10px!important;',
      '  background:rgba(255,255,255,.08)!important;border:none!important;',
      '  color:#eee!important;font-size:1rem!important;flex-shrink:0!important;cursor:pointer!important;',
      '}',
      '.modal-glass .modal-glass-header button:not(.modal-glass-close){',
      '  width:32px!important;height:32px!important;border-radius:10px!important;',
      '  padding:0!important;font-size:.85rem!important;',
      '}',
      '.modal-glass .modal-glass-body{padding:12px 16px 18px!important;background:transparent!important;}',
      '.modal-glass .modal-guide,.modal-glass .modal-guide-box,.modal-glass [class*="guide"]{',
      '  background:rgba(199,125,186,.1)!important;border:none!important;border-radius:12px!important;',
      '  padding:8px 12px!important;margin:0 0 12px!important;',
      '  color:#D4A0C8!important;-webkit-text-fill-color:#D4A0C8!important;',
      '  font-size:.72rem!important;line-height:1.55!important;font-weight:500!important;',
      '}',
      '.modal-glass .modal-guide i,.modal-glass .modal-guide *{',
      '  color:#D4A0C8!important;-webkit-text-fill-color:#D4A0C8!important;font-size:inherit!important;',
      '}',
      '.modal-glass .tab-buttons,.modal-glass .tabs,.modal-glass [class*="tab-row"]{',
      '  display:flex!important;gap:8px!important;margin-bottom:12px!important;',
      '}',
      '.modal-glass .tab-btn{',
      '  flex:1!important;padding:10px 8px!important;border-radius:12px!important;',
      '  border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.06)!important;',
      '  color:#E8E0D0!important;-webkit-text-fill-color:#E8E0D0!important;',
      '  font-size:.8rem!important;font-weight:700!important;cursor:pointer!important;',
      '}',
      '.modal-glass .tab-btn.active{',
      '  background:linear-gradient(135deg,#C9A84C,#A8872A)!important;border-color:transparent!important;',
      '  color:#1a1408!important;-webkit-text-fill-color:#1a1408!important;',
      '}',
      '.modal-glass .input-group label,.modal-glass .form-group label,.modal-glass label{',
      '  display:block!important;margin:0 0 6px!important;',
      '  color:#E8D5A3!important;-webkit-text-fill-color:#E8D5A3!important;',
      '  font-weight:700!important;font-size:.8rem!important;',
      '}',
      '.modal-glass input[type=text],.modal-glass input[type=number],.modal-glass input[type=tel],',
      '.modal-glass input[type=email],.modal-glass input[type=password],.modal-glass input[type=date],',
      '.modal-glass input[type=search],.modal-glass textarea,.modal-glass select,',
      '.modal-glass .input-group input,.modal-glass .input-group select,.modal-glass .input-group textarea,',
      '.modal-glass .form-group input,.modal-glass .form-group select,.modal-glass .form-group textarea,',
      '#hamzadModal input,#hamzadModal select,#hamzadModal select.hamzad-date-select,#hamzadModal #calendar{',
      '  width:100%!important;box-sizing:border-box!important;',
      '  background:#F7F3EA!important;color:#1a1a1a!important;-webkit-text-fill-color:#1a1a1a!important;',
      '  border:none!important;border-radius:12px!important;',
      '  font-weight:600!important;font-size:.92rem!important;padding:12px 14px!important;',
      '  font-family:inherit!important;min-height:44px!important;',
      '  appearance:auto!important;-webkit-appearance:menulist!important;',
      '}',
      '.modal-glass input::placeholder,.modal-glass textarea::placeholder{',
      '  color:#8a8578!important;-webkit-text-fill-color:#8a8578!important;font-weight:500!important;opacity:1!important;',
      '}',
      '.modal-glass input:focus,.modal-glass textarea:focus,.modal-glass select:focus{',
      '  outline:none!important;box-shadow:0 0 0 2px rgba(201,168,76,.45)!important;background:#FFFEF9!important;',
      '}',
      '.modal-glass select option{background:#fff!important;color:#1a1a1a!important;}',
      '.modal-glass .input-group,.modal-glass .form-group{margin-bottom:12px!important;}',
      '.modal-glass .btn,.modal-glass button.btn{',
      '  width:100%!important;padding:13px 14px!important;margin-top:4px!important;',
      '  border:none!important;border-radius:12px!important;',
      '  background:linear-gradient(135deg,#D4B45A,#A8872A)!important;',
      '  color:#1a1408!important;-webkit-text-fill-color:#1a1408!important;',
      '  font-size:.95rem!important;font-weight:800!important;',
      '  box-shadow:0 4px 14px rgba(168,135,42,.35)!important;',
      '}',
      '.modal-glass .result-box[style*="display: none"],.modal-glass .result-box[style*="display:none"]{',
      '  display:none!important;margin:0!important;padding:0!important;height:0!important;border:none!important;',
      '}',
      '.modal-glass .result-box,.modal-glass .result-card{',
      '  background:rgba(255,255,255,.06)!important;border:none!important;border-radius:12px!important;',
      '  padding:12px!important;margin-top:12px!important;',
      '}',
      '.modal-glass .result-description,.modal-glass .result-value,.modal-glass .result-text{',
      '  color:#F5F0E4!important;-webkit-text-fill-color:#F5F0E4!important;',
      '  line-height:1.75!important;font-size:.88rem!important;',
      '  max-height:none!important;overflow:visible!important;',
      '  white-space:pre-wrap!important;word-wrap:break-word!important;',
      '  -webkit-line-clamp:unset!important;line-clamp:unset!important;',
      '}',
      '#hamzadModal .date-row,#hamzadModal .hamzad-date-row{',
      '  display:grid!important;grid-template-columns:1fr 1fr 1fr!important;',
      '  gap:8px!important;margin-bottom:12px!important;',
      '}'
    ].join('\n');
  }

  function stripFrame() {
    try {
      document.querySelectorAll('.modal-glass').forEach(function (modal) {
        modal.style.setProperty('border', 'none', 'important');
        modal.style.setProperty('outline', 'none', 'important');
        modal.style.setProperty('background', '#0B0E16', 'important');
        modal.style.setProperty('backdrop-filter', 'none', 'important');
        var c = modal.querySelector('.modal-glass-content');
        if (!c) return;
        c.style.setProperty('border', 'none', 'important');
        c.style.setProperty('outline', 'none', 'important');
        c.style.setProperty('border-radius', '20px', 'important');
        c.style.setProperty('background', '#161B2A', 'important');
        c.style.setProperty('backdrop-filter', 'none', 'important');
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
          im.alt = 'لوگو';
          logo.appendChild(im);
        }
        if (im.getAttribute('src') !== src) im.src = src;
      });
    } catch (e) {}
  }

  function patch() {
    var prevOpen = window.openModalGlass;
    if (typeof prevOpen === 'function' && !prevOpen.__kafeV9) {
      window.openModalGlass = function () {
        var r = prevOpen.apply(this, arguments);
        setTimeout(function () { injectThemeCSS(); stripFrame(); syncOpen(); applyLogo(); }, 20);
        setTimeout(stripFrame, 150);
        return r;
      };
      window.openModalGlass.__kafeV9 = true;
    }
    var prevClose = window.closeModalGlass;
    if (typeof prevClose === 'function' && !prevClose.__kafeV9) {
      window.closeModalGlass = function () {
        var r = prevClose.apply(this, arguments);
        setTimeout(syncOpen, 30);
        return r;
      };
      window.closeModalGlass.__kafeV9 = true;
    }
  }

  function run() {
    injectThemeCSS();
    stripFrame();
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
    setTimeout(function () { stripFrame(); syncOpen(); applyLogo(); }, 40);
  }, true);
})();
