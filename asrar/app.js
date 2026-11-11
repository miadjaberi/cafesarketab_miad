(async function(){
  try{
    const a = await (await fetch('./app-1.js')).text();
    const b = await (await fetch('./app-b.js')).text();
    (0,eval)(a+b);
  }catch(e){
    console.error(e);
    document.body.insertAdjacentHTML('beforeend','<p style="color:#f1c765;padding:20px;text-align:center;direction:rtl">خطا در بارگذاری. صفحه را رفرش کنید.</p>');
  }
})();
