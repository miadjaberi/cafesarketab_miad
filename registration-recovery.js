/* Kafe Miad — registration recovery guard (server-first).
   Never replace the real registration/authentication handler with a local-only fake login.
   main.js supplies the Supabase-backed window.registerUser before this file loads. */
(function () {
  'use strict';
  if (typeof window.registerUser === 'function') {
    // Keep the existing server-backed registration flow intact.
    return;
  }
  // Fail closed: do not create a local user or bypass registration when the real handler is missing.
  window.registerUser = function registrationUnavailable() {
    var message = 'ثبت‌نام امن بارگذاری نشده است. اتصال اینترنت را بررسی و صفحه را دوباره بارگذاری کنید.';
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(message, 'error');
      } else {
        window.alert(message);
      }
    } catch (_) {}
  };
})();
