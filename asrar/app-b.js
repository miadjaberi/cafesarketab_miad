function show(p,a=0){
 cur=p;
 const pg=$('#pg');
 if(!pg)return;
 if(p==='home'){pg.style.display='none';setNav(0);const sc=$('.scroll');if(sc)sc.style.display='block';return;}
 const sc=$('.scroll');if(sc)sc.style.display='none';
 pg.style.display='block';
 if(p==='lib'){
  setNav(1);
  const cats=[...new Set(C.books.map(b=>b.cat).filter(Boolean))];
  pg.innerHTML=`<div class="ph"><button class="back" data-go="home">←</button><h3>فروشگاه</h3></div>
  <input class="in" id="sq" placeholder="جستجوی محصول" value="${esc(lq)}">
  <div class="chips"><button class="chip ${lc?'':'on'}" data-cat="">همه</button>${cats.map(c=>`<button class="chip ${lc===c?'on':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="grid">${C.books.filter(b=>(!lc||b.cat===lc)&&(!lq||(b.t+b.a+b.desc).includes(lq))).map((b,i)=>`<div class="gc" data-bk="${i}"><div class="cov" style="background:#1a1630;height:90px;display:grid;place-items:center;color:var(--gold);font-size:28px">✦</div><b>${esc(b.t)}</b><small>${esc(b.a)} · <span style="color:var(--gold)">${esc(b.price||'')}</span></small></div>`).join('')}</div>`;
 }
 else if(p==='book'){
  const b=C.books[a];if(!b)return show('lib');
  pg.innerHTML=`<div class="ph"><button class="back" data-go="lib">←</button><h3>جزئیات</h3></div>
  <div class="box"><h3>${esc(b.t)}</h3><p>${esc(b.a)} · ${esc(b.cat)}</p><p style="color:var(--gold);font-weight:700;margin:8px 0">${esc(b.price||'')}</p><p>${esc(b.desc)}</p><button class="btn" style="margin-top:12px;width:100%" data-go="cafe">درخواست خرید / ارتباط</button></div>`;
 }
 else if(p==='istk'){
  setNav(3);
  pg.innerHTML=`<div class="ph"><button class="back" data-go="home">←</button><h3>مودال‌ها / ابزارها</h3></div>`+C.modals.map(m=>`<div class="box"><h3>${esc(m.t)}</h3><p>${esc(m.s)}</p></div>`).join('');
 }
 else if(p==='cafe'){
  setNav(-1);
  pg.innerHTML=`<div class="ph"><button class="back" data-go="home">←</button><h3>اشتراک‌ها و ارتباط</h3></div>`+C.plans.map(pl=>`<div class="box"><b>${esc(pl.t)}</b><span class="pr">${esc(pl.price)}</span><p class="mm">${esc(pl.d||'')}</p></div>`).join('')+`<div class="box"><h3>تماس</h3><p>${esc(C.acts.phone)}</p><p>@${esc(C.brand.tg)}</p></div>`;
 }
 else if(p==='comm'){
  pg.innerHTML=`<div class="ph"><button class="back" data-go="home">←</button><h3>دعاها و اذکار</h3></div><div class="box"><p>به‌تدریج اضافه می‌شود.</p></div>`;
 }
 else if(p==='prof'){
  setNav(4);
  pg.innerHTML=`<div class="ph"><button class="back" data-go="home">←</button><h3>پروفایل</h3></div><div class="box"><p>@${esc(C.brand.tg)}</p><p>${esc(C.acts.phone)}</p></div>`;
 }
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-b],[data-c],[data-t],[data-n],[data-go],[data-bk],[data-cat],#wbtn,.back');
 if(!t)return;
 if(t.dataset.b!==undefined)go(bi+(+t.dataset.b));
 if(t.dataset.c!==undefined)cc(ci+(+t.dataset.c));
 if(t.dataset.t!==undefined)tt(ti+(+t.dataset.t));
 if(t.dataset.n!==undefined){const n=+t.dataset.n;if(n===0)show('home');else if(n===1)show('lib');else if(n===2)show('istk');else if(n===3)show('istk');else if(n===4)show('prof');}
 if(t.dataset.go)show(t.dataset.go);
 if(t.dataset.bk!==undefined)show('book',+t.dataset.bk);
 if(t.dataset.cat!==undefined){lc=t.dataset.cat;show('lib');}
 if(t.id==='wbtn'||t.closest('#wbtn')){const mo=$('#mo');if(mo){mo.style.display='none';mo.innerHTML='';}sessionStorage.setItem('asrar_welcomed','1');}
 if(t.classList.contains('back'))show(t.dataset.go||'home');
});
document.addEventListener('input',e=>{if(e.target&&e.target.id==='sq'){lq=e.target.value.trim();show('lib');}});
swipe($('#bn'),d=>go(bi+(d>0?-1:1)));
swipe($('#cv'),d=>cc(ci+(d>0?-1:1)));
(function loopCards(){setTimeout(()=>{cc(ci+1);loopCards();},((C.set||{}).cards||6)*1000);})();
document.addEventListener('touchmove',function(e){
 if(e.target.closest('.scroll, .pg, .banner, .cv, .track')) return;
 e.preventDefault();
},{passive:false});
render();setNav(0);
