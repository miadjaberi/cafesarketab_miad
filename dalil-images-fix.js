/**
 * dalil-images-fix.js
 * شاخه: fix/dalil-images-v3
 * هدف: انتقال تصاویر «دلیل الحیران» از localStorage به Supabase Storage
 * این فایل بعد از main.js لود می‌شود و توابع قبلی را override می‌کند.
 * هیچ تغییری در main.js ایجاد نمی‌کند.
 */
(function () {
  'use strict';

  function getDalilImages() {
    try {
      var s = JSON.parse(localStorage.getItem('cafeDalilImages') || '{}');
      return s && typeof s === 'object' ? s : {};
    } catch (e) {
      return {};
    }
  }

  function saveDalilImagesLocal(all) {
    try {
      localStorage.setItem('cafeDalilImages', JSON.stringify(all || {}));
    } catch (e) {
      if (typeof showNotification === 'function') {
        showNotification('حافظه گوشی برای تصویر کافی نیست', 'error');
      }
    }
  }

  function dalilImageKey(type, gender, rank) {
    if (type === 'child') return 'child_' + rank;
    return (gender === 'female' ? 'female_' : 'male_') + rank;
  }

  async function uploadDalilImageDataUrl(dataUrl, type, rank, slot) {
    if (!dataUrl || dataUrl.indexOf('data:image/') !== 0) return null;
    if (!window.supabaseClient) {
      console.warn('[dalil-fix] uploadDalilImage: no supabaseClient');
      return null;
    }
    try {
      var a = dataUrl.split(',');
      var mime = (a[0].match(/data:([^;]+);base64/) || [, 'image/jpeg'])[1];
      var bin = atob(a[1]);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var blob = new Blob([bytes], { type: mime });
      var ext = (mime.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '') || 'jpg';
      var safeType = String(type || 'male').replace(/[^a-z0-9_]/gi, '');
      var path = 'dalil-images/' + safeType + '_r' + rank + '_s' + slot + '_' + Date.now() + '.' + ext;
      var up = await supabaseClient.storage
        .from('public-assets')
        .upload(path, blob, { upsert: true, contentType: mime });
      if (up.error) throw up.error;
      var pub = supabaseClient.storage.from('public-assets').getPublicUrl(path);
      var url = pub.data && pub.data.publicUrl ? pub.data.publicUrl : null;
      if (!url) throw new Error('publicUrl empty');
      return url;
    } catch (e) {
      console.warn('[dalil-fix] uploadDalilImage', e);
      return null;
    }
  }

  async function syncDalilImagesToCloud(all) {
    try {
      if (typeof cloudSaveAdminSetting === 'function') {
        await cloudSaveAdminSetting('cafeDalilImages', all);
        return true;
      }
      if (window.supabaseClient) {
        var ur = await supabaseClient.from('app_settings').upsert(
          [
            {
              key: 'admin:cafeDalilImages',
              value: all,
              updated_at: new Date().toISOString()
            }
          ],
          { onConflict: 'key' }
        );
        return !ur.error;
      }
    } catch (e) {
      console.warn('[dalil-fix] syncDalilImagesToCloud', e);
    }
    return false;
  }

  async function loadDalilImagesFromCloud() {
    try {
      var cloud = null;
      if (typeof cloudLoadAdminSetting === 'function') {
        cloud = await cloudLoadAdminSetting('cafeDalilImages');
      } else if (window.supabaseClient) {
        var r = await supabaseClient
          .from('app_settings')
          .select('value')
          .eq('key', 'admin:cafeDalilImages')
          .maybeSingle();
        if (!r.error && r.data) cloud = r.data.value;
      }
      if (cloud && typeof cloud === 'object') {
        saveDalilImagesLocal(cloud);
        return cloud;
      }
    } catch (e) {
      console.warn('[dalil-fix] loadDalilImagesFromCloud', e);
    }
    return getDalilImages();
  }

  function showDalilRankImages(rank, type, gender) {
    type = type || (typeof selectedType !== 'undefined' ? selectedType : 'adult');
    gender = gender || (typeof selectedGender !== 'undefined' ? selectedGender : 'male');
    var key = dalilImageKey(type, gender, rank);
    var all = getDalilImages();
    var d = all[key] || {};
    var box = document.getElementById('dalilRankImagesBox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'dalilRankImagesBox';
      box.style.cssText =
        'display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:12px 0;';
      var res = document.getElementById('hayranResult');
      if (res && res.parentNode) {
        res.parentNode.insertBefore(box, res.nextSibling);
      } else {
        return;
      }
    }
    box.innerHTML = '';
    [d.img1, d.img2].forEach(function (src) {
      if (!src) return;
      var im = document.createElement('img');
      im.src = src;
      im.alt = 'مرتبه ' + rank;
      im.style.cssText =
        'width:48%;max-width:190px;max-height:180px;border-radius:12px;border:2px solid #c9a84c;object-fit:cover;';
      im.loading = 'lazy';
      box.appendChild(im);
    });
    if (!box.children.length) {
      box.innerHTML =
        '<div style="width:100%;text-align:center;color:#777;font-size:.8rem;">برای این مرتبه هنوز تصویری ثبت نشده است.</div>';
    }
  }

  function renderDalilImagesAdmin() {
    var box = document.getElementById('dalilImagesAdmin');
    if (!box) return;
    var all = getDalilImages();
    var html = '';
    [
      ['male', 'آقایان', 'مرد'],
      ['female', 'خانم‌ها', 'زن'],
      ['child', 'اطفال', 'کودک']
    ].forEach(function (group) {
      html +=
        '<div style="margin:14px 0 8px;padding:10px;border-radius:10px;background:#f5efe5;font-weight:800;color:#0A3545;">' +
        group[1] +
        ' — ۹ مرتبه</div>';
      for (var r = 1; r <= 9; r++) {
        var key = dalilImageKey(
          group[0],
          group[0] === 'child' ? 'male' : group[0],
          r
        );
        var d = all[key] || {};
        html +=
          '<div class="admin-card" style="margin-bottom:8px;padding:10px;"><strong style="color:#0A3545;">' +
          group[1] +
          ' — مرتبه ' +
          r +
          ' — دو تصویر</strong>' +
          '<div style="font-size:.72rem;color:#666;margin:4px 0;">تصویر ۱ ' +
          (d.img1 ? '✅' : '❌') +
          ' | تصویر ۲ ' +
          (d.img2 ? '✅' : '❌') +
          '</div>' +
          (d.img1
            ? '<img src="' +
              d.img1 +
              '" style="max-width:80px;max-height:60px;border-radius:6px;margin:4px 4px 4px 0;object-fit:cover;border:1px solid #c9a84c;">'
            : '') +
          (d.img2
            ? '<img src="' +
              d.img2 +
              '" style="max-width:80px;max-height:60px;border-radius:6px;margin:4px 0;object-fit:cover;border:1px solid #c9a84c;">'
            : '') +
          '<input type="file" accept="image/*" data-dalil-type="' +
          group[0] +
          '" data-rank="' +
          r +
          '" data-slot="1" class="dalil-img-file" style="width:100%;margin:4px 0;">' +
          '<input type="file" accept="image/*" data-dalil-type="' +
          group[0] +
          '" data-rank="' +
          r +
          '" data-slot="2" class="dalil-img-file" style="width:100%;margin:4px 0;"></div>';
      }
    });
    box.innerHTML = html;
  }

  // Override global functions that main.js defined
  window.getDalilImages = getDalilImages;
  window.dalilImageKey = dalilImageKey;
  window.showDalilRankImages = showDalilRankImages;
  window.renderDalilImagesAdmin = renderDalilImagesAdmin;

  // Listener for file inputs
  document.addEventListener(
    'change',
    function (ev) {
      var t = ev.target;
      if (!t || !t.classList || !t.classList.contains('dalil-img-file')) return;
      var rank = t.getAttribute('data-rank');
      var slot = t.getAttribute('data-slot');
      var type = t.getAttribute('data-dalil-type');
      var file = t.files && t.files[0];
      if (!file) return;
      if (file.size > 2.5 * 1024 * 1024) {
        if (typeof showNotification === 'function') {
          showNotification('حداکثر ۲.۵ مگابایت', 'error');
        }
        return;
      }
      if (typeof showNotification === 'function') {
        showNotification('⏳ در حال آپلود تصویر به سرور...');
      }
      var reader = new FileReader();
      reader.onload = async function () {
        var dataUrl = reader.result;
        var cloudUrl = await uploadDalilImageDataUrl(dataUrl, type, rank, slot);
        var finalUrl =
          cloudUrl && String(cloudUrl).indexOf('http') === 0 ? cloudUrl : dataUrl;
        var all = getDalilImages();
        var key = dalilImageKey(
          type,
          type === 'female' ? 'female' : 'male',
          rank
        );
        var cur = all[key] || { img1: '', img2: '' };
        if (slot === '1') cur.img1 = finalUrl;
        else cur.img2 = finalUrl;
        all[key] = cur;
        saveDalilImagesLocal(all);
        syncDalilImagesToCloud(all).then(function (ok) {
          if (typeof showNotification === 'function') {
            if (cloudUrl) {
              showNotification(
                '✅ تصویر روی سرور ذخیره شد' + (ok ? ' و همگام شد' : '')
              );
            } else {
              showNotification(
                '⚠️ آپلود به Storage ناموفق — فقط روی این دستگاه ذخیره شد',
                'error'
              );
            }
          }
        });
        renderDalilImagesAdmin();
      };
      reader.readAsDataURL(file);
    },
    true
  );

  // Load from cloud after a short delay
  setTimeout(function () {
    loadDalilImagesFromCloud().then(function () {
      try {
        if (typeof renderDalilImagesAdmin === 'function') {
          renderDalilImagesAdmin();
        }
      } catch (e) {}
    });
  }, 2000);

  console.log('[dalil-images-fix] loaded — تصاویر دلیل الحیران حالا به Supabase Storage متصل هستند');
})();
