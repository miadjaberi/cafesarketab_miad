/** hamzad-ui-fix.js — UI همزاد:
 * 1) فقط یک دکمه پاک‌کردن (همان ⌫ هدر سراسری) — دکمه پایین حذف می‌شود
 * 2) دکمه محاسبه دقیقاً مثل سایر مودال‌ها: class="btn"
 * 3) تاریخ تولد: روز / ماه / سال به صورت select زیبا
 * 4) فیلدها: پس‌زمینه سفید + متن تیره
 */
(function () {
  'use strict';
  if (window.__KAFE_HAMZAD_UI_FIXED_V2__) return;
  window.__KAFE_HAMZAD_UI_FIXED_V2__ = true;

  var JALALI_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  var GREG_MONTHS = ['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];

  function injectStyles() {
    var st = document.getElementById('kafe-hamzad-ui-css');
    if (!st) {
      st = document.createElement('style');
      st.id = 'kafe-hamzad-ui-css';
      document.head.appendChild(st);
    }
    st.textContent = [
      '#hamzadModal .actions{display:none!important;}',
      '#hamzadModal .hamzad-calc-wrap{margin-top:14px;margin-bottom:4px;}',
      '#hamzadModal .hamzad-calc-wrap .btn{width:100%!important;margin:0!important;padding:14px 16px!important;font-size:1rem!important;font-weight:800!important;border:0!important;border-radius:12px!important;cursor:pointer!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;font-family:inherit!important;background:linear-gradient(135deg,#a8872a,#c9a84c,#e8d5a3)!important;color:#0a1628!important;box-shadow:0 4px 20px rgba(201,168,76,.3)!important;}',
      '#hamzadModal .date-row.hamzad-date-row{display:flex!important;gap:8px!important;margin-top:10px!important;direction:rtl!important;}',
      '#hamzadModal .hamzad-date-wrap{flex:1!important;min-width:0!important;}',
      '#hamzadModal .hamzad-date-wrap label{display:block!important;font-size:.72rem!important;color:var(--txt-hint,#C8C0B0)!important;margin-bottom:4px!important;text-align:center!important;}',
      /* فیلدها: پس‌زمینه سفید + متن تیره (خوانا مثل بقیه مودال‌ها) */
      '#hamzadModal input[type=text],#hamzadModal input[type=number],#hamzadModal select,#hamzadModal select.hamzad-date-select,#hamzadModal #calendar{background:#FFFFFF!important;color:#1A1A1A!important;-webkit-text-fill-color:#1A1A1A!important;border:1px solid rgba(201,168,76,.55)!important;border-radius:12px!important;font-family:inherit!important;box-sizing:border-box!important;}',
      '#hamzadModal input[type=text]::placeholder,#hamzadModal input[type=number]::placeholder{color:#6B6B6B!important;opacity:1!important;}',
      '#hamzadModal select.hamzad-date-select{width:100%!important;padding:11px 6px!important;font-size:.9rem!important;text-align:center!important;appearance:auto!important;-webkit-appearance:menulist!important;cursor:pointer!important;}',
      '#hamzadModal select.hamzad-date-select:focus,#hamzadModal input:focus,#hamzadModal #calendar:focus{outline:none!important;border-color:#c9a84c!important;box-shadow:0 0 0 2px rgba(201,168,76,.25)!important;}',
      '#hamzadModal .calendar-selector{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;flex-wrap:wrap!important;margin-bottom:4px!important;}',
      '#hamzadModal .calendar-selector #calendar{width:auto!important;min-width:110px!important;padding:8px 10px!important;font-size:.85rem!important;}',
      '#hamzadModal .form-group{margin-bottom:14px!important;}',
      '#hamzadModal .form-group > label{display:block!important;margin-bottom:6px!important;}',
      '#hamzadModal .form-group input[type=text]{width:100%!important;padding:12px 10px!important;font-size:.95rem!important;}',
      '#hamzadModal #hamzadResult{margin-top:14px!important;}'
    ].join('\n');
  }

  function monthOptions(isGregorian) {
    var names = isGregorian ? GREG_MONTHS : JALALI_MONTHS;
    var html = '';
    for (var m = 1; m <= 12; m++) {
      html += '<option value="' + m + '">' + m + ' — ' + names[m - 1] + '</option>';
    }
    return html;
  }

  function rebuildMonthSelect(isGregorian) {
    var sel = document.getElementById('month');
    if (!sel || sel.tagName !== 'SELECT') return;
    var current = sel.value;
    sel.innerHTML = '<option value="">ماه</option>' + monthOptions(isGregorian);
    if (current) sel.value = current;
  }

  function buildDateSelects(dateRow) {
    if (!dateRow || dateRow.dataset.kafeSelects === '1') return;
    dateRow.dataset.kafeSelects = '1';
    dateRow.classList.add('hamzad-date-row');

    var dayOpts = '';
    for (var d = 1; d <= 31; d++) dayOpts += '<option value="' + d + '">' + d + '</option>';

    var yearOpts = '';
    for (var y = 1410; y >= 1300; y--) yearOpts += '<option value="' + y + '">' + y + '</option>';

    var cal = document.getElementById('calendar');
    var isGreg = cal && cal.value === 'gregorian';

    function makeWrap(id, label, optionsHtml) {
      var wrap = document.createElement('div');
      wrap.className = 'date-input hamzad-date-wrap';
      var lab = document.createElement('label');
      lab.setAttribute('for', id);
      lab.textContent = label;
      var sel = document.createElement('select');
      sel.id = id;
      sel.className = 'hamzad-date-select';
      sel.innerHTML = '<option value="">' + label + '</option>' + optionsHtml;
      wrap.appendChild(lab);
      wrap.appendChild(sel);
      return wrap;
    }

    dateRow.innerHTML = '';
    dateRow.appendChild(makeWrap('day', 'روز', dayOpts));
    dateRow.appendChild(makeWrap('month', 'ماه', monthOptions(isGreg)));
    dateRow.appendChild(makeWrap('year', 'سال', yearOpts));

    if (cal && !cal.dataset.kafeCalBound) {
      cal.dataset.kafeCalBound = '1';
      cal.addEventListener('change', function () {
        rebuildMonthSelect(cal.value === 'gregorian');
        var yearSel = document.getElementById('year');
        if (yearSel && yearSel.tagName === 'SELECT') {
          var prev = yearSel.value;
          var opts = '';
          if (cal.value === 'gregorian') {
            for (var gy = 2030; gy >= 1920; gy--) opts += '<option value="' + gy + '">' + gy + '</option>';
          } else {
            for (var jy = 1410; jy >= 1300; jy--) opts += '<option value="' + jy + '">' + jy + '</option>';
          }
          yearSel.innerHTML = '<option value="">سال</option>' + opts;
          if (prev) yearSel.value = prev;
        }
      });
    }
  }

  function ensureCalcButton(modal) {
    var body = modal.querySelector('.modal-glass-body');
    if (!body) return;

    var actions = modal.querySelector('.actions');
    if (actions) {
      actions.querySelectorAll('button').forEach(function (btn) {
        btn.remove();
      });
      actions.style.display = 'none';
      actions.classList.add('kafe-hamzad-actions-gone');
    }

    var existing = body.querySelector('.hamzad-calc-wrap button[onclick*="calculateHamzad"]');
    if (existing) return;

    var wrap = document.createElement('div');
    wrap.className = 'hamzad-calc-wrap';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.setAttribute('onclick', 'calculateHamzad()');
    btn.innerHTML = '👥 محاسبه همزاد';
    wrap.appendChild(btn);

    var dateGroup = null;
    body.querySelectorAll('.form-group').forEach(function (fg) {
      if (fg.querySelector('.date-row, #calendar, #year')) dateGroup = fg;
    });
    if (dateGroup && dateGroup.nextSibling) {
      body.insertBefore(wrap, dateGroup.nextSibling);
    } else if (dateGroup) {
      dateGroup.parentNode.insertBefore(wrap, dateGroup.nextSibling);
    } else if (actions) {
      actions.parentNode.insertBefore(wrap, actions);
    } else {
      body.appendChild(wrap);
    }

    var result = document.getElementById('hamzadResult');
    if (result && result.parentElement !== body) {
      body.appendChild(result);
    }
  }

  function patchClearForm() {
    window.clearHamzadForm = function () {
      try {
        ['name', 'mother', 'year', 'month', 'day'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = '';
        });
        var cal = document.getElementById('calendar');
        if (cal) cal.value = 'jalali';
        rebuildMonthSelect(false);
        var box = document.getElementById('hamzadResult');
        if (box) {
          box.style.display = 'none';
          box.classList.remove('show');
        }
        var nEl = document.getElementById('hamzadNumber');
        if (nEl) nEl.textContent = '';
        var dEl = document.getElementById('hamzadDescription');
        if (dEl) dEl.textContent = '';
      } catch (e) {}
    };
  }

  function fixHamzadModalUI() {
    var modal = document.getElementById('hamzadModal');
    if (!modal) return;
    try {
      injectStyles();
      patchClearForm();

      var dateRow = modal.querySelector('.date-row');
      if (dateRow) buildDateSelects(dateRow);

      ensureCalcButton(modal);

      modal.querySelectorAll('.modal-glass-body button').forEach(function (btn) {
        var t = ((btn.textContent || '') + (btn.getAttribute('onclick') || '') + (btn.className || '')).toLowerCase();
        if (/پاک|clearhamzad|trash|حذف|fa-trash/.test(t) && !/calculatehamzad|محاسبه/.test(t)) {
          btn.remove();
        }
      });

      modal.dataset.kafeHamzadUiFixed = '1';
    } catch (err) {
      console.warn('fixHamzadModalUI', err);
    }
  }

  function run() {
    fixHamzadModalUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(run, 0);
      setTimeout(run, 600);
      setTimeout(run, 1500);
    });
  } else {
    run();
    setTimeout(run, 600);
    setTimeout(run, 1500);
  }
  window.addEventListener('load', function () {
    setTimeout(run, 300);
    setTimeout(run, 1200);
  });
})();
