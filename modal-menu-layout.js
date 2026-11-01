/** modal-menu-layout.js — منوی مودال‌ها: ۳ ستون، خانه اول «برای من»، گروه‌بندی موضوعی */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_MENU_LAYOUT__) return;
  window.__KAFE_MODAL_MENU_LAYOUT__ = true;

  /* ترتیب نهایی: خانه ۱ = برای من (خالی/در حال توسعه)
     سپس گروه‌های موضوعی کنار هم */
  var ORDERED_IDS = [
    /* 1 — جایگاه شخصی */
    '__for_me__',
    /* ازدواج و روابط */
    'aghatModal',
    'marriageAgeModal',
    'sotareChiniModal',
    'mohabbatModal',
    /* بیماری و شفا */
    'elateBimariModal',
    'elateBimari12Modal',
    'rastegooModal',
    /* بخت و طالع */
    'bahtModal',
    'setareModal',
    'sababModal',
    /* افراد و روابط اجتماعی */
    'hamzadModal',
    'amadanModal',
    'dostDoshmaniModal',
    /* مکاشفه و رمل و جفر */
    'mokashefeModal',
    'mokelModal',
    'ramlModal',
    'dalilModal',
    'asmaniModal',
    'vefqModal',
    /* ابزار */
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
      '#modalsHomeGrid.modals-home-grid, #modalsHomeGrid{',
      '  display:grid!important;',
      '  grid-template-columns:repeat(3,minmax(0,1fr))!important;',
      '  gap:10px!important;',
      '  padding:4px 2px 24px!important;',
      '  width:100%!important;',
      '  box-sizing:border-box!important;',
      '}',
      '#modalsHomeGrid .modals-home-item, #modalsHomeGrid .mh-chip{',
      '  display:flex!important;',
      '  flex-direction:column!important;',
      '  align-items:center!important;',
      '  justify-content:center!important;',
      '  text-align:center!important;',
      '  gap:6px!important;',
      '  min-height:88px!important;',
      '  padding:12px 8px!important;',
      '  border-radius:16px!important;',
      '  background:linear-gradient(145deg,rgba(34,57,95,.92),rgba(20,35,67,.96))!important;',
      '  border:1px solid rgba(201,168,76,.35)!important;',
      '  box-shadow:0 6px 18px rgba(0,0,0,.25)!important;',
      '  cursor:pointer!important;',
      '  transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease!important;',
      '  -webkit-tap-highlight-color:transparent!important;',
      '}',
      '#modalsHomeGrid .modals-home-item:active, #modalsHomeGrid .mh-chip:active{',
      '  transform:scale(0.96)!important;',
      '  border-color:rgba(240,216,120,.7)!important;',
      '}',
      '#modalsHomeGrid .mh-icon{font-size:1.55rem!important;line-height:1!important;display:block!important;}',
      '#modalsHomeGrid .mh-label{',
      '  font-size:.72rem!important;',
      '  font-weight:700!important;',
      '  color:#F5E9C9!important;',
      '  -webkit-text-fill-color:#F5E9C9!important;',
      '  line-height:1.35!important;',
      '  max-width:100%!important;',
      '  overflow:hidden!important;',
      '  display:-webkit-box!important;',
      '  -webkit-line-clamp:2!important;',
      '  -webkit-box-orient:vertical!important;',
      '}',
      '#modalsHomeGrid .mh-chip.mh-for-me{',
      '  background:linear-gradient(145deg,rgba(40,40,48,.9),rgba(22,22,28,.95))!important;',
      '  border:1px dashed rgba(201,168,76,.45)!important;',
      '  opacity:.92!important;',
      '  cursor:default!important;',
      '}',
      '#modalsHomeGrid .mh-chip.mh-for-me .mh-label{color:#C8C0B0!important;-webkit-text-fill-color:#C8C0B0!important;font-size:.68rem!important;}',
      '#modalsHomeGrid .mh-chip.mh-for-me .mh-sub{',
      '  font-size:.6rem!important;color:rgba(200,192,176,.75)!important;margin-top:2px!important;',
      '}',
      '#pageModals .modals-home-hero{text-align:center;margin-bottom:14px;padding:8px 6px;}',
      '#pageModals .modals-home-hero h2{color:var(--txt-title,#F0D878)!important;font-size:1.1rem!important;margin-bottom:4px!important;}',
      '#pageModals .modals-home-hero p{color:var(--txt-hint,#C8C0B0)!important;font-size:.8rem!important;line-height:1.5!important;}'
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
      ramlModal: { title: 'رمل امام علی', icon: '🎲' },
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
      var meta = (typeof getModalMeta === 'function') ? getModalMeta(id) : item;
      var title = (meta && meta.title) || item.title || id;
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
          var meta = (typeof getModalMeta === 'function') ? getModalMeta(m.id) : m;
          html +=
            '<div class="modals-home-item mh-chip" onclick="openModalGlass(\'' + m.id + '\')">' +
            '<span class="mh-icon">' + ((meta && meta.icon) || m.icon || '📜') + '</span>' +
            '<span class="mh-label">' + ((meta && meta.title) || m.title || m.id) + '</span>' +
            '</div>';
        });
      }
    } catch (e) {}

    grid.innerHTML = html;
  }

  function patchRender() {
    window.renderModalsHomeGrid = renderGroupedGrid;
  }

  function patchCenterMenu() {
    var prev = window.toggleMenuDrawer;
    window.toggleMenuDrawer = function () {
      try {
        var overlay = document.getElementById('menuDrawerOverlay');
        var drawer = document.getElementById('menuDrawer');
        if (overlay) overlay.classList.remove('active');
        if (drawer) drawer.classList.remove('active');
        document.body.style.overflow = '';
      } catch (e) {}
      try {
        renderGroupedGrid();
        if (typeof window.scrollToPage === 'function') window.scrollToPage(1);
        else {
          var p = document.getElementById('pageModals');
          if (p) p.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        }
        if (typeof updateSwipeDots === 'function') updateSwipeDots(1);
        if (typeof updateBottomNav === 'function') updateBottomNav(1);
      } catch (e) {
        if (typeof prev === 'function') return prev.apply(this, arguments);
      }
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
      setTimeout(run, 700);
      setTimeout(run, 1800);
    });
  } else {
    run();
    setTimeout(run, 700);
    setTimeout(run, 1800);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 400);
    setTimeout(run, 1400);
  });
})();
