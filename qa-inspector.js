/* Kafe Miad QA Inspector v5 — passive, session-only, admin-gated.
 * Records UI interactions and performs a read-only source inventory.
 * Never submits forms, clicks business controls, writes to Supabase, or stores user input.
 */
(function () {
  'use strict';
  if (window.__KAFE_QA_INSPECTOR_LOADED__) return;
  window.__KAFE_QA_INSPECTOR_LOADED__ = true;

  var active = false;
  var startedAt = null;
  var events = [];
  var notes = [];
  var errors = [];
  var sourceAudit = [];
  var maxEvents = 500;
  var observer = null;
  var panel = null;
  var statusNode = null;
  var lastView = '';
  var lastModalState = '';
  var auditRunning = false;

  function now() { return new Date().toISOString(); }
  function safeText(value, max) {
    return String(value == null ? '' : value)
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[ایمیل]')
      .replace(/\b(?:\+?\d[\d\s().-]{7,}\d)\b/g, '[شماره]')
      .replace(/\s+/g, ' ')
      .slice(0, max || 100);
  }
  function push(list, item) {
    list.push(item);
    if (list.length > maxEvents) list.splice(0, list.length - maxEvents);
    updateCount();
  }
  function record(type, detail) {
    if (!active) return;
    push(events, { at: now(), type: type, detail: detail || '' });
  }
  function getView() {
    var ids = ['pageShop', 'pageBuy', 'pageModals', 'pageTools', 'adminPanel', 'settingsPanel', 'menuDrawer'];
    var visible = [];
    ids.forEach(function (id) {
      var n = document.getElementById(id);
      if (!n) return;
      var cs;
      try { cs = getComputedStyle(n); } catch (e) { cs = null; }
      if (cs && cs.display !== 'none' && cs.visibility !== 'hidden' && (n.offsetWidth || n.offsetHeight || n.getClientRects().length)) {
        visible.push(id);
      }
    });
    return visible.join(',') || 'صفحه قابل تشخیص نیست';
  }
  function getOpenLayers() {
    var nodes = document.querySelectorAll('.modal-glass, [role="dialog"], .modal, .drawer, .sheet');
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], cs;
      try { cs = getComputedStyle(n); } catch (e) { continue; }
      if (cs.display === 'none' || cs.visibility === 'hidden' || (!n.offsetWidth && !n.offsetHeight && !n.getClientRects().length)) continue;
      var id = n.id || n.getAttribute('role') || n.className || 'لایه بدون شناسه';
      out.push(safeText(id, 70));
      if (out.length >= 12) break;
    }
    return out.join(' | ') || 'هیچ پنجره شناخته‌شده‌ای باز نیست';
  }
  function updateCount() {
    if (statusNode) statusNode.textContent = 'رویدادها: ' + events.length + ' · یادداشت‌ها: ' + notes.length;
  }
  function addCard(parent, title, body) {
    var card = document.createElement('div');
    card.style.cssText = 'padding:8px 10px;margin:6px 0;border:1px solid rgba(201,168,76,.24);border-radius:10px;background:rgba(255,255,255,.035)';
    var h = document.createElement('div');
    h.style.cssText = 'font-weight:800;color:#F0D878;margin-bottom:3px';
    h.textContent = title;
    var p = document.createElement('div');
    p.style.cssText = 'font-size:12px;line-height:1.6;color:#F5F0E4;white-space:pre-wrap;overflow-wrap:anywhere';
    p.textContent = body;
    card.appendChild(h); card.appendChild(p); parent.appendChild(card);
  }
  function makeButton(label, handler) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = 'padding:8px 10px;border-radius:9px;border:1px solid rgba(201,168,76,.55);background:#172033;color:#F0D878;font:700 12px Tahoma,sans-serif';
    b.addEventListener('click', handler);
    return b;
  }
  function buildUI() {
    if (panel) return;
    panel = document.createElement('section');
    panel.id = 'kafeQAInspector';
    panel.dir = 'rtl';
    panel.style.cssText = 'position:fixed;z-index:119990;right:8px;left:8px;bottom:76px;max-height:38vh;overflow:auto;padding:10px;background:rgba(7,11,20,.97);color:#F5F0E4;border:1px solid rgba(201,168,76,.65);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.4);font:13px Tahoma,sans-serif;display:none';
    var title = document.createElement('div');
    title.textContent = 'همراه QA — ثبت رفتار و ممیزی کد';
    title.style.cssText = 'font-weight:900;color:#F0D878;margin-bottom:6px';
    var desc = document.createElement('div');
    desc.textContent = 'فقط ثبت مشاهده؛ بدون کلیک خودکار، ارسال فرم یا تغییر داده';
    desc.style.cssText = 'font-size:11px;opacity:.85;line-height:1.6;margin-bottom:7px';
    statusNode = document.createElement('div');
    statusNode.style.cssText = 'font-size:11px;color:#F0D878;margin-bottom:8px';
    var outcome = document.createElement('select');
    outcome.id = 'kafeQAInspectorOutcome';
    outcome.style.cssText = 'width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid #8b7440;background:#fff;color:#111;font:12px Tahoma,sans-serif;margin:4px 0';
    [
      ['pending', 'نیازمند بررسی'],
      ['pass', 'سالم'],
      ['issue', 'دارای مشکل'],
      ['partial', 'ناقص'],
      ['not-run', 'آزمایش نشده']
    ].forEach(function (item) {
      var option = document.createElement('option');
      option.value = item[0]; option.textContent = item[1]; outcome.appendChild(option);
    });
    var note = document.createElement('textarea');
    note.id = 'kafeQAInspectorNote';
    note.rows = 2;
    note.placeholder = 'یادداشت مدیر: چه چیزی را آزمایش کردید و چه نتیجه‌ای دیدید؟';
    note.style.cssText = 'width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid #8b7440;background:#fff;color:#111;font:12px Tahoma,sans-serif;margin:4px 0';
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px';
    actions.appendChild(makeButton('ثبت یادداشت', function () {
      var value = safeText(note.value, 500);
      if (!value) return;
      push(notes, { at: now(), view: getView(), outcome: outcome.value, note: value });
      note.value = '';
      record('یادداشت مدیر', value);
    }));
    actions.appendChild(makeButton('ممیزی کد فقط‌خواندنی', runSourceAudit));
    actions.appendChild(makeButton('کپی گزارش', copyReport));
    actions.appendChild(makeButton('کوچک‌سازی', function () { panel.style.display = 'none'; showLauncher(); }));
    actions.appendChild(makeButton('پایان بررسی', stop));
    panel.appendChild(title); panel.appendChild(desc); panel.appendChild(statusNode);
    panel.appendChild(outcome); panel.appendChild(note); panel.appendChild(actions);
    var feed = document.createElement('div');
    feed.id = 'kafeQAInspectorFeed';
    feed.style.cssText = 'margin-top:8px;max-height:110px;overflow:auto';
    panel.appendChild(feed);
    document.body.appendChild(panel);
    buildLauncher();
    updateCount();
  }
  var launcher = null;
  function buildLauncher() {
    if (launcher) return;
    launcher = makeButton('QA همراه', function () {
      if (panel) panel.style.display = 'block';
      launcher.style.display = 'none';
    });
    launcher.id = 'kafeQAInspectorLauncher';
    launcher.style.cssText += ';position:fixed;z-index:119991;right:10px;bottom:78px;box-shadow:0 4px 14px rgba(0,0,0,.35)';
    document.body.appendChild(launcher);
  }
  function showLauncher() { if (launcher) launcher.style.display = 'block'; }
  function renderFeed() {
    if (!panel) return;
    var feed = document.getElementById('kafeQAInspectorFeed');
    if (!feed) return;
    while (feed.firstChild) feed.removeChild(feed.firstChild);
    events.slice(-8).reverse().forEach(function (e) { addCard(feed, e.type, e.detail); });
    notes.slice(-4).reverse().forEach(function (n) { addCard(feed, 'یادداشت مدیر — ' + n.outcome, n.view + '\n' + n.note); });
  }
  function observe() {
    document.addEventListener('click', function (ev) {
      if (!active) return;
      var n = ev.target && ev.target.closest ? ev.target.closest('button,a,[role="button"],[onclick]') : ev.target;
      if (!n || n.closest('#kafeQAInspector') || n.closest('#kafeQAPanel') || n.closest('#kafeQAInspectorLauncher')) return;
      var label = safeText(n.innerText || n.getAttribute('aria-label') || n.title || n.id || n.className, 90);
      var ident = (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + safeText(n.className, 70).replace(/\s+/g, '.') : '');
      record('لمس کنترل', 'کنترل: ' + (label || 'بدون عنوان') + '؛ شناسه: ' + (ident || 'ندارد') + '؛ صفحه: ' + getView());
      setTimeout(function () {
        if (!active) return;
        var view = getView();
        if (view !== lastView) { lastView = view; record('تغییر صفحه', view); }
        var layers = getOpenLayers();
        if (layers !== lastModalState) { lastModalState = layers; record('تغییر پنجره', layers); }
        renderFeed();
      }, 180);
    }, true);

    document.addEventListener('submit', function (ev) {
      if (!active) return;
      var f = ev.target;
      record('تلاش برای ارسال فرم', 'فرم: ' + safeText(f && (f.id || f.className), 80) + '؛ فقط رویداد ثبت شد؛ هیچ مقداری از فیلدها ذخیره نشد.');
    }, true);

    window.addEventListener('error', function (ev) {
      if (!active) return;
      push(errors, { at: now(), type: 'JS error', detail: safeText(ev.message, 180), file: safeText((ev.filename || '').split('/').pop(), 80), line: ev.lineno || '' });
      record('خطای JavaScript', safeText(ev.message, 180));
      renderFeed();
    });
    window.addEventListener('unhandledrejection', function (ev) {
      if (!active) return;
      var r = ev && ev.reason;
      var msg = safeText(r && r.message ? r.message : r, 180);
      push(errors, { at: now(), type: 'Promise rejection', detail: msg });
      record('خطای Promise', msg);
      renderFeed();
    });

    observer = new MutationObserver(function () {
      if (!active) return;
      var view = getView();
      if (view !== lastView) { lastView = view; record('تغییر صفحه', view); renderFeed(); }
      var layers = getOpenLayers();
      if (layers !== lastModalState) { lastModalState = layers; record('تغییر پنجره', layers); renderFeed(); }
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'aria-hidden', 'open'] });
  }
  function flowReport(name, nodes, sourceText, htmlText) {
    var missing = [];
    var present = [];
    nodes.forEach(function (node) {
      var runtime = typeof window[node] === 'function';
      var source = sourceText.indexOf(node) >= 0 || htmlText.indexOf(node) >= 0;
      if (runtime) present.push(node + ' (تابع در زمان اجرا موجود)');
      else if (source) missing.push(node + ' (نام در کد دیده شد، اما تابع در زمان بررسی در window موجود نیست)');
      else missing.push(node + ' (تعریف/ارجاع در منابع بررسی‌شده پیدا نشد)');
    });
    sourceAudit.push({ at: now(), flow: name, status: missing.length ? 'نیازمند بررسی' : 'نشانه‌های اولیه موجود', present: present, missing: missing });
  }
  async function runSourceAudit() {
    if (!active || auditRunning) return;
    auditRunning = true;
    sourceAudit = [];
    record('شروع ممیزی کد', 'بررسی ساختار فایل‌های بارگذاری‌شده و نشانه‌های مسیر؛ فقط‌خواندنی');
    var scripts = Array.prototype.slice.call(document.scripts || []);
    var sourceText = '';
    var files = [];
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].src;
      if (!src) { sourceText += '\n' + (scripts[i].textContent || ''); continue; }
      var u;
      try { u = new URL(src, location.href); } catch (e) { continue; }
      if (u.origin !== location.origin) { files.push({ file: u.pathname.split('/').pop(), status: 'خارج از مبدأ؛ متن بررسی نشد' }); continue; }
      try {
        var res = await fetch(src, { method: 'GET', credentials: 'same-origin', cache: 'no-store' });
        if (!res.ok) { files.push({ file: u.pathname.split('/').pop(), status: 'HTTP ' + res.status }); continue; }
        var body = await res.text();
        files.push({ file: u.pathname.split('/').pop(), status: body.length ? 'دریافت شد' : 'فایل خالی', chars: body.length });
        sourceText += '\n' + body;
      } catch (e2) { files.push({ file: u.pathname.split('/').pop(), status: 'دریافت ناموفق' }); }
    }
    var htmlText = document.documentElement ? document.documentElement.innerHTML : '';
    flowReport('ورود و ثبت‌نام', ['registerUser', 'togglePhonePinMode'], sourceText, htmlText);
    flowReport('خرید محصول', ['showOnlineOrderForm', 'submitProductOrder', 'hideOnlineOrderForm'], sourceText, htmlText);
    flowReport('خرید تلفنی', ['showCallPurchaseInfo'], sourceText, htmlText);
    flowReport('اشتراک', ['openSubOrdersPanel', 'openSubscriptionPurchase'], sourceText, htmlText);
    var tables = [];
    var re = /\.from\s*\(\s*['"]([a-zA-Z0-9_]+)['"]\s*\)/g, m;
    while ((m = re.exec(sourceText)) && tables.length < 40) if (tables.indexOf(m[1]) < 0) tables.push(m[1]);
    sourceAudit.push({ at: now(), flow: 'وابستگی‌های Supabase', status: tables.length ? 'نام جدول‌ها از کدهای دریافت‌شده استخراج شد' : 'نام جدول قابل تشخیص نیست', tables: tables });
    sourceAudit.push({ at: now(), flow: 'فایل‌های اسکریپت', status: 'فهرست منابع و وضعیت دریافت', files: files });
    var missingHandlers = [];
    var handlers = document.querySelectorAll('[onclick]');
    for (var j = 0; j < handlers.length; j++) {
      var code = handlers[j].getAttribute('onclick') || '';
      var mm = code.match(/(?:window\.)?([A-Za-z_$][\w$]*)\s*\(/);
      if (mm && typeof window[mm[1]] !== 'function') {
        missingHandlers.push({ control: handlers[j].id || handlers[j].className || handlers[j].tagName, handler: mm[1] });
      }
    }
    sourceAudit.push({ at: now(), flow: 'اتصال کنترل‌های HTML', status: missingHandlers.length ? 'برخی handlerها در window پیدا نشدند؛ نیازمند بررسی' : 'handlerهای inline بررسی‌شده در window موجودند', missing: missingHandlers.slice(0, 60), checked: handlers.length });
    record('پایان ممیزی کد', 'جریان‌ها: ' + sourceAudit.length + '؛ فایل‌های اسکریپت: ' + files.length + '؛ کنترل‌های inline: ' + handlers.length);
    auditRunning = false;
    renderFeed();
    if (panel) {
      var summary = document.createElement('div');
      summary.style.cssText = 'margin-top:8px;padding:8px;border:1px solid rgba(201,168,76,.35);border-radius:9px;font-size:11px;line-height:1.7';
      summary.textContent = 'ممیزی اولیه تمام شد. موارد نیازمند بررسی: ' + sourceAudit.filter(function (x) { return x.status.indexOf('نیازمند') >= 0 || x.status.indexOf('خالی') >= 0; }).length + '. نتیجه کامل در گزارش قابل کپی است. این بررسی اثبات اجرای کامل خرید/پرداخت نیست.';
      panel.appendChild(summary);
    }
  }
  function buildReport() {
    return [
      'گزارش همراه QA کافه سرکتاب میعاد — v5',
      'شروع: ' + startedAt,
      'پایان: ' + now(),
      'وضعیت: ثبت مشاهده و ممیزی فقط‌خواندنی؛ بدون عملیات حساس',
      '',
      '--- رویدادهای رابط کاربری ---',
      events.map(function (e) { return e.at + ' | ' + e.type + ' | ' + e.detail; }).join('\n'),
      '',
      '--- یادداشت‌های مدیر ---',
      notes.map(function (n) { return n.at + ' | ' + n.outcome + ' | ' + n.view + ' | ' + n.note; }).join('\n'),
      '',
      '--- خطاها ---',
      errors.map(function (e) { return e.at + ' | ' + e.type + ' | ' + e.detail + (e.file ? ' | ' + e.file + ':' + e.line : ''); }).join('\n'),
      '',
      '--- ممیزی ساختاری کد ---',
      sourceAudit.map(function (a) {
        var s = a.at + ' | ' + a.flow + ' | ' + a.status;
        if (a.present) s += '\n  موجود: ' + a.present.join('، ');
        if (a.missing) s += '\n  نیازمند بررسی: ' + (Array.isArray(a.missing) ? a.missing.map(function (x) { return typeof x === 'string' ? x : x.handler + ' (' + x.control + ')'; }).join('، ') : a.missing);
        if (a.tables) s += '\n  جدول‌های مشاهده‌شده: ' + a.tables.join('، ');
        if (a.files) s += '\n  فایل‌ها: ' + a.files.map(function (f) { return f.file + '=' + f.status + (f.chars != null ? ' (' + f.chars + ' chars)' : ''); }).join('؛ ');
        if (a.checked != null) s += '\n  کنترل‌های inline بررسی‌شده: ' + a.checked;
        return s;
      }).join('\n\n'),
      '',
      'محدودیت: تحلیل ایستا و مشاهده UI به‌تنهایی صحت کامل منطق سرور، RLS، پرداخت یا پایان‌به‌پایان خرید را اثبات نمی‌کند. برای اثبات آن‌ها آزمون کنترل‌شده در محیط آزمایشی لازم است.',
      'حریم خصوصی: مقدار فیلدهای فرم، رمز، OTP، توکن، شماره و شناسه کاربر عمداً ثبت نشده است.'
    ].join('\n');
  }
  function copyReport() {
    var text = buildReport();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { record('گزارش کپی شد', 'گزارش در کلیپ‌بورد قرار گرفت'); });
    } else {
      window.prompt('گزارش QA را کپی کنید:', text);
    }
  }
  function start() {
    if (active || !window.__KAFE_QA_ADMIN_VERIFIED__) return;
    active = true;
    startedAt = now();
    buildUI();
    panel.style.display = 'block';
    if (launcher) launcher.style.display = 'none';
    lastView = getView();
    lastModalState = getOpenLayers();
    record('شروع همراهی مدیر', 'صفحه آغازین: ' + lastView + '؛ پنجره‌ها: ' + lastModalState);
    observe();
    renderFeed();
  }
  function stop() {
    active = false;
    if (observer) { observer.disconnect(); observer = null; }
    if (panel) panel.style.display = 'none';
    if (launcher) launcher.style.display = 'none';
  }
  window.addEventListener('kafe:qa-admin-verified', start);
  window.addEventListener('kafe:qa-end', stop);
  if (window.__KAFE_QA_ADMIN_VERIFIED__) setTimeout(start, 0);
})();
