/** fix-four-bugs.js — ✕ → pageModals + terms gate + contrast */
(function () {
  'use strict';
  if (window.__KAFE_FOUR_BUGS_SAFE_V2__) return;
  window.__KAFE_FOUR_BUGS_SAFE_V2__ = true;

  function injectContrastCSS() {
    if (document.getElementById('kafe-four-bugs-css')) return;
    var css = document.createElement('style');
    css.id = 'kafe-four-bugs-css';
    css.textContent = '.modal-glass .result-value,#hamzadNumber{color:#F0D878!important;-webkit-text-fill-color:#F0D878!important}.modal-glass .result-description,#hamzadDescription{color:#F5F0E4!important}.user-notif-sheet-card,.user-notif-sheet-card *{color:#1a1a1a!important;-webkit-text-fill-color:#1a1a1a!important}.user-notif-sheet-card{background:#fffaf2!important}.admin-inbox-item{color:#F5F0E4!important}#kafeAdminPurchaseDetail,#kafeAdminPurchaseDetail *{color:#111!important;-webkit-text-fill-color:#111!important}#kafeAdminPurchaseDetail>div{background:#fff!important}#notification{color:#fff!important}';
    document.head.appendChild(css);
  }
  function sessionTermsOk(){try{return sessionStorage.getItem('kafeTermsSession')==='1'}catch(e){return false}}
  function setSessionTermsOk(){try{sessionStorage.setItem('kafeTermsSession','1')}catch(e){}try{localStorage.setItem('kafeTermsAccepted','1')}catch(e){}}
  function enforceTermsGate(){
    if(sessionTermsOk())return;
    try{if(document.querySelector('.modal-glass.active'))return;if(document.getElementById('menuDrawer')&&document.getElementById('menuDrawer').classList.contains('active'))return}catch(e){}
    try{
      var terms=document.getElementById('termsScreen'),splash=document.getElementById('splashScreen'),reg=document.getElementById('registerScreen'),app=document.getElementById('app');
      if(!terms)return;
      if(splash){splash.style.display='none';splash.classList.add('hidden','waiting')}
      if(reg){reg.style.display='none';reg.classList.add('hidden')}
      if(app){app.style.display='none';app.classList.add('hidden')}
      terms.classList.remove('hidden');terms.style.display='flex';
    }catch(e){}
  }
  /* ✕ → صفحه منوی مودال‌ها (#pageModals) — نه دراور */
  function openMainModalsMenu(){
    try{
      var overlay=document.getElementById('menuDrawerOverlay'),drawer=document.getElementById('menuDrawer');
      if(overlay)overlay.classList.remove('active');
      if(drawer)drawer.classList.remove('active');
      document.body.style.overflow='';
    }catch(e){}
    try{
      if(typeof window.renderModalsHomeGrid==='function')window.renderModalsHomeGrid();
      else if(typeof renderModalsHomeGrid==='function')renderModalsHomeGrid();
    }catch(e){}
    try{
      if(typeof window.scrollToPage==='function')window.scrollToPage(1);
      else {
        var menuPage=document.getElementById('pageModals');
        if(menuPage)menuPage.scrollIntoView({behavior:'smooth',inline:'start',block:'nearest'});
      }
      if(typeof updateSwipeDots==='function')updateSwipeDots(1);
      if(typeof updateBottomNav==='function')updateBottomNav(1);
    }catch(e){}
  }
  function patchCloseModalGlass(){
    var prev=window.closeModalGlass;
    if(typeof prev==='function'&&prev.__kafeSafeClose)return;
    function safeClose(modalId){
      try{var s=document.getElementById('kafeChannelSupport');if(s)s.remove()}catch(e){}
      try{
        if(typeof prev==='function')prev.apply(this,arguments);
        else{
          var m=document.getElementById(modalId);
          if(m)m.classList.remove('active');
          document.body.style.overflow='';
        }
      }catch(e){
        try{var m2=document.getElementById(modalId);if(m2)m2.classList.remove('active')}catch(x){}
      }
      setTimeout(openMainModalsMenu,100);
    }
    safeClose.__kafeSafeClose=true;
    window.closeModalGlass=safeClose;
  }
  function patchAcceptTerms(){
    var prev=window.acceptTermsAndContinue;if(typeof prev!=='function'||prev.__kafeSafeAccept)return;
    function safeAccept(){setSessionTermsOk();try{return prev.apply(this,arguments)}catch(e){console.warn(e)}}
    safeAccept.__kafeSafeAccept=true;window.acceptTermsAndContinue=safeAccept;
  }
  function applyAll(){
    injectContrastCSS();patchCloseModalGlass();patchAcceptTerms();
    if(!sessionTermsOk()&&!document.querySelector('.modal-glass.active'))enforceTermsGate();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(applyAll,0);setTimeout(applyAll,600)});
  else{applyAll();setTimeout(applyAll,600)}
  window.addEventListener('load',function(){setTimeout(applyAll,300)});
})();
