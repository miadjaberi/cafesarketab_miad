/** modal-ui-theme.js V7
 * حذف قطعی حاشیه زرد/طلایی دور تمام پنجره‌های مودال
 * + استایل اینلاین برای شکست theme-lock و styles.css
 */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_UI_THEME_V7__) return;
  window.__KAFE_MODAL_UI_THEME_V7__ = true;

  function injectThemeCSS() {
    var id = 'kafe-modal-ui-theme-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    /* این استایل آخر head می‌ماند تا بر theme-lock بچربد */
    try { document.head.appendChild(st); } catch (e) {}
    st.textContent = [
      'body.kafe-modal-open #pageModals,',
      'body.kafe-modal-open #modalsHomeGrid,',
      'body.kafe-modal-open .modals-home-grid,',
      'body.kafe-modal-open .modals-home-hero{',
      '  opacity:0!important;visibility:hidden!important;pointer-events:none!important;',
      '}',
      '.modal-glass,.modal-glass.active,',
      'div.modal-glass,div.modal-glass.active{',
      '  background:rgba(0,0,0,.14)!important;background-color:rgba(0,0,0,.14)!important;',
      '  background-image:none!important;backdrop-filter:blur(1px)!important;',
      '  -webkit-backdrop-filter:blur(1px)!important;',
      '  align-items:center!important;justify-content:center!important;',
      '  padding:12px 12px calc(var(--bottom-nav-height,64px) + 12px)!important;',
      '  box-sizing:border-box!important;',
      '  border:none!important;outline:none!important;',
      '}',
      /* ===== حذف کامل خط زرد دور پنجره ===== */
      '.modal-glass .modal-glass-content,',
      '.modal-glass > .modal-glass-content,',
      'div.modal-glass .modal-glass-content,',
      'div.modal-glass > div.modal-glass-content,',
      '.modal-glass-content{',
      '  background:rgba(12,16,28,.22)!important;',
      '  border:0!important;',
      '  border-width:0!important;',
      '  border-style:none!important;',
      '  border-color:transparent!important;',
      '  border-top:0!important;border-right:0!important;border-bottom:0!important;border-left:0!important;',
      '  outline:none!important;',
      '  outline-width:0!important;',
      '  box-shadow:0 12px 36px rgba(0,0,0,.28)!important;',
      '  border-radius:28px!important;',
      '  border-top-left-radius:28px!important;border-top-right-radius:28px!important;',
      '  border-bottom-left-radius:28px!important;border-bottom-right-radius:28px!important;',
      '  backdrop-filter:blur(12px) saturate(1.1)!important;',
      '  -webkit-backdrop-filter:blur(12px) saturate(1.1)!important;',
      '  max-height:min(88vh,780px)!important;min-height:0!important;',
      '  overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;',
      '  margin:0 auto!important;width:calc(100% - 10px)!important;max-width:440px!important;padding:0!important;',
      '}',
      '.modal-glass .modal-glass-header{',
      '  display:flex!important;align-items:center!important;gap:8px!important;',
      '  padding:12px 14px 10px!important;',
      '  border-bottom:1px solid rgba(255,255,255,.08)!important;',
      '  background:transparent!important;border-radius:28px 28px 0 0!important;',
      '}',
      '.modal-glass .modal-glass-logo{',
      '  display:flex!important;align-items:center!important;justify-content:center!important;',
      '  width:36px!important;height:36px!important;flex-shrink:0!important;font-size:0!important;',
      '  overflow:hidden!important;border-radius:50%!important;',
      '  opacity:1!important;visibility:visible!important;',
      '}',
      '.modal-glass .modal-glass-logo img{',
      '  width:36px!important;height:36px!important;object-fit:contain!important;',
      '  border-radius:50%!important;display:block!important;',
      '}',
      '.modal-glass .modal-glass-title{',
      '  flex:1!important;color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-size:.95rem!important;font-weight:800!important;line-height:1.25!important;text-align:right!important;',
      '}',
      '.modal-glass .modal-glass-close{',
      '  color:#F5F0E4!important;-webkit-text-fill-color:#F5F0E4!important;',
      '  background:rgba(255,255,255,.1)!important;border:1px solid rgba(255,255,255,.12)!important;',
      '  border-radius:12px!important;width:34px!important;height:34px!important;',
      '  font-size:1rem!important;flex-shrink:0!important;',
      '}',
      '.modal-glass .modal-glass-body{padding:12px 14px 16px!important;background:transparent!important;}',
      '.modal-glass .modal-guide,.modal-glass .modal-guide-box,.modal-glass [class*="guide"]{',
      '  background:rgba(255,255,255,.07)!important;border:1px solid rgba(199,125,186,.25)!important;',
      '  border-radius:14px!important;padding:10px 12px!important;margin-bottom:12px!important;',
      '  color:#C77DBA!important;-webkit-text-fill-color:#C77DBA!important;',
      '  font-size:.78rem!important;line-height:1.5!important;font-weight:600!important;',
      '}',
      '.modal-glass .modal-guide i,.modal-glass .modal-guide *{',
      '  color:#C77DBA!important;-webkit-text-fill-color:#C77DBA!important;font-size:inherit!important;',
      '}',
      '.modal-glass .input-group label,.modal-glass .form-group label,.modal-glass label{',
      '  display:block!important;margin-bottom:5px!important;',
      '  color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-weight:700!important;font-size:.82rem!important;',
      '}',
      '.modal-glass input[type=text],.modal-glass input[type=number],.modal-glass input[type=tel],',
      '.modal-glass input[type=email],.modal-glass input[type=password],.modal-glass input[type=date],',
      '.modal-glass input[type=search],.modal-glass textarea,.modal-glass select,',
      '.modal-glass .input-group input,.modal-glass .input-group select,.modal-glass .input-group textarea,',
      '.modal-glass .form-group input,.modal-glass .form-group select,.modal-glass .form-group textarea,',
      '#hamzadModal input,#hamzadModal select,#hamzadModal select.hamzad-date-select,#hamzadModal #calendar{',
      '  width:100%!important;box-sizing:border-box!important;',
      '  background:rgba(255,255,255,.14)!important;border:1px solid rgba(255,255,255,.18)!important;',
      '  border-radius:14px!important;color:#FFFFFF!important;-webkit-text-fill-color:#FFFFFF!important;',
      '  font-weight:700!important;font-size:.95rem!important;padding:11px 12px!important;',
      '  font-family:inherit!important;backdrop-filter:blur(6px)!important;',
      '  -webkit-backdrop-filter:blur(6px)!important;min-height:0!important;',
      '  appearance:auto!important;-webkit-appearance:menulist!important;',
      '}',
      '.modal-glass input::placeholder,.modal-glass textarea::placeholder{',
      '  color:rgba(255,255,255,.45)!important;-webkit-text-fill-color:rgba(255,255,255,.45)!important;',
      '  font-weight:500!important;opacity:1!important;',
      '}',
      '.modal-glass input:focus,.modal-glass textarea:focus,.modal-glass select:focus{',
      '  outline:none!important;border-color:rgba(255,255,255,.35)!important;',
      '  box-shadow:0 0 0 2px rgba(255,255,255,.08)!important;background:rgba(255,255,255,.18)!important;',
      '}',
      '.modal-glass select option{background:#121824!important;color:#fff!important;}',
      '.modal-glass .input-group,.modal-glass .form-group{margin-bottom:12px!important;}',
      '.modal-glass .result-box,.modal-glass .result-card,.modal-glass .result-description,',
      '.modal-glass .result-text,.modal-glass .result-value,.modal-glass #ramlAnswer,',
      '.modal-glass #ramlResult,.modal-glass [id$="Result"],.modal-glass [id$="Answer"]{',
      '  max-height:none!important;height:auto!important;overflow:visible!important;',
      '  overflow-y:visible!important;-webkit-line-clamp:unset!important;line-clamp:unset!important;',
      '  display:block!important;white-space:pre-wrap!important;word-wrap:break-word!important;',
      '  text-overflow:unset!important;',
      '}',
      '.modal-glass .result-box,.modal-glass .result-card{',
      '  background:rgba(12,16,28,.35)!important;border:1px solid rgba(255,255,255,.1)!important;',
      '  border-radius:16px!important;padding:12px!important;margin-top:12px!important;',
      '}',
      '.modal-glass .result-description{',
      '  color:#F5F0E4!important;-webkit-text-fill-color:#F5F0E4!important;',
      '  line-height:1.85!important;font-size:.9rem!important;text-align:justify!important;',
      '}',
      '#hamzadModal .date-row,#hamzadModal .hamzad-date-row{',
      '  display:grid!important;grid-template-columns:1fr 1fr 1fr!important;',
      '  gap:8px!important;margin-bottom:12px!important;',
      '}',
      '.modal-glass .btn,.modal-glass button.btn{padding:13px 14px!important;font-size:.95rem!important;border-radius:14px!important;}',
      '.modal-glass .tab-btn{color:#F5F0E4!important;border-color:rgba(255,255,255,.15)!important;padding:8px 10px!important;font-size:.82rem!important;border-radius:12px!important;}',
      '.modal-glass .tab-btn.active{color:#120E06!important;-webkit-text-fill-color:#120E06!important;}'
    ].join('\n');
  }

  /** استایل اینلاین — بر هر CSS دیگر غالب است */
  function stripYellowFrame() {
    try {
      document.querySelectorAll('.modal-glass').forEach(function (modal) {
        modal.style.setProperty('border', 'none', 'important');
        modal.style.setProperty('outline', 'none', 'important');
        var content = modal.querySelector('.modal-glass-content');
        if (!content) return;
        content.style.setProperty('border', 'none', 'important');
        content.style.setProperty('border-width', '0', 'important');
        content.style.setProperty('border-style', 'none', 'important');
        content.style.setProperty('border-color', 'transparent', 'important');
        content.style.setProperty('outline', 'none', 'important');
        content.style.setProperty('border-radius', '28px', 'important');
        content.style.setProperty('box-shadow', '0 12px 36px rgba(0,0,0,0.28)', 'important');
      });
    } catch (e) {}
  }

  function syncModalOpenClass() {
    try {
      var any = document.querySelector('.modal-glass.active');
      if (any) document.body.classList.add('kafe-modal-open');
      else document.body.classList.remove('kafe-modal-open');
    } catch (e) {}
  }

  function applyHeaderLogoToModals() {
    var src = './icon192.png';
    try {
      var img = document.getElementById('headerLogoImg');
      if (img && img.src) src = img.src;
      else {
        var brand = document.querySelector('#headerBrandLogo img, .brand-logo-img');
        if (brand && brand.src) src = brand.src;
      }
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
        var existing = logo.querySelector('img');
        if (!existing) {
          logo.textContent = '';
          existing = document.createElement('img');
          existing.alt = 'لوگو';
          logo.appendChild(existing);
        }
        if (existing.getAttribute('src') !== src) existing.src = src;
        logo.style.display = 'flex';
        logo.style.visibility = 'visible';
        logo.style.opacity = '1';
      });
    } catch (e) {}
  }

  function patchOpenClose() {
    try {
      var prevOpen = window.openModalGlass;
      if (typeof prevOpen === 'function' && !prevOpen.__kafeBgPatchedV7) {
        window.openModalGlass = function () {
          var r = prevOpen.apply(this, arguments);
          setTimeout(function () {
            injectThemeCSS();
            stripYellowFrame();
            syncModalOpenClass();
            applyHeaderLogoToModals();
          }, 20);
          setTimeout(stripYellowFrame, 100);
          setTimeout(stripYellowFrame, 300);
          return r;
        };
        window.openModalGlass.__kafeBgPatchedV7 = true;
        window.openModalGlass.__kafeBgPatched = true;
      }
      var prevClose = window.closeModalGlass;
      if (typeof prevClose === 'function' && !prevClose.__kafeBgPatchedV7) {
        window.closeModalGlass = function () {
          var r = prevClose.apply(this, arguments);
          setTimeout(syncModalOpenClass, 30);
          return r;
        };
        window.closeModalGlass.__kafeBgPatchedV7 = true;
        window.closeModalGlass.__kafeBgPatched = true;
      }
    } catch (e) {}
  }

  function run() {
    injectThemeCSS();
    stripYellowFrame();
    patchOpenClose();
    syncModalOpenClass();
    applyHeaderLogoToModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0); setTimeout(run, 500); setTimeout(run, 1500);
    });
  } else {
    run(); setTimeout(run, 500); setTimeout(run, 1500);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300); setTimeout(run, 1000);
  });
  document.addEventListener('click', function () {
    setTimeout(function () {
      stripYellowFrame();
      syncModalOpenClass();
      applyHeaderLogoToModals();
    }, 40);
  }, true);
})();
