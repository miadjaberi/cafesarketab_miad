document.addEventListener('click',e=>{
 const t=e.target.closest('[data-b],[data-c],[data-t],[data-n],[data-go],#wbtn');
 if(!t)return;
 if(t.dataset.b!==undefined)go(bi-(+t.dataset.b));
 if(t.dataset.c!==undefined)cc(ci+(+t.dataset.c));
 if(t.dataset.t!==undefined)tt(ti+(+t.dataset.t));
 if(t.dataset.n!==undefined)setNav(+t.dataset.n);
 if(t.dataset.go){const g=t.dataset.go;if(g==='lib')setNav(1);else if(g==='cafe')setNav(3);else if(g==='istk')setNav(2);else if(g==='comm')setNav(3);else if(g==='home')setNav(0);}
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
