/* Kafe Miad — single-flight guard for the Telegram admin login.
   Prevents double taps from opening parallel OTP flows or creating competing challenges.
   This wrapper does not grant access; the original server/session verification remains authoritative.
*/
(function () {
  'use strict';
  function install() {
    var original = window.toggleAdmin;
    if (typeof original !== 'function' || original.__kafeSingleFlightGuard) return;
    var running = false;
    async function guardedToggleAdmin() {
      if (running) {
        try {
          if (typeof window.showNotification === 'function') {
            window.showNotification('درخواست ورود مدیریت در حال بررسی است؛ لطفاً چند لحظه صبر کنید.', 'info');
          }
        } catch (_) {}
        return false;
      }
      running = true;
      try {
        return await original.apply(this, arguments);
      } finally {
        running = false;
      }
    }
    guardedToggleAdmin.__kafeSingleFlightGuard = true;
    guardedToggleAdmin.__kafeOriginalToggleAdmin = original;
    window.toggleAdmin = guardedToggleAdmin;
    console.info('Kafe Miad: admin login single-flight guard installed.');
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
