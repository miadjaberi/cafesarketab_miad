function show(p,a=0){
 cur=p;curArg=a;
 $$('.pg').forEach(x=>x.classList.remove('on'));
 const scroll=$('.scroll');
 if(p==='home'){if(scroll)scroll.style.display='block';setNav(0);return;}
 if(scroll)scroll.style.display='none';
 if(p==='lib'){setNav(1);const el=$('#pg-lib');if(el){el.classList.add('on');el.innerHTML=`<div class="box"><h3>فروشگاه</h3><p>کتاب‌ها به‌تدریج از اپ اصلی منتقل می‌شوند.</p></div>`+C.books.map(b=>`<div class="box"><h3>${esc(b.t)}</h3><p>${esc(b.a)} — ${esc(b.cat)}</p></div>`).join('');}}
 if(p==='istk'){setNav(2);const el=$('#pg-istk');if(el){el.classList.add('on');el.innerHTML=`<div class="box"><h3>ابزارهای تخصصی</h3></div>`+C.modals.map(m=>`<div class="box"><h3>${esc(m.t)}</h3><p>${esc(m.s)}</p></div>`).join('');}}
 if(p==='cafe'){setNav(3);const el=$('#pg-cafe');if(el){el.classList.add('on');el.innerHTML=`<div class="box"><h3>اشتراک‌ها</h3></div>`+C.plans.map(pl=>`<div class="box"><h3>${esc(pl.t)}</h3><p>${esc(pl.price)}</p></div>`).join('');}}
 if(p==='comm'){const el=$('#pg-comm');if(el){el.classList.add('on');el.innerHTML=`<div class="box"><h3>دعاها و اذکار</h3><p>به‌تدریج اضافه می‌شود.</p></div>`;}}
 if(p==='prof'){setNav(4);const el=$('#pg-prof');if(el){el.classList.add('on');el.innerHTML=`<div class="box"><h3>پروفایل</h3><p>@${esc(C.brand.tg)}</p><p>${esc(C.acts.phone)}</p></div>`;}}
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-b],[data-c],[data-t],[data-n],[data-go],#wbtn');
 if(!t)return;
 if(t.dataset.b!==undefined)go(bi+(+t.dataset.b));
 if(t.dataset.c!==undefined)cc(ci+(+t.dataset.c));
 if(t.dataset.t!==undefined)tt(ti+(+t.dataset.t));
 if(t.dataset.n!==undefined){const n=+t.dataset.n;if(n===0)show('home');else if(n===1)show('lib');else if(n===2)show('istk');else if(n===3)show('cafe');else if(n===4)show('prof');}
 if(t.dataset.go){const g=t.dataset.go;if(['lib','cafe','istk','comm','home','prof'].includes(g))show(g);}
 if(t.id==='wbtn'){const wm=$('#wm');if(wm)wm.classList.remove('on');sessionStorage.setItem('asrar_welcomed','1');}
});
swipe($('#bn'),d=>go(bi+(d>0?-1:1)));
swipe($('#cv'),d=>cc(ci+(d>0?-1:1)));
swipe($('.today'),d=>tt(ti+(d>0?-1:1)));
(function loopCards(){setTimeout(()=>{cc(ci+1);loopCards();},((C.set||{}).cards||6)*1000);})();
document.addEventListener('touchmove',function(e){
 if(e.target.closest('.scroll, .pg, .banner, .cv, .track')) return;
 e.preventDefault();
},{passive:false});
render();setNav(0);
