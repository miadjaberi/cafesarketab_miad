/* سفارش آنلاین اگر اینترنت جهانی قطع باشد روی گوشی می‌ماند و با برگشت نت ارسال می‌شود. */
(function () {
  'use strict';
  function orders() {
    try { var a = JSON.parse(localStorage.getItem('cafeOrders') || '[]'); return Array.isArray(a) ? a : []; }
    catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem('cafeOrders', JSON.stringify(list.slice(0, 200))); } catch (e) {}
  }
  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function draft() {
    var p = window._currentProduct;
    return {
      id: Date.now(),
      productId: p ? p.id : null,
      product: val('orderProductName') || (p && p.title) || '',
      price: p ? p.price : 0,
      name: val('orderName'),
      motherName: val('orderMotherName'),
      nationalId: val('orderNationalId'),
      phone: val('orderPhone'),
      address: val('orderAddress'),
      postalCode: val('orderPostalCode'),
      receiverName: val('orderReceiverName'),
      receiverPhone: val('orderReceiverPhone'),
      receiverAddress: val('orderReceiverAddress'),
      note: val('orderNote'),
      type: 'online',
      status: 'روی گوشی ماند — با تماس تأیید می‌شود و با برگشت اینترنت ارسال می‌شود',
      date: new Date().toLocaleString('fa-IR'),
      pendingUpload: true,
      hasReceipt: !!window._orderReceiptData
    };
  }
  var orig = window.submitProductOrder;
  if (typeof orig === 'function') {
    window.submitProductOrder = async function () {
      var snapshot = draft();
      var receipt = window._orderReceiptData || '';
      var before = orders();
      var beforeId = before[0] ? String(before[0].id) : '';
      try { await orig.apply(this, arguments); }
      catch (e) { console.warn('order submit', e); }
      var after = orders();
      var sent = after[0] && String(after[0].id) !== beforeId;
      if (sent || !snapshot.name || !snapshot.phone) return;
      if (receipt && receipt.length < 1500000) snapshot.receiptData = receipt;
      after.unshift(snapshot);
      save(after);
      if (typeof hideOnlineOrderForm === 'function') hideOnlineOrderForm();
      if (typeof closeProductDetail === 'function') { try { closeProductDetail(); } catch (e) {} }
      if (typeof showNotification === 'function') {
        showNotification('سفارش روی همین گوشی ذخیره شد. برای تأیید با مدیریت تماس بگیرید. با برگشت اینترنت خودش ارسال می‌شود.');
      }
    };
  }
  var flushing = false;
  async function flush() {
    if (flushing || (navigator.onLine === false)) return;
    var c = window.supabaseClient;
    if (!c || !c.auth) return;
    flushing = true;
    try {
      var ses = await c.auth.getSession();
      var session = ses && ses.data && ses.data.session;
      if (!session || !session.user) return;
      var list = orders();
      var changed = false;
      for (var i = 0; i < list.length; i++) {
        var o = list[i];
        if (!o || !o.pendingUpload) continue;
        var receiptPath = '';
        if (o.receiptData) {
          var m = String(o.receiptData).match(/^data:([^;]+);base64,(.+)$/);
          if (m) {
            var bin = atob(m[2]);
            var bytes = new Uint8Array(bin.length);
            for (var j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
            var blob = new Blob([bytes], { type: m[1] || 'image/jpeg' });
            var ext = (m[1] || '').indexOf('png') >= 0 ? 'png' : 'jpg';
            var path = session.user.id + '/' + String(o.id).replace(/[^a-zA-Z0-9_-]/g, '') + '.' + ext;
            var up = await c.storage.from('receipts').upload(path, blob, { upsert: true, contentType: m[1] || 'image/jpeg' });
            if (!up.error) receiptPath = (up.data && up.data.path) || path;
          }
        }
        var row = {
          local_id: o.id,
          user_id: session.user.id,
          name: o.name,
          phone: o.phone,
          customer_name: o.name,
          customer_phone: o.phone,
          shipping_address: o.address || '',
          notes: o.note || '',
          productName: o.product,
          productPrice: o.price,
          details: JSON.stringify({
            motherName: o.motherName, nationalId: o.nationalId, address: o.address,
            postalCode: o.postalCode, receiverName: o.receiverName, receiverPhone: o.receiverPhone,
            receiverAddress: o.receiverAddress, note: o.note, hasReceipt: !!receiptPath, offline: true
          }),
          receipt_path: receiptPath || null,
          has_receipt: !!receiptPath,
          status: 'در انتظار تایید فیش',
          date: o.date,
          type: 'online'
        };
        var ins = await c.from('orders').insert([row]).select();
        if (!ins.error) {
          o.pendingUpload = false;
          o.status = 'ارسال شد — در انتظار تأیید فیش';
          o.receiptData = '';
          changed = true;
          if (typeof showNotification === 'function') showNotification('سفارش ذخیره‌شده به سرور ارسال شد');
        }
      }
      if (changed) save(list);
    } catch (e) {
      console.warn('offline flush', e);
    } finally {
      flushing = false;
    }
  }
  window.addEventListener('online', function () { setTimeout(flush, 700); });
  setInterval(flush, 20000);
  setTimeout(flush, 3500);
})();
