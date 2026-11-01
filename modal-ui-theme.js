/** modal-ui-theme.js — استایل یکدست همه مودال‌ها
 * 1) پس‌زمینه ثابت = تصویر اصلی برنامه
 * 2) فیلدها شیشه‌ای
 * 3) متن فیلد سفید پررنگ کمی بزرگ‌تر
 * 4) لیبل بالای فیلد طلایی
 * 5) راهنما شیشه‌ای + متن بادمجانی
 * 6) لوگو واضح در هدر
 */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_UI_THEME_V1__) return;
  window.__KAFE_MODAL_UI_THEME_V1__ = true;

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
      '  background-color:rgba(5,7,13,.72)!important;',
      '  background-image:var(--app-user-bg, radial-gradient(ellipse 90% 55% at 50% -15%, rgba(240,216,120,0.12), transparent 50%), linear-gradient(#05070D,#05070D))!important;',
      '  background-size:cover!important;',
      '  background-position:center!important;',
      '  background-attachment:fixed!important;',
      '}',
      '.modal-glass .modal-glass-content{',
      '  background:rgba(12,16,28,.55)!important;',
      '  border:1px solid rgba(201,168,76,.4)!important;',
      '  backdrop-filter:blur(18px) saturate(1.15)!important;',
      '  -webkit-backdrop-filter:blur(18px) saturate(1.15)!important;',
      '  box-shadow:0 12px 40px rgba(0,0,0,.45)!important;',
      '  border-radius:20px!important;',
      '}',
      '.modal-glass .modal-glass-header{',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  gap:10px!important;',
      '  padding:14px 16px 10px!important;',
      '  border-bottom:1px solid rgba(201,168,76,.25)!important;',
      '}',
      '.modal-glass .modal-glass-logo{',
      '  display:flex!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  font-size:1.85rem!important;',
      '  width:42px!important;',
      '  height:42px!important;',
      '  flex-shrink:0!important;',
      '  filter:drop-shadow(0 0 12px rgba(201,168,76,.45))!important;',
      '  opacity:1!important;',
      '  visibility:visible!important;',
      '}',
      '.modal-glass .modal-glass-logo img{',
      '  width:40px!important;height:40px!important;object-fit:contain!important;',
      '  border-radius:50%!important;',
      '}',
      '.modal-glass .modal-glass-title{',
      '  flex:1!important;',
      '  color:#F0D878!important;',
      '  -webkit-text-fill-color:#F0D878!important;',
      '  font-size:1rem!important;',
      '  font-weight:800!important;',
      '}',
      '.modal-glass .modal-glass-close{',
      '  color:#F5F0E4!important;',
      '  -webkit-text-fill-color:#F5F0E4!important;',
      '  background:rgba(255,255,255,.08)!important;',
      '  border:1px solid rgba(201,168,76,.3)!important;',
      '  border-radius:10px!important;',
      '  width:36px!important;height:36px!important;',
      '  font-size:1.1rem!important;',
      '}',
      '.modal-glass .modal-glass-body{',
      '  padding:14px 16px 18px!important;',
      '}',
      '.modal-glass .modal-guide,',
      '.modal-glass .modal-guide-box,',
      '.modal-glass [class*="guide"]{',
      '  background:rgba(255,255,255,.07)!important;',
      '  border:1px solid rgba(199,125,186,.35)!important;',
      '  border-radius:14px!important;',
      '  padding:12px 14px!important;',
      '  margin-bottom:14px!important;',
      '  backdrop-filter:blur(10px)!important;',
      '  -webkit-backdrop-filter:blur(10px)!important;',
      '  color:#C77DBA!important;',
      '  -webkit-text-fill-color:#C77DBA!important;',
      '  font-size:.88rem!important;',
      '  line-height:1.7!important;',
      '  font-weight:600!important;',
      '}',
      '.modal-glass .modal-guide i,',
      '.modal-glass .modal-guide *{',
      '  color:#C77DBA!important;',
      '  -webkit-text-fill-color:#C77DBA!important;',
      '}',
      '.modal-glass .input-group label,',
      '.modal-glass .form-group > label,',
      '.modal-glass .form-group label,',
      '.modal-glass label{',
      '  display:block!important;',
      '  margin-bottom:6px!important;',
      '  color:#F0D878!important;',
      '  -webkit-text-fill-color:#F0D878!important;',
      '  font-weight:700!important;',
      '  font-size:.86rem!important;',
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
      '  background:rgba(255,255,255,.10)!important;',
      '  border:1px solid rgba(201,168,76,.4)!important;',
      '  border-radius:14px!important;',
      '  color:#FFFFFF!important;',
      '  -webkit-text-fill-color:#FFFFFF!important;',
      '  font-weight:700!important;',
      '  font-size:1.02rem!important;',
      '  padding:13px 12px!important;',
      '  font-family:inherit!important;',
      '  backdrop-filter:blur(10px)!important;',
      '  -webkit-backdrop-filter:blur(10px)!important;',
      '  box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;',
      '  appearance:auto!important;',
      '  -webkit-appearance:menulist!important;',
      '}',
      '.modal-glass input::placeholder,',
      '.modal-glass textarea::placeholder{',
      '  color:rgba(255,255,255,.45)!important;',
      '  -webkit-text-fill-color:rgba(255,255,255,.45)!important;',
      '  font-weight:500!important;',
      '  opacity:1!important;',
      '}',
      '.modal-glass input:focus,',
      '.modal-glass textarea:focus,',
      '.modal-glass select:focus{',
      '  outline:none!important;',
      '  border-color:rgba(240,216,120,.75)!important;',
      '  box-shadow:0 0 0 2px rgba(201,168,76,.22)!important;',
      '  background:rgba(255,255,255,.14)!important;',
      '}',
      '.modal-glass select option{',
      '  background:#121824!important;',
      '  color:#fff!important;',
      '}',
      '.modal-glass .input-group,',
      '.modal-glass .form-group{',
      '  margin-bottom:14px!important;',
      '}',
      '.modal-glass .result-box,',
      '.modal-glass .result-card{',
      '  background:rgba(12,16,28,.65)!important;',
      '  border:1px solid rgba(201,168,76,.3)!important;',
      '  border-radius:16px!important;',
      '  backdrop-filter:blur(10px)!important;',
      '}',
      '.modal-glass .tab-btn{',
      '  color:#F5F0E4!important;',
      '  border-color:rgba(201,168,76,.3)!important;',
      '}',
      '.modal-glass .tab-btn.active{',
      '  color:#120E06!important;',
      '  -webkit-text-fill-color:#120E06!important;',
      '}'
    ].join('\n');
  }

  function ensureLogosVisible() {
    try {
      document.querySelectorAll('.modal-glass').forEach(function (modal) {
        var header = modal.querySelector('.modal-glass-header');
        if (!header) return;
        var logo = header.querySelector('.modal-glass-logo');
        if (!logo) {
          logo = document.createElement('div');
          logo.className = 'modal-glass-logo';
          logo.textContent = '📜';
          var title = header.querySelector('.modal-glass-title');
          if (title) header.insertBefore(logo, title);
          else header.insertBefore(logo, header.firstChild);
        }
        logo.style.display = 'flex';
        logo.style.visibility = 'visible';
        logo.style.opacity = '1';
      });
    } catch (e) {}
  }

  function syncModalBgFromApp() {
    try {
      var bg = getComputedStyle(document.body).backgroundImage;
      if (bg && bg !== 'none') {
        document.documentElement.style.setProperty('--kafe-modal-bg', bg);
      }
    } catch (e) {}
  }

  function run() {
    injectThemeCSS();
    syncModalBgFromApp();
    ensureLogosVisible();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 800);
      setTimeout(run, 2000);
    });
  } else {
    run();
    setTimeout(run, 800);
    setTimeout(run, 2000);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400);
    setTimeout(run, 1500);
  });
})();
