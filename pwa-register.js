/* pwa-register.js — آنلاین؛ عمداً هیچ Service Worker ثبت یا فعال نمی‌کند.
 * manifest در index.html تعریف شده است. وابستگی‌های تاریخیِ ناموجود بارگذاری نمی‌شوند.
 */
(function () {
  'use strict';
  if (window.__KAFE_PWA_ONLINE_ONLY_V1__) return;
  window.__KAFE_PWA_ONLINE_ONLY_V1__ = true;
  // Manifest فقط برای فراداده نصب باقی می‌ماند؛ هیچ worker یا cache آفلاینی ساخته نمی‌شود.
  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }
})();
