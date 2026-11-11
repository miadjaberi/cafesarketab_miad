(async function(){
  try{
    const n = 6;
    let code = '';
    for(let i=1;i<=n;i++){
      code += await (await fetch('./app-'+i+'.js')).text();
    }
    (0,eval)(code);
  }catch(e){
    console.error(e);
    document.body.insertAdjacentHTML('beforeend','<p style="color:#f1c765;padding:20px;text-align:center;direction:rtl">خطا در بارگذاری. صفحه را رفرش کنید.</p>');
  }
})();
