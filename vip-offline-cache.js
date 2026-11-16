/* vip-offline-cache.js — برای همیشه غیرفعال (online-only) */
(function () {
  'use strict';
  window.__KAFE_VIP_OFFLINE_DISABLED__ = true;
  window.readVipOfflineCache = function () { return null; };
  window.writeVipOfflineCache = function () {};
  window.applyVipOfflineCache = function () { return null; };
  window.clearVipOfflineCache = function () {};
})();
