/* doago-modal-fix.js v2 — دعاگو + ادغام کنترل‌پنل مودال‌ها */
(function () {
  'use strict';
  if (window.__KAFE_DOAGO_V2__) return;
  window.__KAFE_DOAGO_V2__ = true;
  window.__KAFE_DOAGO_V1__ = true;

  var MODAL_ID = 'developingModal';
  var TITLE = 'دعاگو';
  var ICON = '🙏';
  var STORE_KEY = 'kafeDoagoContent';

  var DEFAULT = {
    duas: [{ title: 'دعای شروع', text: 'متن دعا را از پنل مدیریت ویرایش کنید.' }],
    talsams: [{ title: 'طلسم نمونه', text: 'متن طلسم را اینجا قرار دهید.' }]
  };

  function getContent() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var o = JSON.parse(raw);
        if (o && (Array.isArray(o.duas) || Array.isArray(o.talsams))) {
          return {
            duas: Array.isArray(o.duas) ? o.duas : [],
            talsams: Array.isArray(o.talsams) ? o.talsams : []
          };
        }
      }
    } catch (e) {}
    try {
      if (typeof window.getModalMeta === 'function') {
        var m = window.getModalMeta(MODAL_ID);
        if (m && m.doago) {
          return {
            duas: Array.isArray(m.doago.duas) ? m.doago.duas : DEFAULT.duas.slice(),
            talsams: Array.isArray(m.doago.talsams) ? m.doago.talsams : DEFAULT.talsams.slice()
          };
        }
      }
    } catch (e2) {}
    return { duas: DEFAULT.duas.slice(), talsams: DEFAULT.talsams.slice() };
  }

  function saveContent(c) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(c)); } catch (e) {}
    try {
      var map = JSON.parse(localStorage.getItem('cafeModalMeta') || '{}') || {};
      var cur = map[MODAL_ID] || {};
      cur.title = TITLE;
      cur.icon = ICON;
      cur.guide = cur.guide || 'بخش دعا و طلسم — عنوان‌ها ردیف می‌شوند.';
      cur.doago = c;
      map[MODAL_ID] = cur;
      localStorage.setItem('cafeModalMeta', JSON.stringify(map));
    } catch (e2) {}
  }

  function ensureMetaTitle() {
    try {
      var map = JSON.parse(localStorage.getItem('cafeModalMeta') || '{}') || {};
      var cur = map[MODAL_ID] || {};
      cur.title = TITLE;
      cur.icon = ICON;
      if (!cur.guide) cur.guide = 'بخش دعا و طلسم — هر عنوان را انتخاب کنید تا متن نمایش داده شود.';
      if (!cur.doago) cur.doago = getContent();
      map[MODAL_ID] = cur;
      localStorage.setItem('cafeModalMeta', JSON.stringify(map));
    } catch (e) {}
  }

  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function rebuildModal() {
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    var titleEl = modal.querySelector('.modal-glass-title');
    if (titleEl) titleEl.textContent = ICON + ' ' + TITLE;
    var logo = modal.querySelector('.modal-glass-logo');
    if (logo) logo.textContent = ICON;

    var body = modal.querySelector('.modal-glass-body');
    if (!body) return;
    if (body.getAttribute('data-kafe-doago') === '1') {
      renderLists();
      return;
    }
    body.setAttribute('data-kafe-doago', '1');
    body.innerHTML =
      '<div class="modal-guide"><i class="fas fa-info-circle"></i> دو بخش <b>دعا</b> و <b>طلسم</b>. عنوان‌ها ردیف می‌شوند؛ با انتخاب هر عنوان متن آن باز می‌شود.</div>' +
      '<div class="doago-tabs" style="display:flex;gap:8px;margin:10px 0 14px;">' +
      '<button type="button" class="doago-tab active" data-tab="duas" style="flex:1;padding:10px;border-radius:12px;border:1px solid rgba(201,168,76,.35);background:linear-gradient(135deg,#a8872a,#c9a84c);color:#0a1628;font-weight:800;">🙏 دعا</button>' +
      '<button type="button" class="doago-tab" data-tab="talsams" style="flex:1;padding:10px;border-radius:12px;border:1px solid rgba(201,168,76,.35);background:rgba(255,255,255,.06);color:#F5F0E4;font-weight:700;">🧿 طلسم</button>' +
      '</div>' +
      '<div id="doagoSectionDuas" class="doago-section"></div>' +
      '<div id="doagoSectionTalsams" class="doago-section" style="display:none;"></div>';

    body.querySelectorAll('.doago-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        body.querySelectorAll('.doago-tab').forEach(function (b) {
          b.classList.remove('active');
          b.style.background = 'rgba(255,255,255,.06)';
          b.style.color = '#F5F0E4';
        });
        btn.classList.add('active');
        btn.style.background = 'linear-gradient(135deg,#a8872a,#c9a84c)';
        btn.style.color = '#0a1628';
        var tab = btn.getAttribute('data-tab');
        var d = document.getElementById('doagoSectionDuas');
        var t = document.getElementById('doagoSectionTalsams');
        if (d) d.style.display = tab === 'duas' ? 'block' : 'none';
        if (t) t.style.display = tab === 'talsams' ? 'block' : 'none';
      });
    });

    renderLists();
  }

  function renderLists() {
    var c = getContent();
    fillSection('doagoSectionDuas', c.duas, 'duas');
    fillSection('doagoSectionTalsams', c.talsams, 'talsams');
  }

  function fillSection(elId, items, kind) {
    var el = document.getElementById(elId);
    if (!el) return;
    if (!items || !items.length) {
      el.innerHTML = '<p style="opacity:.7;font-size:.85rem;">هنوز موردی ثبت نشده است.</p>';
      return;
    }
    var html = '<div class="doago-title-row" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">';
    items.forEach(function (it, i) {
      html += '<button type="button" class="doago-chip" data-kind="' + kind + '" data-idx="' + i + '" style="padding:8px 12px;border-radius:999px;border:1px solid rgba(201,168,76,.3);background:rgba(255,255,255,.05);color:#F0D878;font-size:.82rem;font-weight:700;">' +
        escapeHtml(it.title || ('مورد ' + (i + 1))) + '</button>';
    });
    html += '</div><div class="doago-body-panel" id="doagoBody_' + kind + '" style="padding:12px;border-radius:14px;border:1px solid rgba(201,168,76,.2);background:rgba(0,0,0,.25);min-height:80px;line-height:1.85;white-space:pre-wrap;color:#F5F0E4;font-size:.9rem;">برای دیدن متن، یک عنوان را انتخاب کنید.</div>';
    el.innerHTML = html;
    el.querySelectorAll('.doago-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var idx = Number(chip.getAttribute('data-idx'));
        var k = chip.getAttribute('data-kind');
        var list = getContent()[k] || [];
        var item = list[idx];
        var panel = document.getElementById('doagoBody_' + k);
        if (panel && item) {
          panel.innerHTML = '<div style="font-weight:800;color:#F0D878;margin-bottom:8px;">' + escapeHtml(item.title || '') + '</div>' +
            escapeHtml(item.text || '');
        }
        el.querySelectorAll('.doago-chip').forEach(function (c) {
          c.style.background = 'rgba(255,255,255,.05)';
          c.style.borderColor = 'rgba(201,168,76,.3)';
        });
        chip.style.background = 'rgba(201,168,76,.25)';
        chip.style.borderColor = 'rgba(201,168,76,.7)';
      });
    });
  }

  function injectAdminEditorPanel() {
    var list = document.getElementById('adminModalsList');
    if (list) {
      list.querySelectorAll('.modal-admin-item').forEach(function (item) {
        var name = item.querySelector('.modal-admin-name');
        if (!name) return;
        var txt = name.textContent || '';
        if (txt.indexOf('شرح حال') >= 0 || txt.indexOf('دعاگو') >= 0) {
          var c = getContent();
          var structure = name.querySelector('.admin-structure');
          if (structure) structure.textContent = (c.duas.length) + ' دعا / ' + (c.talsams.length) + ' طلسم';
          var b = name.querySelector('b');
          if (b && b.textContent.indexOf('شرح حال') >= 0) b.textContent = TITLE;
        }
      });
    }
    var editId = document.getElementById('modalEditId');
    if (editId && String(editId.value) === MODAL_ID) ensureAdminDoagoFields();
  }

  function ensureAdminDoagoFields() {
    if (document.getElementById('kafeDoagoAdminEditor')) return;
    var anchor = document.getElementById('modalEditAnswers') ||
      document.getElementById('modalEditGuide') ||
      document.getElementById('modalEditTitle') ||
      document.getElementById('adminModals');
    if (!anchor) return;
    var parent = anchor.parentNode || anchor;
    var box = document.createElement('div');
    box.id = 'kafeDoagoAdminEditor';
    box.style.cssText = 'margin:14px 0;padding:12px;border-radius:14px;border:1px solid rgba(201,168,76,.35);background:rgba(0,0,0,.2);';
    var c = getContent();
    box.innerHTML =
      '<div style="font-weight:800;color:#F0D878;margin-bottom:8px;">🙏 محتوای دعاگو (دعا / طلسم)</div>' +
      '<div style="font-size:.78rem;opacity:.85;margin-bottom:10px;line-height:1.6;">عنوان‌ها ردیف می‌شوند و متن زیر هر عنوان ذخیره می‌شود.</div>' +
      adminSectionHtml('duas', 'دعاها', c.duas) +
      adminSectionHtml('talsams', 'طلسم‌ها', c.talsams) +
      '<button type="button" id="kafeDoagoAdminSave" class="btn" style="width:100%;margin-top:10px;">💾 ذخیره دعا و طلسم</button>';
    if (anchor.id === 'adminModals') parent.appendChild(box);
    else parent.insertBefore(box, anchor.nextSibling);

    box.querySelectorAll('[data-doago-add]').forEach(function (btn) {
      btn.onclick = function () {
        var kind = btn.getAttribute('data-doago-add');
        var wrap = document.getElementById('kafeDoagoList_' + kind);
        if (wrap) wrap.appendChild(makeAdminRow({ title: '', text: '' }));
      };
    });
    bindAdminDeletes(box);
    var save = document.getElementById('kafeDoagoAdminSave');
    if (save) {
      save.onclick = function () {
        var next = { duas: readAdminList('duas'), talsams: readAdminList('talsams') };
        saveContent(next);
        renderLists();
        if (typeof showNotification === 'function') showNotification('✅ دعاگو در پنل مدیریت ذخیره شد');
        try {
          if (typeof window.renderAdminModals === 'function') window.renderAdminModals();
          if (typeof window.renderModalsHomeGrid === 'function') window.renderModalsHomeGrid();
        } catch (e) {}
        var old = document.getElementById('kafeDoagoAdminEditor');
        if (old) old.remove();
        ensureAdminDoagoFields();
      };
    }
  }

  function adminSectionHtml(kind, label, items) {
    var html = '<div style="margin-top:12px;"><div style="font-weight:700;color:#e8c76b;margin-bottom:6px;">' + label +
      ' <button type="button" data-doago-add="' + kind + '" style="margin-right:8px;padding:3px 8px;border-radius:8px;border:1px solid rgba(201,168,76,.4);background:rgba(255,255,255,.06);color:#F5F0E4;font-size:.72rem;">+ افزودن</button></div>' +
      '<div id="kafeDoagoList_' + kind + '">';
    (items || []).forEach(function (it) { html += adminRowHtml(it); });
    html += '</div></div>';
    return html;
  }

  function adminRowHtml(it) {
    return '<div class="kafe-doago-row" style="margin-bottom:8px;padding:8px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.18);">' +
      '<input type="text" class="kafe-doago-title" placeholder="عنوان / سرفصل" value="' + escapeHtml(it.title || '') + '" style="width:100%;margin-bottom:5px;padding:8px;border-radius:8px;border:1px solid rgba(255,215,0,.2);background:rgba(255,255,255,.06);color:#F5F0E4;box-sizing:border-box;">' +
      '<textarea class="kafe-doago-text" rows="3" placeholder="متن" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,215,0,.2);background:rgba(255,255,255,.06);color:#F5F0E4;box-sizing:border-box;font-family:inherit;">' + escapeHtml(it.text || '') + '</textarea>' +
      '<button type="button" class="kafe-doago-del" style="margin-top:5px;padding:3px 8px;border-radius:8px;border:1px solid rgba(255,100,100,.35);background:rgba(255,80,80,.12);color:#ffb4b4;font-size:.72rem;">حذف</button></div>';
  }

  function makeAdminRow(it) {
    var d = document.createElement('div');
    d.innerHTML = adminRowHtml(it);
    var row = d.firstChild;
    var del = row.querySelector('.kafe-doago-del');
    if (del) del.onclick = function () { row.remove(); };
    return row;
  }

  function bindAdminDeletes(root) {
    (root || document).querySelectorAll('.kafe-doago-del').forEach(function (btn) {
      btn.onclick = function () {
        var row = btn.closest('.kafe-doago-row');
        if (row) row.remove();
      };
    });
  }

  function readAdminList(kind) {
    var wrap = document.getElementById('kafeDoagoList_' + kind);
    var out = [];
    if (!wrap) return out;
    wrap.querySelectorAll('.kafe-doago-row').forEach(function (row) {
      var t = (row.querySelector('.kafe-doago-title') || {}).value || '';
      var x = (row.querySelector('.kafe-doago-text') || {}).value || '';
      if (String(t).trim() || String(x).trim()) out.push({ title: String(t).trim(), text: String(x).trim() });
    });
    return out;
  }

  function patchAdminHooks() {
    var prevRender = window.renderAdminModals;
    if (typeof prevRender === 'function' && !prevRender.__kafeDoago) {
      window.renderAdminModals = function () {
        var r = prevRender.apply(this, arguments);
        setTimeout(injectAdminEditorPanel, 40);
        setTimeout(injectAdminEditorPanel, 200);
        return r;
      };
      window.renderAdminModals.__kafeDoago = true;
    }
    var prevEdit = window.editModalMetaAdmin;
    if (typeof prevEdit === 'function' && !prevEdit.__kafeDoago) {
      window.editModalMetaAdmin = function (modalId) {
        var r = prevEdit.apply(this, arguments);
        try {
          if (r && typeof r.then === 'function') {
            r.then(function () {
              if (String(modalId) === MODAL_ID) setTimeout(ensureAdminDoagoFields, 80);
            });
          } else if (String(modalId) === MODAL_ID) {
            setTimeout(ensureAdminDoagoFields, 80);
            setTimeout(ensureAdminDoagoFields, 250);
          }
        } catch (e) {}
        return r;
      };
      window.editModalMetaAdmin.__kafeDoago = true;
    }
  }

  function boot() {
    ensureMetaTitle();
    rebuildModal();
    patchAdminHooks();
    injectAdminEditorPanel();
    try {
      if (typeof window.applyModalMetaToUI === 'function') window.applyModalMetaToUI(MODAL_ID);
      if (typeof window.renderModalsHomeGrid === 'function') window.renderModalsHomeGrid();
      if (typeof window.renderDrawerItems === 'function') window.renderDrawerItems();
      if (typeof window.renderAdminModals === 'function') window.renderAdminModals();
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 600); });
  } else setTimeout(boot, 600);
  setTimeout(boot, 2200);
  setTimeout(boot, 5500);

  var prevOpen = window.openModalGlass;
  if (typeof prevOpen === 'function' && !prevOpen.__kafeDoago) {
    window.openModalGlass = function (id) {
      var r = prevOpen.apply(this, arguments);
      if (id === MODAL_ID) setTimeout(rebuildModal, 40);
      return r;
    };
    window.openModalGlass.__kafeDoago = true;
  }

  try {
    var obs = new MutationObserver(function () {
      if (document.getElementById('modalEditId') && String(document.getElementById('modalEditId').value) === MODAL_ID) {
        ensureAdminDoagoFields();
      }
      injectAdminEditorPanel();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  } catch (eObs) {}
})();
