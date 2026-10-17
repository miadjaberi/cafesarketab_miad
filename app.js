/* Cafe Sarketab Miad — V18 realtime compatibility bridge.
   main.js owns startup, profile validation and the initial product refresh.
   This file deliberately performs NO initial getUser/products/settings requests.
   It keeps only the legacy realtime refresh behavior for server-side changes.
*/
(function () {
  'use strict';

  function getClient() {
    return window.supabaseClient || window.v12Supabase || null;
  }
  function byId(id) { return document.getElementById(id); }

  window.v18State = {
    get client() { return getClient(); },
    get user() { return window.__v18User || null; }
  };

  function refreshSettingsFromServer() {
    var c = getClient();
    if (!c) return Promise.resolve();
    return c.from('app_settings').select('key,value').eq('key','main').maybeSingle()
      .then(function (r) {
        if (r.error || !r.data) return;
        var s = r.data.value || {};
        if (byId('appTitle')) byId('appTitle').textContent = s.app_name || 'کافه سرکتاب میعاد';
        if (byId('appTagline')) byId('appTagline').textContent = s.tagline || '';
        if (s.primary_color) document.documentElement.style.setProperty('--primary', s.primary_color);
        if (s.secondary_color) document.documentElement.style.setProperty('--secondary', s.secondary_color);
      })
      .catch(function (e) { console.warn('V18 realtime settings refresh', e); });
  }

  function refreshProductsFromServer() {
    var c = getClient();
    if (!c) return Promise.resolve();
    return c.from('products').select('*').eq('is_active', true).order('local_id', { ascending: true })
      .then(function (r) {
        if (r.error) {
          console.warn('V18 realtime products refresh', r.error);
          return;
        }
        window.__v18Products = Array.isArray(r.data) ? r.data : [];
        var n = byId('statProducts');
        if (n) n.textContent = String(window.__v18Products.length);
        if (typeof window.renderProducts === 'function') window.renderProducts();
      })
      .catch(function (e) { console.warn('V18 realtime products refresh', e); });
  }

  function installRealtimeOnly() {
    var c = getClient();
    if (!c || !c.channel || window.__v18LiveChannel) return;
    try {
      window.__v18LiveChannel = c.channel('v18-core-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, function () {
          refreshProductsFromServer();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, function () {
          refreshSettingsFromServer();
        })
        .subscribe();
    } catch (e) {
      window.__v18LiveChannel = null;
      console.warn('V18 realtime subscription unavailable:', e);
    }
  }

  function waitForClientAndSubscribe() {
    var tries = 0;
    function attempt() {
      if (getClient()) {
        installRealtimeOnly();
        return;
      }
      if (++tries >= 20) return;
      setTimeout(attempt, 100);
    }
    attempt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForClientAndSubscribe, { once: true });
  } else {
    waitForClientAndSubscribe();
  }
})();
