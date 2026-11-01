/** modal-ui-theme.js V4
 * نزدیک به نمونه تصویر:
 * - شفاف‌تر (کمتر تاری، نه کامل)
 * - عرض خوب + ارتفاع بیشتر
 * - حاشیه طلایی با گوشه گرد (نه تیز)
 * - فاصله از لبه بالا و پایین
 * - فیلد شیشه‌ای، لیبل طلایی، متن سفید، راهنما بادمجانی
 * - لوگوی هدر
 */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_UI_THEME_V4__) return;
  window.__KAFE_MODAL_UI_THEME_V4__ = true;

  var EGGPLANT = '#C77DBA';

  function injectThemeCSS() {
    var id = 'kafe-modal-ui-theme-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '.modal-glass,',
      '.modal-glass.active{',
      '  background:rgba(0,0,0,.18)!important;',
      '  background-color:rgba(0,0,0,.18)!important;',
      '  background-image:none!important;',
      '  backdrop-filter:blur(1.5px)!important;',
      '  -webkit-backdrop-filter:blur(1.5px)!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  padding:10px 10px calc(var(--bottom-nav-height,64px) + 10px)!important;',
      '  box-sizing:border-box!important;',
      '}',
      '.modal-glass .modal-glass-content{',
      '  background:rgba(12,16,28,.22)!important;',
      '  border:1.8px solid rgba(201,168,76,.62)!important;',
      '  backdrop-filter:blur(12px) saturate(1.1)!important;',
      '  -webkit-backdrop-filter:blur(12px) saturate(1.1)!important;',
      '  box-shadow:0 12px 36px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.05)!important;',
      '  border-radius:22px!important;',
      '  max-height:min(86vh,760px)!important;',
      '  min-height:0!important;',
      '  overflow-y:auto!important;',
      '  -webkit-overflow-scrolling:touch!important;',
      '  margin:0 auto!important;',
      '  width:calc(100% - 8px)!important;',
      '  max-width:440px!important;',
      '  padding:0!important;',
      '}',
      '.modal-glass .modal-glass-header{',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  gap:8px!important;',
      '  padding:12px 14px 10px!important;',
      '  border-bottom:1px solid rgba(201,168,76,.22)!important;',
      '  background:transparent!important;',
      '  border-radius:22px 22px 0 0!important;',
      '}',
      '.modal-glass .modal-glass-logo{',
      '  display:flex!important;align-items:center!important;justify-content:center!important;',
      '  width:36px!important;height:36px!important;flex-shrink:0!important;',
      '  font-size:0!important;overflow:hidden!important;border-radius:50%!important;',
      '  filter:drop-shadow(0 0 8px rgba(201,168,76,.4))!important;',
      '  opacity:1!important;visibility:visible!important;',
      '}',
      '.modal-glass .modal-glass-logo img{',
      '  width:36px!important;height:36px!important;object-fit:contain!important;',
      '  border-radius:50%!important;display:block!important;',
      '}',
      '.modal-glass .modal-glass-title{',
      '  flex:1!important;color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-size:.95rem!important;font-weight:800!important;line-height:1.25!important;',
      '  text-align:right!important;',
      '}',
      '.modal-glass .modal-glass-close{',
      '  color:#F5F0E4!important;-webkit-text-fill-color:#F5F0E4!important;',
      '  background:rgba(255,255,255,.1)!important;',
      '  border:1px solid rgba(201,168,76,.35)!important;',
      '  border-radius:12px!important;width:34px!important;height:34px!important;',
      '  font-size:1rem!important;flex-shrink:0!important;',
      '}',
      '.modal-glass .modal-glass-body{',
      '  padding:12px 14px 16px!important;',
      '  background:transparent!important;',
      '}',
      '.modal-glass .modal-guide,',
      '.modal-glass .modal-guide-box,',
      '.modal-glass [class*="guide"]{',
      '  background:rgba(255,255,255,.07)!important;',
      '  border:1px solid rgba(199,125,186,.3)!important;',
      '  border-radius:14px!important;',
      '  padding:10px 12px!important;',
      '  margin-bottom:12px!important;',
      '  backdrop-filter:blur(6px)!important;',
      '  -webkit-backdrop-filter:blur(6px)!important;',
      '  color:#C77DBA!important;',
      '  -webkit-text-fill-color:#C77DBA!important;',
      '  font-size:.78rem!important;',
      '  line-height:1.5!important;',
      '  font-weight:600!important;',
      '}',
      '.modal-glass .modal-guide i,',
      '.modal-glass .modal-guide *{',
      '  color:#C77DBA!important;',
      '  -webkit-text-fill-color:#C77DBA!important;',
      '  font-size:inherit!important;',
      '}',
      '.modal-glass .input-group label,',
      '.modal-glass .form-group > label,',
      '.modal-glass .form-group label,',
      '.modal-glass label{',
      '  display:block!important;',
      '  margin-bottom:5px!important;',
      '  color:#F0D878!important;',
      '  -webkit-text-fill-color:#F0D878!important;',
      '  font-weight:700!important;',
      '  font-size:.82rem!important;',
      '}',
      '.modal-glass input[type=text],',
      '.modal-glass input[type=number],',
      '.modal-glass input[type=tel],',
      '.modal-glass input[type=email],',
      '.modal-glass input[type=password],',
      '.modal-glass input[type=date],',
      '.modal-glass input[type=search],',
      '.modal-glass textarea,',
      '.modal-glass select,',
      '.modal-glass .input-group input,',
      '.modal-glass .input-group select,',
      '.modal-glass .input-group textarea,',
      '.modal-glass .form-group input,',
      '.modal-glass .form-group select,',
      '.modal-glass .form-group textarea,',
      '#hamzadModal input,',
      '#hamzadModal select,',
      '#hamzadModal select.hamzad-date-select,',
      '#hamzadModal #calendar{',
      '  width:100%!important;',
      '  box-sizing:border-box!important;',
      '  background:rgba(255,255,255,.14)!important;',
      '  border:1px solid rgba(201,168,76,.4)!important;',
      '  border-radius:14px!important;',
      '  color:#FFFFFF!important;',
      '  -webkit-text-fill-color:#FFFFFF!important;',
      '  font-weight:700!important;',
      '  font-size:.95rem!important;',
      '  padding:11px 12px!important;',
      '  font-family:inherit!important;',
      '  backdrop-filter:blur(6px)!important;',
      '  -webkit-backdrop-filter:blur(6px)!important;',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;',
      '  appearance:auto!important;',
      '  -webkit-appearance:menulist!important;',
      '  min-height:0!important;',
      '}',
      '.modal-glass input::placeholder,',
      '.modal-glass textarea::placeholder{',
      '  color:rgba(255,255,255,.45)!important;',
      '  -webkit-text-fill-color:rgba(255,255,255,.45)!important;',
      '  font-weight:500!important;opacity:1!important;',
      '}',
      '.modal-glass input:focus,',
      '.modal-glass textarea:focus,',
      '.modal-glass select:focus{',
      '  outline:none!important;',
      '  border-color:rgba(240,216,120,.75)!important;',
      '  box-shadow:0 0 0 2px rgba(201,168,76,.2)!important;',
      '  background:rgba(255,255,255,.18)!important;',
      '}',
      '.modal-glass select option{background:#121824!important;color:#fff!important;}',
      '.modal-glass .input-group,',
      '.modal-glass .form-group{margin-bottom:12px!important;}',
      '.modal-glass .result-box,',
      '.modal-glass .result-card{',
      '  background:rgba(12,16,28,.35)!important;',
      '  border:1px solid rgba(201,168,76,.3)!important;',
      '  border-radius:14px!important;',
      '  backdrop-filter:blur(6px)!important;',
      '  padding:10px!important;',
      '}',
      '#hamzadModal .date-row,#hamzadModal .hamzad-date-row{',
      '  display:grid!important;grid-template-columns:1fr 1fr 1fr!important;',
      '  gap:8px!important;margin-bottom:12px!important;',
      '}',
      '.modal-glass .btn,.modal-glass button.btn{',
      '  padding:13px 14px!important;font-size:.95rem!important;',
      '  border-radius:14px!important;',
      '}',
      '.modal-glass .tab-btn{color:#F5F0E4!important;border-color:rgba(201,168,76,.3)!important;padding:8px 10px!important;font-size:.82rem!important;border-radius:12px!important;}',
      '.modal-glass .tab-btn.active{color:#120E06!important;-webkit-text-fill-color:#120E06!important;}'
    ].join('\n');
  }

  function getHeaderLogoSrc() {
    try {
      var img = document.getElementById('headerLogoImg');
      if (img && img.src) return img.src;
      var brand = document.querySelector('#headerBrandLogo img, .brand-logo-img, .header-brand img');
      if (brand && brand.src) return brand.src;
    } catch (e) {}
    return './icon192.png';
  }

  function applyHeaderLogoToModals() {
    var src = getHeaderLogoSrc();
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

  function run() {
    injectThemeCSS();
    applyHeaderLogoToModals();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 500);
      setTimeout(run, 1500);
    });
  } else {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
    setTimeout(run, 1000);
  });
  document.addEventListener('click', function () {
    setTimeout(applyHeaderLogoToModals, 80);
  }, true);
})();
