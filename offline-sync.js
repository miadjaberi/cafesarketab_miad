/* Kafe Miad — online-only order policy.
   Offline orders are not queued or uploaded later. A purchase exists only after
   submitProductOrder confirms it was saved by Supabase.
   Legacy local-only drafts are preserved in browser storage, but are never
   presented as server-confirmed or automatically uploaded. */
(function () {
  'use strict';

  // Preservation rule: do not delete existing local records as part of hardening.
  // This file intentionally does not retry or upload offline drafts.
  console.log('Kafe Miad: offline order queue disabled; existing local records preserved; server confirmation required.');
})();
