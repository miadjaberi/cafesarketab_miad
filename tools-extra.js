/* tools-extra.js — V21 ابزارهای کاربردی (ایمن) */
(function(){
  'use strict';

  var HAFEZ = [{"n": 1, "t": "الا یا ایها الساقی ادر کاسا و ناولها", "b": "که عشق آسان نمود اول ولی افتاد مشکل‌ها\nبه بوی نافه‌ای کاخر صبا زان طره بگشاید\nز تاب جعد مشکینش چه خون افتاد در دل‌ها", "i": "نتیجه فال: راهی که شروع کرده‌ای آسان به نظر می‌رسید اما سختی‌هایی در پیش است. ناامید نشو؛ با صبر و توکل گشایش می‌آید. توصیه: عجله نکن و از اهل دل مشورت بگیر."}, {"n": 2, "t": "اگر آن ترک شیرازی به دست آرد دل ما را", "b": "به خال هندویش بخشم سمرقند و بخارا را\nبده ساقی می باقی که در جنت نخواهی یافت\nکنار آب رکن‌آباد و گلگشت مصلا را", "i": "نتیجه فال: خواسته‌ات ارزشمند است و ممکن است به قیمت فداکاری به‌دست آید. آنچه نزدیک توست غنیمت بدان. توصیه: به داشته‌های فعلی‌ات بیشتر توجه کن."}, {"n": 3, "t": "صبا به لطف بگو آن غزال رعنا را", "b": "که سر به کوه و بیابان تو داده‌ای ما را\nشکر فروش که عمرش دراز باد چرا\nتفقدی نکند طوطی شکرخا را", "i": "نتیجه فال: کسی یا موقعیتی از تو دور شده؛ با لطف و پیام نرم می‌توان نزدیک شد. توصیه: اولین قدم آشتی یا پیگیری محترمانه از سوی تو باشد."}, {"n": 4, "t": "دل می‌رود ز دستم صاحب دلان خدا را", "b": "دردا که راز پنهان خواهد شد آشکارا\nکشتی شکستگانیم ای باد شرطه برخیز\nباشد که باز بینیم دیدار آشنا را", "i": "نتیجه فال: دل‌نگرانی‌ات برحق است؛ چیزی پنهان به‌زودی روشن می‌شود. امید به دیدار یا خبر خوش هست. توصیه: راز خود را فعلاً نگه دار و دعا کن."}, {"n": 5, "t": "به مژگان سیه کردی هزاران رخنه در دینم", "b": "بیا کز چشم بیمارت هزاران درد برچینم\nفدای جان تو گر دم زنم از درجه عشقت\nکه پیوسته است از این غم در دلم خونین مژگانم", "i": "نتیجه فال: وابستگی عاطفی شدید است و آرامشت را گرفته. اگر نیت خیر باشد، بهبود می‌آید. توصیه: تعادل بین دل و عقل را حفظ کن."}, {"n": 6, "t": "روزه یکسو شد و عید آمد و دل‌ها برخاست", "b": "می ز خمخانه به جوش آمد و می باید خواست\nنوبه نو می‌رسد از راه و طرف باز کنید\nکه در این عهد ز خوبان خبری می‌آید راست", "i": "نتیجه فال: دوره سختی رو به پایان است و خبر خوش در راه است. زمان اقدام و شادی معقول است. توصیه: در را به روی فرصت‌های جدید باز کن."}, {"n": 7, "t": "یوسف گم‌گشته بازآید به کنعان غم مخور", "b": "کلبه احزان شود روزی گلستان غم مخور\nای دل غمدیده حالت به شود دل بد مکن\nوین سر شوریده بازآید به سامان غم مخور", "i": "نتیجه فال: غم مخور — گشایش و بازگشت مطلوب نزدیک است. وضعیت بهتر می‌شود. توصیه: امید را از دست نده و کار نیک را ادامه بده."}, {"n": 8, "t": "سینه مالامال درد است ای دریغا مرهمی", "b": "دل ز تنهایی به جان آمد خدا را همدمی\nدیده‌اش دم می‌زند گر بشنود زخمی سخن\nجان فدا سازد اگر بیند دلی را محرمی", "i": "نتیجه فال: نیاز به همدم و مرهم داری؛ دردتنهایی‌ات دیده می‌شود. توصیه: با فرد امین درد دل کن و از تنهایی طولانی بپرهیز."}, {"n": 9, "t": "در ازل پرتو حسنت ز تجلی دم زد", "b": "عشق پیدا شد و آتش به همه عالم زد\nدیده می‌خواست که بیند رخ جانان خود\nاز غم و درد به خود سوخت و دامن تر زد", "i": "نتیجه فال: نیتت بزرگ و پرحرارت است؛ راه بی‌رنج نیست. توصیه: نیت را پاک نگه دار و از شتاب در نتیجه بپرهیز."}, {"n": 10, "t": "گفتم غم تو دارم گفتا غمت سرآید", "b": "گفتم که ماه من شو گفتا اگر برآید\nگفتم ز مهرورزان رسم وفا بیاموز\nگفتا ز خوبرویان این کار کمتر آید", "i": "نتیجه فال: غم فعلی گذراست؛ اما شرط وفا را از هر کسی انتظار نداشته باش. توصیه: صبور باش و به عمل افراد نگاه کن نه فقط حرف."}, {"n": 11, "t": "ما را ز می منع می‌کردند و اکنون", "b": "خود توبه شکستند و پیمان شکستند\nزاهد ظاهرپرست از حال ما آگاه نیست\nدر حق ما هر چه گوید جای هیچ اکراه نیست", "i": "نتیجه فال: قضاوت دیگران مهم نیست؛ ظاهرپرستی دیگران به کار تو نمی‌آید. توصیه: راه درست خودت را برو و به حرف بی‌اساس بها نده."}, {"n": 12, "t": "باغ مرا چه حاجت سرو و صنوبر است", "b": "شمشاد خانه پرور ما از که کمتر است\nای گل تو دوش عرض جفا می‌نموده‌ای\nبا ما سخن بگو که سخن‌ها برابر است", "i": "نتیجه فال: آنچه داری کم نیست؛ مقایسه با دیگران آرامشت را می‌گیرد. توصیه: قدر داشته‌ها را بدان و گفتگوی روراست را انتخاب کن."}, {"n": 13, "t": "بیا تا گل برافشانیم و می در ساغر اندازیم", "b": "فلک را سقف بشکافیم و طرحی نو دراندازیم\nاگر غم لشکر انگیزد که خون عاشقان ریزد\nمن و ساقی به هم تازیم و بنیادش براندازیم", "i": "نتیجه فال: زمان تغییر و طرح نو است؛ می‌توانی بر غم چیره شوی. توصیه: با اراده و همراهی افراد مثبت، برنامه تازه‌ای بریز."}, {"n": 14, "t": "زلف‌آشفته و خوی‌کرده و خندان‌لب و مست", "b": "پیرهن‌چاک و غزل‌خوان و صراحی در دست\nنرگسش عربده‌جوی و لبش افسوس‌کنان\nنیم‌شب دوش به بالین من آمد بنشست", "i": "نتیجه فال: خبر یا رویدادی غیرمنتظره و پرهیجان در راه است. توصیه: هوشیار باش؛ هر جلوه زیبایی لزوماً پایدار نیست."}, {"n": 15, "t": "حال دل با تو گفتنم هوس است", "b": "خبر دل شنفتنم هوس است\nطمع خام بین که قصه فاش\nاز رقیبان نهفتنم هوس است", "i": "نتیجه فال: دل می‌خواهد حرف بزند اما فعلاً رازداری بهتر است. توصیه: تا زمان مناسب، نیت و راز را پیش هر کسی فاش نکن."}];
  var FALNAMEH = [{"t": "گشایش", "b": "نیت تو رو به خیر است.", "i": "نتیجه: مثبت. با توکل جلو برو. توصیه: صدقه بده و عجله نکن."}, {"t": "صبر", "b": "زمان هنوز کامل نرسیده است.", "i": "نتیجه: فعلاً دست نگه دار. توصیه: صبر کن؛ شتاب زیان دارد."}, {"t": "هشدار", "b": "در این کار نشانه‌های احتیاط هست.", "i": "نتیجه: مراقب باش. توصیه: از معامله عجولانه و دوست ناباب دوری کن."}, {"t": "رزق", "b": "روزی از جایی نزدیک می‌شود.", "i": "نتیجه: امید به گشایش مالی. توصیه: کار و ذکر را رها نکن."}, {"t": "محبت", "b": "دل‌ها اگر صدق باشد نرم می‌شود.", "i": "نتیجه: رابطه قابل بهبود است. توصیه: با کلام نرم آغاز کن."}, {"t": "سفر", "b": "حرکت و جابه‌جایی به سود توست.", "i": "نتیجه: سفر یا تغییر مکان مفید است. توصیه: نیت را پاک کن و برو."}, {"t": "شفا", "b": "بهبود در راه است.", "i": "نتیجه: رو به خیر. توصیه: پرهیز و دعا را ادامه بده."}, {"t": "کار", "b": "شروع کار با حساب‌وکتاب خوب است.", "i": "نتیجه: مناسب برای اقدام. توصیه: شریک امین و برنامه روشن داشته باش."}, {"t": "ازدواج", "b": "اگر پایه دین و اخلاق باشد مبارک است.", "i": "نتیجه: مشروط به مثبت. توصیه: عجله نکن؛ مشورت بگیر."}, {"t": "غایب", "b": "خبری از غایب می‌رسد.", "i": "نتیجه: نگران نباش. توصیه: دعا کن و پیگیری آرام داشته باش."}, {"t": "امتحان", "b": "این مرحله آزمون است.", "i": "نتیجه: عبور می‌کنی اگر راست باشی. توصیه: صداقت را حفظ کن."}, {"t": "تأمل", "b": "نیاز به فکر بیشتر داری.", "i": "نتیجه: امروز تصمیم قطعی نگیر. توصیه: یک شب صبر کن و دوباره نیت کن."}];

  var ABJAD = {'ا':1,'آ':1,'أ':1,'إ':1,'ب':2,'پ':2,'ج':3,'چ':3,'د':4,'ه':5,'ة':5,'و':6,'ز':7,'ژ':7,'ح':8,'ط':9,'ی':10,'ي':10,'ک':20,'ك':20,'گ':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000};
  var VAL2LET = {1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط',10:'ی',20:'ک',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص',100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ',1000:'غ'};

  function $(id){ return document.getElementById(id); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function showBox(id, html){
    try {
      var el = $(id);
      if (!el) return;
      el.innerHTML = html;
      el.style.display = 'block';
      el.classList.add('modal-result-pro');
    } catch (e) { console.warn('showBox', e); }
  }

  /* قطب‌نما */
  window.startCompass = function(){
    var status = $('compassStatus'), needle = $('compassNeedle'), degEl = $('compassDeg');
    function onOri(e){
      var h = e.webkitCompassHeading;
      if (h == null && e.alpha != null) h = (360 - e.alpha) % 360;
      if (h == null || isNaN(h)) return;
      if (needle) needle.style.transform = 'rotate(' + (-h) + 'deg)';
      if (degEl) degEl.textContent = Math.round(h) + '°';
      var dirs = ['شمال','شمال‌شرقی','شرق','جنوب‌شرقی','جنوب','جنوب‌غربی','غرب','شمال‌غربی'];
      if (status) status.textContent = dirs[Math.round(h/45)%8] + ' — ' + Math.round(h) + ' درجه';
    }
    try {
      if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission().then(function(s){
          if (s === 'granted') { window.addEventListener('deviceorientation', onOri, true); if(status) status.textContent='فعال است'; }
          else if (status) status.textContent='اجازه حسگر داده نشد';
        }).catch(function(){ if(status) status.textContent='خطا در دسترسی حسگر'; });
      } else if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', onOri, true);
        if (status) status.textContent = 'فعال است — گوشی را افقی بگیرید';
      } else if (status) status.textContent = 'حسگر جهت روی این دستگاه نیست';
    } catch (e) { if (status) status.textContent = 'خطا: ' + (e.message||e); }
  };

  /* اوقات شرعی تقریبی */
  function toRad(d){ return d*Math.PI/180; }
  function toDeg(r){ return r*180/Math.PI; }
  function prayerTimes(lat, lon, date){
    var d = date||new Date();
    var day = Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/86400000);
    var B = toRad((360/365)*(day-81));
    var eot = 9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B);
    var lstm = 15*Math.round(lon/15);
    var tc = (4*(lon-lstm)+eot)/60;
    var decl = 23.45*Math.sin(toRad((360/365)*(day-81)));
    function hourAngle(angle){
      var cosH=(Math.sin(toRad(angle))-Math.sin(toRad(lat))*Math.sin(toRad(decl)))/(Math.cos(toRad(lat))*Math.cos(toRad(decl)));
      cosH=Math.min(1,Math.max(-1,cosH));
      return toDeg(Math.acos(cosH))/15;
    }
    var solarNoon=12-tc, sunrise=solarNoon-hourAngle(-0.83), sunset=solarNoon+hourAngle(-0.83);
    var fajr=solarNoon-hourAngle(-18), isha=solarNoon+hourAngle(-17);
    var asr=solarNoon+hourAngle(90-Math.abs(lat-decl))*0.5+1.2;
    function fmt(h){ if(!isFinite(h))return'—'; var hh=Math.floor((h%24+24)%24),mm=Math.floor(((h%24+24)%24-hh)*60); return String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'); }
    return {fajr:fmt(fajr),sunrise:fmt(sunrise),dhuhr:fmt(solarNoon+0.05),asr:fmt(asr),maghrib:fmt(sunset+0.05),isha:fmt(isha)};
  }
  window.calcAdhanTimes = function(){
    var status=$('adhanStatus');
    function apply(lat,lon,label){
      var t=prayerTimes(lat,lon,new Date());
      showBox('adhanResult','<div class="modal-result-text" style="line-height:2.2"><strong>اوقات تقریبی امروز</strong><br>'+(label?('📍 '+esc(label)+'<br>'):'')+
        'اذان صبح: <b>'+t.fajr+'</b><br>طلوع: <b>'+t.sunrise+'</b><br>ظهر: <b>'+t.dhuhr+'</b><br>عصر: <b>'+t.asr+'</b><br>مغرب: <b>'+t.maghrib+'</b><br>عشاء: <b>'+t.isha+'</b><br><small style="opacity:.75">تقریبی است؛ برای دقت شرعی به مرجع محلی مراجعه کنید.</small></div>');
      if(status) status.textContent='محاسبه شد';
    }
    if(!navigator.geolocation){ apply(35.69,51.39,'تهران (پیش‌فرض)'); return; }
    if(status) status.textContent='دریافت موقعیت...';
    navigator.geolocation.getCurrentPosition(function(pos){ apply(pos.coords.latitude,pos.coords.longitude,'موقعیت فعلی'); },
      function(){ apply(35.69,51.39,'تهران (موقعیت رد شد)'); }, {timeout:8000,maximumAge:600000});
  };

  /* فال حافظ — شعر + تفسیر واضح */
  window.drawHafezFal = function(){
    try {
      if (!HAFEZ.length) return;
      var g = HAFEZ[Math.floor(Math.random()*HAFEZ.length)];
      showBox('hafezResult',
        '<div class="modal-result-text">'+
        '<div style="color:#F0D878;font-weight:800;margin-bottom:8px">📜 غزل شماره '+esc(g.n)+'</div>'+
        '<div style="color:#F0D878;margin-bottom:8px;line-height:1.9">'+esc(g.t)+'</div>'+
        '<div style="white-space:pre-line;line-height:2;margin-bottom:14px;opacity:.95">'+esc(g.b)+'</div>'+
        '<div style="border-top:1px solid rgba(232,201,106,.35);padding-top:12px;margin-top:8px">'+
        '<div style="color:#F0D878;font-weight:800;margin-bottom:6px">🔎 پاسخ فال (تفسیر)</div>'+
        '<div style="line-height:2.05">'+esc(g.i)+'</div></div></div>'
      );
    } catch (e) {
      console.warn(e);
      if (typeof showNotification==='function') showNotification('خطا در فال حافظ','error');
    }
  };

  /* فالنامه — نتیجه واضح */
  window.drawFalnameh = function(){
    try {
      var f = FALNAMEH[Math.floor(Math.random()*FALNAMEH.length)];
      showBox('falnamehResult',
        '<div class="modal-result-text">'+
        '<div style="color:#F0D878;font-weight:800;margin-bottom:8px">📖 عنوان: '+esc(f.t)+'</div>'+
        '<div style="line-height:2;margin-bottom:10px">'+esc(f.b)+'</div>'+
        '<div style="border-top:1px solid rgba(232,201,106,.35);padding-top:12px">'+
        '<div style="color:#F0D878;font-weight:800;margin-bottom:6px">🔎 نتیجه برای شما</div>'+
        '<div style="line-height:2.05">'+esc(f.i)+'</div></div></div>'
      );
    } catch (e) {
      if (typeof showNotification==='function') showNotification('خطا در فالنامه','error');
    }
  };

  /* حروف و اعداد */
  window.convertLettersNumbers = function(){
    var mode=(($('lnMode')||{}).value)||'text2num';
    var input=((($('lnInput')||{}).value)||'').trim();
    if(!input){ if(typeof showNotification==='function') showNotification('ورودی خالی است','error'); return; }
    if(mode==='text2num'){
      var total=0, rows=[];
      for(var i=0;i<input.length;i++){ var ch=input[i], v=ABJAD[ch]; if(v!=null){ total+=v; rows.push(ch+' = '+v); } }
      showBox('lnResult','<div class="modal-result-text">جمع ابجد: <b style="color:#F0D878">'+total+'</b><br><br>'+rows.map(esc).join('<br>')+'</div>');
    } else {
      var n=parseInt(input.replace(/[^\d]/g,''),10);
      if(!n){ if(typeof showNotification==='function') showNotification('عدد معتبر وارد کنید','error'); return; }
      var units=[1000,900,800,700,600,500,400,300,200,100,90,80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1], letters=[], rest=n;
      for(var u=0;u<units.length;u++) while(rest>=units[u]){ letters.push(VAL2LET[units[u]]); rest-=units[u]; }
      showBox('lnResult','<div class="modal-result-text">عدد <b style="color:#F0D878">'+n+'</b><br>حروف: <b style="color:#F0D878">'+esc(letters.join(' '))+'</b></div>');
    }
  };

  /* قرآن — چند منبع + ذخیره IndexedDB */
  var QDB='kafeQuranDB', QSTORE='surahs';
  function openQDB(){
    return new Promise(function(resolve,reject){
      try {
        var r=indexedDB.open(QDB,1);
        r.onupgradeneeded=function(e){ var db=e.target.result; if(!db.objectStoreNames.contains(QSTORE)) db.createObjectStore(QSTORE,{keyPath:'number'}); };
        r.onsuccess=function(){ resolve(r.result); };
        r.onerror=function(){ reject(r.error||new Error('idb')); };
      } catch(e){ reject(e); }
    });
  }
  function qPut(surah){
    return openQDB().then(function(db){
      return new Promise(function(res,rej){
        var tx=db.transaction(QSTORE,'readwrite');
        tx.objectStore(QSTORE).put(surah);
        tx.oncomplete=function(){ res(true); };
        tx.onerror=function(){ rej(tx.error); };
      });
    });
  }
  function qGet(num){
    return openQDB().then(function(db){
      return new Promise(function(res,rej){
        var req=db.transaction(QSTORE,'readonly').objectStore(QSTORE).get(num);
        req.onsuccess=function(){ res(req.result||null); };
        req.onerror=function(){ rej(req.error); };
      });
    });
  }
  function qCount(){
    return openQDB().then(function(db){
      return new Promise(function(res){
        var req=db.transaction(QSTORE,'readonly').objectStore(QSTORE).count();
        req.onsuccess=function(){ res(req.result||0); };
        req.onerror=function(){ res(0); };
      });
    }).catch(function(){ return 0; });
  }

  window.quranUpdateStatus = function(){
    qCount().then(function(c){
      var el=$('quranStatus');
      if(el) el.textContent = c>=114 ? '✅ تمام ۱۱۴ سوره ذخیره آفلاین است' : (c ? ('📦 '+c+' سوره ذخیره شده') : 'هنوز دانلودی نشده — اینترنت لازم است');
    });
  };

  async function fetchJson(url, timeoutMs){
    var ctrl = typeof AbortController!=='undefined' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function(){ try{ctrl.abort();}catch(e){} }, timeoutMs||25000) : null;
    try {
      var res = await fetch(url, { signal: ctrl && ctrl.signal, mode:'cors', cache:'default' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    } finally {
      if (t) clearTimeout(t);
    }
  }

  /** چند منبع برای قرآن */
  async function downloadQuranFromSources(onProgress){
    var errors = [];
    // 1) alquran.cloud full
    try {
      if (onProgress) onProgress('اتصال به منبع ۱...');
      var data = await fetchJson('https://api.alquran.cloud/v1/quran/quran-uthmani', 60000);
      var surahs = data && data.data && data.data.surahs;
      if (surahs && surahs.length) {
        for (var i=0;i<surahs.length;i++){
          var s=surahs[i];
          await qPut({ number:s.number, name:s.name, englishName:s.englishName, ayahs:(s.ayahs||[]).map(function(a){return a.text;}) });
          if (onProgress && (i%10===0 || i===surahs.length-1)) onProgress('ذخیره '+(i+1)+'/114');
        }
        return { ok:true, count:surahs.length, source:'alquran.cloud' };
      }
      errors.push('منبع ۱ خالی بود');
    } catch(e){ errors.push('منبع ۱: '+(e.message||e)); }

    // 2) download surah by surah (cdn.jsdelivr mirror of quran json sometimes blocked — use alquran per surah)
    try {
      if (onProgress) onProgress('تلاش منبع ۲ (سوره‌به‌سوره)...');
      var okCount=0;
      for (var n=1;n<=114;n++){
        try {
          var d2 = await fetchJson('https://api.alquran.cloud/v1/surah/'+n+'/quran-uthmani', 20000);
          var d = d2 && d2.data;
          if (d) {
            await qPut({ number:d.number, name:d.name, englishName:d.englishName, ayahs:(d.ayahs||[]).map(function(a){return a.text;}) });
            okCount++;
          }
        } catch(e1){ /* skip one */ }
        if (onProgress && n%5===0) onProgress('سوره '+n+'/114');
      }
      if (okCount>=50) return { ok:true, count:okCount, source:'alquran-surah' };
      errors.push('منبع ۲ فقط '+okCount+' سوره');
    } catch(e){ errors.push('منبع ۲: '+(e.message||e)); }

    // 3) api.quran.com - chapters + verses
    try {
      if (onProgress) onProgress('تلاش منبع ۳...');
      var ch = await fetchJson('https://api.quran.com/api/v4/chapters?language=ar', 20000);
      var chapters = ch && ch.chapters;
      if (chapters && chapters.length) {
        var got=0;
        for (var ci=0;ci<chapters.length;ci++){
          var c=chapters[ci];
          try {
            var vs = await fetchJson('https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number='+c.id, 20000);
            var verses = (vs && vs.verses) || [];
            var ayahs = verses.map(function(v){ return v.text_uthmani || v.text_uthmani_simple || ''; });
            if (ayahs.length) {
              await qPut({ number:c.id, name:c.name_arabic||c.name_simple, englishName:c.name_simple, ayahs:ayahs });
              got++;
            }
          } catch(e2){}
          if (onProgress && ci%5===0) onProgress('منبع۳ '+(ci+1)+'/114');
        }
        if (got>=50) return { ok:true, count:got, source:'quran.com' };
        errors.push('منبع ۳ فقط '+got+' سوره');
      }
    } catch(e){ errors.push('منبع ۳: '+(e.message||e)); }

    throw new Error(errors.join(' | ') || 'همه منابع ناموفق');
  }

  window.quranDownloadAll = async function(){
    var status=$('quranStatus'), btn=$('quranDownloadBtn');
    if (btn) btn.disabled=true;
    try {
      if (status) status.textContent='شروع دانلود... اینترنت لازم است';
      var r = await downloadQuranFromSources(function(msg){ if(status) status.textContent=msg; });
      if (status) status.textContent='✅ ذخیره شد ('+r.count+' سوره) از '+r.source;
      if (typeof showNotification==='function') showNotification('قرآن ذخیره شد');
      window.quranFillSurahList && window.quranFillSurahList();
      window.quranUpdateStatus && window.quranUpdateStatus();
    } catch (e) {
      console.warn('quran download', e);
      var msg = 'دانلود ناموفق. اینترنت را چک کنید یا بعداً دوباره تلاش کنید.';
      if (status) status.textContent = msg + (e && e.message ? (' — '+e.message) : '');
      if (typeof showNotification==='function') showNotification('دانلود قرآن ناموفق بود','error');
    }
    if (btn) btn.disabled=false;
  };

  window.quranFillSurahList = function(){
    var sel=$('quranSurahSelect');
    if(!sel) return;
    sel.innerHTML='<option value="">انتخاب سوره...</option>';
    for(var i=1;i<=114;i++){ var o=document.createElement('option'); o.value=String(i); o.textContent='سوره '+i; sel.appendChild(o); }
    qCount().then(function(c){
      if(c<=0) return;
      openQDB().then(function(db){
        var req=db.transaction(QSTORE,'readonly').objectStore(QSTORE).openCursor();
        req.onsuccess=function(e){
          var cur=e.target.result;
          if(cur){ var v=cur.value; var opt=sel.querySelector('option[value="'+v.number+'"]'); if(opt) opt.textContent=v.number+'. '+(v.name||''); cur.continue(); }
        };
      }).catch(function(){});
    });
  };

  window.quranShowSurah = async function(){
    var num=parseInt((($('quranSurahSelect')||{}).value)||'',10);
    if(!num){ if(typeof showNotification==='function') showNotification('سوره را انتخاب کنید','error'); return; }
    var status=$('quranStatus');
    try {
      var s = await qGet(num);
      if(!s){
        if(status) status.textContent='دانلود سوره '+num+' از اینترنت...';
        try {
          var data = await fetchJson('https://api.alquran.cloud/v1/surah/'+num+'/quran-uthmani', 20000);
          var d=data.data;
          s={ number:d.number, name:d.name, englishName:d.englishName, ayahs:(d.ayahs||[]).map(function(a){return a.text;}) };
          await qPut(s);
        } catch(e1) {
          try {
            var vs=await fetchJson('https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number='+num,20000);
            var verses=(vs&&vs.verses)||[];
            s={ number:num, name:'سوره '+num, englishName:'', ayahs:verses.map(function(v){return v.text_uthmani||'';}) };
            await qPut(s);
          } catch(e2) {
            throw e2;
          }
        }
      }
      var body=(s.ayahs||[]).map(function(t,i){ return '<div style="margin:10px 0;line-height:2.2"><span style="color:#F0D878;font-size:.75rem">﴿'+(i+1)+'﴾</span> '+esc(t)+'</div>'; }).join('');
      showBox('quranResult','<div class="modal-result-text"><div style="color:#F0D878;font-weight:800;margin-bottom:12px;font-size:1.1rem">'+esc(s.name||('سوره '+num))+'</div>'+body+'</div>');
      if(status) status.textContent='نمایش سوره '+num;
    } catch(e){
      if(status) status.textContent='بارگذاری ناموفق — ابتدا «دانلود تمام قرآن» را با اینترنت بزنید';
      if(typeof showNotification==='function') showNotification('سوره در دسترس نیست','error');
    }
  };

  function registerTools(){
    window.KAFE_EXTRA_TOOLS=[
      {id:'compassModal',title:'قطب‌نما',icon:'🧭'},
      {id:'adhanModal',title:'اوقات شرعی',icon:'🕌'},
      {id:'hafezModal',title:'فال حافظ',icon:'📜'},
      {id:'falnamehModal',title:'فالنامه',icon:'📖'},
      {id:'letterNumModal',title:'حروف و اعداد',icon:'🔢'},
      {id:'quranModal',title:'قرآن کریم',icon:'📗'}
    ];
    try {
      if (typeof modalList!=='undefined' && Array.isArray(modalList)) {
        var ban={compassModal:1,adhanModal:1,hafezModal:1,falnamehModal:1,letterNumModal:1,quranModal:1};
        for(var i=modalList.length-1;i>=0;i--) if(ban[modalList[i].id]) modalList.splice(i,1);
      }
    } catch(e){}
    try { window.quranFillSurahList(); window.quranUpdateStatus(); } catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', registerTools);
  else registerTools();
  setTimeout(registerTools, 800);
})();
