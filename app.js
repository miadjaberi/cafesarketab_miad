/* Cafe Sarketab Miad — V22.9-RC1 single Supabase client bootstrap.
   The main index.html creates the only browser Supabase client.
   This file deliberately reuses it; it never creates a second GoTrue client. */
(function(){
  'use strict';
  function getClient(){ return window.supabaseClient || window.v12Supabase || null; }
  function byId(id){ return document.getElementById(id); }
  async function getUser(){
    var c=getClient();
    if(!c) return null;
    try{
      var r=await c.auth.getUser();
      window.__v18User=r.data&&r.data.user||null;
      return window.__v18User;
    }catch(e){ window.__v18User=null; return null; }
  }
  async function loadSettings(){
    var c=getClient(); if(!c)return;
    try{
      var r=await c.from('app_settings').select('key,value').eq('key','main').maybeSingle();
      if(r.error||!r.data)return;
      var s=r.data.value||{};
      if(byId('appTitle'))byId('appTitle').textContent=s.app_name||'کافه سرکتاب میعاد';
      if(byId('appTagline'))byId('appTagline').textContent=s.tagline||'';
      if(s.primary_color)document.documentElement.style.setProperty('--primary',s.primary_color);
      if(s.secondary_color)document.documentElement.style.setProperty('--secondary',s.secondary_color);
    }catch(e){console.warn('V18 settings',e);}
  }
  async function loadProducts(){
    var c=getClient(); if(!c)return;
    try{
      // اگر main.js همین الان محصولات را از سرور آورده، دوباره شلوغ نکن
      if (window.__productsCloudSynced && Array.isArray(window.products) && window.products.length) {
        var n0=byId('statProducts'); if(n0)n0.textContent=window.products.length;
        return;
      }
      var r=await c.from('products').select('*').eq('is_active',true).order('local_id',{ascending:true});
      if(r.error)return;
      window.__v18Products=r.data||[];
      var n=byId('statProducts'); if(n)n.textContent=window.__v18Products.length;
      if(typeof window.renderProducts==='function')window.renderProducts();
    }catch(e){console.warn('V18 products',e);}
  }
  async function init(){
    var c=getClient();
    if(!c){console.warn('V18: Supabase client not ready');return;}
    await Promise.all([getUser(),loadSettings(),loadProducts()]);
    if(!window.__v18LiveChannel && c.channel){
      window.__v18LiveChannel=c.channel('v18-core-live')
        .on('postgres_changes',{event:'*',schema:'public',table:'products'},loadProducts)
        .on('postgres_changes',{event:'*',schema:'public',table:'app_settings'},loadSettings)
        .subscribe();
    }
  }
  window.v18State={get client(){return getClient();},get user(){return window.__v18User||null;}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,0);});
  else setTimeout(init,0);
})();
