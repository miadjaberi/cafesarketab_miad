const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&','<':'<','>':'>','"':'"',"'":'&#39;'}[c]));
const HAS=typeof claude!=='undefined';let U=null,C=null,db=null,ART='',bi=0,ci=1,ti=0,bt,cur='home',lq='',lc='',curArg=0;
const LG=`<svg id="lg" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6c1 4 3 6 6 7-3 1-5 3-6 7-1-4-3-6-6-7 3-1 5-3 6-7zM6 22c5-1 10 0 14 4 4-4 9-5 14-4v10c-5-1-10 0-14 3-4-3-9-4-14-3z"/><path d="M20 26v10"/></svg>`;
const im=u=>/^(\/_blob\/[0-9a-f]+|data:image\/)/.test(u||'')?u:'';
const GR=['#1a1630','#1a1630','#1a1630','#1a1630','#1a1630'];
const D={brand:{name:'اسرار ازل',sub:'سرکتاب • رمل • مکاشفه',logo:'',tg:'khatmjaberi'},
banners:[{t:'اسرار ازل\nپرده رازها',p:'در این سرا، سرکتاب و رمل و مکاشفه با هم جمع‌اند. با نیت پاک قدم بگذار.',b:'ورود',img:'',go:'lib'},{t:'اشتراک ویژه،\nدسترسی کامل',p:'با اشتراک، به ابزارها و محتوای ویژه دسترسی داشته باشید.',b:'مشاهده اشتراک‌ها',img:'',go:'cafe'},{t:'ابزارهای\nتخصصی',p:'ابجد، رمل، دلیل الحیران، همزاد و اسماء الحسنی در اختیار شماست.',b:'مشاهده ابزارها',img:'',go:'istk'},{t:'دعاها و اذکار\nویژه',p:'دعاها و اذکار منتخب را بخوانید و در آرامش همراهشان باشید.',b:'مشاهده دعاها',img:'',go:'comm'}],
quick:[{t:'فروشگاه',s:'دسته‌بندی و جستجو',pg:'lib'},{t:'اشتراک‌ها و پیام‌ها',s:'ارتباط با مدیریت',pg:'cafe'},{t:'مودال‌ها',s:'ابزارهای تخصصی',pg:'istk'},{t:'دعاها و اذکار ویژه',s:'منتخب برای شما',pg:'comm'}],
secT:'پیشنهادهای ویژه',all:'مشاهده همه',
books:[{t:'پدرخوانده',a:'ماریو پوزو',cat:'رمان',rate:4.7,desc:'حماسه‌ای از قدرت، خانواده و وفاداری.',img:''},{t:'ملت عشق',a:'الیف شافاک',cat:'رمان',rate:4.8,desc:'روایتی دو لایه از دیدار شمس و مولانا.',img:''},{t:'شازده کوچولو',a:'آنتوان دو سنت اگزوپری',cat:'داستان',rate:4.9,desc:'قصه‌ای ساده و عمیق درباره دوستی.',img:''},{t:'کیمیاگر',a:'پائولو کوئیلو',cat:'داستان',rate:4.5,desc:'سفر چوپانی جوان برای یافتن افسانه شخصی‌اش.',img:''},{t:'سیدارتا',a:'هرمان هسه',cat:'فلسفه',rate:4.4,desc:'جست‌وجوی معنا و آرامش در مسیر خودشناسی.',img:''}],
acts:{title:'اعمال امروز',dateT:'تاریخ امروز',hOff:'0',zekrT:'ذکر روز و اعمال آن',recT:'پیشنهادات استاد و مدیریت',recB:'پیشنهادهای استاد و مدیریت را از پنل مدیریت وارد کنید.',contT:'ارتباط با ما',contB:'برای ارتباط با ما از راه‌های زیر اقدام کنید.',phone:'09392979200',chT:'مشخصات کانال',tg:'khatmjaberi',site:'dbamag.ir',ig:'khatmjaberi'},
zekrs:[{day:'شنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'ترجمه ذکر',am:'اعمال این روز'},{day:'یکشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'ترجمه ذکر',am:'اعمال این روز'},{day:'دوشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'ترجمه ذکر',am:'اعمال این روز'},{day:'سه‌شنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'ترجمه ذکر',am:'اعمال این روز'},{day:'چهارشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'ترجمه ذکر',am:'اعمال این روز'},{day:'پنجشنبه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'ترجمه ذکر',am:'اعمال این روز'},{day:'جمعه',z:'متن ذکر روز را از پنل مدیریت وارد کنید.',tr:'ترجمه ذکر',am:'اعمال این روز'}],
notes:[],foot:'اسرار ازل — سرکتاب، رمل و مکاشفه',
welcome:{on:'1',t:'بسم الله الرحمن الرحیم',b:'اسرار ازل را نه تو دانی و نه من\nوین حرف معما نه تو خوانی و نه من\nهست از پسِ پرده گفت‌وگوی من و تو\nچون پرده برافتد نه تو مانی و نه من\n\nنتایج ابزارها بر پایه روش‌های سنتی است و جایگزین توکل، مشورت با عالم دینی و پزشک نیست.\nبا نیت پاک و آرامش از برنامه استفاده کنید.',btn:'موافقم'},
ann:{on:'0',t:'اعلان ویژه',b:'',btn:'متوجه شدم'},set:{slide:5,cards:6,pin:'1234',logoPos:'l',logoSize:36},
modals:[{t:'ابجد و حروف',s:'ابزار تخصصی',b:''},{t:'رمل امام علی',s:'ابزار تخصصی',b:''},{t:'دلیل الحیران',s:'ابزار تخصصی',b:''},{t:'همزاد قرین',s:'ابزار تخصصی',b:''},{t:'اسماء الحسنی',s:'ابزار تخصصی',b:''}],
plans:[{t:'اشتراک یک‌ماهه',price:'۰ تومان',d:''},{t:'اشتراک سه‌ماهه',price:'۰ تومان',d:''},{t:'اشتراک یک‌ساله',price:'۰ تومان',d:''}],
duas:[]
};
C=structuredClone(D);
function swipe(el,fn){if(!el)return;let x0=0;el.addEventListener('touchstart',e=>{x0=e.changedTouches[0].clientX},{passive:true});el.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)fn(dx);},{passive:true});}
function go(k){const n=C.banners.length||1;bi=(k+n)%n;const tr=$('#tr');if(tr)tr.style.transform='translateX('+(-bi*100)+'%)';const dots=$('#dots');if(dots)[...dots.children].forEach((d,j)=>d.classList.toggle('on',j==bi));clearInterval(bt);bt=setInterval(()=>go(bi+1),((C.set||{}).slide||5)*1000);}
function cc(k){const n=C.books.length;if(!n)return;ci=(k+n)%n;const cv=$('#cv');if(!cv)return;[...cv.querySelectorAll('.bk')].forEach((e,j)=>{let o=j-ci;if(o>n/2)o-=n;if(o<-n/2)o+=n;const a=Math.abs(o);e.style.opacity=a>2?0:a==2?.45:a==1?.8:1;e.style.zIndex=10-a;e.style.pointerEvents=a>2?'none':'auto';e.style.transform='translateX('+(o*92)+'px) scale('+(1.08-a*.2)+') rotateY('+(-o*22)+'deg)'});}
function tt(k){const n=C.zekrs.length||1;ti=(k+n)%n;const z=C.zekrs[ti];const tp=$('#tp');if(tp&&z)tp.textContent=(z.z||'')+' — '+(z.am||'');}
function setNav(n){$$('nav button').forEach(b=>b.classList.toggle('on',+b.dataset.n===n));}
function render(){
 const bn1=$('#bn1'),bn2=$('#bn2');if(bn1)bn1.textContent=C.brand.name;if(bn2)bn2.textContent=C.brand.sub;
 const tr=$('#tr');if(tr){tr.innerHTML='';C.banners.forEach((b,i)=>{const d=document.createElement('div');d.className='slide s'+(i%4);d.innerHTML=`<div class="bt"><h2>${esc(b.t).replace(/\\n/g,'<br>')}</h2><p>${esc(b.p)}</p><button data-go="${esc(b.go||'')}">${esc(b.b)}</button></div>`;tr.appendChild(d);});}
 const dots=$('#dots');if(dots)dots.innerHTML=C.banners.map((_,i)=>`<i class="${i===bi?'on':''}"></i>`).join('');
 go(bi);
 const qk=$('#qk');if(qk)qk.innerHTML=C.quick.map((q,i)=>`<button class="q" data-go="${esc(q.pg)}"><div class="ic"><svg class="i"><use href="#${['book','cup','star','users'][i%4]}"/></svg></div><b>${esc(q.t)}</b><small>${esc(q.s)}</small></button>`).join('');
 const st=$('#st'),al=$('#al');if(st)st.textContent=C.secT;if(al)al.textContent=C.all;
 const cv=$('#cv');if(cv){cv.querySelectorAll('.bk').forEach(e=>e.remove());C.books.forEach((b,k)=>{const e=document.createElement('div');e.className='bk';if(im(b.img)){e.style.background=`url(${im(b.img)}) center/cover`;e.innerHTML='';}else{e.style.background='#1a1630';e.innerHTML=`<h4>${esc(b.t)}</h4><small>${esc(b.a)}</small>`;}e.onclick=()=>cc(k);cv.appendChild(e);});cc(ci);}
 const ttEl=$('#tt');if(ttEl)ttEl.textContent=C.acts.title;tt(ti);
 if(C.welcome&&C.welcome.on==='1'&&!sessionStorage.getItem('asrar_welcomed')){const wt=$('#wt'),wb=$('#wb'),wbtn=$('#wbtn'),wm=$('#wm');if(wt)wt.textContent=C.welcome.t;if(wb)wb.textContent=C.welcome.b;if(wbtn)wbtn.textContent=C.welcome.btn||'موافقم';if(wm)wm.classList.add('on');}
}
function libList(){return C.books.filter(b=>(!lc||(lc==='__mine'?false:b.cat===lc))&&(!lq||(b.t+b.a).includes(lq)));}
