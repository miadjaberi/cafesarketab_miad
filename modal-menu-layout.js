/** modal-menu-layout.js — منوی مودال‌ها:
 *  ظاهر شیشه‌ای + حاشیه طلایی مثل ابزارهای پرکاربرد
 *  ۳ ستون، ارتفاع یکسان، گروه‌بندی موضوعی
 *  خانه اول: برای من (در حال توسعه)
 */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_MENU_LAYOUT_V5__) return;
  window.__KAFE_MODAL_MENU_LAYOUT_V5__ = true;

  var TITLE_SHORT = {
    ramlModal: 'قرعه موکلین',
    rastegooModal: 'راستگو و شفا',
    elateBimari12Modal: 'علت بیماری ۱۲',
    dostDoshmaniModal: 'دوست و دشمنی',
    calculatorModal: 'ماشین حساب',
    mokashefeModal: 'مکاشفه موکلین',
    mohabbatModal: 'محبت زن به مرد'
  };

  var ORDERED_IDS = [
    '__for_me__',
    'aghatModal',
    'marriageAgeModal',
    'sotareChiniModal',
    'mohabbatModal',
    'elateBimariModal',
    'elateBimari12Modal',
    'rastegooModal',
    'bahtModal',
    'setareModal',
    'sababModal',
    'hamzadModal',
    'amadanModal',
    'dostDoshmaniModal',
    'mokashefeModal',
    'mokelModal',
    'ramlModal',
    'dalilModal',
    'asmaniModal',
    'vefqModal',
    'calculatorModal',
    'developingModal'
  ];

  function injectMenuCSS() {
    var id = 'kafe-modal-menu-css';
    var st = document.getElementById(id);
    if (!st) {
      st = document.createElement('style');
      st.id = id;
      document.head.appendChild(st);
    }
    st.textContent = [
      '#pageModals{',
      '  padding:10px 10px 28px!important;',
      '  box-sizing:border-box!important;',
      '}',
      '#pageModals .modals-home-hero{',
      '  display:block!important;',
      '  text-align:center!important;',
      '  margin:0 0 12px!important;',
      '  padding:12px 14px!important;',
      '  border-radius:16px!important;',
      '  background:rgba(12,16,28,.55)!important;',
      '  border:1px solid rgba(201,168,76,.35)!important;',
      '  backdrop-filter:blur(14px) saturate(1.1)!important;',
      '  -webkit-backdrop-filter:blur(14px) saturate(1.1)!important;',
      '  box-shadow:0 4px 18px rgba(0,0,0,.25)!important;',
      '}',
      '#pageModals .modals-home-hero h2{',
      '  color:#F0D878!important;-webkit-text-fill-color:#F0D878!important;',
      '  font-size:1.05rem!important;font-weight:800!important;margin:0 0 4px!important;',
      '}',
      '#pageModals .modals-home-hero p{',
      '  color:#C8C0B0!important;-webkit-text-fill-color:#C8C0B0!important;',
      '  font-size:.78rem!important;line-height:1.5!important;margin:0!important;',
      '}',
      '#modalsHomeGrid.modals-home-grid,#modalsHomeGrid{',
      '  display:grid!important;',
      '  grid-template-columns:repeat(3,minmax(0,1fr))!important;',
      '  gap:10px!important;',
      '  padding:2px 0 20px!important;',
      '  width:100%!important;',
      '  box-sizing:border-box!important;',
      '  min-height:120px!important;',
      '}',
      '#modalsHomeGrid .modals-home-item,#modalsHomeGrid .mh-chip{',
      '  display:flex!important;',
      '  flex-direction:column!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  text-align:center!important;',
      '  gap:4px!important;',
      '  height:78px!important;',
      '  min-height:78px!important;',
      '  max-height:78px!important;',
      '  padding:8px 5px!important;',
      '  border-radius:14px!important;',
      '  background:rgba(255,255,255,.08)!important;',
      '  border:1px solid rgba(201,168,76,.38)!important;',
      '  backdrop-filter:blur(12px) saturate(1.15)!important;',
      '  -webkit-backdrop-filter:blur(12px) saturate(1.15)!important;',
      '  box-shadow:0 4px 14px rgba(0,0,0,.22)!important;',
      '  cursor:pointer!important;',
      '  transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease,background .15s ease!important;',
      '  -webkit-tap-highlight-color:transparent!important;',
      '  box-sizing:border-box!important;',
      '}',
      '#modalsHomeGrid .modals-home-item:active,#modalsHomeGrid .mh-chip:active{',
      '  transform:scale(0.96)!important;',
      '  border-color:rgba(240,216,120,.75)!important;',
      '  background:rgba(201,168,76,.14)!important;',
      '}',
      '#modalsHomeGrid .mh-icon{',
      '  font-size:1.35rem!important;',
      '  line-height:1!important;',
      '  display:block!important;',
      '  filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));',
      '}',
      '#modalsHomeGrid .mh-label{',
      '  font-size:.65rem!important;',
      '  font-weight:700!important;',
      '  height:2.6em!important;',
      '  color:#F5E9C9!important;',
      '  -webkit-text-fill-color:#F5E9C9!important;',
      '  line-height:1.3!important;',
      '  max-width:100%!important;',
      '  overflow:hidden!important;',
      '  display:-webkit-box!important;',
      '  -webkit-line-clamp:2!important;',
      '  -webkit-box-orient:vertical!important;',
      '  word-break:break-word!important;',
      '}',
      '#modalsHomeGrid .mh-chip.mh-for-me{',
      '  background:rgba(255,255,255,.04)!important;',
      '  border:1px dashed rgba(201,168,76,.45)!important;',
      '  opacity:.9!important;',
      '  cursor:default!important;',
      '}',
      '#modalsHomeGrid .mh-chip.mh-for-me .mh-label{',
      '  color:#C8C0B0!important;-webkit-text-fill-color:#C8C0B0!important;',
      '}',
      '#modalsHomeGrid .mh-chip.mh-for-me .mh-sub{',
      '  font-size:.58rem!important;',
      '  color:rgba(200,192,176,.7)!important;',
      '  -webkit-text-fill-color:rgba(200,192,176,.7)!important;',
      '  line-height:1.2!important;',
      '}',
      '@media (max-width:360px){',
      '  #modalsHomeGrid .mh-label{font-size:.62rem!important;}',
      '  #modalsHomeGrid .modals-home-item,#modalsHomeGrid .mh-chip{height:74px!important;min-height:74px!important;max-height:74px!important;padding:7px 4px!important;}',
      '}'
    ].join('\n');
  }

  function buildLookup() {
    var map = {};
    try {
      if (typeof modalList !== 'undefined' && Array.isArray(modalList)) {
        modalList.forEach(function (m) {
          if (m && m.id) map[m.id] = { id: m.id, title: m.title || m.id, icon: m.icon || '📜' };
        });
      }
    } catch (e) {}
    var fb = {
      sababModal: { title: 'سبب القادم', icon: '👁️' },
      mohabbatModal: { title: 'محبت زن به مرد', icon: '💖' },
      rastegooModal: { title: 'راستگو و شفا', icon: '✅' },
      dostDoshmaniModal: { title: 'دوست و دشمنی', icon: '🤝' },
      elateBimari12Modal: { title: 'علت بیماری ۱۲', icon: '🩺' },
      elateBimariModal: { title: 'علت بیماری', icon: '💊' },
      amadanModal: { title: 'آمدن غایب', icon: '⏰' },
      bahtModal: { title: 'بخت و اقبال', icon: '🍀' },
      setareModal: { title: 'ستاره طالع', icon: '⭐' },
      aghatModal: { title: 'عاقبت ازدواج', icon: '💍' },
      calculatorModal: { title: 'ماشین حساب', icon: '🧮' },
      dalilModal: { title: 'دلیل الحیران', icon: '❓' },
      ramlModal: { title: 'قرعه موکلین', icon: '🎲' },
      hamzadModal: { title: 'همزاد قرین', icon: '👥' },
      mokashefeModal: { title: 'مکاشفه موکلین', icon: '🔮' },
      sotareChiniModal: { title: 'ستاره چینی', icon: '⭐' },
      mokelModal: { title: 'استخراج موکل', icon: '📿' },
      asmaniModal: { title: 'اسماء الحسنی', icon: '🌟' },
      vefqModal: { title: 'طلسم‌ساز وفق', icon: '🔮' },
      marriageAgeModal: { title: 'سن ازدواج', icon: '💍' },
      developingModal: { title: 'شرح حال', icon: '📋' }
    };
    Object.keys(fb).forEach(function (k) {
      if (!map[k]) map[k] = { id: k, title: fb[k].title, icon: fb[k].icon };
      else {
        if (!map[k].title) map[k].title = fb[k].title;
        if (!map[k].icon) map[k].icon = fb[k].icon;
      }
    });
    return map;
  }

  function renderGroupedGrid() {
    var grid = document.getElementById('modalsHomeGrid');
    if (!grid) return;
    injectMenuCSS();
    grid.classList.add('modals-home-grid');

    var lookup = buildLookup();
    var html = '';
    var seen = {};

    ORDERED_IDS.forEach(function (id) {
      if (id === '__for_me__') {
        html +=
          '<div class="modals-home-item mh-chip mh-for-me" role="button" aria-disabled="true" title="در حال توسعه">' +
          '<span class="mh-icon">👤</span>' +
          '<span class="mh-label">برای من</span>' +
          '<span class="mh-sub">در حال توسعه</span>' +
          '</div>';
        return;
      }
      if (seen[id]) return;
      seen[id] = true;
      var item = lookup[id];
      if (!item) return;
      var meta = null;
      try { if (typeof getModalMeta === 'function') meta = getModalMeta(id); } catch (e) {}
      var title = TITLE_SHORT[id] || (meta && meta.title) || item.title || id;
      if (id === 'ramlModal') title = 'قرعه موکلین';
      var icon = (meta && meta.icon) || item.icon || '📜';
      html +=
        '<div class="modals-home-item mh-chip" onclick="openModalGlass(\'' + id + '\')">' +
        '<span class="mh-icon">' + icon + '</span>' +
        '<span class="mh-label">' + title + '</span>' +
        '</div>';
    });

    try {
      if (typeof modalList !== 'undefined' && Array.isArray(modalList)) {
        modalList.forEach(function (m) {
          if (!m || !m.id || seen[m.id]) return;
          seen[m.id] = true;
          var meta = null;
          try { if (typeof getModalMeta === 'function') meta = getModalMeta(m.id); } catch (e) {}
          var title = TITLE_SHORT[m.id] || (meta && meta.title) || m.title || m.id;
          if (m.id === 'ramlModal') title = 'قرعه موکلین';
          html +=
            '<div class="modals-home-item mh-chip" onclick="openModalGlass(\'' + m.id + '\')">' +
            '<span class="mh-icon">' + ((meta && meta.icon) || m.icon || '📜') + '</span>' +
            '<span class="mh-label">' + title + '</span>' +
            '</div>';
        });
      }
    } catch (e) {}

    grid.innerHTML = html;
  }

  function patchRender() {
    window.renderModalsHomeGrid = renderGroupedGrid;
  }

  function goToModalsPage() {
    try {
      var overlay = document.getElementById('menuDrawerOverlay');
      var drawer = document.getElementById('menuDrawer');
      if (overlay) overlay.classList.remove('active');
      if (drawer) drawer.classList.remove('active');
      document.body.style.overflow = '';
    } catch (e) {}
    renderGroupedGrid();
    try {
      if (typeof window.scrollToPage === 'function') window.scrollToPage(1);
      else {
        var p = document.getElementById('pageModals');
        if (p) p.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      }
      if (typeof updateSwipeDots === 'function') updateSwipeDots(1);
      if (typeof updateBottomNav === 'function') updateBottomNav(1);
    } catch (e) {}
  }

  function patchCenterMenu() {
    window.toggleMenuDrawer = function () {
      goToModalsPage();
    };
  }

  function run() {
    injectMenuCSS();
    patchRender();
    patchCenterMenu();
    renderGroupedGrid();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 500);
      setTimeout(run, 1500);
      setTimeout(run, 3000);
    });
  } else {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
    setTimeout(run, 3000);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });
})();
