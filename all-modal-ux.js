/* Kafe Miad — App-wide modal guidance and safe reset controls
 * UI-only: does not change calculation formulas, account state, orders, purchases, or server data.
 */
(function () {
  'use strict';
  var STYLE_ID = 'km-modal-ux-style';
  var EXCLUDED = {};
  var GUIDE_COPY = [
    { test: /سن ازدواج|عاقبت ازدواج|محبت|ستاره چین|ازدواج/i, text: 'راهنما: اطلاعات خواسته‌شده را کامل وارد کنید و دکمه محاسبه را بزنید. نتیجه را به‌عنوان برداشت احتمالی بخوانید، نه پیش‌بینی قطعی.' },
    { test: /رمل|دلیل الحیران|سبب القادم|همزاد|مکاشفه|موکل|طلسم|وفق/i, text: 'راهنما: فیلدهای همین بخش را به‌ترتیب تکمیل کنید، سؤال یا گزینهٔ مناسب را انتخاب کنید و سپس دکمهٔ محاسبه/استخراج را بزنید. برای نتیجهٔ تازه از «پاک کردن و شروع دوباره» استفاده کنید.' },
    { test: /بیماری|شفای|راستگو/i, text: 'راهنما: اطلاعات درخواستی را وارد کنید و دکمهٔ مربوط به همین موضوع را بزنید. این نتیجه جایگزین تشخیص یا درمان پزشکی نیست.' },
    { test: /ابجد|ماشین حساب|حروف و اعداد/i, text: 'راهنما: متن، عدد یا عمل موردنظر را وارد/انتخاب کنید و سپس دکمهٔ تبدیل یا محاسبه را بزنید. برای ورودی تازه، پاک‌سازی همین مودال را انتخاب کنید.' },
    { test: /حافظ|فالنامه/i, text: 'راهنما: ابتدا نیت کنید، سپس دکمهٔ دریافت فال را بزنید و متن نتیجه را بخوانید. برای شروع دوباره، دکمهٔ پاک‌سازی را بزنید.' },
    { test: /قرآن/i, text: 'راهنما: برای مطالعه، سوره را انتخاب و «نمایش سوره» را بزنید. دانلود کامل فقط با اینترنت پایدار انجام می‌شود؛ پاک‌سازی این پنجره فایل‌های ذخیره‌شده را حذف نمی‌کند.' },
    { test: /اوقات شرعی/i, text: 'راهنما: در صورت درخواست، اجازهٔ موقعیت مکانی را بدهید و محاسبه را اجرا کنید. زمان‌ها تقریبی‌اند؛ برای اطمینان به منبع معتبر محلی مراجعه کنید.' },
    { test: /قطب‌نما/i, text: 'راهنما: گوشی را صاف و دور از آهن‌ربا نگه دارید و در صورت درخواست، دسترسی حسگر را فعال کنید.' },
    { test: /اسماء الحسنی/i, text: 'راهنما: عدد موردنظر را وارد کنید و دکمهٔ جستجو را بزنید تا مورد متناظر نمایش داده شود.' }
  ];
  function titleOf(modal) {
    var el = modal.querySelector('.modal-glass-title');
    return (el ? el.textContent : modal.id || 'این بخش').replace(/\s+/g, ' ').trim();
  }
  function guideFor(modal) {
    var title = titleOf(modal);
    for (var i = 0; i < GUIDE_COPY.length; i++) if (GUIDE_COPY[i].test.test(title)) return GUIDE_COPY[i].text;
    var labels = Array.prototype.map.call(modal.querySelectorAll('label'), function (x) { return x.textContent.trim(); }).filter(Boolean).slice(0, 5);
    return labels.length
      ? 'راهنما: ابتدا ' + labels.join('، ') + ' را تکمیل کنید؛ سپس دکمهٔ مربوط به این بخش را بزنید. نتیجه در همین پنجره نمایش داده می‌شود.'
      : 'راهنما: توضیح این بخش را بخوانید و دکمهٔ مربوط به فعالیت را بزنید. پاک‌سازی فقط محتوای همین پنجره را بازنشانی می‌کند و اطلاعات حساب یا خریدها را حذف نمی‌کند.';
  }
  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = '.km-modal-ux-guide{margin:0 0 12px;padding:24px 20px;border:1px solid rgba(255,215,0,.15);border-radius:16px;background:rgba(255,255,255,.065);backdrop-filter:blur(14px) saturate(135%);-webkit-backdrop-filter:blur(14px) saturate(135%);box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 8px 22px rgba(0,0,0,.12);color:var(--txt-body,#F5F0E4)!important;font:500 14px/1.95 Vazirmatn,Tahoma,sans-serif;text-align:justify;text-shadow:none;opacity:1}.km-modal-ux-guide *{color:var(--txt-body,#F5F0E4)!important;opacity:1;text-shadow:none}.km-modal-ux-guide strong,.km-modal-ux-guide b{color:var(--txt-title,#F0D878)!important;font-weight:800}.km-modal-ux-actions{display:flex;justify-content:flex-start;margin:10px 0 14px}.km-modal-ux-reset{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:9px 14px;border:1px solid rgba(255,215,0,.25);border-radius:12px;background:rgba(255,255,255,.055);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--txt-title,#F0D878);font:700 13px/1.6 Vazirmatn,Tahoma,sans-serif;cursor:pointer;touch-action:manipulation}.km-modal-ux-reset:active{transform:scale(.98)}.km-modal-ux-reset:focus-visible{outline:2px solid #e8c65a;outline-offset:2px}@media(max-width:420px){.km-modal-ux-actions{width:100%}.km-modal-ux-reset{width:100%}}';
    document.head.appendChild(style);
  }
  function applyWelcomeGlass(guide) {
    var styles = {
      'display':'block','box-sizing':'border-box','width':'100%',
      'margin':'0 0 12px','padding':'24px 20px',
      'background':'rgba(255,255,255,0.065)','backdrop-filter':'blur(14px) saturate(135%)',
      '-webkit-backdrop-filter':'blur(14px) saturate(135%)',
      'border':'1px solid rgba(230,200,120,0.32)','border-radius':'16px',
      'box-shadow':'inset 0 1px 0 rgba(255,255,255,0.07),0 8px 22px rgba(0,0,0,0.12)',
      'text-align':'justify','color':'#F5F0E4',
      'font-family':'Vazirmatn,Tahoma,sans-serif','font-size':'14px',
      'font-weight':'500','line-height':'1.95','opacity':'1','text-shadow':'none'
    };
    Object.keys(styles).forEach(function (key) {
      guide.style.setProperty(key, styles[key], 'important');
    });
    guide.querySelectorAll('*').forEach(function (node) {
      node.style.setProperty('opacity','1','important');
      node.style.setProperty('text-shadow','none','important');
      if (node.tagName === 'STRONG' || node.tagName === 'B') {
        node.style.setProperty('color','#F0D878','important');
        node.style.setProperty('font-weight','800','important');
      } else {
        node.style.setProperty('color','#F5F0E4','important');
      }
    });
  }
  function clearResultNodes(modal) {
    var selectors = '.result-box,.modal-result,.calculation-result,.result-container,[id$="Result"],[id$="result"],[id*="Output"],[id*="output"]';
    modal.querySelectorAll(selectors).forEach(function (node) {
      if (node.closest('.km-modal-ux-guide,.km-modal-ux-actions')) return;
      node.textContent = '';
      node.style.display = 'none';
      node.classList.remove('show', 'active', 'visible');
      node.setAttribute('aria-hidden', 'true');
    });
    modal.querySelectorAll('.result.show').forEach(function (node) {
      node.classList.remove('show');
      node.style.display = 'none';
      node.setAttribute('aria-hidden', 'true');
    });
  }
  function resetModal(modal) {
    modal.querySelectorAll('input,textarea,select').forEach(function (field) {
      if (field.disabled || field.dataset.keepOnModalReset === 'true' || field.id === 'orderProductName') return;
      var type = (field.type || '').toLowerCase();
      if (type === 'button' || type === 'submit' || type === 'reset') return;
      if (type === 'checkbox' || type === 'radio') field.checked = false;
      else if (type === 'file') field.value = '';
      else if (field.tagName === 'SELECT') {
        field.selectedIndex = 0;
        field.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        field.value = '';
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    clearResultNodes(modal);
    modal.querySelectorAll('.error,.field-error,[role="alert"]').forEach(function (node) {
      if (node.classList.contains('km-modal-ux-guide')) return;
      node.textContent = '';
    });
    var first = modal.querySelector('input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([disabled]),textarea:not([disabled]),select:not([disabled])');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { try { first.focus(); } catch (ignore) {} } }
  }
  function enhanceProductBackButton() {
    var modal = document.getElementById('productDetailModal');
    if (!modal) return;
    var content = modal.querySelector('.modal-glass-content');
    if (!content || content.querySelector('.km-product-back-row')) return;
    var row = document.createElement('div');
    row.className = 'km-product-back-row';
    row.style.cssText = 'position:sticky;top:0;z-index:30;display:flex;justify-content:flex-start;align-items:center;padding:8px 12px;background:rgba(10,14,25,.97);border-bottom:1px solid rgba(255,215,0,.22);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'km-product-back-button';
    button.textContent = '← بازگشت به فروشگاه';
    button.setAttribute('aria-label', 'بستن جزئیات محصول و بازگشت به فروشگاه');
    button.style.cssText = 'min-height:42px;padding:9px 16px;border-radius:12px;border:1px solid rgba(255,215,0,.35);background:linear-gradient(135deg,rgba(161,107,35,.28),rgba(255,255,255,.07));color:#F0D878;font:700 14px/1.5 Vazirmatn,Tahoma,sans-serif;cursor:pointer;touch-action:manipulation;';
    button.addEventListener('click', function () {
      if (typeof window.closeProductDetail === 'function') window.closeProductDetail();
      else modal.classList.remove('active');
    });
    row.appendChild(button);
    content.insertBefore(row, content.firstChild);
  }
  function enhance() {
    addStyle();
    enhanceProductBackButton();
    document.querySelectorAll('.modal-glass').forEach(function (modal) {
      if (EXCLUDED[modal.id]) return;
      var body = modal.querySelector('.modal-glass-body') || modal.querySelector('.modal-glass-content');
      if (!body) return;
      if (!modal.querySelector('.km-modal-ux-guide')) {
        var guide = document.createElement('div');
        guide.className = 'km-modal-ux-guide';
        guide.setAttribute('role', 'note');
        var guideText = guideFor(modal);
        guide.textContent = '';
        if (guideText.indexOf('راهنما:') === 0) {
          var lead = document.createElement('strong');
          lead.textContent = 'راهنما:';
          guide.appendChild(lead);
          guide.appendChild(document.createTextNode(guideText.slice('راهنما:'.length)));
        } else {
          guide.textContent = guideText;
        }
        applyWelcomeGlass(guide);
        var header = body.querySelector('.modal-guide');
        if (header && header.parentNode === body) header.insertAdjacentElement('afterend', guide);
        else body.insertBefore(guide, body.firstChild);
      }
      /* راهنمای قدیمی را حذف کن؛ فقط کادر جدید شیشه‌ای باقی بماند. */
      modal.querySelectorAll('.modal-guide').forEach(function (oldGuide) {
        if (!oldGuide.classList.contains('km-modal-ux-guide')) oldGuide.remove();
      });
      if (!modal.querySelector('.km-modal-ux-reset')) {
        var actions = document.createElement('div');
        actions.className = 'km-modal-ux-actions';
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'km-modal-ux-reset';
        button.textContent = '🧹 پاک کردن و شروع دوباره';
        button.setAttribute('aria-label', 'پاک کردن ورودی‌ها و نتایج همین پنجره');
        button.addEventListener('click', function () { resetModal(modal); });
        actions.appendChild(button);
        var guideNode = modal.querySelector('.km-modal-ux-guide');
        if (guideNode && guideNode.parentNode) guideNode.insertAdjacentElement('afterend', actions);
        else body.insertBefore(actions, body.firstChild);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, { once: true });
  else enhance();
})();
