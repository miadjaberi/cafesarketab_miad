const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]));
const im=u=>/^(\/_blob\/[0-9a-f]+|data:image\/)/.test(u||'')?u:'';
const GR=['#1a1630','#1a1630','#1a1630','#1a1630','#1a1630'];
const D={brand:{name:'اسرار ازل',sub:'سرکتاب • رمل • مکاشفه',logo:'',tg:'khatmjaberi'},
banners:[{t:'اسرار ازل\nپرده رازها',p:'در این سرا، سرکتاب و رمل و مکاشفه با هم جمع‌اند. با نیت پاک قدم بگذار.',b:'ورود',img:'',go:'lib'},{t:'فروشگاه\nمحصولات ویژه',p:'کتاب‌ها، دوره‌ها و خدمات تخصصی را از فروشگاه تهیه کنید.',b:'مشاهده فروشگاه',img:'',go:'lib'},{t:'ابزارهای\nتخصصی',p:'ابجد، رمل، همزاد، اسماء الحسنی و دیگر ابزارها.',b:'مشاهده ابزارها',img:'',go:'istk'},{t:'دعاها و اذکار\nویژه',p:'دعاها و اذکار منتخب را بخوانید.',b:'مشاهده',img:'',go:'comm'}],
quick:[{t:'فروشگاه',s:'محصولات و خدمات',pg:'lib'},{t:'اشتراک‌ها',s:'ارتباط با مدیریت',pg:'cafe'},{t:'مودال‌ها',s:'ابزارهای تخصصی',pg:'istk'},{t:'دعاها',s:'منتخب برای شما',pg:'comm'}],
secT:'محصولات و پیشنهادها',all:'مشاهده همه',
books:[
{t:'کتاب جفر و ابجد',a:'آموزشی',cat:'کتاب',rate:4.8,desc:'آموزش کامل حروف ابجد، جفر و استخراج احکام عملی برای اهل فن.',img:'',price:'۱۵۰٬۰۰۰ تومان',badge:'جدید'},
{t:'دوره آموزشی رمل',a:'دوره',cat:'دوره',rate:4.9,desc:'دوره جامع رمل امام علی علیه‌السلام همراه با مثال‌های کاربردی.',img:'',price:'۳۵۰٬۰۰۰ تومان',badge:'محبوب'},
{t:'تفسیر خواب حرفه‌ای',a:'آموزشی',cat:'کتاب',rate:4.6,desc:'روش‌های تخصصی تعبیر خواب بر پایه روایات و تجربه عملی.',img:'',price:'۲۰۰٬۰۰۰ تومان',badge:''},
{t:'کتاب اسماء الحسنی',a:'آموزشی',cat:'کتاب',rate:4.7,desc:'شرح و خواص اسماء الحسنی برای ذکر، ختم و کارگشایی.',img:'',price:'۱۲۰٬۰۰۰ تومان',badge:''},
{t:'دوره مکاشفه موکلین',a:'دوره',cat:'دوره',rate:4.9,desc:'آموزش مکاشفه و ارتباط صحیح با موکلین با رعایت آداب شرعی.',img:'',price:'۴۵۰٬۰۰۰ تومان',badge:'ویژه'},
{t:'مشاوره تخصصی',a:'خدمت',cat:'مشاوره',rate:4.8,desc:'جلسه مشاوره خصوصی با استاد برای مسائل شخصی و معنوی.',img:'',price:'۳۰۰٬۰۰۰ تومان',badge:''},
{t:'طلسم و وفق کامل',a:'خدمت',cat:'خدمت',rate:4.7,desc:'تهیه طلسم و وفق بر اساس نام و حاجت متقاضی.',img:'',price:'۵۰۰٬۰۰۰ تومان',badge:'ویژه'},
{t:'استخراج موکل شخصی',a:'خدمت',cat:'خدمت',rate:4.6,desc:'استخراج نام موکل و دستورالعمل ذکر و عمل مربوطه.',img:'',price:'۲۸۰٬۰۰۰ تومان',badge:''},
{t:'پکیج طالع‌بینی سالانه',a:'خدمت',cat:'طالع',rate:4.5,desc:'تحلیل طالع و ستاره سال بر اساس نام و تاریخ.',img:'',price:'۱۸۰٬۰۰۰ تومان',badge:''},
{t:'دوره همزاد و قرین',a:'دوره',cat:'دوره',rate:4.7,desc:'شناخت همزاد و قرین و روش‌های تعامل صحیح.',img:'',price:'۳۲۰٬۰۰۰ تومان',badge:''},
{t:'کتاب رمل پیشرفته',a:'آموزشی',cat:'کتاب',rate:4.6,desc:'مباحث پیشرفته خانه‌های رمل و احکام ترکیبی.',img:'',price:'۲۲۰٬۰۰۰ تومان',badge:'جدید'},
{t:'ذکر و ختم اختصاصی',a:'خدمت',cat:'خدمت',rate:4.5,desc:'برنامه ذکر و ختم متناسب با حاجت شما.',img:'',price:'۱۵۰٬۰۰۰ تومان',badge:''},
{t:'تحلیل ازدواج',a:'خدمت',cat:'ازدواج',rate:4.8,desc:'بررسی عاقبت و سازگاری ازدواج از طریق روش‌های سنتی.',img:'',price:'۲۵۰٬۰۰۰ تومان',badge:''},
{t:'رفع مشکلات معنوی',a:'خدمت',cat:'خدمت',rate:4.7,desc:'بررسی و راهنمایی برای رفع موانع و مشکلات معنوی.',img:'',price:'۴۰۰٬۰۰۰ تومان',badge:''}
],
acts:{title:'اعمال امروز',dateT:'تاریخ امروز',hOff:'0',zekrT:'ذکر روز و اعمال آن',recT:'پیشنهادات استاد و مدیریت',recB:'پیشنهادهای استاد و مدیریت را از پنل مدیریت وارد کنید.',contT:'ارتباط با ما',contB:'برای ارتباط با ما از راه‌های زیر اقدام کنید.',phone:'09392979200',chT:'مشخصات کانال',tg:'khatmjaberi',site:'dbamag.ir',ig:'khatmjaberi'},
zekrs:[{day:'شنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'',am:'اعمال این روز'},{day:'یکشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'',am:'اعمال این روز'},{day:'دوشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'',am:'اعمال این روز'},{day:'سه‌شنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'',am:'اعمال این روز'},{day:'چهارشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'',am:'اعمال این روز'},{day:'پنجشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'',am:'اعمال این روز'},{day:'جمعه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'',am:'اعمال این روز'}],
notes:[],foot:'اسرار ازل — سرکتاب، رمل و مکاشفه',
welcome:{on:'1',t:'بسم الله الرحمن الرحیم',b:'اسرار ازل را نه تو دانی و نه من\nوین حرف معما نه تو خوانی و نه من\nهست از پسِ پرده گفت‌وگوی من و تو\nچون پرده برافتد نه تو مانی و نه من\n\nنتایج ابزارها بر پایه روش‌های سنتی است و جایگزین توکل، مشورت با عالم دینی و پزشک نیست.\nبا نیت پاک و آرامش از برنامه استفاده کنید.',btn:'موافقم'},
ann:{on:'0',t:'اعلان ویژه',b:'',btn:'متوجه شدم'},set:{slide:5,cards:6,pin:'1234',logoPos:'l',logoSize:36},
modals:[{t:'ابجد و حروف',s:'ابزار تخصصی',b:''},{t:'رمل امام علی',s:'ابزار تخصصی',b:''},{t:'دلیل الحیران',s:'ابزار تخصصی',b:''},{t:'همزاد قرین',s:'ابزار تخصصی',b:''},{t:'اسماء الحسنی',s:'ابزار تخصصی',b:''}],
plans:[{t:'اشتراک یک‌ماهه',price:'۰ تومان',d:''},{t:'اشتراک سه‌ماهه',price:'۰ تومان',d:''},{t:'اشتراک یک‌ساله',price:'۰ تومان',d:''}],
duas:[]
};
let C=structuredClone(D),bi=0,ci=0,ti=0,bt=null,cur='home',lq='',lc='',mine=[];
function swipe(el,fn){if(!el)return;let x0=0;el.addEventListener('touchstart',e=>{x0=e.changedTouches[0].clientX},{passive:true});el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)fn(dx);},{passive:true});}
function go(k){const n=C.banners.length||1;bi=(k+n)%n;const tr=$('#tr');if(tr)tr.style.transform='translateX('+(-bi*100)+'%)';const dots=$('#dots');if(dots)[...dots.children].forEach((d,j)=>d.classList.toggle('on',j==bi));clearInterval(bt);bt=setInterval(()=>go(bi+1),((C.set||{}).slide||5)*1000);}
function cc(k){const n=C.books.length;if(!n)return;ci=(k+n)%n;const cv=$('#cv');if(!cv)return;[...cv.querySelectorAll('.bk')].forEach((e,j)=>{let o=j-ci;if(o>n/2)o-=n;if(o<-n/2)o+=n;const a=Math.abs(o);e.style.opacity=a>2?0:a==2?.45:a==1?.8:1;e.style.zIndex=10-a;e.style.pointerEvents=a>2?'none':'auto';e.style.transform='translateX('+(o*92)+'px) scale('+(1.08-a*.2)+') rotateY('+(-o*22)+'deg)'});}
function tt(k){const n=C.zekrs.length||1;ti=(k+n)%n;const z=C.zekrs[ti];const tp=$('#tp')||$('#tx');if(tp&&z)tp.innerHTML=`<h5>${esc(C.acts.title)} — ${esc(z.day)}</h5><p>${esc(z.z)}</p><small>${esc(z.am||'')}</small>`;}
function setNav(n){$$('nav button').forEach((b,i)=>{const dn=b.dataset.n!==undefined?+b.dataset.n:i;b.classList.toggle('on',dn===n);});}
function render(){
 const bn1=$('#bn1'),bn2=$('#bn2');if(bn1)bn1.textContent=C.brand.name;if(bn2)bn2.textContent=C.brand.sub;
 const tr=$('#tr');if(tr){tr.innerHTML='';C.banners.forEach((b,i)=>{const d=document.createElement('div');d.className='slide s'+(i%4);d.innerHTML=`<div class="bt"><h2>${esc(b.t).replace(/\\n/g,'<br>')}</h2><p>${esc(b.p)}</p><button data-go="${esc(b.go||'')}">${esc(b.b)}</button></div>`;tr.appendChild(d);});}
 const dots=$('#dots');if(dots)dots.innerHTML=C.banners.map((_,i)=>`<i class="${i===bi?'on':''}"></i>`).join('');
 go(bi);
 const qk=$('#qk');if(qk)qk.innerHTML=C.quick.map((q,i)=>`<button class="q" data-go="${esc(q.pg)}"><div class="ic"><svg class="i"><use href="#${['book','cup','star','users'][i%4]}"/></svg></div><b>${esc(q.t)}</b><small>${esc(q.s)}</small></button>`).join('');
 const st=$('#st'),al=$('#al');if(st)st.textContent=C.secT;if(al)al.textContent=C.all;
 const cv=$('#cv');if(cv){cv.querySelectorAll('.bk').forEach(e=>e.remove());C.books.forEach((b,k)=>{const e=document.createElement('div');e.className='bk';e.style.background='#1a1630';e.innerHTML=`<h4>${esc(b.t)}</h4><small>${esc(b.price||b.a)}</small>`;e.onclick=()=>cc(k);cv.appendChild(e);});cc(ci);}
 tt(ti);
 if(C.welcome&&C.welcome.on==='1'&&!sessionStorage.getItem('asrar_welcomed')){const wt=$('#wt'),wb=$('#wb'),wbtn=$('#wbtn'),wm=$('#wm')||$('#mo');if(wm){if(!wm.querySelector('.mc')&&!wm.querySelector('.mbox')){wm.innerHTML=`<div class="mbox" style="background:#13102a;border:1.5px solid var(--gold2);border-radius:20px;padding:22px;max-width:340px;width:100%;direction:rtl;text-align:center"><h3 id="wt" style="color:var(--gold)">${esc(C.welcome.t)}</h3><p id="wb" style="white-space:pre-line;line-height:1.9">${esc(C.welcome.b)}</p><button id="wbtn" class="btn" style="width:100%;margin-top:10px">${esc(C.welcome.btn||'موافقم')}</button></div>`;wm.style.display='flex';wm.style.position='fixed';wm.style.inset='0';wm.style.zIndex='100';wm.style.alignItems='center';wm.style.justifyContent='center';wm.style.background='#000c';}}}
}
