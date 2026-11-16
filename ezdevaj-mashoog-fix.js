/* ezdevaj-mashoog-fix.js v1 — مودال ازدواج با معشوق + ابجد ۲۸تایی */
(function () {
  'use strict';
  if (window.__KAFE_EZDEVAJ_MASHOOG_V1__) return;
  window.__KAFE_EZDEVAJ_MASHOOG_V1__ = true;

  var MODAL_ID = 'aghatModal';
  var TITLE = 'ازدواج با معشوق';
  var ICON = '💍';

  var RESULTS = [
    'ازدواج بین آن‌ها اتفاق نمی‌افتد.',
    'ازدواج بین آن‌ها حاصل نمی‌شود.',
    'ازدواج انجام می‌شود و خیر زیادی دارد.',
    'ازدواج انجام می‌شود اما دور است؛ بعید است.',
    'ازدواج رخ نمی‌دهد.',
    'ازدواج اتفاق می‌افتد اما مسئله‌ای باعث طلاق می‌شود.',
    'ازدواج رخ نمی‌دهد چون یکی از دو طرف خیانت‌کار است.',
    'ازدواج همراه با خیر، سرور و شادی است و به‌زودی اتفاق می‌افتد.',
    'به کسی که طلب ازدواج کرده بگو خواسته‌اش برآورده می‌شود.',
    'ازدواج بین آن‌ها اتفاق می‌افتد، اما با تأخیر.',
    'ازدواج بین آن‌ها رخ می‌دهد اما در آینده‌ای دور.',
    'بله، ازدواج انجام می‌شود اما در آینده‌ی دور.',
    'ازدواج اتفاق نمی‌افتد چون یکی خیانت‌کار است.',
    'ازدواج حاصل نمی‌شود چون یکی از دو طرف اهل نیرنگ و خیانت است.',
    'ازدواجی مبارک که همراه با خیر، شادی و توفیق است و به‌زودی اتفاق می‌افتد.',
    'ازدواج بین آن‌ها حاصل نمی‌شود.',
    'ازدواج بین آن‌ها حاصل نمی‌شود.',
    'به کسی که طلب ازدواج کرده بشارت بده: بله، ازدواج به زودی، به اذن خدا.',
    'ازدواج اتفاق نمی‌افتد چون یکی از آن‌ها اهل نیرنگ و دروغ است.',
    'ازدواج همراه با خیر و روزی است و به زودی اتفاق می‌افتد.',
    'بله، ازدواج اتفاق می‌افتد اما در آینده‌ی دور.',
    'ازدواج بین آن‌ها رخ نمی‌دهد.',
    'ازدواج مبارک است و در آن تفاهم و سازش وجود دارد و به‌زودی اتفاق می‌افتد.',
    'به کسی که طلب ازدواج کرده بشارت بده؛ خواسته‌اش به زودی، به اذن خدا برآورده می‌شود.',
    'ازدواج همراه با خیر، شادی و سرور است و به‌زودی اتفاق می‌افتد.',
    'ازدواج بین آن‌ها انجام نمی‌شود چون یکی از طرفین اهل نیرنگ و خیانت است.',
    'به کسی که طلب ازدواج کرده بشارت بده؛ خواسته‌اش به اذن خدا برآورده خواهد شد.',
    'ازدواج بین آن‌ها اتفاق نمی‌افتد.'
  ];

  var GUIDE = 'نام خود، نام مادر خود، نام طرف مقابل و نام مادر او را وارد کنید. حروف ویژه طبق قواعد ابجد تبدیل می‌شوند.';

  function normalizeName(s) {
    s = String(s || '').trim();
    s = s.replace(/\u200c/g, '');
    s = s.replace(/ژ/g, 'ز').replace(/گ/g, 'ک').replace(/چ/g, 'ج').replace(/پ/g, 'ب');
    s = s.replace(/موسی/g, 'موسا').replace(/مصطفی/g, 'مصطفا');
    s = s.replace(/سماء/g, '');
    return s;
  }

  function abjadSum(text) {
    if (typeof window.calculateAbjad === 'function') {
      return Number(window.calculateAbjad(normalizeName(text), 'kabir')) || 0;
    }
    var map = {
      'ا':1,'آ':1,'ء':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
      'ی':10,'ك':20,'ک':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,
      'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000
    };
    var t = normalizeName(text), sum = 0;
    for (var i = 0; i < t.length; i++) sum += map[t[i]] || 0;
    return sum;
  }

  function ensureMetaDefault() {
    try {
      var map = {};
      try { map = JSON.parse(localStorage.getItem('cafeModalMeta') || '{}') || {}; } catch (e) {}
      var cur = map[MODAL_ID] || {};
      if (!cur.title || cur.title === 'عاقبت ازدواج') cur.title = TITLE;
      if (!cur.icon) cur.icon = ICON;
      if (!cur.guide) cur.guide = GUIDE;
      if (!Array.isArray(cur.results) || cur.results.length < 28) cur.results = RESULTS.slice();
      map[MODAL_ID] = cur;
      localStorage.setItem('cafeModalMeta', JSON.stringify(map));
    } catch (e) {}
  }

  function getResultsList() {
    try {
      if (typeof window.getModalMeta === 'function') {
        var m = window.getModalMeta(MODAL_ID);
        if (m && Array.isArray(m.results) && m.results.length >= 28) return m.results;
      }
    } catch (e) {}
    return RESULTS;
  }

  function rebuildForm() {
    var modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    var titleEl = modal.querySelector('.modal-glass-title');
    if (titleEl) titleEl.textContent = ICON + ' ' + TITLE;
    var logo = modal.querySelector('.modal-glass-logo');
    if (logo) logo.textContent = ICON;

    var body = modal.querySelector('.modal-glass-body');
    if (!body) return;
    if (body.getAttribute('data-kafe-mashoog') === '1') return;
    body.setAttribute('data-kafe-mashoog', '1');

    body.innerHTML =
      '<div class="modal-guide"><i class="fas fa-info-circle"></i> ' + GUIDE + '</div>' +
      '<div class="input-group"><label>♂️ اسم مرد / خواستگار:</label>' +
      '<input type="text" id="ezdevajMan" placeholder="مثال: حسان"></div>' +
      '<div class="input-group"><label>👩 نام مادر مرد:</label>' +
      '<input type="text" id="ezdevajManMother" placeholder="مثال: مریم"></div>' +
      '<div class="input-group"><label>♀️ اسم زن / معشوق:</label>' +
      '<input type="text" id="ezdevajWoman" placeholder="مثال: میسا"></div>' +
      '<div class="input-group"><label>👩 نام مادر زن:</label>' +
      '<input type="text" id="ezdevajWomanMother" placeholder="مثال: نور"></div>' +
      '<button class="btn" type="button" id="ezdevajCalcBtn">💕 محاسبه ازدواج با معشوق</button>' +
      '<div class="result-box" id="ezdevajResult" style="display:none;">' +
      '<div class="result-value" id="ezdevajValue"></div>' +
      '<div class="result-description" id="ezdevajDescription"></div>' +
      '<div id="ezdevajDetail" style="margin-top:10px;font-size:0.78rem;line-height:1.7;opacity:0.9;"></div>' +
      '</div>';

    var btn = document.getElementById('ezdevajCalcBtn');
    if (btn) btn.onclick = function () { window.calculateEzdevaj(); };
  }

  window.calculateEzdevaj = function calculateEzdevaj() {
    var man = (document.getElementById('ezdevajMan') || {}).value || '';
    var manMother = (document.getElementById('ezdevajManMother') || {}).value || '';
    var woman = (document.getElementById('ezdevajWoman') || {}).value || '';
    var womanMother = (document.getElementById('ezdevajWomanMother') || {}).value || '';

    man = String(man).trim();
    manMother = String(manMother).trim();
    woman = String(woman).trim();
    womanMother = String(womanMother).trim();

    if (!man || !manMother || !woman || !womanMother) {
      if (typeof showNotification === 'function') {
        showNotification('هر چهار نام (مرد، مادر مرد، زن، مادر زن) را وارد کنید', 'error');
      }
      return;
    }

    var vMan = abjadSum(man);
    var vManM = abjadSum(manMother);
    var vWoman = abjadSum(woman);
    var vWomanM = abjadSum(womanMother);
    var total = vMan + vManM + vWoman + vWomanM;
    var withConst = total + 184;
    var rem = withConst % 28;
    var idx = rem === 0 ? 28 : rem;
    var results = getResultsList();
    var text = results[idx - 1] || ('نتیجه شماره ' + idx);

    var valEl = document.getElementById('ezdevajValue');
    var descEl = document.getElementById('ezdevajDescription');
    var detEl = document.getElementById('ezdevajDetail');
    var box = document.getElementById('ezdevajResult');
    if (valEl) {
      valEl.style.display = 'block';
      valEl.textContent = 'شماره نتیجه: ' + idx;
    }
    if (descEl) descEl.textContent = text;
    if (detEl) {
      detEl.innerHTML =
        'جمع ابجد نام‌ها: <b>' + total + '</b><br>' +
        'با افزودن ۱۸۴: <b>' + withConst + '</b><br>' +
        'باقیمانده بر ۲۸: <b>' + rem + '</b> → نتیجه <b>' + idx + '</b>';
    }
    if (box) box.style.display = 'block';
    if (typeof showNotification === 'function') showNotification('محاسبه ازدواج با معشوق انجام شد');
  };

  function boot() {
    ensureMetaDefault();
    rebuildForm();
    try {
      if (typeof window.applyModalMetaToUI === 'function') window.applyModalMetaToUI(MODAL_ID);
    } catch (e) {}
    try {
      if (typeof window.renderModalsHomeGrid === 'function') window.renderModalsHomeGrid();
      if (typeof window.renderAdminModals === 'function') window.renderAdminModals();
      if (typeof window.renderDrawerItems === 'function') window.renderDrawerItems();
    } catch (e2) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 500); });
  } else setTimeout(boot, 500);
  setTimeout(boot, 2000);
  setTimeout(boot, 5000);

  var prevOpen = window.openModalGlass;
  if (typeof prevOpen === 'function' && !prevOpen.__kafeMashoog) {
    window.openModalGlass = function (id) {
      var r = prevOpen.apply(this, arguments);
      if (id === MODAL_ID) setTimeout(rebuildForm, 30);
      return r;
    };
    window.openModalGlass.__kafeMashoog = true;
  }
})();
