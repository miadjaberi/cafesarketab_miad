(async function () {
  try {
    const load = async (u) => (await fetch(u)).text();
    const a = await load('./app-a.js');
    const b = await load('./app-b.js');
    (0, eval)(a + b);
  } catch (e) {
    console.error(e);
    document.body.insertAdjacentHTML('beforeend', '<p style="color:#f1c765;padding:20px;text-align:center;direction:rtl">خطا در بارگذاری. صفحه را رفرش کنید.</p>');
  }
})();
