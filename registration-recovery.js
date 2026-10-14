/* Kafe Miad — registration recovery + fixed server-backed registerUser
   Fixes: duplicate key value violates unique constraint "profiles_phone_unique"
   - Checks phone first
   - Handles returning users cleanly
   - Has isRegistering lock to prevent double-click race
   - Safe for both online and offline fallback
*/
(function () {
  'use strict';

  var isRegistering = false;

  window.registerUser = async function () {
    if (isRegistering) {
      if (typeof showNotification === 'function') {
        showNotification('لطفاً چند لحظه صبر کنید...', 'info');
      }
      return;
    }
    isRegistering = true;

    try {
      var nameEl = document.getElementById('regName');
      var phoneEl = document.getElementById('regPhone');
      var name = nameEl ? (nameEl.value || '').trim() : '';
      var phone = phoneEl ? (phoneEl.value || '').replace(/\s/g, '').trim() : '';

      if (!name || !phone) {
        if (typeof showNotification === 'function') showNotification('لطفاً نام و شماره تماس را وارد کنید', 'error');
        return;
      }
      if (!/^09[0-9]{9}$/.test(phone)) {
        if (typeof showNotification === 'function') showNotification('شماره تماس نامعتبر است', 'error');
        return;
      }

      var supabaseClient = window.supabaseClient || window.v12Supabase || null;
      if (!supabaseClient) {
        if (typeof showNotification === 'function') showNotification('❌ اتصال آنلاین در دسترس نیست', 'error');
        return;
      }

      // ۱. اطمینان از وجود سشن
      var sr = await supabaseClient.auth.getSession();
      var session = sr && sr.data && sr.data.session;

      if (!session || !session.user) {
        if (!supabaseClient.auth.signInAnonymously) {
          throw new Error('ورود کاربر در این پروژه فعال نیست.');
        }
        var ar = await supabaseClient.auth.signInAnonymously();
        if (ar.error || !ar.data || !ar.data.session) {
          throw (ar.error || new Error('ایجاد نشست کاربر ناموفق بود.'));
        }
        session = ar.data.session;
      }

      var user = session.user;
      var registeredAt = new Date().toISOString();

      // ۲. اول چک کن آیا این شماره قبلاً ثبت شده
      var existing = await supabaseClient
        .from('profiles')
        .select('id,name,phone,registered_at,role')
        .eq('phone', phone)
        .maybeSingle();

      if (existing.error) throw existing.error;

      var finalUserData;

      if (existing.data) {
        // کاربر برگشتی
        finalUserData = {
          name: existing.data.name || name,
          phone: existing.data.phone,
          registeredAt: existing.data.registered_at || registeredAt,
          user_id: existing.data.id,
          role: existing.data.role || 'user'
        };

        // اگر نام تغییر کرده، آپدیت کن
        if (existing.data.name !== name) {
          await supabaseClient
            .from('profiles')
            .update({ name: name })
            .eq('id', existing.data.id);
          finalUserData.name = name;
        }
      } else {
        // کاربر جدید
        var profilePayload = {
          id: user.id,
          name: name,
          phone: phone,
          registered_at: registeredAt
        };

        var pr = await supabaseClient
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' })
          .select()
          .single();

        if (pr.error) {
          // اگر به خاطر unique روی phone بود، دوباره جستجو کن (race condition)
          if (pr.error.code === '23505') {
            var retry = await supabaseClient
              .from('profiles')
              .select('id,name,phone,registered_at,role')
              .eq('phone', phone)
              .maybeSingle();

            if (retry.data) {
              finalUserData = {
                name: retry.data.name || name,
                phone: retry.data.phone,
                registeredAt: retry.data.registered_at || registeredAt,
                user_id: retry.data.id,
                role: retry.data.role || 'user'
              };
            } else {
              throw pr.error;
            }
          } else {
            throw pr.error;
          }
        } else {
          finalUserData = {
            name: name,
            phone: phone,
            registeredAt: registeredAt,
            user_id: user.id
          };
        }
      }

      // ۳. ذخیره و ورود
      try {
        localStorage.setItem('cafeUser', JSON.stringify(finalUserData));
      } catch (e) {}

      var rs = document.getElementById('registerScreen');
      var app = document.getElementById('app');
      if (rs) rs.style.display = 'none';
      if (app) {
        app.style.display = 'block';
        app.classList.remove('hidden');
      }

      if (typeof updateUserDisplay === 'function') {
        await updateUserDisplay(finalUserData);
      }

      if (typeof showNotification === 'function') {
        showNotification(
          existing.data
            ? '✅ خوش آمدید دوباره ' + finalUserData.name
            : '✅ ورود کاربر انجام شد و حساب روی سرور ثبت شد.'
        );
      }
    } catch (e) {
      console.error('user entry', e);
      if (typeof showNotification === 'function') {
        showNotification('❌ ورود کاربر انجام نشد: ' + (e.message || e), 'error');
      }
    } finally {
      isRegistering = false;
    }
  };

  console.log('✅ registration-recovery fixed (phone unique + lock) loaded');
})();
