/* Kafe Miad — server-first operational center. Existing records only; no RLS changes. */
(function(){
'use strict';
var ch=null,busy=false,locksReady=false;
var SEEN='kafeAdminSeenRequests_v2',USER_SEEN='kafeUserSeenDecisions_v2';
function c(){return window.supabaseClient||null}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])})}
function fmt(v){try{return v?new Date(v).toLocaleString('fa-IR'):'—'}catch(e){return String(v||'—')}}
function map(k){try{var v=JSON.parse(localStorage.getItem(k)||'{}');return v&&typeof v==='object'?v:{}}catch(e){return{}}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function toast(m,t){if(typeof window.showNotification==='function')window.showNotification(m,t||'')}
async function user(){var x=c();if(!x||!x.auth)return null;try{var r=await x.auth.getSession();return r&&r.data&&r.data.session&&r.data.session.user||null}catch(e){return null}}
async function admin(){var x=c(),u=await user();if(!x||!u||u.is_anonymous)return false;try{var r=await x.from('profiles').select('role').eq('id',u.id).maybeSingle();return !!(r&&!r.error&&r.data&&r.data.role==='admin')}catch(e){return false}}
function decision(s){s=String(s||'').toLowerCase();if(!s||/pending|در انتظار|بررسی|جدید|تایید نشده/.test(s))return'';if(/reject|رد|نشد|لغو/.test(s))return'rejected';if(/approv|تایید|تأیید|فعال|موفق/.test(s))return'approved';return''}
function ensureUI(){
 var tabs=document.getElementById('adminTabs'),panel=document.getElementById('adminPanel');if(!tabs||!panel)return;
 if(!tabs.querySelector('[data-tab="requests"]')){var b=document.createElement('button');b.type='button';b.className='admin-tab';b.dataset.tab='requests';b.id='kafeRequestsTab';b.innerHTML='🔔 مرکز درخواست‌ها <span id="kafeRequestsBadge" style="display:none;background:#d32f2f;color:#fff;border-radius:12px;padding:1px 6px;font-size:11px">0</span>';b.onclick=function(){if(typeof window.switchAdminTab==='function')window.switchAdminTab('requests')};tabs.appendChild(b)}
 if(!document.getElementById('adminRequests')){var s=document.createElement('div');s.className='admin-content';s.id='adminRequests';s.innerHTML='<div class="admin-card"><h4>🔔 مرکز یکپارچه درخواست‌ها</h4><p style="line-height:1.8">اطلاعات واقعی سرور؛ درخواست‌های در انتظار بررسی در ابتدای فهرست هستند.</p><div id="kafeRequestSummary" style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"></div><div id="kafeRequestList" aria-live="polite">در حال خواندن اطلاعات سرور…</div><button id="kafeRefreshRequests" type="button" class="btn" style="margin-top:10px">🔄 تازه‌سازی از سرور</button></div>';var d=document.getElementById('adminDashboard');if(d&&d.parentNode)d.parentNode.insertBefore(s,d.nextSibling);else panel.appendChild(s);s.querySelector('#kafeRefreshRequests').onclick=function(){refresh(true)}}
 if(!document.getElementById('adminLiveUsersList')){var d=document.getElementById('adminDashboard');if(d){var u=document.createElement('div');u.className='admin-card';u.innerHTML='<h4>👥 کاربران ثبت‌شده از سرور</h4><div id="adminLiveUsersList" style="font-size:.82rem;line-height:1.9"></div>';d.appendChild(u)}}
}
function badge(n){var b=document.getElementById('kafeRequestsBadge');if(b){b.textContent=String(n);b.style.display=n?'inline-block':'none'}var n2=document.getElementById('notifBadge');if(n2){n2.textContent=String(n);n2.style.display=n?'inline-flex':'none'}}
function tag(t,color){return '<span style="display:inline-block;border-radius:999px;padding:3px 9px;background:'+color+';color:#fff;font-size:.76rem;font-weight:800">'+esc(t)+'</span>'}
function render(orders,subs,messages){
 var box=document.getElementById('kafeRequestList'),sum=document.getElementById('kafeRequestSummary');if(!box)return;
 var all=[];
 orders.forEach(function(r){all.push({kind:'order',id:r.id,uid:r.user_id,name:r.name||r.customer_name,phone:r.phone||r.customer_phone,title:r.productName||'خرید محصول',status:r.status||r.payment_status||'جدید',date:r.created_at||r.date})});
 subs.forEach(function(r){all.push({kind:'sub',id:r.id,uid:r.user_id,name:r.name,phone:r.phone,title:r.plan||'اشتراک',status:r.status||'pending',date:r.created_at})});
 (messages||[]).forEach(function(r){all.push({kind:'message',id:r.id,uid:r.user_id,name:r.user||r.name,phone:r.phone,title:r.subject||r.text||r.body||'پیام جدید',status:'پیام خوانده‌نشده',date:r.created_at})});
 all.sort(function(a,b){return (Number(!!decision(a.status))-Number(!!decision(b.status)))||String(b.date||'').localeCompare(String(a.date||''))});
 var pend=all.filter(function(r){return !decision(r.status)}).length;badge(pend);
 if(sum)sum.innerHTML=tag('کل: '+all.length,'#34495e')+' '+tag('در انتظار: '+pend,pend?'#c62828':'#2e7d32')+' '+tag('خرید: '+orders.length,'#1565c0')+' '+tag('اشتراک: '+subs.length,'#6a1b9a')+' '+tag('پیام خوانده‌نشده: '+(messages||[]).length,(messages||[]).length?'#c62828':'#2e7d32');
 if(!all.length){box.innerHTML='<p style="padding:12px">در حال حاضر درخواست خرید، اشتراک یا پیام خوانده‌نشده‌ای در سرور نیست.</p>';return}
 box.innerHTML=all.map(function(r){var sub=r.kind==='sub',msg=r.kind==='message',d=decision(r.status),color=d==='approved'?'#2e7d32':d==='rejected'?'#c62828':msg?'#1565c0':'#b7791f';var label=msg?'💬 پیام جدید':sub?'⭐ اشتراک':'🛒 خرید';var tab=msg?'messages':sub?'subscriptions':'products';var tabName=msg?'پیام‌ها':sub?'اشتراک‌ها':'سفارش‌ها';return '<article style="border:1px solid '+color+';border-right:4px solid '+color+';border-radius:12px;padding:12px;margin:10px 0;overflow-wrap:anywhere;background:rgba(255,255,255,.04)"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b>'+label+' · '+esc(r.title)+'</b>'+tag(r.status,color)+'</div><div style="margin-top:7px;line-height:1.9;font-size:.83rem">شناسه: <b dir="ltr">'+esc(r.id)+'</b><br>شناسه کاربر: <b dir="ltr">'+esc(r.uid||'ثبت نشده')+'</b><br>نام: '+esc(r.name||'—')+' · تلفن: <b dir="ltr">'+esc(r.phone||'—')+'</b><br>زمان: '+esc(fmt(r.date))+'</div><button type="button" class="btn" data-kafe-jump="'+tab+'" style="margin-top:8px;padding:8px 12px;font-size:.82rem">رفتن به بخش '+tabName+'</button></article>'}).join('');
 box.querySelectorAll('[data-kafe-jump]').forEach(function(b){b.onclick=function(){if(typeof window.switchAdminTab==='function')window.switchAdminTab(b.dataset.kafeJump)}});
}
async function refresh(force){
 var x=c();if(!x||busy||!(await admin()))return;busy=true;
 try{
 ensureUI();
 var rr=await Promise.all([
 x.from('profiles').select('id,name,phone,role,registered_at').order('registered_at',{ascending:false}).limit(500),
 x.from('orders').select('id,user_id,name,phone,customer_name,customer_phone,productName,status,payment_status,created_at,date').order('created_at',{ascending:false}).limit(300),
 x.from('subscription_requests').select('id,user_id,name,phone,plan,status,created_at').order('created_at',{ascending:false}).limit(300),
 x.from('subscriptions').select('id,user_id,name,phone,plan,status,created_at,active').order('created_at',{ascending:false}).limit(300),
 x.from('messages').select('id,user_id,user,name,phone,subject,body,text,created_at,read,is_from_admin,conversation_id').eq('read',false).eq('is_from_admin',false).order('created_at',{ascending:false}).limit(100)
 ]);
 var profiles=rr[0].error?[]:(rr[0].data||[]),orders=rr[1].error?[]:(rr[1].data||[]),subs=rr[2].error?[]:(rr[2].data||[]),active=rr[3].error?[]:(rr[3].data||[]),messages=rr[4].error?[]:(rr[4].data||[]);
 var total=document.getElementById('adminTotalUsers');if(total)total.textContent=String(profiles.length);
 var st=document.getElementById('adminTotalSubscriptions');if(st)st.textContent=String(active.length);
 var ub=document.getElementById('adminLiveUsersList');if(ub)ub.innerHTML=profiles.length?profiles.slice(0,200).map(function(u){return '<div style="padding:7px 0;border-bottom:1px solid rgba(201,168,76,.22);overflow-wrap:anywhere"><b>'+esc(u.name||'بدون نام')+'</b> · <span dir="ltr">'+esc(u.phone||'—')+'</span>'+(u.role==='admin'?' · 👑 مدیریت':'')+'<br><small>شناسه: <span dir="ltr">'+esc(u.id)+'</span> · ثبت: '+esc(fmt(u.registered_at))+'</small></div>'}).join(''):'<p style="color:#ffb4ab">فهرست کاربران از سرور خوانده نشد.'+(rr[0].error?' علت: '+esc(rr[0].error.message):'')+'</p>';
 render(orders,subs,messages);
 var pending=[];orders.forEach(function(r){if(!decision(r.status||r.payment_status))pending.push({k:'o:'+r.id,t:'خرید '+(r.productName||'محصول')+' از '+(r.name||r.customer_name||r.phone||'کاربر')})});subs.forEach(function(r){if(!decision(r.status))pending.push({k:'s:'+r.id,t:'اشتراک '+(r.plan||'')+' از '+(r.name||r.phone||'کاربر')})});messages.forEach(function(r){pending.push({k:'m:'+r.id,t:'پیام جدید از '+(r.user||r.name||r.phone||'کاربر')})});
 var seen=map(SEEN),fresh=[];
 if(!localStorage.getItem(SEEN+'_ready')){pending.forEach(function(r){seen[r.k]=1});save(SEEN,seen);try{localStorage.setItem(SEEN+'_ready','1')}catch(e){}}
 else {pending.forEach(function(r){if(!seen[r.k]){fresh.push(r.t);seen[r.k]=Date.now()}});save(SEEN,seen);if(fresh.length){toast('🔔 درخواست تازه: '+fresh[0]+(fresh.length>1?' و '+(fresh.length-1)+' مورد دیگر':''));try{var u=await user();if(u)await x.from('notifications').insert([{user_id:u.id,user_name:'مدیریت',user_phone:'',message:'درخواست جدید: '+fresh.slice(0,5).join('؛ '),type:'admin_request',read:false,action_url:'#adminRequests'}])}catch(e){console.warn('notification persistence skipped',e)}}}
 if(force)toast('✅ اطلاعات مرکز درخواست‌ها از سرور تازه شد.')
 }catch(e){console.warn('Kafe operational center',e)}finally{busy=false}
}
async function userUpdates(){
 var x=c(),u=await user();if(!x||!u)return;
 try{var profile=await x.from('profiles').select('id').eq('id',u.id).maybeSingle();if(profile.error||!profile.data)return}catch(e){return}
 var rr=await Promise.all([x.from('orders').select('id,status,payment_status,productName').eq('user_id',u.id).order('created_at',{ascending:false}).limit(40),x.from('subscription_requests').select('id,status,plan').eq('user_id',u.id).order('created_at',{ascending:false}).limit(40)]);
 var rows=[];if(!rr[0].error)(rr[0].data||[]).forEach(function(r){rows.push({id:'o:'+r.id,kind:'خرید',title:r.productName||'محصول',status:r.status||r.payment_status})});if(!rr[1].error)(rr[1].data||[]).forEach(function(r){rows.push({id:'s:'+r.id,kind:'اشتراک',title:r.plan||'اشتراک',status:r.status})});
 var seen=map(USER_SEEN);if(!localStorage.getItem(USER_SEEN+'_ready')){rows.forEach(function(r){var d=decision(r.status);if(d)seen[r.id+':'+d]=1});save(USER_SEEN,seen);try{localStorage.setItem(USER_SEEN+'_ready','1')}catch(e){}return}
 var hit=null;rows.some(function(r){var d=decision(r.status);if(d&&!seen[r.id+':'+d]){hit={r:r,d:d};return true}return false});if(!hit)return;seen[hit.r.id+':'+hit.d]=Date.now();save(USER_SEEN,seen);toast((hit.d==='approved'?'✅ ':'🔴 ')+hit.r.kind+' «'+hit.r.title+'» '+(hit.d==='approved'?'تأیید شد.':'رد شد.'))
}
async function tick(){if(await admin())await refresh(false);else await userUpdates()}
async function loadLocks(){
 if(locksReady)return;var x=c();if(!x)return;
 try{var r=await x.from('app_settings').select('value').eq('key','admin:cafeVipLocks').maybeSingle();if(!r.error&&r.data&&r.data.value&&typeof r.data.value==='object'){localStorage.setItem('cafeVipLocks',JSON.stringify(r.data.value));if(typeof window.renderAdminModals==='function')window.renderAdminModals();if(typeof window.renderVipLockAdmin==='function')window.renderVipLockAdmin();if(typeof window.renderModalsHomeGrid==='function')window.renderModalsHomeGrid()}locksReady=true}catch(e){console.warn('Server lock settings unavailable',e)}
}
function installLockWrappers(){
 if(typeof window.__kafeOpenModalDirect==='function'&&!window.__kafeOpenModalDirect.__serverLockWrapped){var old=window.__kafeOpenModalDirect;var w=async function(id){await loadLocks();return old.apply(this,arguments)};w.__serverLockWrapped=true;window.__kafeOpenModalDirect=w}
 if(typeof window.setVipLock==='function'&&!window.setVipLock.__serverSaveWrapped){var oldSet=window.setVipLock;var wSet=function(id,on){var ret=oldSet.apply(this,arguments);(async function(){var x=c();if(!x||!(await admin())){toast('⚠️ قفل محلی تغییر کرد، اما نشست مدیریت برای ذخیره سرور معتبر نیست.','error');return}try{var locks=map('cafeVipLocks'),ok=typeof window.cloudSaveAdminSetting==='function'&&await window.cloudSaveAdminSetting('cafeVipLocks',locks);if(!ok)toast('⚠️ ذخیره قفل روی سرور ناموفق بود.','error');else toast('✅ قفل روی سرور ذخیره شد.')}catch(e){toast('❌ ذخیره قفل روی سرور ناموفق بود.','error')}})();return ret};wSet.__serverSaveWrapped=true;window.setVipLock=wSet}
}
function realtime(){var x=c();if(!x||!x.channel||ch)return;try{ch=x.channel('kafe-ops-center').on('postgres_changes',{event:'*',schema:'public',table:'orders'},tick).on('postgres_changes',{event:'*',schema:'public',table:'subscription_requests'},tick).on('postgres_changes',{event:'*',schema:'public',table:'profiles'},tick).on('postgres_changes',{event:'*',schema:'public',table:'subscriptions'},tick).on('postgres_changes',{event:'*',schema:'public',table:'messages'},tick).subscribe()}catch(e){console.warn('Realtime not ready; periodic refresh remains.',e)}}
function boot(){
 ensureUI();installLockWrappers();loadLocks().then(installLockWrappers);realtime();setTimeout(tick,2200);setInterval(tick,10000);
 var sw=window.switchAdminTab;if(typeof sw==='function'&&!sw.__opsCenterWrapped){var wrap=function(tab){var r=sw.apply(this,arguments);if(tab==='requests')admin().then(function(ok){if(!ok){if(typeof window.closeAdmin==='function')window.closeAdmin();toast('ورود امن مدیریت لازم است.','error')}else refresh(false)});return r};wrap.__opsCenterWrapped=true;window.switchAdminTab=wrap}
 var oa=window.openAdmin;if(typeof oa==='function'&&!oa.__opsCenterWrapped){var ow=function(){var r=oa.apply(this,arguments);Promise.resolve(r).then(function(){setTimeout(tick,350)});return r};ow.__opsCenterWrapped=true;window.openAdmin=ow}
 document.addEventListener('visibilitychange',function(){if(!document.hidden)tick()});
 // The earlier alert helper announces all historical pending requests on first run; suppress only that obsolete toast.
 var oldToast=window.showNotification;if(typeof oldToast==='function'&&!oldToast.__opsToastWrapped){var st=function(msg,type){if(/^🔔 درخواست جدید:/.test(String(msg||'')))return;return oldToast.apply(this,arguments)};st.__opsToastWrapped=true;window.showNotification=st}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.kafeRefreshOperationalCenter=refresh;
})();