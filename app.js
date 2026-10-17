/* Cafe Sarketab Miad — V18 compatibility bridge.
   main.js owns startup, profile validation and the initial product refresh.
   Do not issue parallel getUser/products/settings requests here: they race bootGate
   and refreshOnlineData, producing extra network traffic and stale UI renders.
*/
(function () {
  'use strict';

  function getClient() {
    return window.supabaseClient || window.v12Supabase || null;
  }

  window.v18State = {
    get client() { return getClient(); },
    get user() { return window.__v18User || null; }
  };

  var client = getClient();
  if (!client || !client.auth || typeof client.auth.onAuthStateChange !== 'function') {
    // The main startup gate remains the sole authority if Supabase is not ready.
    return;
  }

  // Auth state events are local SDK notifications; this bridge does not perform
  // an extra getUser/getSession request or alter profile/admin permissions.
  try {
    client.auth.onAuthStateChange(function (_event, session) {
      window.__v18User = session && session.user ? session.user : null;
    });
  } catch (e) {
    console.warn('V18 auth bridge unavailable:', e);
  }
})();
