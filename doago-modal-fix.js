/* doago-modal-fix.js v1 — مودال دعاگو: دعا + طلسم (لیست عنوان‌دار و ادامه‌دار) */
(function () {
  'use strict';
  if (window.__KAFE_DOAGO_V1__) return;
  window.__KAFE_DOAGO_V1__ = true;

  var MODAL_ID = 'developingModal';
  var TITLE = 'دعاگو';
  var ICON = '🙏';
  var STORE_KEY = 'kafeDoagoContent';

  var DEFAULT = {
    duas: [
      { title: 'دعای شروع', text: 'متن دعا را از پنل مدیریت یا همین‌جا ویرایش کنید.' }
    ],
    talsams: [
      { title: 'طلسم نمونه', text: 'متن طلسم را اینجا قرار دهید.' }
    ]
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
      '<div id="doagoSectionTalsams" class="doago-section" style="display:none;"></div>' +
      '<div id="doagoAdminBox" style="margin-top:16px;padding-top:12px;border-top:1px solid rgba(255,215,0,.12);"></div>';

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
    renderAdminEditor();
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

  function renderAdminEditor() {
    var box = document.getElementById('doagoAdminBox');
    if (!box) return;
    var c = getContent();
    box.innerHTML =
      '<details style="direction:rtl;">' +
      '<summary style="cursor:pointer;color:#F0D878;font-weight:700;padding:6px 0;">⚙️ مدیریت محتوا (افزودن / ویرایش دعا و طلسم)</summary>' +
      '<div style="margin-top:10px;font-size:.8rem;opacity:.85;line-height:1.6;">برای هر مورد عنوان و متن بگذارید. با «افزودن» ردیف جدید ساخته می‌شود.</div>' +
      sectionEditorHtml('duas', 'دعاها', c.duas) +
      sectionEditorHtml('talsams', 'طلسم‌ها', c.talsams) +
      '<button type="button" id="doagoSaveBtn" class="btn" style="width:100%;margin-top:12px;">💾 ذخیره محتوا</button>' +
      '</details>';

    var saveBtn = document.getElementById('doagoSaveBtn');
    if (saveBtn) {
      saveBtn.onclick = function () {
        var next = { duas: readEditor('duas'), talsams: readEditor('talsams') };
        saveContent(next);
        renderLists();
        if (typeof showNotification === 'function') showNotification('✅ محتوای دعاگو ذخیره شد');
        try {
          if (typeof window.renderModalsHomeGrid === 'function') window.renderModalsHomeGrid();
          if (typeof window.renderAdminModals === 'function') window.renderAdminModals();
        } catch (e) {}
      };
    }
    box.querySelectorAll('[data-add]').forEach(function (btn) {
      btn.onclick = function () {
        var kind = btn.getAttribute('data-add');
        var wrap = document.getElementById('doagoEditList_' + kind);
        if (!wrap) return;
        wrap.appendChild(makeEditorRow(kind, { title: '', text: '' }, wrap.children.length));
      };
    });
    bindDeleteButtons();
  }

  function sectionEditorHtml(kind, label, items) {
    var html = '<div style="margin-top:14px;"><div style="font-weight:800;color:#e8c76b;margin-bottom:8px;">' + label +
      ' <button type="button" data-add="' + kind + '" style="margin-right:8px;padding:4px 10px;border-radius:8px;border:1px solid rgba(201,168,76,.4);background:rgba(255,255,255,.06);color:#F5F0E4;font-size:.75rem;">+ افزودن</button></div>' +
      '<div id="doagoEditList_' + kind + '">';
    (items || []).forEach(function (it, i) {
      html += editorRowHtml(kind, it, i);
    });
    html += '</div></div>';
    return html;
  }

  function editorRowHtml(kind, it, i) {
    return '<div class="doago-edit-row" data-kind="' + kind + '" style="margin-bottom:10px;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(0,0,0,.2);">' +
      '<input type="text" class="doago-edit-title" placeholder="عنوان / سرفصل" value="' + escapeHtml(it.title || '') + '" style="width:100%;margin-bottom:6px;padding:8px;border-radius:8px;border:1px solid rgba(255,215,0,.2);background:rgba(255,255,255,.06);color:#F5F0E4;box-sizing:border-box;">' +
      '<textarea class="doago-edit-text" rows="3" placeholder="متن دعا یا طلسم" style="width:100%;padding:8px;border-radius:8px;border:1px solid rgba(255,215,0,.2);background:rgba(255,255,255,.06);color:#F5F0E4;box-sizing:border-box;font-family:inherit;">' + escapeHtml(it.text || '') + '</textarea>' +
      '<button type="button" class="doago-del" style="margin-top:6px;padding:4px 10px;border-radius:8px;border:1px solid rgba(255,100,100,.35);background:rgba(255,80,80,.12);color:#ffb4b4;font-size:.75rem;">حذف</button>' +
      '</div>';
  }

  function makeEditorRow(kind, it, i) {
    var div = document.createElement('div');
    div.innerHTML = editorRowHtml(kind, it, i);
    var row = div.firstChild;
    var del = row.querySelector('.doago-del');
    if (del) del.onclick = function () { row.remove(); };
    return row;
  }

  function readEditor(kind) {
    var wrap = document.getElementById('doagoEditList_' + kind);
    var out = [];
    if (!wrap) return out;
    wrap.querySelectorAll('.doago-edit-row').forEach(function (row) {
      var t = (row.querySelector('.doago-edit-title') || {}).value || '';
      var x = (row.querySelector('.doago-edit-text') || {}).value || '';
      if (String(t).trim() || String(x).trim()) {
        out.push({ title: String(t).trim(), text: String(x).trim() });
      }
    });
    return out;
  }

  function bindDeleteButtons() {
    setTimeout(function () {
      var box = document.getElementById('doagoAdminBox');
      if (!box) return;
      box.querySelectorAll('.doago-del').forEach(function (btn) {
        btn.onclick = function () {
          var row = btn.closest('.doago-edit-row');
          if (row) row.remove();
        };
      });
    }, 50);
  }

  function boot() {
    ensureMetaTitle();
    rebuildModal();
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
      if (id === MODAL_ID) {
        setTimeout(function () {
          rebuildModal();
          bindDeleteButtons();
        }, 40);
      }
      return r;
    };
    window.openModalGlass.__kafeDoago = true;
  }
})();
