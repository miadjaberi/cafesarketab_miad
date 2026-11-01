/** modal-ui-theme.js V2
 * - لوگوی هدر واقعی در همه مودال‌ها
 * - فشرده: بدون اسکرول اضافه / راهنما کوچک
 * - پس‌زمینه شفاف‌تر + حاشیه طلایی واضح (صفحه اصلی دیده شود)
 */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_UI_THEME_V2__) return;
  window.__KAFE_MODAL_UI_THEME_V2__ = true;

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
      '.modal-glass{',
      '  background:rgba(5,7,13,.35)!important;',
      '  background-image:none!important;',
      '  backdrop-filter:blur(2px)!important;',
      '  -webkit-backdrop-filter:blur(2px)!important;',
      '}',
      '.modal-glass .modal-glass-content{',
      '  background:rgba(10,14,24,.42)!important;',
      '  border:1.5px solid rgba(201,168,76,.55)!important;',
      '  backdrop-filter:blur(16px) saturate(1.2)!important;',
      '  -webkit-backdrop-filter:blur(16px) saturate(1.2)!important;',
      '  box-shadow:0 8px 28px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)!important;',
      '  border-radius:18px!important;',
      '  max-height:min(88vh,720px)!important;',
      '  overflow-y:auto!important;',
      '  -webkit-overflow-scrolling:touch!important;',
      '}',
      '.modal-glass .modal-glass-header{',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  gap:8px!important;',
      '  padding:10px 12px 8px!important;',
      '  border-bottom:1px solid rgba(201,168,76,.28)!important;',
      '  min-height:0!important;',
      '}',
      '.modal-glass .modal-glass-logo{',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  width:36px!important;',
      '  height:36px!important;',
      '  flex-shrink:0!important;',
      '  font-size:0!important;',
      '  filter:drop-shadow(0 0 8px rgba(201,168,76,.4))!important;',
      '  opacity:1!important;',
      '  visibility:visible!important;',
      '  overflow:hidden!important;',
      '  border-radius:50%!important;',
      '}',
      '.modal-glass .modal-glass-logo img{',
      '  width:36px!important;',
      '  height:36px!important;',
      '  object-fit:contain!important;',
      '  border-radius:50%!important;',
      '  display:block!important;',
      '}',
      '.modal-glass .modal-glass-title{',
      '  flex:1!important;',
      '  color:#F0D878!important;',
      '  -webkit-text-fill-color:#F0D878!important;',
      '  font-size:.95rem!important;',
      '  font-weight:800!important;',
      '  line-height:1.25!important;',
      '}',
      '.modal-glass .modal-glass-close{',
      '  color:#F5F0E4!important;',
      '  -webkit-text-fill-color:#F5F0E4!important;',
      '  background:rgba(255,255,255,.08)!important;',
      '  border:1px solid rgba(201,168,76,.35)!important;',
      '  border-radius:10px!important;',
      '  width:32px!important;height:32px!important;',
      '  font-size:1rem!important;',
      '  flex-shrink:0!important;',
      '}',
      '.modal-glass .modal-glass-body{',
      '  padding:10px 12px 12px!important;',
      '}',
      '.modal-glass .modal-guide,',
      '.modal-glass .modal-guide-box,',
      '.modal-glass [class*="guide"]{',
      '  background:rgba(255,255,255,.06)!important;',
      '  border:1px solid rgba(199,125,186,.3)!important;',
      '  border-radius:10px!important;',
      '  padding:8px 10px!important;',
      '  margin-bottom:10px!important;',
      '  backdrop-filter:blur(8px)!important;',
      '  -webkit-backdrop-filter:blur(8px)!important;',
      '  color:#C77DBA!important;',
      '  -webkit-text-fill-color:#C77DBA!important;',
      '  font-size:.78rem!important;',
      '  line-height:1.45!important;',
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
      '  margin-bottom:4px!important;',
      '  color:#F0D878!important;',
      '  -webkit-text-fill-color:#F0D878!important;',
      '  font-weight:700!important;',
      '  font-size:.8rem!important;',
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
      '  background:rgba(255,255,255,.09)!important;',
      '  border:1px solid rgba(201,168,76,.4)!important;',
      '  border-radius:12px!important;',
      '  color:#FFFFFF!important;',
      '  -webkit-text-fill-color:#FFFFFF!important;',
      '  font-weight:700!important;',
      '  font-size:.95rem!important;',
      '  padding:10px 11px!important;',
      '  font-family:inherit!important;',
      '  backdrop-filter:blur(8px)!important;',
      '  -webkit-backdrop-filter:blur(8px)!important;',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.07)!important;',
      '  appearance:auto!important;',
      '  -webkit-appearance:menulist!important;',
      '  min-height:0!important;',
      '}',
      '.modal-glass input::placeholder,',
      '.modal-glass textarea::placeholder{',
      '  color:rgba(255,255,255,.42)!important;',
      '  -webkit-text-fill-color:rgba(255,255,255,.42)!important;',
      '  font-weight:500!important;',
      '  opacity:1!important;',
      '}',
      '.modal-glass input:focus,',
      '.modal-glass textarea:focus,',
      '.modal-glass select:focus{',
      '  outline:none!important;',
      '  border-color:rgba(240,216,120,.7)!important;',
      '  box-shadow:0 0 0 2px rgba(201,168,76,.2)!important;',
      '  background:rgba(255,255,255,.13)!important;',
      '}',
      '.modal-glass select option{background:#121824!important;color:#fff!important;}',
      '.modal-glass .input-group,',
      '.modal-glass .form-group{margin-bottom:10px!important;}',
      '.modal-glass .result-box,',
      '.modal-glass .result-card{',
      '  background:rgba(12,16,28,.5)!important;',
      '  border:1px solid rgba(201,168,76,.3)!important;',
      '  border-radius:14px!important;',
      '  backdrop-filter:blur(8px)!important;',
      '  padding:10px!important;',
      '}',
      '#hamzadModal .date-row,',
      '#hamzadModal .hamzad-date-row{',
      '  display:grid!important;',
      '  grid-template-columns:1fr 1fr 1fr!important;',
      '  gap:8px!important;',
      '  margin-bottom:10px!important;',
      '}',
      '.modal-glass .btn,',
      '.modal-glass button.btn{',
      '  padding:12px 14px!important;',
      '  font-size:.95rem!important;',
      '}',
      '.modal-glass .tab-btn{color:#F5F0E4!important;border-color:rgba(201,168,76,.3)!important;padding:8px 10px!important;font-size:.82rem!important;}',
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
        if (existing.getAttribute('src') !== src) {
          existing.src = src;
        }
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
      setTimeout(run, 600);
      setTimeout(run, 1800);
    });
  } else {
    run();
    setTimeout(run, 600);
    setTimeout(run, 1800);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });
  document.addEventListener('click', function () {
    setTimeout(applyHeaderLogoToModals, 80);
  }, true);
})();
