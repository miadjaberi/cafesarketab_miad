/* loaded from clean package - bootstrap replaced */
console.log('asrar loading...');
fetch('app-full.js').then(r=>r.text()).then(code=>{(0,eval)(code);}).catch(e=>{console.error(e);document.body.insertAdjacentHTML('beforeend','<p style="color:#f1c765;padding:20px;text-align:center">خطا در بارگذاری. صفحه را رفرش کنید.</p>');});
