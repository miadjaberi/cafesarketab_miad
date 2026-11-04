/** modal-guide-size-fix.js
 * فقط اندازه کادر راهنمای مودال — متعادل و خوانا
 * بدون دستکاری منطق یا بقیه UI
 */
(function () {
  'use strict';
  if (window.__KAFE_MODAL_GUIDE_SIZE_V1__) return;
  window.__KAFE_MODAL_GUIDE_SIZE_V1__ = true;

  var id = 'kafe-modal-guide-size-css';
  var st = document.getElementById(id);
  if (!st) {
    st = document.createElement('style');
    st.id = id;
    document.head.appendChild(st);
  }

  st.textContent = [
    '/* کادر راهنمای مودال — اندازه متعادل */',
    'html body .modal-glass .modal-guide,',
    'html body .modal-glass .modal-guide-box,',
    'html body .modal-glass [class*="guide"]{',
    '  display:block!important;',
    '  width:100%!important;',
    '  box-sizing:border-box!important;',
    '  padding:12px 14px!important;',
    '  margin:0 0 14px!important;',
    '  border-radius:12px!important;',
    '  font-size:0.9rem!important;',
    '  line-height:1.75!important;',
    '  font-weight:500!important;',
    '  max-height:none!important;',
    '  min-height:0!important;',
    '  overflow:visible!important;',
    '}',
    'html body .modal-glass .kafe-modal-detailed-guide,',
    'html body .kafe-modal-detailed-guide{',
    '  display:block!important;',
    '  width:100%!important;',
    '  box-sizing:border-box!important;',
    '  padding:12px 14px!important;',
    '  margin:0 0 14px!important;',
    '  border-radius:12px!important;',
    '  font-size:0.88rem!important;',
    '  line-height:1.75!important;',
    '  max-height:220px!important;',
    '  overflow-y:auto!important;',
    '  min-height:0!important;',
    '}',
    'html body .kafe-modal-detailed-guide .kafe-modal-guide-title,',
    'html body .kafe-modal-guide-title{',
    '  display:block!important;',
    '  font-size:0.95rem!important;',
    '  line-height:1.4!important;',
    '  margin:0 0 6px!important;',
    '  font-weight:800!important;',
    '  color:#F0D878!important;',
    '  -webkit-text-fill-color:#F0D878!important;',
    '}',
    'html body .kafe-modal-detailed-guide p,',
    'html body .kafe-modal-detailed-guide p *{',
    '  font-size:0.88rem!important;',
    '  line-height:1.75!important;',
    '  margin:0!important;',
    '  font-weight:500!important;',
    '}'
  ].join('\n');
})();
