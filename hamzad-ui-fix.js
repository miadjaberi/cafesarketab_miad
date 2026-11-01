/** hamzad-ui-fix.js — UI همزاد: یک دکمه پاک‌کردن (هدر)، محاسبه مثل بقیه، تاریخ کشویی */
(function () {
  'use strict';
  if (window.__KAFE_HAMZAD_UI_FIXED__) return;
  window.__KAFE_HAMZAD_UI_FIXED__ = true;

  function fixHamzadModalUI() {
    var modal = document.getElementById('hamzadModal');
    if (!modal || modal.dataset.kafeHamzadUiFixed === '1') return;
    try {
      var actions = modal.querySelector('.actions');
      if (actions) {
        actions.querySelectorAll('button').forEach(function (btn) {
          var t = (btn.textContent || '') + (btn.getAttribute('onclick') || '');
          if (/پاک|clearHamzad|trash|حذف/i.test(t) && !/calculateHamzad/i.test(t)) {
            btn.remove();
          }
        });
        var calc = actions.querySelector('button.primary, button[onclick*="calculateHamzad"]');
        if (calc) {
          calc.className = 'btn';
          calc.innerHTML = '👥 محاسبه همزاد';
          calc.setAttribute('type', 'button');
          calc.setAttribute('onclick', 'calculateHamzad()');
        }
        if (calc && calc.parentElement === actions) {
          actions.className = '';
          actions.style.display = 'block';
          actions.style.marginTop = '12px';
        }
      }

      var dateRow = modal.querySelector('.date-row');
      if (dateRow && !dateRow.dataset.kafeSelects) {
        dateRow.dataset.kafeSelects = '1';
        var jalaliMonths = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
        var gregMonths = ['ژانویه','فوریه','مارس','آوریل','مه','ژوئن','ژوئیه','اوت','سپتامبر','اکتبر','نوامبر','دسامبر'];

        function buildSelect(id, placeholder, optionsHtml) {
          var sel = document.createElement('select');
          sel.id = id;
          sel.className = 'hamzad-date-select';
          sel.innerHTML = '<option value="">' + placeholder + '</option>' + optionsHtml;
          return sel;
        }

        var dayOpts = '', monthOpts = '', yearOpts = '';
        for (var d = 1; d <= 31; d++) dayOpts += '<option value="' + d + '">' + d + '</option>';
        for (var m = 1; m <= 12; m++) monthOpts += '<option value="' + m + '">' + m + ' — ' + jalaliMonths[m - 1] + '</option>';
        for (var y = 1410; y >= 1300; y--) yearOpts += '<option value="' + y + '">' + y + '</option>';

        dateRow.innerHTML = '';
        function wrap(sel) {
          var div = document.createElement('div');
          div.className = 'date-input hamzad-date-wrap';
          div.appendChild(sel);
          return div;
        }
        dateRow.appendChild(wrap(buildSelect('day', 'روز', dayOpts)));
        dateRow.appendChild(wrap(buildSelect('month', 'ماه', monthOpts)));
        dateRow.appendChild(wrap(buildSelect('year', 'سال', yearOpts)));

        var cal = document.getElementById('calendar');
        if (cal && !cal.dataset.kafeMonthHook) {
          cal.dataset.kafeMonthHook = '1';
          cal.addEventListener('change', function () {
            var monthSel = document.getElementById('month');
            var yearSel = document.getElementById('year');
            var names = cal.value === 'gregorian' ? gregMonths : jalaliMonths;
            if (monthSel) {
              var cur = monthSel.value;
              var html = '<option value="">ماه</option>';
              for (var i = 1; i <= 12; i++) html += '<option value="' + i + '">' + i + ' — ' + names[i - 1] + '</option>';
              monthSel.innerHTML = html;
              if (cur) monthSel.value = cur;
            }
            if (yearSel) {
              var ycur = yearSel.value;
              var yhtml = '<option value="">سال</option>';
              if (cal.value === 'gregorian') {
                for (var gy = 2030; gy >= 1950; gy--) yhtml += '<option value="' + gy + '">' + gy + '</option>';
              } else {
                for (var jy = 1410; jy >= 1300; jy--) yhtml += '<option value="' + jy + '">' + jy + '</option>';
              }
              yearSel.innerHTML = yhtml;
              if (ycur) yearSel.value = ycur;
            }
          });
        }
      }

      if (!document.getElementById('kafe-hamzad-ui-css')) {
        var st = document.createElement('style');
        st.id = 'kafe-hamzad-ui-css';
        st.textContent = [
          '#hamzadModal .date-row{display:grid!important;grid-template-columns:1fr 1.2fr 1fr!important;gap:10px!important;margin-top:10px!important;}',
          '#hamzadModal .hamzad-date-select,#hamzadModal #calendar{width:100%!important;padding:12px 10px!important;border-radius:12px!important;border:1px solid rgba(201,168,76,.35)!important;background:rgba(255,255,255,.08)!important;color:var(--txt-body,#F5F0E4)!important;font-size:.95rem!important;font-family:inherit!important;appearance:auto!important;-webkit-appearance:menulist!important;}',
          '#hamzadModal .calendar-selector{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px!important;flex-wrap:wrap!important;}',
          '#hamzadModal .calendar-selector #calendar{width:auto!important;min-width:120px!important;}',
          '#hamzadModal .btn{width:100%!important;margin-top:8px!important;padding:14px!important;font-size:1rem!important;font-weight:800!important;border:0!important;border-radius:12px!important;cursor:pointer!important;}',
          '#hamzadModal .form-group{margin-bottom:14px!important;}',
          '#hamzadModal .form-group label{display:block!important;margin-bottom:6px!important;}',
          '#hamzadModal .form-group input[type=text]{width:100%!important;padding:12px 10px!important;border-radius:12px!important;border:1px solid rgba(201,168,76,.35)!important;background:rgba(255,255,255,.08)!important;color:var(--txt-body,#F5F0E4)!important;font-size:.95rem!important;box-sizing:border-box!important;}',
          '#hamzadModal #hamzadResult{margin-top:14px!important;}'
        ].join('\n');
        document.head.appendChild(st);
      }

      window.clearHamzadForm = function () {
        try {
          ['name', 'mother', 'year', 'month', 'day'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.value = '';
          });
          var cal2 = document.getElementById('calendar');
          if (cal2) cal2.value = 'jalali';
          var box = document.getElementById('hamzadResult');
          if (box) box.style.display = 'none';
          var nEl = document.getElementById('hamzadNumber');
          if (nEl) nEl.textContent = '';
          var dEl = document.getElementById('hamzadDescription');
          if (dEl) dEl.textContent = '';
        } catch (e) {}
      };

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
      setTimeout(run, 800);
    });
  } else {
    run();
    setTimeout(run, 800);
  }
  window.addEventListener('load', function () { setTimeout(run, 400); });
})();
