/* Kafe Miad — online-only order policy.
   Offline orders are not queued or uploaded later. A purchase exists only after
   submitProductOrder confirms it was saved by Supabase. Legacy local-only
   pendingUpload drafts are discarded because they were never server-confirmed. */
(function () {
  'use strict';
  try {
    var raw = localStorage.getItem('cafeOrders') || '[]';
    var list = JSON.parse(raw);
    if (Array.isArray(list)) {
      var confirmedOnly = list.filter(function (order) {
        return !order || order.pendingUpload !== true;
      });
      if (confirmedOnly.length !== list.length) {
        localStorage.setItem('cafeOrders', JSON.stringify(confirmedOnly.slice(0, 200)));
      }
    }
  } catch (e) {}

  // Intentionally do not wrap submitProductOrder and do not retry offline drafts.
  // The main order flow must show failure when the server cannot confirm the write.
  console.log('Kafe Miad: offline order queue disabled; server confirmation required.');
})();
