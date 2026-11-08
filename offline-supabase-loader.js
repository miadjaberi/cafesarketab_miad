/** offline-supabase-loader.js — local SDK first, CDN only if missing */
(function () {
  'use strict';
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    window.__kafeSupabaseSdkSource = 'local-or-prior';
    return;
  }
  function load(src, label) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = function () {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
          window.__kafeSupabaseSdkSource = label;
          resolve(true);
        } else reject(new Error('no createClient after ' + label));
      };
      s.onerror = function () { reject(new Error('fail ' + label)); };
      (document.head || document.documentElement).appendChild(s);
    });
  }
  window.__kafeEnsureSupabaseSdk = function () {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      return Promise.resolve(true);
    }
    return load('./vendor/supabase-js.min.js', 'local-vendor')
      .catch(function () {
        return load('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.1/dist/umd/supabase.js', 'cdn');
      })
      .catch(function () {
        window.__kafeSupabaseSdkSource = 'missing';
        return false;
      });
  };
  window.__kafeEnsureSupabaseSdk();
})();
