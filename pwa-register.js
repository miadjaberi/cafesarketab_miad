/* SW + Manifest + field pattern + brand + admin messages + ui-feedback (light) + admin-save */
(function () {
  'use strict';

  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }

  var oldFp = document.querySelector('link[href*="field-pattern.css"]');
  if (oldFp) oldFp.remove();
  var fp = document.createElement('link');
  fp.rel = 'stylesheet';
  fp.href = './field-pattern.css?v=22.22-fix';
  document.head.appendChild(fp);

  var oldSt = document.getElementById('kafeFieldPatternInline');
  if (oldSt) oldSt.remove();
  var st = document.createElement('style');
  st.id = 'kafeFieldPatternInline';
  st.textContent = [
    'html body input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]):not([type=hidden]):not([type=button]):not([type=submit]):not([type=reset]),',
    'html body textarea, html body select,',
    'html body .modal-glass-content input, html body .register-box input, html body #settingsPanel input,',
    'html body #adminPanel input, html body #adminPanel textarea, html body #registerScreen input,',
    'html body .input-group input, html body .hub-input, html body .register-input, html body .settings-field input {',
    '  background:linear-gradient(165deg,rgba(245,236,250,.97),rgba(232,244,242,.95)) !important;',
    '  background-color:#F0EAF4 !important; color:#1A1220 !important; -webkit-text-fill-color:#1A1220 !important;',
    '  border:1.5px solid rgba(110,70,130,.55) !important; border-radius:12px !important;',
    '  box-shadow:inset 0 1px 0 rgba(255,255,255,.65) !important;',
    '}',
    'html body input::placeholder, html body textarea::placeholder { color:#7A5F8A !important; -webkit-text-fill-color:#7A5F8A !important; }',
    'html body input:focus, html body textarea:focus, html body select:focus {',
    '  border-color:rgba(32,160,150,.85) !important; outline:none !important;',
    '  box-shadow:0 0 0 3px rgba(32,160,150,.22) !important;',
    '}'
  ].join('\n');
  document.head.appendChild(st);

  function addScript(src) {
    if (document.querySelector('script[src*="' + src.split('?')[0] + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    (document.body || document.head).appendChild(s);
  }

  function blockMessageRealtime() {
    var c = window.supabaseClient || window.v12Supabase;
    if (!c || !c.channel || c.__kafeMsgChannelPatched) return;
    var orig = c.channel.bind(c);
    c.channel = function (name) {
      if (name === 'v18-messages-live') {
        var d = { on: function () { return d; }, subscribe: function () { return d; }, unsubscribe: function () { return d; } };
        return d;
      }
      return orig.apply(c, arguments);
    };
    c.__kafeMsgChannelPatched = true;
    try {
      var chans = typeof c.getChannels === 'function' ? c.getChannels() : [];
      for (var i = 0; i < chans.length; i++) {
        if (String((chans[i] && chans[i].topic) || '').indexOf('v18-messages-live') !== -1) {
          try { c.removeChannel(chans[i]); } catch (e) {}
        }
      }
    } catch (e2) {}
  }
  blockMessageRealtime();
  setTimeout(blockMessageRealtime, 200);
  setTimeout(blockMessageRealtime, 1300);

  addScript('./brand-public-fix.js?v=fix2');
  addScript('./ui-feedback.js?v=fix2');
  addScript('./admin-messages-fix.js?v=fix2');
  addScript('./admin-save-feedback.js?v=fix2');

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function (reg) {
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }).catch(function () {});
    });
  }
})();
