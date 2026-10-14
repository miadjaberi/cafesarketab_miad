/* Kafe Miad — registration recovery guard.
   Keeps the registration screen from freezing on malformed local cache data.
   Does not grant admin rights or change Supabase permissions. */
(function () {
  'use strict';
  function normalizeDigits(value) {
    return String(value || '').replace(/[۰-۹]/g, function (d) {
      return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
    }).replace(/[٠-٩]/g, function (d) {
      return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    }).replace(/[\s\-()]/g, '');
  }
  function notify(message, type) {
    try {
      if (typeof window.showNotification === 'function') {
        window.showNotification(message, type || '');
        return;
      }
    } catch (_) {}
    try { window.alert(message); } catch (_) {}
  }
  function setVisible(id, visible, display) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = visible ? (display || 'flex') : 'none';
    el.classList.toggle('hidden', !visible);
    el.classList.toggle('waiting', false);
  }
  window.registerUser = function registerUserRecovery() {
    var nameEl = document.getElementById('regName');
    var phoneEl = document.getElementById('regPhone');
    var name = nameEl ? String(nameEl.value || '').trim() : '';
    var phone = normalizeDigits(phoneEl ? phoneEl.value : '');
    if (!name || !phone) {
      notify('لطفاً نام و شماره تماس را وارد کنید', 'error');
      return;
    }
    if (!/^09[0-9]{9}$/.test(phone)) {
      notify('شماره تماس معتبر نیست؛ شماره ۱۱ رقمی را با 09 وارد کنید.', 'error');
      return;
    }
    var user = { name: name, phone: phone, registeredAt: new Date().toISOString() };
    var saved = false;
    try {
      localStorage.setItem('cafeUser', JSON.stringify(user));
      saved = true;
    } catch (e) {
      try { sessionStorage.setItem('cafeUser', JSON.stringify(user)); } catch (_) {}
    }
    // A corrupted legacy list must not stop the app from opening.
    try {
      var raw = localStorage.getItem('cafeUsers') || '[]';
      var users;
      try { users = JSON.parse(raw); } catch (_) { users = []; }
      if (!Array.isArray(users)) users = [];
      if (!users.some(function (u) { return u && normalizeDigits(u.phone) === phone; })) {
        users.push(user);
      }
      try { localStorage.setItem('cafeUsers', JSON.stringify(users)); } catch (_) {}
    } catch (_) {}
    try { localStorage.setItem('kafeTermsAccepted', '1'); } catch (_) {}
    setVisible('termsScreen', false);
    setVisible('splashScreen', false);
    setVisible('registerScreen', false);
    setVisible('app', true, 'block');
    try {
      if (typeof window.updateUserDisplay === 'function') window.updateUserDisplay(user);
      else {
        var nameTarget = document.getElementById('userName');
        if (nameTarget) nameTarget.textContent = name;
      }
    } catch (e) {}
    notify(saved ? ('خوش آمدید ' + name) : ('برنامه باز شد، اما ذخیره‌سازی گوشی در دسترس نیست؛ لطفاً پس از ورود وضعیت را بررسی کنید.'));
  };
})();