/* Compatibility shim.
   Live dashboard, unified request center, user decision alerts and modal-lock synchronization
   are handled by ops-center.js to avoid duplicate polling and duplicate notifications. */
(function(){
  'use strict';
  window.kafeOpsAlertsLegacyDisabled = true;
})();