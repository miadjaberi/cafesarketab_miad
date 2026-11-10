(async function(){
  const load = async (u)=>{const r=await fetch(u);return r.text()};
  const a = await load('app-p1.js');
  const b = await load('app-p2.js');
  (0,eval)(a+b);
})();
