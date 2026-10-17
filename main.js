
/* CLEAN_LOCAL_TX — V22.9-RC1: فقط کلیدهای مرده/آزمایشی سکه و OTP قدیمی
   سفارش و اشتراک واقعی کاربر پاک نمی‌شود. */
(function(){
  var FLAG = 'kafeCleanTx_v22_9_rc1';
  try {
    if (localStorage.getItem(FLAG) === '1') return;
    var keys = [
      'kafeCoinPurchaseRequests','kafeCoinLog','kafeCoinBalance','kafeCoinWeeklyClaim','kafeEconomyConfig',
      'cafeOTPs','v18AdminDraft','kafeChannelJoined','kafeChannelSupportSeen_v22_8'
    ];
    keys.forEach(function(k){ try { localStorage.removeItem(k); } catch(e){} });
    try { sessionStorage.removeItem('kafe_miad_admin_telegram_otp_v7'); } catch(e){}
    try { sessionStorage.removeItem('kafeChannelSupportSeen_v22_8'); } catch(e){}
    localStorage.setItem(FLAG, '1');
  } catch(e) {}
})();



/* ورود مخفی مدیریت: ۵ ضربه روی لوگو در ۳ ثانیه */
(function(){
  var taps = [];
  window.kafeLogoTap = function() {
    var now = Date.now();
    taps.push(now);
    taps = taps.filter(function(t){ return now - t < 3000; });
    if (taps.length >= 5) {
      taps = [];
      if (typeof window.toggleAdmin === 'function') {
        window.toggleAdmin();
      } else if (typeof showNotification === 'function') {
        showNotification('ورود مدیریت در دسترس نیست', 'error');
      }
      return;
    }
    // ضربه معمولی: برو به فروشگاه
    if (typeof scrollToPage === 'function') {
      try { scrollToPage(0); } catch(e) {}
    }
  };
})();

/* ===== 00-safety.js ===== */
/* V7.2 GLOBAL SAFETY HELPERS — available before every dashboard/message script */
(function(){
  function escapeHtml(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  window.escapeHtml = escapeHtml;
  window.kafeEscapeHtml = escapeHtml;
})();

/* V18 ADMIN HTML-ATTRIBUTE ARGUMENT SAFETY */
(function(){
  window.kafeHtmlJsArg = function(value){
    return JSON.stringify(String(value == null ? '' : value)).replace(/"/g,'&quot;');
  };
})();


/* ===== 01-main-app.js ===== */

        // ============================================================
        // SUPABASE CONFIG (پایدار)
        // ============================================================
        var SUPABASE_URL = 'https://evxxvnlwtbaqpjbjaxdk.supabase.co';
        var SUPABASE_KEY = 'sb_publishable_yqampnRU4wIzRn-3ENi81g_ojYSM4le';
        var supabaseClient = null;
        try {
            if (window.supabase && window.supabase.createClient) {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
                window.supabaseClient = supabaseClient;
                if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') console.log('✅ Supabase connected');
            }
        } catch (e) { console.warn('Supabase init error', e); }

        // Final online layer: keep offline-first behavior, but establish an
        // anonymous Supabase session when the project allows it. This gives
        // receipt uploads a real authenticated owner without changing the
        // existing UI or local data model.
        var _sbAnonReady = false;
        async function ensureSupabaseSession() {
            if (!supabaseClient) return null;
            try {
                var current = await supabaseClient.auth.getSession();
                if (current && current.data && current.data.session) {
                    _sbAnonReady = true;
                    return current.data.session;
                }
                if (!supabaseClient.auth.signInAnonymously) {
                    throw new Error('ورود موقت کاربر در پروژه فعال نیست.');
                }
                var r = await supabaseClient.auth.signInAnonymously();
                if (r.error || !r.data || !r.data.session) {
                    throw (r.error || new Error('ایجاد نشست کاربر ناموفق بود.'));
                }
                _sbAnonReady = true;
                return r.data.session;
            } catch (e) {
                console.warn('Supabase session', e);
                return null;
            }
        }
        async function sbUploadSubscriptionReceipt(file, userId) {
            if (!supabaseClient || !file || !userId) throw new Error('اطلاعات بارگذاری فیش کامل نیست.');
            var mime=file.type||'application/octet-stream';
            var ext=mime==='application/pdf'?'pdf':(mime==='image/png'?'png':(mime==='image/webp'?'webp':'jpg'));
            var path=String(userId)+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
            var up=await supabaseClient.storage.from('receipts').upload(path,file,{upsert:false,contentType:mime});
            if(up.error)throw up.error;
            return up.data&&up.data.path?up.data.path:path;
        }

        async function sbUploadReceipt(data, localOrderId) {
            if (!supabaseClient || !data) return null;
            try {
                var current = await supabaseClient.auth.getSession();
                var session = current && current.data && current.data.session;
                if (!session || !session.user) {
                    throw new Error('نشست کاربر معتبر نیست؛ ابتدا وارد حساب شوید.');
                }
                var file = (typeof File !== 'undefined' && data instanceof File) ? data : null;
                var blob = file || (data instanceof Blob ? data : null);
                if (!blob) {
                    var m = String(data).match(/^data:([^;]+);base64,(.+)$/);
                    if (!m) throw new Error('فیش انتخاب‌شده معتبر نیست.');
                    var bin = atob(m[2]), bytes = new Uint8Array(bin.length);
                    for (var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
                    blob = new Blob([bytes], {type:m[1]||'image/jpeg'});
                }
                var mime = blob.type || 'image/jpeg';
                var ext = mime.indexOf('pdf')>=0 ? 'pdf' : (mime.indexOf('png')>=0 ? 'png' : (mime.indexOf('webp')>=0 ? 'webp' : 'jpg'));
                var safeId = String(localOrderId || Date.now()).replace(/[^a-zA-Z0-9_-]/g,'-');
                var path = String(session.user.id) + '/' + safeId + '.' + ext;
                var up = await supabaseClient.storage.from('receipts').upload(path, blob, {upsert:false, contentType:mime});
                if (up.error) throw up.error;
                return up.data && up.data.path ? up.data.path : path;
            } catch (e) {
                console.warn('receipt upload', e);
                throw e;
            }
        }

        async function sbSyncOrderLocalId(localId, fields) {
            if (!supabaseClient || localId == null) return null;
            try {
                var r = await supabaseClient.from('orders').update(fields).eq('local_id', localId).select('id');
                if (r.error) throw r.error;
                if (Array.isArray(r.data) && r.data.length) return r.data;
                // Older server rows may not have local_id; try the real server UUID only.
                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(localId))) {
                    var byId = await supabaseClient.from('orders').update(fields).eq('id', String(localId)).select('id');
                    if (byId.error) throw byId.error;
                    if (Array.isArray(byId.data) && byId.data.length) return byId.data;
                }
                return null;
            } catch(e) { console.warn('order update was not confirmed by server', e); return null; }
        }

        async function sbPullAdminData() {
            if (!supabaseClient) return false;
            try {
                var session = await supabaseClient.auth.getSession();
                if (!session.data || !session.data.session) return false;
                var uid = session.data.session.user.id;
                var prof = await supabaseClient.from('profiles').select('role').eq('id', uid).maybeSingle();
                if (prof.error || !prof.data || prof.data.role !== 'admin') return false;
                var cloudOrders = await supabaseClient.from('orders').select('*').order('created_at',{ascending:false}).limit(200);
                if (!cloudOrders.error && Array.isArray(cloudOrders.data)) {
                    var local = [];
                    try { local = JSON.parse(localStorage.getItem('cafeOrders') || '[]'); } catch(e) {}
                    if (!Array.isArray(local)) local=[];
                    var byId={}; local.forEach(function(o){ byId[String(o.id)] = o; });
                    cloudOrders.data.forEach(function(r){
                        var id = r.local_id != null ? Number(r.local_id) : String(r.id);
                        var d={id:id, productId:null, product:r.productName||'', price:Number(r.productPrice)||0, name:r.name||'', phone:r.phone||'', type:r.type||'online', status:r.status||'', date:r.date||r.created_at||'', hasReceipt:!!r.has_receipt};
                        try { var det=JSON.parse(r.details||'{}'); Object.assign(d,det); } catch(e) {}
                        byId[String(id)] = Object.assign({}, byId[String(id)]||{}, d);
                    });
                    local=Object.keys(byId).map(function(k){return byId[k];}).sort(function(a,b){return Number(b.id||0)-Number(a.id||0);});
                    localStorage.setItem('cafeOrders', JSON.stringify(local.slice(0,200)));
                }
                return true;
            } catch(e) { console.warn('admin cloud pull',e); return false; }
        }

        // Do not create an anonymous account at boot. A real user session is
        // created only after the user submits name + phone on the entry screen.
        // refreshOnlineData فقط بعد از آماده بودن client در DOMContentLoaded صدا می‌شود.

        async function sbGet(table, filter) {
            if (!supabaseClient) return null;
            try {
                var q = supabaseClient.from(table).select('*');
                if (filter) {
                    Object.keys(filter).forEach(function(k) { q = q.eq(k, filter[k]); });
                }
                var res = await q;
                if (res.error) { console.warn('sbGet', table, res.error); return null; }
                return res.data || [];
            } catch (e) { console.warn(e); return null; }
        }
        async function sbAdd(table, row) {
            if (!supabaseClient) return null;
            try {
                var res = await supabaseClient.from(table).insert([row]).select();
                if (res.error) { console.warn('sbAdd', table, res.error); return null; }
                // A successful HTTP response without a returned inserted row is not proof of persistence.
                if (!Array.isArray(res.data) || res.data.length !== 1 || !res.data[0] || !res.data[0].id) {
                    console.warn('sbAdd: server did not confirm a single inserted row', table);
                    return null;
                }
                return res.data;
            } catch (e) { console.warn(e); return null; }
        }
        async function sbUpdate(table, id, fields) {
            if (!supabaseClient) return null;
            try {
                var res = await supabaseClient.from(table).update(fields).eq('id', id).select();
                if (res.error) { console.warn('sbUpdate', table, res.error); return null; }
                return res.data;
            } catch (e) { console.warn(e); return null; }
        }
        async function sbDelete(table, id) {
            if (!supabaseClient) return false;
            try {
                var res = await supabaseClient.from(table).delete().eq('id', id);
                if (res.error) { console.warn('sbDelete', table, res.error); return false; }
                return true;
            } catch (e) { console.warn(e); return false; }
        }
        async function sbDeleteByLocalId(table, localId) {
            if (!supabaseClient) return false;
            try {
                var res = await supabaseClient.from(table).delete().eq('local_id', Number(localId));
                if (res.error) { console.warn('sbDeleteByLocalId', table, res.error); return false; }
                return true;
            } catch (e) { console.warn(e); return false; }
        }
        async function sbUpsert(table, row, onConflict) {
            if (!supabaseClient) return null;
            try {
                var res = await supabaseClient.from(table).upsert([row], onConflict ? { onConflict: onConflict } : undefined).select();
                if (res.error) { console.warn('sbUpsert', table, res.error); return null; }
                return res.data;
            } catch (e) { console.warn(e); return null; }
        }

        // Online-first reads with local fallback. Existing app logic remains intact.
        var __refreshOnlineInFlight = null;
        async function refreshOnlineData() {
            if (__refreshOnlineInFlight) return __refreshOnlineInFlight;
            __refreshOnlineInFlight = (async function(){
                try {
                    // main.js creates the sole Supabase client synchronously before this function.
                    // Do not poll for a client that is already initialized.
                    if (!supabaseClient && window.supabaseClient) supabaseClient = window.supabaseClient;
                    if (!supabaseClient) return;
                    var products = await sbGet('products');
                    // An empty array is a valid server result: clear stale cached products too.
                    // null means the read failed, so leave the last-known cache untouched.
                    if (Array.isArray(products)) {
                        var mapped = products.map(function(r) {
                            return { id: (r.local_id != null ? Number(r.local_id) : r.id), cloudId: r.id, title: r.title || r.name || '', price: Number(r.price) || 0, image: r.image || '📦', imageUrl: r.image_url || '', badge: r.badge || '', desc: r.desc || r.description || '' };
                        });
                        localStorage.setItem('cafeProducts', JSON.stringify(mapped));
                        window.__productsCloudSynced = true;
                    }
                } catch(e) { console.warn('online product refresh', e); }
                finally { __refreshOnlineInFlight = null; }
            })();
            return __refreshOnlineInFlight;
        }

        // ============================================================
        // جداول ابجد
        // ============================================================
        // ابجد کبیر کلاسیک (با حروف فارسی)
        const abjadKabir = {
            'ا':1,'آ':1,'أ':1,'إ':1,'ء':1,'ئ':1,'ب':2,'پ':2,'ج':3,'چ':3,'د':4,'ه':5,'ة':5,
            'و':6,'ز':7,'ژ':7,'ح':8,'ط':9,'ی':10,'ي':10,'ئ':10,'ى':10,
            'ک':20,'ك':20,'گ':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,
            'ص':90,'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,
            'ذ':700,'ض':800,'ظ':900,'غ':1000
        };
        const abjadSaghir = {
            'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
            'ی':10,'ک':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,
            'ص':90,'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,
            'ذ':700,'ض':800,'ظ':900,'غ':1000,'پ':2,'چ':3,'ژ':7,'گ':20
        };
        const abjadVasit = {
            'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
            'ی':10,'ک':11,'ل':12,'م':13,'ن':14,'س':15,'ع':16,'ف':17,
            'ص':18,'ق':19,'ر':20,'ش':21,'ت':22,'ث':23,'خ':24,'ذ':25,
            'ض':26,'ظ':27,'غ':28,'پ':2,'چ':3,'ژ':7,'گ':11
        };
        const abjadSpecial = {
            'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'ز':6,'ح':7,'ط':8,'ی':9,
            'ک':10,'ل':8,'م':6,'ن':2,'س':0,'ع':10,'ف':8,'ص':6,
            'ق':4,'ر':8,'ش':0,'ت':4,'ث':8,'خ':0,'ذ':0,'ض':8,
            'ظ':0,'غ':4,'پ':2,'چ':3,'ژ':6,'گ':10
        };
        const abjadHejai = {
            'ا':1,'آ':1,'أ':1,'إ':1,'ء':1,'ئ':1,'ب':2,'ت':3,'ث':4,
            'ج':5,'ح':6,'خ':7,'د':8,'ذ':9,'ر':10,'ز':11,'س':12,
            'ش':13,'ص':14,'ض':15,'ط':16,'ظ':17,'ع':18,'غ':19,'ف':20,
            'ق':21,'ك':22,'ک':22,'گ':22,'ل':23,'م':24,'ن':25,'ه':26,'ة':26,
            'و':27,'ى':28,'ی':28,'ي':28,'پ':2,'چ':5,'ژ':11
        };

        // ============================================================
        // توابع کمکی
        // ============================================================
        function calculateAbjad(text, type) {
            type = type || 'kabir';
            if (!text || text.trim() === '') return 0;
            var total = 0;
            var tbl;
            switch (type) {
                case 'kabir': tbl = abjadKabir; break;
                case 'saghir': tbl = abjadSaghir; break;
                case 'vasit': tbl = abjadVasit; break;
                case 'special': tbl = abjadSpecial; break;
                case 'hejai': tbl = abjadHejai; break;
                default: tbl = abjadKabir;
            }
            var s = String(text).trim();
            for (var i = 0; i < s.length; i++) {
                var char = s[i];
                if (tbl[char] !== undefined) {
                    total += tbl[char];
                }
            }
            return total;
        }

        function reduceByX(number, x) {
            var r = number % x;
            return r === 0 ? x : r;
        }

        function calculateRemainder(total, divisor) {
            var r = total % divisor;
            return r === 0 ? divisor : r;
        }

        window.setElementText = function setElementText(id, text) {
            var el = document.getElementById(id);
            if (el) { el.textContent = text; }
        }

        window.showNotification = function showNotification(msg, type) {
            var n = document.getElementById('notification');
            if (n) {
                n.textContent = msg;
                n.style.display = 'block';
                n.className = type === 'error' ? 'error' : '';
                clearTimeout(n._timeout);
                n._timeout = setTimeout(function() {
                    n.style.display = 'none';
                }, 3000);
            }
        }

        window.__kafeOpenModalDirect = async function(modalId) {
            try {
                document.querySelectorAll('[onclick*="' + modalId + '"]').forEach(function(el){
                    el.classList.add('pre-active');
                    setTimeout(function(){ el.classList.remove('pre-active'); }, 300);
                });
            } catch (e) {}

            // قفل VIP برای هر مودال (از کنترل پنل)
            if (typeof isVipLocked === 'function' && isVipLocked(modalId) && !(await isAdminSession()) && typeof isSubscriptionActive === 'function' && !isSubscriptionActive()) {
                var lockName = (typeof getModalMeta === 'function' ? (getModalMeta(modalId).title || modalId) : modalId);
                if (typeof SUBSCRIPTION_MODALS !== 'undefined' && SUBSCRIPTION_MODALS[modalId]) lockName = SUBSCRIPTION_MODALS[modalId];
                requireSubscription(lockName);
                return;
            }

            var m = document.getElementById(modalId);
            if (m) {
                m.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        };

        /** پیام حمایتی کانال — غیر اجباری؛ یک‌بار در هر نشست نمایش داده می‌شود */
        window.__kafeShowChannelSupportThen = function(modalId) {
            var FLAG = 'kafeChannelSupportSeen_v22_8';
            try {
                if (sessionStorage.getItem(FLAG) === '1') {
                    window.__kafeOpenModalDirect(modalId);
                    return;
                }
            } catch (e) {}

            var old = document.getElementById('kafeChannelSupport');
            if (old) old.remove();

            var el = document.createElement('div');
            el.id = 'kafeChannelSupport';
            el.style.cssText = 'position:fixed;inset:0;z-index:20050;background:rgba(5,7,13,0.88);display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;';
            el.innerHTML =
                '<div style="max-width:360px;width:100%;background:linear-gradient(165deg,#12101c,#0c1424);border:2px solid #c9a84c;border-radius:18px;padding:22px 18px;color:#F0E6D3;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,.5);">' +
                '<div style="font-size:1.15rem;font-weight:800;color:#F0D878;margin-bottom:12px;">📣 حمایت از کانال</div>' +
                '<p style="font-size:0.92rem;line-height:1.95;color:#E8DFD0;margin-bottom:16px;">باعث افتخار است اگر با عضویت در کانال از ما حمایت می‌کنید.</p>' +
                '<a href="https://t.me/khatmjaberi" target="_blank" rel="noopener" style="display:block;margin-bottom:14px;padding:14px;text-decoration:none;background:rgba(201,168,76,0.22);border:1px solid rgba(201,168,76,0.45);border-radius:12px;color:#F0D878;font-weight:800;">عضویت در کانال @khatmjaberi</a>' +
                '<button type="button" id="kafeChannelSupportContinue" style="width:100%;padding:14px;background:linear-gradient(135deg,#8F6F28,#C9A84C);color:#0d0f1a;font-weight:800;border:0;border-radius:12px;cursor:pointer;font-size:0.95rem;">ادامه و باز کردن ابزار</button>' +
                '<p style="font-size:0.72rem;color:#9A9388;margin-top:12px;line-height:1.7;">این پیام فقط درخواست حمایت دوستانه است و اجباری نیست.</p>' +
                '</div>';
            document.body.appendChild(el);

            function proceed() {
                try { sessionStorage.setItem(FLAG, '1'); } catch (e) {}
                el.remove();
                window.__kafeOpenModalDirect(modalId);
            }
            document.getElementById('kafeChannelSupportContinue').onclick = proceed;
            el.addEventListener('click', function(ev) {
                if (ev.target === el) proceed();
            });
        };

        window.openModalGlass = async function openModalGlass(modalId) {
            window.__kafeShowChannelSupportThen(modalId);
        }

        window.closeModalGlass = function closeModalGlass(modalId) {
            var m = document.getElementById(modalId);
            if (m) {
                m.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        window.changeTab = function changeTab(modalName, tabId, event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            var modal = document.getElementById(modalName + 'Modal');
            if (!modal) return;
            modal.querySelectorAll('.tab-btn').forEach(function(b) {
                b.classList.remove('active');
            });
            modal.querySelectorAll('.tab-content').forEach(function(c) {
                c.classList.remove('active');
            });
            if (event && event.target) {
                event.target.classList.add('active');
            }
            var tgt = document.getElementById(tabId);
            if (tgt) tgt.classList.add('active');
        }

        // ============================================================
        // داده‌های رمل (۴۶ سوال) - داده واقعی کامل
        // ============================================================
        var ramlQuestionsPart1 = [
        { id: 1, title: "آیا حاجت برآورده می‌شود یا خیر؟", opts: ["در یُسْت و زود برآورده می‌شود", "بعد از تنگی و سختی برآورده می‌شود", "برآورده نمی‌شود و مانع آن مرد یا شخصی است", "در یُسر و از آن خیر و گشایش حاصل می‌شود", "پس از انتظار طولانی برآورده می‌شود", "به‌سرعت برآورده می‌شود", "در سختی و پس از انتظار طولانی برآورده می‌شود", "برآورده نمی‌شود و مانع آن حسد و کینه است", "برآورده می‌شود و از آن خیر و روزی نصیب می‌شود", "پس از سختی و تلاش و رنج برآورده می‌شود", "در یسر و شادمانی برآورده می‌شود", "پس از ناامیدی و دل‌زدگی برآورده می‌شود", "برآورده نمی‌شود و مانع آن مکر و فریب است", "پس از مدت طولانی برآورده می‌شود", "در یُسر و با خیری برآورده می‌شود", "پس از شدت و زحمت برآورده می‌شود"] },
        { id: 2, title: "آیا کار انجام می‌شود یا خیر؟", opts: ["کار انجام می‌شود", "کار انجام می‌شود", "کار انجام می‌شود", "کار انجام می‌شود اما بعد از زحمت و نزدیک به عدم انجام", "کار انجام می‌شود", "کار انجام نمی‌شود", "کار انجام نمی‌شود", "در آخر خراب می‌شود", "کار انجام می‌شود", "کار انجام نمی‌شود", "کار انجام می‌شود", "کار انجام می‌شود", "کار انجام می‌شود", "کار انجام نمی‌شود", "کار انجام نمی‌شود", "کار انجام می‌شود"] },
        { id: 3, title: "عاقبت سؤال‌کننده در خواسته‌اش چیست؟", opts: ["عاقبت نیک و پسندیده", "عاقبت نیک اما همراه تلاش و رنج", "مطلوب حاصل می‌شود و به مراد می‌رسد", "عاقبت مختلط از خوبی و بدی", "عاقبت ناپسند مگر اینکه صاحب منصب باشد؛ در آن صورت خوب است", "عاقبت نیک و پسندیده", "عاقبت بد و ناپسند", "عاقبت بد و ناپسند", "عاقبت نیک و پسندیده", "عاقبت همراه رنج ولی در نهایت نیکو", "عاقبت ناپسند", "آغاز با سختی و پایان با یسر و شادمانی", "عاقبت خوب", "عاقبت خوب اما همراه زحمت و تلاش", "عاقبت خوب ولی آغازش نزاع و اختلاف دارد", "ابتدا غم و اندوه سپس خوشی و سعادت"] },
        { id: 4, title: "آیا اتصال به مطلوب حاصل می‌شود یا خیر؟", opts: ["ارتباط حاصل نمی‌شود", "ارتباط حاصل می‌شود", "ارتباط دور است", "ارتباط حاصل می‌شود", "ارتباط از راه نظر است اما اجتماع نیست", "ارتباط بعد از مدت طولانی حاصل می‌شود", "ارتباط از جانب مطلوب خواهد بود", "ارتباط حاصل نمی‌شود", "ارتباط حاصل می‌شود", "ارتباط هنگام حضور خویشاوندان یا اعضاء فامیل خواهد بود", "ارتباط دور است", "ارتباط حاصل نمی‌شود", "ارتباط کامل حاصل می‌شود", "ارتباط بعد از مدت طولانی حاصل می‌شود", "ارتباط کامل حاصل می‌شود", "ارتباط حاصل نمی‌شود"] },
        { id: 5, title: "مطلوب در چه مکانی است؟", opts: ["پیش برادران و نزدیکانش (خویشاوندان)", "پیش دوستان و عزیزانش", "در میان همسایگان یا نزدیکان ساکن", "در منزل و خانهٔ خودش", "پیش پدر و بزرگان خانواده", "در جای شاد و خوشایند", "پیش برادران و نزدیکانش", "پیش دوستان و عزیزانش", "پیش دوستان و عزیزانش", "در میان همسایگان یا نزدیکان", "در مکان شادی و فرح", "پیش دوستان و عزیزانش", "در حال بیماری یا زندان", "پیش دوستان و عزیزانش", "در منزل و محل سکونتش شناخته‌شده", "پیش پدر یا بزرگان خانواده"] },
        { id: 6, title: "آیا مطلوب به شما می‌آید یا باید دنبال آن بروید؟", opts: ["مطلوب به تو می‌آید", "مطلوب به تو می‌آید", "لازم است که تو برایش تلاش کنی", "لازم است تلاش کنی", "لازم است تلاش کنی", "مطلوب پس از زمان طولانی می‌آید", "مطلوب به تو می‌آید", "مطلوب به تو می‌آید", "مطلوب به تو می‌آید", "باید برای آن تلاش کنی", "تماس و اجتماع بین طالب و مطلوب صورت نمی‌پذیرد", "باید برای آن تلاش کنی", "مطلوب به تو می‌آید", "باید برای آن تلاش کنی", "تماس رخ نمی‌دهد و اجتماع پیش نمی‌آید", "باید برای آن تلاش کنی"] },
        { id: 7, title: "اتصال به آنچه می‌طلبید نزدیک است یا دور؟", opts: ["اتصال نزدیک است", "اتصال دور است", "اتصال صورت نمی‌پذیرد", "اتصال دور است", "اتصال نزدیک است", "اتصال نزدیک است", "اتصال نزدیک است", "یا اتصال صورت نمی‌پذیرد یا دور خواهد بود", "اتصال دور است", "اتصال دور است", "اتصال نزدیک است", "اتصال دور است", "اتصال نزدیک است", "اتصال نزدیک است", "اتصال دور است", "اتصال دور است"] },
        { id: 8, title: "آیا کرب و بلا رفع می‌شود یا خیر؟", opts: ["پس از زمان طولانی رفع می‌شود", "مصیبت طولانی می‌شود", "به‌سرعت و عاجل رفع می‌شود", "پس از هفت روز رفع می‌شود", "پس از چند روز رفع می‌شود", "پس از زمان طولانی رفع می‌شود", "به‌سرعت رفع می‌شود", "طول می‌کشد سپس رفع می‌شود", "پس از سه روز رفع می‌شود", "به‌سرعت رفع می‌شود", "پس از زمان طولانی رفع می‌شود", "طول می‌کشد سپس رفع می‌شود", "به‌سرعت رفع می‌شود", "به‌سرعت رفع می‌شود", "پس از هفت روز رفع می‌شود", "طول می‌کشد سپس رفع می‌شود"] },
        { id: 9, title: "آیا آنچه می‌آید خیر است یا شر؟", opts: ["آینده خیر است", "آینده خیر است", "آینده خیر است", "مخلوطی از خیر و شر", "مخلوطی از خیر و شر", "آینده شر است", "آینده شر است", "آینده شر است", "آینده خیر است", "مخلوطی اما گرایش به خیر", "آینده خیر است", "مخلوطی اما گرایش به شر", "آینده شر است", "آینده خیر است", "آینده خیر است", "در آن خیر و شر هست"] },
        { id: 10, title: "آیا راز محفوظ می‌ماند یا فاش می‌شود؟", opts: ["راز فاش نمی‌شود", "راز فاش و برملا می‌شود", "راز مخفی و محفوظ می‌ماند", "راز فاش می‌شود", "راز فاش می‌شود", "راز محفوظ و مخفی می‌ماند", "راز نزد افراد ناشناس فاش می‌شود", "راز فاش و آشکار می‌شود", "راز نزد کسانی که نمی‌شناسی فاش می‌شود", "دیگران از آن اطلاع پیدا می‌کنند", "راز محفوظ و مخفی می‌ماند", "راز فاش می‌شود", "راز مخفی نگه داشته می‌شود", "راز فاش و شناخته می‌شود", "راز فاش می‌شود و معلوم می‌گردد", "راز محفوظ و مخفی می‌ماند"] },
        { id: 11, title: "حرکت در روز بهتر است یا در شب؟", opts: ["حرکت در روز بهتر است", "حرکت در شب بهتر است", "در شب و روز تفاوتی نیست", "حرکت در روز بهتر است", "حرکت در روز بهتر است", "حرکت در شب بهتر است", "حرکت در شب بهتر است", "حرکت در شب بهتر است", "در شب و روز تفاوتی نیست", "حرکت در روز مناسب‌تر است", "حرکت در روز بهتر است", "حرکت در روز بهتر است", "حرکت در شب بهتر است", "حرکت در شب بهتر است", "حرکت در روز بهتر است", "حرکت در شب بهتر است"] },
        { id: 12, title: "عاقبت سفر چیست؟", opts: ["سفر همراه فرح و آسایش است", "سفر همراه رنج و زحمت است", "سفر خیر و روزی به همراه دارد", "سفر شاد و مفرح است", "سفر همراه خسارت و رنج است", "سفر همراه خیر و روزی است", "سفر سختی دارد اما با سود", "سفر همراه روزی و خیر و زحمت است", "سفر شاد و سرورآفرین است", "سفر همراه رنج و تلاش است", "سفر شاد و مفرح است", "سفر روزی دارد اما با زحمت", "سفر آسایش و روزی و خیر دارد", "سفر آسوده و شادی دارد اما خسارت مالی", "سفر روزی‌آور و پرثمر است با تلاش", "سفر آسوده و مفرح و همراه خیر و روزی است"] },
        { id: 13, title: "عاقبت تجارت چیست؟", opts: ["تجارت همراه سود و فراوانی است", "سود کم دارد", "زحمت و تلاش بیش از سود است", "تجارت خسارت دارد", "سود و روزی نصیب می‌شود", "سود کمتر از سرمایه اولیه دارد", "خسارت و زحمت دارد", "زحمت با سود اندک", "رزق و سود دارد", "خسارت همراه رنج", "سود و روزی دارد", "سود فراوان دارد", "زحمت و تلاش با سود کم", "سود کم با تلاش زیاد", "سود و روزی فراوان", "سود و روزی در پی دارد"] },
        { id: 14, title: "عاقبت خرید چیست؟", opts: ["خرید همراه نحسی است", "خوش‌یُمنی در خرید", "خوش‌یُمنی در خرید", "نحسی در خرید", "نحسی در خرید", "خیر در خرید", "خیر در خرید", "باید قرعه را در زمان دیگر تکرار کرد", "نحسی در خرید", "نحسی در خرید", "خیر در خرید", "خیر در خرید", "خیر در خرید", "خیر در خرید", "خیر در خرید", "نحسی در خرید"] },
        { id: 15, title: "عاقبت فروش چیست؟", opts: ["فروش با سود و منفعت است", "بین سود و ضرر در نوسان است", "فروشنده در ضرر است", "فروش همراه سود است", "سودی که تکرار نمی‌شود", "خرابی و ضرر", "فروش با سود و منفعت", "نه ضرر دارد نه منفعت", "خسارت در فروش", "فروش با سود و منفعت", "فروش با سود و منفعت", "نه منفعت نه زیان", "فروش بهتر است", "خسارت دارد؛ بهتر صبر شود", "فروش سودآور است", "فروش مفید و سودآور است"] },
        { id: 16, title: "عاقبت دوستی چیست؟", opts: ["دوستی با مهر و احترام و فداکاری و اتحاد", "دوستی همراه خنده، تمسخر، جدایی و اختلاف", "دوستی با نجابت، صدق، بخشش و آرامش قلب", "ابتدا شادمانی و سپس نزاع و اختلاف", "دوستی پایدار و در ارتباط و موافق", "دوستی همراه حسد، غیبت و بدخواهی", "دوستی همراه خیر، خوشی و انس", "شادی و انس ولی سپس جدایی", "نجابت، بخشش، خیر و روزی", "محبت و مهربانی همراه انس و شادی", "انس، بخشش، روزی، صدق و برادری", "بخشنده ولی ناپاسخ", "شادی و اخذ و اهداء", "دوستی همراه مکر، حیله و نزاع", "دوستی خوب با انس و صدق ولی گاهی نزاع", "دوستی با عشق، فداکاری و خیر"] },
        { id: 17, title: "آیا شخص به وعده خود عمل می‌کند یا خیر؟", opts: ["وعده را اجرا می‌کند", "پس از مدت طولانی وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را وفا نمی‌کند", "پس از اختلاف و وعید وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "نیت او نقض عهد است", "وعده را اجرا می‌کند", "پس از تأخیر و بهانه وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "نقض عهد می‌کند", "نقض عهد می‌کند", "وعده را به‌طور کامل اجرا می‌کند"] },
        { id: 18, title: "آیا مدیون بدهی خود را می‌پردازد یا خیر؟", opts: ["مدیون بدهی خود را می‌پردازد", "پس از تأخیر و طول انتظار آن را می‌پردازد", "مدیون پرداخت می‌کند", "پس از وعده و تأخیر پرداخت می‌شود", "مدیون بدهی را بازپس نمی‌دهد", "مدیون بازنمی‌پردازد", "طلبکار دِین خود را پس می‌گیرد", "مدیون بدهی خود را می‌پردازد", "طلبکار دِین را پس می‌گیرد", "مدیون بدهی را می‌پردازد", "مدیون از دین انکار می‌کند", "مدیون دین را بازنمی‌گرداند", "پس از تأخیر و وعید دین پرداخت می‌شود", "طلبکار دِین را پس می‌گیرد", "مدیون بدهی را می‌پردازد", "مدیون دین را بازنمی‌گرداند"] },
        { id: 19, title: "آیا دین ادا می‌شود یا خیر؟", opts: ["دین سریعاً ادا می‌شود", "دین قسطی و پراکنده ادا می‌شود", "دین فقط پس از زمان طولانی و رنج ادا می‌شود", "دین با سختی ادا می‌شود و نزدیک است ادا نشود", "دین پیش از موعد ادا می‌شود", "دین با سختی و پراکنده ادا می‌شود", "طلبکار جای دیگری را نشان می‌دهد", "دین ناقص ادا می‌شود", "پرداخت دین با تأخیر انجام می‌شود", "بخشی نقد و بخشی به‌صورت چیز دیگری ادا می‌شود", "پس از صلح دین ادا می‌شود", "دین با تأخیر ادا می‌شود", "دین ناقص ادا می‌شود", "دین با تأخیر ادا می‌شود", "دین با سختی ادا می‌شود و نزدیک است ادا نشود", "دین سریعاً ادا می‌شود"] },
        { id: 20, title: "آیا امانت بازگردانده می‌شود یا خیر؟", opts: ["اگر خدا بخواهد بازمی‌گردد", "امانت بازنمی‌گردد", "پس از تذکر و وعید بازمی‌گردد", "امانت بازگردانده می‌شود", "امانت فاسد می‌شود", "پس از تأخیر و سختی بازمی‌گردد", "امانت بازمی‌گردد", "امانت بازمی‌گردد", "امانت بازمی‌گردد", "پس از زمان طولانی بازمی‌گردد", "امانت بازمی‌گردد", "امانت بازنمی‌گردد", "امانت بازمی‌گردد", "امانت فاسد می‌شود", "امانت بازنمی‌گردد", "امانت بازمی‌گردد"] },
        { id: 21, title: "آیا خبر صحیح است یا دروغ؟", opts: ["خبر حقیقت و صادق است", "آنچه شنیدی درست نیست", "مخلوطی از صدق و کذب", "غیرصحیح و دروغ است", "خبر حق و صادق است", "خبر حق و صادق است", "در آن صدق و کذب هست", "باطل و دروغ", "خبر حق و صادق است", "در آن صدق و کذب هست", "خبر حقیقت دارد", "خبر حقیقت دارد", "باطل و دروغ", "باطل و دروغ", "در آن صدق و کذب هست", "در آن صدق و کذب هست"] },
        { id: 22, title: "مدت زمان چقدر است؟", opts: ["یک روز", "سه روز", "پنج روز", "هفت روز", "یک جمعه (هفته)", "دو جمعه (دو هفته)", "سه جمعه (سه هفته)", "چهار جمعه (چهار هفته)", "سه ماه", "پنج ماه", "هفت ماه", "ده ماه", "یک سال", "دو سال", "سه سال", "چهار سال"] },
        { id: 23, title: "عاقبت ازدواج چیست؟", opts: ["اتفاق و خیر و پیوند", "اختلاف و تنگی و ناراحتی", "مخلوطی از روزهای موافق و مخالف", "شاد و ساکن، آرامش و هم‌نشینی", "راحتی و کمی سختی", "نحسی و جدایی", "اتفاق با اندکی اختلاف", "اتفاق و خوشی و آرامش", "اختلاف و جدایی", "خوشی و آرامش ولی گاهی دوری در بستر", "آرامش، خیر و توافق", "نزاع و جدایی و دوری در بستر", "خوشی و آرامش و محبّت", "آغاز خوش و پایان با سختی", "آرامش و خوشی و سعادت", "فراق و وصال متناوب"] }
        ];

        var ramlQuestionsPart2 = [
        { id: 24, title: "آیا مطلّقه به همسر خود بازمی‌گردد یا خیر؟", opts: ["برنمی‌گردد و طرف تمایل ندارد", "بازمی‌گردد", "پس از مدت طولانی بازمی‌گردد", "تمایل دارد و بازمی‌گردد", "تمایل دارد ولی بازنمی‌گردد", "تمایل دارد ولی بازنمی‌گردد", "او تمایل دارد ولی برگردانده نمی‌شود", "بازمی‌گردد", "بازمی‌گردد و پذیرفته می‌شود", "نه تمایل دارد نه بازمی‌گردد", "بازمی‌گردد", "تمایل دارد اما پذیرفته نمی‌شود", "تمایل دارد ولی بازنمی‌گردد", "بازمی‌گردد", "بازمی‌گردد", "تمایل دارد اما بازگردانده نمی‌شود"] },
        { id: 25, title: "آیا فرزندی حاصل می‌شود یا خیر؟", opts: ["فرزندی حاصل نمی‌شود", "رزق فرزند خواهد شد", "رزق فرزند نصیب می‌شود", "پس از انتظار طولانی فرزند حاصل می‌شود", "رزق فرزند خواهد شد", "رزق فرزند خواهد شد", "خطر عقیم بودن هست", "پس از انتظار طولانی صاحب فرزند می‌شود", "رزق فرزند خواهد شد", "رزق فرزند خواهد شد", "پس از انتظار طولانی صاحب فرزند می‌شود", "پس از انتظار طولانی و نگرانی از عقیم بودن", "رزق فرزند خواهد شد", "رزق فرزند خواهد شد", "رزق فرزند پس از انتظار طولانی", "پس از انتظار طولانی صاحب فرزند می‌شود؛ اگر بیش از 9 سال گذرد نگرانی از عقیم بودن"] },
        { id: 26, title: "آیا زن حامله است یا خیر؟", opts: ["حامل نیست", "حامل است", "حامل نیست", "حامل است", "حامل نیست", "حامل نیست", "حامل نیست", "حامل است", "حامل است", "حامل است", "حامل است", "حامل نیست", "حامل نیست", "حامل نیست", "حامل است", "حامل است"] },
        { id: 27, title: "آیا حاملگی تثبیت می‌شود یا خیر؟", opts: ["حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود"] },
        { id: 28, title: "تعداد فرزند در شکم مادر چقدر است؟", opts: ["تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "دو قلو", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "دو قلو"] },
        { id: 29, title: "جنسیت نوزاد چیست؟", opts: ["نوزاد پسر", "نوزاد پسر", "نوزاد دختر", "نوزاد پسر", "نوزاد دختر", "نوزاد دختر", "نوزاد دختر", "نوزاد دختر", "نوزاد دختر", "نوزاد پسر", "نوزاد پسر", "نوزاد دختر", "نوزاد پسر", "نوزاد پسر", "نوزاد دختر", "نوزاد دختر"] },
        { id: 30, title: "در چه روزی زن زایمان می‌کند؟", opts: ["دوشنبه", "سه‌شنبه", "پنج‌شنبه", "جمعه", "چهارشنبه", "دوشنبه", "شنبه", "یک‌شنبه", "یک‌شنبه", "شنبه", "پنج‌شنبه", "چهارشنبه", "شنبه", "جمعه", "سه‌شنبه", "شنبه"] },
        { id: 31, title: "وضعیت غایب چیست؟", opts: ["در خوبی و سلامت", "در خوبی و سلامت", "دل‌مشغولی، افکار پریشان، کمی بی‌پولی", "ممکن است فوت کرده باشد", "در خوبی و سلامت", "در خوبی و سلامت", "در تنگنا و درد", "ممکن است فوت کرده باشد", "ممکن است فوت کرده باشد", "در درد و عذاب", "احتمالاً محبوس است", "در خوبی و سلامت", "محبوس در جهت شرق", "در خوبی و سلامت", "محبوس است", "در خوبی و سلامت"] },
        { id: 32, title: "آیا غایب بازمی‌گردد یا خیر؟", opts: ["به‌زودی بازمی‌گردد", "پس از هفت روز؛ اگر نشد پس از هفت ماه؛ اگر باز نشد پس از هفت سال", "به‌زودی بازمی‌گردد", "بازنمی‌گردد", "پس از سه روز یا هفت روز بازمی‌گردد", "پس از چند روز بازمی‌گردد", "پس از یک یا چند روز بازمی‌گردد", "بازنمی‌گردد", "بازنمی‌گردد", "پس از هفت روز یا در صورت تأخیر پس از یک ماه بازمی‌گردد", "پس از یک روز بازمی‌گردد", "پس از چهار روز یا اگر تأخیر شود پس یک هفته و اگر بازهم تأخیر کند پس دو هفته", "پس از سه روز بازمی‌گردد", "پس از چند روز بازمی‌گردد", "پس از هفت روز بازمی‌گردد", "پس از سه روز یا پس از سه هفته بازمی‌گردد"] },
        { id: 33, title: "وضعیت فراری یا هارب چیست؟", opts: ["در شهر گیج و سرگردان است", "در شهر به اختیار خود خارج شده", "با خوشی و میل در کنار دیگران است", "معذور و در غم و اندوه است", "با کسی که پیش او رفت‌وآمد داشته", "محبوس است و نمی‌تواند خارج شود", "محبوس و قادر به بازگشت نیست", "آزاد و نمی‌خواهد بازگردد", "گیج و سرگردان است", "در مکر و فریب است", "با کسی که میل دارد است", "در پشیمانی و آرزوی بازگشت ولی ناتوان", "در تنگی و حبس", "آزاد و نمی‌خواهد بازگردد", "با کسی که میل دارد است", "در اندوه و پشیمانی"] },
        { id: 34, title: "آیا فراری بازمی‌گردد یا خیر؟", opts: ["به‌سرعت پیدا می‌شود", "به‌راحتی یا بازمی‌گردد سریع", "پس از مدت طولانی پیدا می‌شود", "پس از مدت طولانی پیدا می‌شود", "به‌راحتی یا بازمی‌گردد سریع", "پس از چند روز بازمی‌گردد و بیش از هفت روز نمی‌شود", "به‌راحتی مکانش را نشان می‌دهد", "پس از چند روز بازمی‌گردد", "به‌راحتی مکانش معلوم می‌شود", "پس از چند روز پیدا می‌شود", "برنمی‌گردد؛ قرعه را دوباره تکرار کن", "پس از چند روز بازمی‌گردد", "بازنمی‌گردد", "در همان روز یا شب یا پس از سه روز بازمی‌گردد", "پس از چند روز بازمی‌گردد", "بین یک تا سه روز پیدا می‌شود"] },
        { id: 35, title: "آیا بیمار شفا می‌یابد یا خیر؟", opts: ["پس از مدت طولانی بهبود می‌یابد", "خیر؛ بیمار از دنیا می‌رود", "بیمار به‌سرعت بهبود می‌یابد", "خیر؛ بیمار درگذرد", "بیمار پس از چند روز بهبود می‌یابد", "بیمار پس از مدت طولانی بهبود می‌یابد", "بهبود پس از ماه‌ها یا یک سال", "بهبود پس از شدت بیماری", "شفا می‌یابد", "شفا نمی‌یابد", "پس از شدت بهبود می‌یابد", "پس از چند روز بهبود می‌یابد", "پس از درمان طولانی بهبود می‌یابد", "شفا نمی‌یابد", "پس از چند روز بهبود می‌یابد", "پس از درمان طولانی بهبود می‌یابد"] },
        { id: 36, title: "آیا متهم بی‌گناه است یا خیر؟", opts: ["متهم بی‌گناه است", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود"] },
        { id: 37, title: "عاقبت مخاصمه چیست؟", opts: ["خصم از سؤال‌کننده قوی‌تر است", "خصم بر سؤال‌کننده غلبه می‌کند", "دو طرف در قوت برابرند", "سؤال‌کننده خصم را مغلوب می‌کند", "سؤال‌کننده خصم را مغلوب می‌کند", "سؤال‌کننده پیروز می‌شود", "خصم بر سؤال‌کننده غلبه می‌کند", "سؤال‌کننده بر خصم پیروز می‌شود", "سؤال‌کننده از خصم قوی‌تر است", "سؤال‌کننده از خصم قوی‌تر است", "خصم از سؤال‌کننده قوی‌تر است", "خصم از سؤال‌کننده قوی‌تر است", "دو طرف در قوت برابرند", "خصم از سؤال‌کننده قوی‌تر است", "سؤال‌کننده بر خصم غالب می‌شود", "دو طرف برابرند"] },
        { id: 38, title: "حکم قاضی درباره سؤال‌کننده چیست؟", opts: ["سؤال‌کننده مغلوب خواهد شد", "سؤال‌کننده غالب است و عاقبتش خوب است", "سؤال‌کننده غالب و پیروز می‌شود", "سؤال‌کننده مغلوب می‌شود", "سؤال‌کننده مغلوب می‌شود", "سؤال‌کننده پیروز و منتصر می‌شود", "سؤال‌کننده غالب است", "سؤال‌کننده غالب است", "سؤال‌کننده مغلوب است", "سؤال‌کننده مغلوب است", "سؤال‌کننده غالب است", "سؤال‌کننده نتیجهٔ نیک خواهد داشت", "سؤال‌کننده نتیجهٔ نیک خواهد داشت", "سؤال‌کننده پیروز و ظافر می‌شود", "عاقبت سؤال‌کننده نیکو خواهد بود", "سؤال‌کننده مغلوب می‌شود"] },
        { id: 39, title: "آیا مال مسروقه بازمی‌گردد یا خیر؟", opts: ["مسروقه بازنمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه ناقص بازمی‌گردد", "مسروقه پاره یا بریدگی‌خورده بازمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه فاسد بازمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازنمی‌گردد"] },
        { id: 40, title: "وضعیت و صفت دزد چیست؟", opts: ["دزد از نزدیکان یا افرادی است که پناه می‌دهد", "دزد از اهل خانه یا خویشاوندان نزدیک است", "دزد از فرزندان عم یا خویشان نسبی", "دزد از برادران یا خواهران است", "دزد از فرزندان خاله یا خاله‌زاده‌ها", "دزد غریبه و دور است", "دزد از اهل خانه یا کسی که زیاد رفت‌وآمد دارد", "دزد غریبه و دور", "دزد از اهل خانه یا خویشاوند است", "دزد از اهل خانه یا خویشاوند است", "دزد خود سؤال‌کننده است", "دزد از دوستان یا همسایگان سؤال‌کننده است", "دزد غریبهٔ دور", "دزد از دوستان یا همسایگان سؤال‌کننده است", "دزد غریبه و دور", "دزد کسی است که زیاد به محل مسروقه سر می‌زند"] },
        { id: 41, title: "آیا دزد بین متهمان است یا خیر؟", opts: ["دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد بین متهمان است", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است"] },
        { id: 42, title: "راهنمای بیرون کشیدن دزد از میان متهمان", opts: ["در جهت شمال", "در جهت شمال", "در جهت راست (راست بودن)", "در جهت راست", "در جهت راست", "در جهت راست", "در جهت شمال", "در جهت شمال", "در جهت راست", "در جهت شمال", "در جهت راست", "در جهت راست", "در جهت شمال", "در جهت شمال", "در جهت راست", "در جهت شمال"] },
        { id: 43, title: "آیا زندانی آزاد می‌شود یا خیر؟", opts: ["به‌زودی آزاد می‌شود", "در زندان فوت می‌کند", "پس از زمان طولانی آزاد می‌شود", "پس از زمان طولانی آزاد می‌شود", "پس از یک سال و اگر بیشتر شد پس هفت سال", "به‌سرعت آزاد می‌شود", "پس از زمان طولانی آزاد می‌شود", "به‌سرعت آزاد می‌شود", "به‌زودی آزاد می‌شود", "پس از چند روز یا اگر بیشتر شد پس یک ماه آزاد می‌شود", "پس از چند سال آزاد می‌شود", "پس از یک ماه آزاد می‌شود", "به‌زودی آزاد می‌شود", "پس از یک ماه آزاد می‌شود", "مدت حبس طولانی می‌شود", "به‌سرعت آزاد می‌شود"] },
        { id: 44, title: "آیا شخص به مقام یا سلطنت می‌رسد یا خیر؟", opts: ["به آنچه می‌خواهد و مقصودش می‌رسد", "به مقام یا چیزی کمتر از آن می‌رسد", "به حکومت و منصب می‌رسد", "نمی‌رسد و حاصل نمی‌شود", "نمی‌رسد", "خسارت و بازگشت و بی‌فایده", "نمی‌رسد", "نمی‌رسد ولی چیزی کمتر از آن می‌یابد", "نمی‌رسد", "ممکن است سلطان یا چیزی مشابه شود", "به خواسته‌ها و عنوان موردنظر می‌رسد", "نمی‌رسد", "نمی‌رسد", "نمی‌رسد", "نمی‌رسد", "به حکومت و منصب می‌رسد"] },
        { id: 45, title: "وضعیت حکم و رفتار سلطان و حاکم چیست؟", opts: ["با خود مشغول است و به حکم و رعیت نمی‌پردازد", "عزت دارد و نفوذ دارد؛ ممکن است ولیعهدی پیدا کند", "جبّار و ستمگر، فتنه و جنگ زیاد", "نشان‌دهنده فساد مملکت و ضعف اطاعت", "حکمش ظلم و جور است", "وظایف را می‌شناسد و به‌جا می‌آورد", "عادل و محبوب", "سیر و کارش ستوده و عادل است", "ضعیف و بیمار و تمایل به ظلم", "بسیاُر در سفر و حرکت است، به عدالت فرمان می‌دهد", "ملک و ثروت به دست می‌آورد و بر دشمنان چیره می‌شود", "عادل و محبوب", "ثروتمند و دارای یاران و مورد استقبال رعیّت", "ضعیف و ترسو، ممکن است شورش شود", "عادل و صالح و محبوب", "حکمش ظالمانه است و طول نمی‌کشد"] },
        { id: 46, title: "آیا جنگ رخ می‌دهد یا خیر؟", opts: ["جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "نشانهٔ خشونت هست و جنگ ممکن است", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ می‌دهد", "جنگ رخ می‌دهد", "جنگ رخ می‌دهد و نظامی وارد می‌شود", "جنگ رخ می‌دهد و بلا وارد می‌شود", "جنگ رخ می‌دهد", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ می‌دهد", "جنگ رخ می‌دهد"] }
        ];

        var ramlQuestions = ramlQuestionsPart1.concat(ramlQuestionsPart2);


        // ============================================================
        // داده‌های همزاد (۲۸ نتیجه) - داده واقعی
        // ============================================================
        function ensureHamzadResultsSeeded() {
            try {
                if (window.__VIP_HAMZAD_SEED && typeof hamzadResults === 'object') {
                    for (var k = 1; k <= 28; k++) {
                        if (!hamzadResults[k] && window.__VIP_HAMZAD_SEED[k]) hamzadResults[k] = window.__VIP_HAMZAD_SEED[k];
                    }
                }
            } catch (e) {}
        }
        var hamzadResults = {
        1: "قرین علوی قویتر است پس اسم مناسب است",
        2: "قرین علوی قویتر است و بسیار خیر می‌بیند",
        3: "قرین سفلی بسیار از قرین علوی قویتر است؛ اسم مناسب نیست و فقر می‌آورد",
        4: "مناسب است؛ قرین علوی قویتر است",
        5: "قرین سفلی قویتر است خیلی خیلی زیاد",
        6: "قرین علوی قویتر است و شخص خیر زیادی می‌بیند",
        7: "قرین علوی قویتر است و شخص خیر زیادی می‌بیند",
        8: "قرین علوی قویتر است و شخص خیر زیادی می‌بیند",
        9: "قرین سفلی زیاد قویتر از قرین علوی نیست؛ حامل این اسم همیشه مریض و بدحال خواهد بود",
        10: "قرین از جنس شیطانی است؛ اگر شخص نجنبد و مشکل را حل نکند، بدبخت خواهد شد",
        11: "اسم مناسب است",
        12: "مناسب است",
        13: "تابع قرینی دارد: أم‌الصبیان",
        14: "تابع قرینی دارد: أم‌الصبیان",
        15: "بسیار مناسب است",
        16: "قرین علوی با قرین سفلی در یک اندازه هستند",
        17: "قرین سفلی قویتر است",
        18: "مناسب است",
        19: "اسم مناسب است و برای صاحب اسم رزق بسیار می‌آورد",
        20: "قرین سفلی قویتر است خیلی خیلی زیاد",
        21: "تابع قرینی دارد: أم‌الصبیان (قرین سفلی بیش از اندازه قوی است)",
        22: "مناسب است",
        23: "اسم خوب است؛ هر دو قرین در یک اندازه‌اند اما حامل اسم از چیزی می‌ترسد که از جن به او ضرر می‌رسد",
        24: "مناسب است",
        25: "هر دو قرین در یک اندازه‌اند ولی این شخص ممکن است در تصادف یا اتفاقی بدنش توسط جن تسخیر شود",
        26: "مناسب است و خیر و رزق برایش می‌آورد",
        27: "قرین علوی بسیار قویتر است و این شخص خیر زیادی در زندگی می‌بیند",
        28: "هر دو قرین در یک اندازه‌اند ولی ممکن است در خواب/حمام/تصادف بدنش توسط جن تسخیر شود"
        };


        // ============================================================
        // داده‌های مکاشفه (۱۶ خانه) - داده واقعی اهل یقین
        // ============================================================
        var defaultMokashefeData = [
{
            id: 1,
            number: 1,
            name: "دارای اشکال زیبا",
            persianName: "خانه اول: دار القمر",
            arabicName: "له من الأشکال الجمال",
            houseArabicName: "دار القمر - منزل العلوم",
            arabicText: "الله متعال فرمود. قالوا أتعجبین من قضای الله رحمة الله و برکاته علیکم أهل البیت إنه حمید مجید. و سعد منقلب کوکبه الزهرة تدل على ورود کتاب من عند الاحباب و تدل على الاجتماع و الاتصال و تدل على قدوم الغائب. و هی علامة الافراح و تدل على الشموع الموقودة هذا الشکل یدل على الرزق الموجود و على دفع کید الحسود و على کثرة الافراح و الایام الملاة و انت ناوی على حرکة فیها برکة و ان سالت عن الغائب الذی قلبک من اجله فی متاعب و قلبه من اجلک فی لظی و وجد فانه یاتیک بکل السعد و ان شاء الله عن قریب قادم و یاتی الیک سالم و ان سالت عن الحمل فانه ذکر و لابد من بلوغ الامال و ان سالت من الزواج فانه صالح و الحج الیک ناجح و الفرح واصل و المقصود الیک حاصل و ان سالت عن المريض فان الشفاء من بعد الاسقام و نجات له من سائر الآلام و شموع عزک موقودة و الحواسد مكمودة و حاجتك مقضية و امورك مرضية و ان سالت عن المحبوب و غرام جدید فاترك المطلوب و اترك هواه فالولد فیه غیمة و البعد عنه غنیمة و الضائع یرد و العذول یصد و هنا لابد من قبض داخل اما نفسا او مالا او ضائعا او منصبا.",
            persianText: "خداوند متعال فرمود. گفتند: آیا از قضای خدا تعجب می‌کنی؟ رحمت خدا و برکات او بر شما اهل بیت باد. همانا او ستوده و بزرگوار است. و سعد (خوشبختی) تغییرکننده است ستاره‌اش زهره، نشان می‌دهد بر ورود کتاب از نزد دوستان و نشان می‌دهد بر اجتماع و ارتباط و نشان می‌دهد بر آمدن غایب. و آن علامت شادی‌ها است و نشان می‌دهد بر شمع‌های روشن. این شکل نشان می‌دهد بر روزی موجود و بر دفع نیرنگ حسود و بر زیادی شادی‌ها و روزهای پرنعمت. و تو قصد داری بر حرکتی که در آن برکت است. و اگر پرسیدی از غایبی که دل تو به خاطر او در رنج‌هاست و دل او به خاطر تو در آتش است و یافته، پس او می‌آید به سوی تو با همه خوشبختی و ان شاء الله به زودی می‌آید و می‌آید به سوی تو سالم. و اگر پرسیدی از حمل (بارداری)، پس آن پسر است و واجب است از رسیدن آرزوها. و اگر پرسیدی از ازدواج، پس آن شایسته است و حج به سوی تو موفق است و شادی می‌رسد و مقصود به سوی تو حاصل می‌شود. و اگر پرسیدی از بیمار، پس شفاست پس از بیماری‌ها و نجات برای او از همه دردها. و شمع‌های عزت تو روشن و حسودان خاموش و نیاز تو برآورده شده و کارهایت پسندیده است. و اگر پرسیدی از معشوق و عشق جدید، پس رها کن خواسته را و رها کن هوسش را، زیرا فرزند در آن ابری است و دوری از آن غنیمت است. گمشده بازمی‌گردد و عیب‌جو بازمی‌ایستد. و اینجا واجب است از گرفتن درونی خواه جان باشد یا مال یا گمشده یا مقام.",
            summary: "خبرهای خوب می‌آید. نامه یا پیام مثبت دریافت می‌کنی. غایب برمی‌گردد. کارت برکت دارد. ازدواج موفق است. بیمار بهبود می‌یابد.",
            shortResult: "همه چیز خوب پیش می‌رود، اقدام کن.",
            conclusion: "این خانه نشان‌دهنده آغاز، خلوص و روشنایی است. شخص در آستانه دریافت دانش و بینش جدید قرار دارد. در خواب چیزی می‌بیند که او را شگفت‌زده می‌کند و خیری از طرف آب یا سفر به او می‌رسد."
        },
        {
            id: 2,
            number: 2,
            name: "خندان",
            persianName: "خانه دوم: دار عطارد",
            arabicName: "له من الأشکال الاحیان او الضاحک",
            houseArabicName: "دار عطارد - منزل التجارة",
            arabicText: "قال تعالى :سلام علیکم طبتم فادخلوها خالدین ، یدل على الخیر والسعادة ویدل على کثرة التفکر والخوف . ان هذا الشکل سعد خارج کوکبة المشتری و هو دلیل العلم والدین والقضاء انة یدل على الامر الرشید وعلى بعد التنکید وعلى الامور الحمیدة والثورات الشدیدة وان سالت عن المريض فانة سالم والعذول من اجل صحته نادم ولا بد من الاجتماع بمن ترجو وصالة وتظفر بامالة وان سالت عن الحاجة فانها مقضیة بحرمة خیر البریة وانت الظافر بضدک وابشر بنجاح امرک وسعدک ولا بد از الرزق لک بغلام وتفرح به على کید الآم وان سالت عن الزواج فانة لک صالح وان کنت من اهل التجارة ففالح ورابح وان بعت لاتر الخسارة ولا بد از وقوع حرکة فیها برکة وان شالت عن ضائع فالفل مخیرا به بالشتات والان ولی وفاق ولا بد از زیارة بیت الله الحرام وتنال منة المقصود والمرام وذلک مدی الایام واللیالی ولا بد الیک من بلوغ الامال وان سالت عن الغائب فانة قادم والعذول من اجل قدومة نادم وان سالت عن سفر فانة معیق فاترك هذا العزم یا رفیق وان سالت عن الاسیر فانة ینجو من کل ضیر وهذا ما دل علیة الدلائل واخبرت عنة الاوائل.",
            persianText: "خداوند متعال فرمود: سلام بر شما، پاک شدید پس داخل آن شوید جاودانه. نشان می‌دهد بر خیر و خوشبختی و نشان می‌دهد بر زیادی تفکر و ترس. همانا این شکل سعد خارج است ستاره‌اش مشتری و او دلیل علم و دین و قضاست. همانا نشان می‌دهد بر امر درست و بر دوری از سخت‌گیری و بر کارهای ستوده و انقلاب‌های شدید. و اگر پرسیدی از بیمار، پس او سالم است و عیب‌جو به خاطر سلامتی‌اش پشیمان است. و واجب است از اجتماع با کسی که امید وصال او را داری و به آرزویت می‌رسی. و اگر پرسیدی از نیاز، پس آن برآورده شده است به حرمت بهترین آفریده. و تو پیروز بر دشمنت هستی و بشارت باد بر موفقیت کارت و خوشبختی‌ات. و واجب است از روزی برای تو با پسر و شاد می‌شوی به او بر نیرنگ بدکاران. و اگر پرسیدی از ازدواج، پس آن برای تو شایسته است. و اگر از اهل تجارت هستی، پس موفق و سودآور. و اگر فروختی نمی‌بینی زیان. و واجب است از وقوع حرکتی که در آن برکت است. و اگر پرسیدی از گمشده، پس فال خبر می‌دهد از او با پراکندگی و اکنون ولی وفاق است. و واجب است از زیارت خانه خدا (کعبه) و می‌رسی از آن مقصود و مراد. و آن تا روزها و شب‌هاست. و واجب است برای تو از رسیدن آرزوها. و اگر پرسیدی از غایب، پس او می‌آید و عیب‌جو به خاطر آمدنش پشیمان است. و اگر پرسیدی از سفر، پس آن مانع دارد، پس رها کن این عزم را ای رفیق. و اگر پرسیدی از اسیر، پس او نجات می‌یابد از هر زیانی. و این است آنچه نشان داد بر آن دلایل و خبر دادند از آن پیشینیان.",
            summary: "خیر و برکت در انتظار توست. تفکر کن اما ترس نداشته باش. کارت موفق می‌شود. سود مالی داری. سفر مبارک است.",
            shortResult: "شرایط مساعد است، با اعتماد به نفس پیش برو.",
            conclusion: "خانه ارتباطات، تجارت و دانش عملی. موفقیت در مذاکرات و امور مالی پیش‌بینی می‌شود. در کارهایش توفیق می‌یابد و گشایشی پس از تنگی می‌یابد."
        },
        {
            id: 3,
            number: 3,
            name: "آستانه درونی یا پرچم",
            persianName: "خانه سوم: دار الزهرة",
            arabicName: "له من الأشکال العتبة الداخلة او الرایة",
            houseArabicName: "دار الزهرة - منزل المحبة",
            arabicText: "قال تعالى : یا نار کونی بردا وسلاما علی ابراهیم ، یدل على صحة الجسم وقوة النفس وطول الحیاة والمعیشة الحسنة ویدل على السؤال عن خطبة او عشق او مودة او اتصال وعلى رجوع ما خرج من الید وصحة المريض ان هذا الشکل سعد داخل کوکبة الزهرة وهی دلیل العشق وقیل المشتری وکلاهما سعد وهی تدل على العز والتمکین وطیب القلب وحسن النیة ویدل على الخلاص من ید الظالمین ویدل على الفرح والسرور ولا بد از زوال المحذور وابشر بصلاح امرک فیما تطلبة وتمام سعدک ولا بد لک از الزواج فاعزم علیه بلا لجاج فالامور مرضیة والسفر طریقه مجلیة والوالی فاسمع القول والق الریب وان سالت عن غائب فان راجع سالم من بعد ما کان محیر الاشتات ولا تخش من کید الحاسدین وکن الى الله من الشاکرین فهذا المقال یدل على بلوغ الامال وابشر باجتماع الاحباب وان سالت عن السفر فان لک صالح والبیع والشراء فانک رابح ولا بد لک من الانتقال از مکان الى مکان وتنال من العز بعد الخسران والحذر ثم الحذر از اقوام مرادهم یرمونک فی بحر اللجج واستعن علیهم بالله والله یاتی بالفرح لکن احذر المخادع واذا لدیك نیة جدیدة فدرسها جیدا .",
            persianText: "خداوند متعال فرمود: ای آتش باش سرد و سالم بر ابراهیم. نشان می‌دهد بر سلامت جسم و قوت نفس و طول حیات و زندگی خوب و نشان می‌دهد بر سؤال از خواستگاری یا عشق یا محبت یا ارتباط و بر بازگشت آنچه خارج شد از دست و سلامت بیمار. همانا این شکل سعد داخل است ستاره‌اش زهره و آن دلیل عشق است و گفته شده مشتری و هر دوی آنها سعد هستند. و آن نشان می‌دهد بر عزت و توانمندی و پاکی قلب و حسن نیت و نشان می‌دهد بر خلاص از دست ستمگران و نشان می‌دهد بر شادی و خوشحالی. و واجب است از زوال ترسیده و بشارت باد بر صلاح کارت در آنچه می‌خواهی و تمام شدن خوشبختی‌ات. و واجب است برای تو از ازدواج پس مصمم شو بر آن بدون لجاجت. پس کارها پسندیده است و سفر راهش روشن است و والی پس بشنو سخن را و دور کن شک را. و اگر پرسیدی از غایب، پس بازگردنده سالم است پس از آنکه بود سرگردان پراکنده‌ها. و مترس از نیرنگ حسودان و باش به سوی خدا از شاکران. پس این سخن نشان می‌دهد بر رسیدن آرزوها و بشارت باد بر اجتماع دوستان. و اگر پرسیدی از سفر، پس برای تو شایسته است و خرید و فروش پس تو سودآور هستی. و واجب است برای تو از انتقال از مکانی به مکانی و می‌رسی از عزت پس از زیان. و احتیاط سپس احتیاط از گروه‌هایی که قصدشان انداختن توست در دریای ژرف. و کمک بگیر بر آنها از خدا و خدا می‌آورد شادی را. لکن احتیاط کن از فریبکار. و اگر نزد تو نیت جدیدی است پس مطالعه کن آن را خوب.",
            summary: "سلامتی و طول عمر داری. عشق و محبت در راه است. از مشکلات رها می‌شوی. تصمیم‌گیری‌هایت درست است.",
            shortResult: "موقعیت خوبی برای شروع رابطه یا کار جدید.",
            conclusion: "خانه عشق، هنر و زیبایی. روابط عاطفی تقویت می‌شود و شادی در راه است. خبری خوش به او می‌رسد و کاری که منتظرش بود به پایان می‌رسد."
        },
        {
            id: 4,
            number: 4,
            name: "سفیدی",
            persianName: "خانه چهارم: دار الشمس",
            arabicName: "له من الأشکال البیاض",
            houseArabicName: "دار الشمس - منزل السلطة",
            arabicText: "قال تعالى الحمد لله الذی اذهب عنا الحزن ان ربنا لغفور شکور . هذا الشکل سعد ثابت کوکبة القمر وهو دلیل النقلة والحرکات والاسفار والفتوح این الشکل یدل على الفرح والسرور ونجاح الامر ولا بد از قبض مال وتنصلح لک کل الاحوال والشخص الذی واقف فی طریقک یرددک عن الحرکات فاحمل من کل الاثبات والامر الذی انت ناوی علیه فتوکل على الله واقدم علیه کما انه ورائک شخص یغیر منك هذا ما دل علیة الشکل الرملی استیقظ از نومتک فالرزق الیک دان از غیر تعویق ببرکة النبی یوسف الصدیق وان سالت عن ضائع فالله اذن فی ذهابه ولا بد از الصبر وانت فی طلبه وان سالت عن الرجوع للزوجة الملیحة فکن مرادها لاجل ترک المنازعة وابشر بالعز المقیم والخیر العمیم وانت ناوی على امر تارة تتقدم وتارة تتاخر فاقدم علیه وارکن الیه وان سالت عن المحبوس فله ایاما قلائل وبالسرور یاتی الى المنازل والقوم التی انت بینهم فاترك مقالهم ولا تخش منهم فانت دونهم فی اعلا الرتب ولا تخف الانکال واکثر من التامل والفرح تری کثرة العطایا واذکر الله کثیرا وقل ( لا اله الا الله کثیرا ) بکرة واصیلا .",
            persianText: "خداوند متعال فرمود: ستایش خداوندی را که برد از ما غم را، همانا پروردگار ما آمرزنده سپاسگزار است. این شکل سعد ثابت است ستاره‌اش ماه و او دلیل انتقال و حرکت‌ها و سفرها و فتح‌هاست. این شکل نشان می‌دهد بر شادی و خوشحالی و موفقیت کار. و واجب است از گرفتن مال و درست می‌شود برای تو همه احوال. و شخصی که ایستاده در راه تو بازمی‌دارد تو را از حرکت‌ها. پس برگیر از هر اثباتی و کاری که تو قصد آن را داری پس توکل بر خدا کن و اقدام کن بر آن. همانا پشت سرت شخصی است که تغییر می‌دهد از تو. این است آنچه نشان داد بر آن شکل شنی. بیدار شو از خوابت پس روزی به سوی تو نزدیک است بدون مانع به برکت پیامبر یوسف صدیق. و اگر پرسیدی از گمشده، پس خدا اجازه داده در رفتنش. و واجب است از صبر و تو در طلب آن هستی. و اگر پرسیدی از بازگشت به زن زیبا، پس باش خواسته‌اش برای ترک منازعه و بشارت باد بر عزت پایدار و خیر فراوان. و تو قصد داری بر کاری گاهی پیش می‌روی و گاهی تأخیر می‌کنی. پس اقدام کن بر آن و تکیه کن بر آن. و اگر پرسیدی از محبوس، پس برای او روزهایی کمی است و با شادی می‌آید به خانه‌ها. و گروهی که تو در میان آنها هستی، پس رها کن سخنشان را و مترس از آنها. پس تو پایین‌تر از آنها هستی در بالاترین رتبه‌ها. و مترس از بازخواست و زیاد کن از تأمل و شادی. می‌بینی زیادی عطاها. و یاد کن خدا را زیاد و بگو (لا اله الا الله زیاد) صبحگاهان و شامگاهان.",
            summary: "غم‌ها می‌رود. موفقیت در کار. پول به دست می‌آوری. روزی نزدیک است. صبر نتیجه می‌دهد.",
            shortResult: "پس از سختی، آسانی می‌آید. امیدوار باش.",
            conclusion: "خانه قدرت، موفقیت و درخشش. شخصیت قوی و موفقیت در امور شغلی. در مقامش پیشرفت می‌کند و احترام مردم را به دست می‌آورد."
        },
        {
            id: 5,
            number: 5,
            name: "گونه پاک",
            persianName: "خانه پنجم: دار المريخ",
            arabicName: "له من الأشکال نقی الخد",
            houseArabicName: "دار المريخ - منزل الجهاد",
            arabicText: "قال تعالی : فاذا عزمت فتوکل . قیل ان کوکبة المریخ وهو دلیل الجند والسلاح والحرب هذا الشکل یدل على السعد القائم مع الخیرات ویدل على حصول المسرات ورایة الفرح لک تدوم ویدل على حیاة المريض وصحته وذهاب الامراض العارضة و رجوع الهارب ولا بد از زوال کل الهموم والبشرة بالعز بعد العناء وجلب المقصود مع بلوغ المنى والحاجة التی انت ناوی علیها فانها مقضیة وامورك مرضیة فاشکر رب البریة تنجو از الهم والغم و عن قریب یحصل لک المراد وتنجو از اعدائک والحساد واحذر من الدین لانة آفة کل شئ والامر الذی ناوی علیه فاقدم علیه والمسرات فانها الیک دانیة فعلیك بعمل الصلاح وتکون من اهل السماح وعلیك بعمل الاحسان تنال الاجر والامتنان ولا بد از الوصال فتامل فی کلمة نقی الخد فهی دلیل السعد وتبلغ مناك وتشمت بذلک اعدائک او وصل ببنت جمیلة لها قامة طويلة وان سالت عن الزواج فانه صالح والبیع والشراء یکون رابح وربما انت ناوی على الانتقال فترک المقال وان سالت عن غائب فدلالته انه یاتی ومعہ المکاسب والخدامة او المساعدة ابعده عنها لانها متعبة آه منها.",
            persianText: "خداوند متعال فرمود: پس هنگامی که تصمیم گرفتی پس توکل کن. گفته شده که ستاره مریخ و او دلیل لشکر و سلاح و جنگ است. این شکل نشان می‌دهد بر خوشبختی پایدار با نیکی‌ها و نشان می‌دهد بر رسیدن شادی‌ها و پرچم شادی برای تو پایدار است. و نشان می‌دهد بر زندگی بیمار و سلامتی‌اش و رفتن بیماری‌های عارضی و بازگشت فراری. و واجب است از زوال همه غم‌ها و بشارت به عزت پس از زحمت و آوردن مقصود با رسیدن آرزو. و نیازی که تو قصد آن را داری، پس آن برآورده شده است و کارهایت پسندیده است. پس شکر کن پروردگار آفرینش را، نجات می‌یابی از غم و اندوه. و به زودی حاصل می‌شود برای تو مراد و نجات می‌یابی از دشمنانت و حسودان. و احتیاط کن از دین (قرض) زیرا آن آفت هر چیزی است. و کاری که قصد آن را داری، پس اقدام کن بر آن. و شادی‌ها پس آنها به سوی تو نزدیک است. پس بر توست عمل صالح و باش از اهل بخشش. و بر توست عمل احسان، می‌رسی بر پاداش و سپاس. و واجب است از وصال. پس تأمل کن در کلمه 'گونه پاک'، زیرا آن دلیل خوشبختی است و می‌رسی بر آرزویت و شماتت می‌کنی به آن دشمنانت را. یا وصال کن با دختری زیبا که قامتی بلند دارد. و اگر پرسیدی از ازدواج، پس آن شایسته است و خرید و فروش می‌شود سودآور. و شاید تو قصد داری بر انتقال، پس رها کن سخن را. و اگر پرسیدی از غایب، پس نشانه‌اش این است که او می‌آید و با او سودها و خدمت یا کمک. دور کن آن را زیرا آن خسته کننده است، آه از آن.",
            summary: "خوشبختی همراه توست. بیمار بهبود می‌یابد. آرزوها برآورده می‌شود. شادی پایدار است.",
            shortResult: "بهترین زمان برای اقدامات مهم.",
            conclusion: "خانه انرژی، اقدام و مبارزه. نیاز به تلاش بیشتر دارد اما پیروزی در انتظار است. بر دشمنانش چیره می‌شود و خواسته‌اش را با جدیت و عزم به دست می‌آورد."
        },
        {
            id: 6,
            number: 6,
            name: "آستانه بیرونی",
            persianName: "خانه ششم: دار المشتری",
            arabicName: "له من الأشکال العتبة الخارجة",
            houseArabicName: "دار المشتری - منزل البركة",
            arabicText: "قال تعالى : والذین اذا اصابتهم مصیبة قالوا انا لله وانا الیه راجعون ..یدل على کثرة الهم والغم ولا بد از خروج شئ من الید ویدل على تلف الاحوال هذا الشکل نحس خارج وهی دلیل على الارذال من الناس کوکبها الذنب این الشکل یدل على الشرور وزوال السرور والامر الذی انت ناوی علیه لا تامن علیه وحالك عسیر فاترك هذا الضمیر لان لا تقع فی الاهوال فاترك هذه الفعال تنجو از القیل والقال والحاجة التی انت ناوی علیها فلا ترکن الیها فی هذا الوقت لانها فی این الوقت غیر مقضیة والامور فی این الان غیر مرضیة واصبر فان الصبر سلامة العجل ندامة ولا تقرب الضمان فان فیه الخسران وان سالت عن محبوب فانه غیر صدیق فالحذر منة لان لا تقع فی الضیق والحذر از اعدائک الجمیع لان لا تقع فی الامر الشنیع وانت ناوی على حرکة فلیس فی الوقت برکة فاصبر فان الصبر سلامة والعجلة الندامة وان سالت عن السفر فانه خطر وابعد عنه تامن منه وان سالت عن المريض فانه یکون فی ضرر فادعو یزول الضرر فامورك غیر موافقة والاوقات غیر لائقة وعلیك بالاکثار من یا نور یا لطیف یا الله 71 مرة فی کل وقت .",
            persianText: "خداوند متعال فرمود: و کسانی که هنگامی که به آنها مصیبتی رسید گفتند ما از آن خداییم و به سوی او بازمی‌گردیم. نشان می‌دهد بر زیادی غم و اندوه و واجب است از خارج شدن چیزی از دست و نشان می‌دهد بر تباهی احوال. این شکل نحس خارج است و آن دلیل بر پست‌ترین مردم است. ستاره‌اش ذنب (دنباله) است. این شکل نشان می‌دهد بر بدی‌ها و زوال شادی و کاری که تو قصد آن را داری، بر آن اطمینان نکن و حالت سخت است. پس رها کن این وجدان را زیرا نیفتی در بلاها. پس رها کن این کارها را نجات می‌یابی از حرف و حدیث. و نیازی که تو قصد آن را داری، پس تکیه نکن بر آن در این زمان زیرا آن در این زمان برآورده نشده است. و کارها در این هنگام پسندیده نیستند. و صبر کن زیرا صبر ایمنی است، عجله پشیمانی است. و نزدیک نشو به ضمانت زیرا در آن زیان است. و اگر پرسیدی از محبوب، پس او دوست نیست. پس احتیاط کن از او زیرا نیفتی در تنگی. و احتیاط کن از همه دشمنانت زیرا نیفتی در کار زشت. و تو قصد داری بر حرکتی، پس در این زمان برکتی نیست. پس صبر کن زیرا صبر ایمنی است و عجله پشیمانی. و اگر پرسیدی از سفر، پس آن خطرناک است و دور شو از آن، ایمن می‌شوی از آن. و اگر پرسیدی از بیمار، پس او در زیان است. پس دعا کن برطرف می‌شود زیان. پس کارهایت موافق نیست و اوقات مناسب نیست. و بر توست زیاد کردن از 'ای نور، ای لطیف، ای خدا' ۷۱ بار در هر زمان.",
            summary: "دوره‌ای سخت در پیش است. چیزی از دست می‌رود. شادی کم می‌شود. سفر نکن. تصمیم مهم نگیر.",
            shortResult: "صبر کن، این زمان مناسب اقدام نیست.",
            conclusion: "خانه برکت، رشد و خوش‌شانسی. بهترین خانه برای پیشرفت مالی و معنوی. روزی‌اش زیاد می‌شود و آرزویی که انتظارش را می‌کشید محقق می‌شود."
        },
        {
            id: 7,
            number: 7,
            name: "سرخی",
            persianName: "خانه هفتم: دار زحل",
            arabicName: "له من الأشکال الحمرة",
            houseArabicName: "دار زحل - منزل الصبر",
            arabicText: "قال تعلی : واصبر وما صبرک الا بالله ، لا بد از کتم السر والرجوع عن این الامر واحذر یفشی سرک للغیر وتدل على الفزع والخوف وانت تریید اتصال امراة ، ویدل على الحرق والنار ویدل على الخروج عن الطاعة وعلى ضیق الصدور این الشکل نحس کوکبه المریخ وهی دلیل العساکر والحرب والقتال واهراق الدماء این الشکل یدل على الامر الذی لا یفید لان فیه التعب الشدید ویدل على الملقاة بمن لا تریید تدل على ضیق الصدور والانفاس وان السفر مذموم وان سالت عن المريض فانه على خطر وربما زاد علی الاثر وان سالت عن ضائع فانه غیر قادم وتکون انت از اجله نادم وکن علی حذر از کید المنغصین واحذر من من معاشرة الخائنین واحذر من الناس الحاسدین فالفل یدل على الهوان وان سالت عن صدیق فانه خوان ولا تامن الیه فانه کاذب واترك هواه فانه غیر صاحب والامر الذی انت علیه ناوی فانه خطر وان فعلته یجلب لک الکدر وانه فی هذا الان لا یتحصل فاتركه واشتغل بالصبر وتحمل فان الاوقات فی این الان غیر موافقة والامور غیر لائقة فاترك این الضمیر فان فیه التعسیر والصبر سلامة والعجل ندامة واذکر یا لطیف یا رب واکثر منها یلطف بک الله فی این المراد.",
            persianText: "خداوند متعال فرمود: و صبر کن و نیست صبر تو مگر به خدا. واجب است از پنهان کردن راز و بازگشت از این کار. و احتیاط کن افشا شود رازت برای غیر. و نشان می‌دهد بر وحشت و ترس و تو می‌خواهی ارتباط با زنی. و نشان می‌دهد بر سوختن و آتش و نشان می‌دهد بر خروج از اطاعت و بر تنگی سینه‌ها. این شکل نحس است ستاره‌اش مریخ و آن دلیل لشکریان و جنگ و نبرد و ریختن خون‌هاست. این شکل نشان می‌دهد بر کاری که سودی ندارد زیرا در آن خستگی شدید است. و نشان می‌دهد بر ملاقات با کسی که نمی‌خواهی. نشان می‌دهد بر تنگی سینه‌ها و نفس‌ها و اینکه سفر نکوهیده است. و اگر پرسیدی از بیمار، پس او در خطر است و شاید افزوده شد بر اثر. و اگر پرسیدی از گمشده، پس او نمی‌آید و می‌شوی تو به خاطر آن پشیمان. و باش بر احتیاط از نیرنگ غم‌آوران. و احتیاط کن از معاشرت با خائنان. و احتیاط کن از مردم حسودان. پس فال نشان می‌دهد بر خواری. و اگر پرسیدی از دوست، پس او خیانتکار است و اطمینان نکن به او، زیرا او دروغگوست. و رها کن هوسش را زیرا او همراه نیست. و کاری که تو بر آن قصد داری، پس آن خطرناک است و اگر انجامش دهی می‌آورد برای تو پریشانی. و آن در این هنگام حاصل نمی‌شود. پس رها کنش و مشغول شو به صبر و تحمل. زیرا اوقات در این هنگام موافق نیست و کارها مناسب نیست. پس رها کن این وجدان را زیرا در آن دشواری است. و صبر ایمنی است و عجله پشیمانی. و یاد کن ای لطیف ای پروردگار و زیاد کن از آن، لطف می‌کند با تو خدا در این مراد.",
            summary: "خطر فاش شدن راز. ترس و نگرانی. آتش و آسیب. اعتماد نکن. سفر بد است.",
            shortResult: "مراقب باش، شرایط خطرناک است.",
            conclusion: "خانه آزمون، صبر و حکمت. نیاز به شکیبایی دارد اما نتیجه ارزشمند است. درس‌های ارزشمندی می‌آموزد و از تنگی به گشایش می‌رسد."
        },
        {
            id: 8,
            number: 8,
            name: "وارونه",
            persianName: "خانه هشتم: دار الثوابت",
            arabicName: "له من الأشکال الانکیس",
            houseArabicName: "دار الثوابت - منزل الأمان",
            arabicText: "قال تعالى : ان الله مع الصابرین وقال تعالى: وسیق الذین اتقوا ربهم الى الجنة زمرا ، هذا شکل نحییس دنیوی وهو بلاء واجره علی الله وعاقبته عند الله عظیمة ویدل على ان السائل فی تعکیس وتشویش من عبد اوامة او خادم او خادمة او خابع یا عامل ولا بد از المسالة عن غائب یا امراة او شئ تریید الاجتماع به وهو شئ یدل على فساد المسالة وهو نحس داخل کوکبة زحل یدل على التشویش والتعکیس والامر الذی انت ناوی علیه فعاقه ابلیس وکن علی حذر من الذی انت طالبة والطریق الذی انت سالکة فانة مذموم وان فعلته یجلب لک الغموم ویدل على فساد الدور وهدم القصور وعلى التعب والخیانة وقلة الامانة والامر الذی انت ناوی علیه فلا ترکن الیه واترك این المطلب تنجو از التعب ولا بد بعد التعب از زوال المحذور وتزول الشرور الامر فانه بعید وانت من جهة این فی تنکید فکن من اجل این الامر صابر وامهل ولا تکن خاسر وان نویت علی السفر فانه خطر ویدل على قلة الافراح وعلى قلة الوصل من الغانیات الملاة وان سالت عن الزواج فانه غیر صالح والامر غیر ناجح وان سالت عن ضائع فانه لا یرد والصبر سلامة العجلة الندامة واکثر از ذکر یانور یا حق کل یوم.",
            persianText: "خداوند متعال فرمود: همانا خدا با صابران است. و فرمود متعال: و رانده شدند کسانی که پرهیز کردند از پروردگارشان به سوی بهشت گروه گروه. این شکل نحس دنیوی است و آن بلایی است و پاداشش بر خداست و عاقبتش نزد خدا بزرگ است. و نشان می‌دهد که پرسشگر در وارونگی و آشفتگی است از بنده‌ای یا کنیزی یا خدمتکار مرد یا خدمتکار زن یا پیرو یا کارگر. و واجب است از پرسش از غایب یا زن یا چیزی که می‌خواهی اجتماع با آن. و آن چیزی است که نشان می‌دهد بر فساد پرسش. و آن نحس داخل است ستاره‌اش زحل. نشان می‌دهد بر آشفتگی و وارونگی. و کاری که تو قصد آن را داری، پس بازداردش شیطان. و باش بر احتیاط از آنکه تو طالب آن هستی. و راهی که تو رونده آن هستی، پس آن نکوهیده است. و اگر انجامش دهی می‌آورد برای تو غم‌ها. و نشان می‌دهد بر فساد دوران و ویرانی قصرها و بر خستگی و خیانت و کمی امانت. و کاری که تو قصد آن را داری، پس تکیه نکن بر آن و رها کن این طلب را، نجات می‌یابی از خستگی. و واجب است پس از خستگی از زوال ترسیده و می‌رود بدی‌ها. کار پس آن دور است و تو از جهت این در سخت‌گیری هستی. پس باش به خاطر این کار صابر و مهلت ده و نباش زیانکار. و اگر قصد کردی بر سفر، پس آن خطرناک است و نشان می‌دهد بر کمی شادی‌ها و بر کمی وصال از زنان زیبای پرنعمت. و اگر پرسیدی از ازدواج، پس آن شایسته نیست و کار موفق نیست. و اگر پرسیدی از گمشده، پس آن بازنمی‌گردد. و صبر ایمنی است، عجله پشیمانی. و زیاد کن از ذکر 'ای نور، ای حق' هر روز.",
            summary: "مشکلات پیچیده. خیانت و بی‌اعتمادی. کارها وارونه پیش می‌رود. ازدواج بد است.",
            shortResult: "همه چیز برعکس است، فعلاً کاری نکن.",
            conclusion: "خانه امنیت، ثبات و حمایت الهی. زمان خوبی برای برنامه‌ریزی بلندمدت. احساس حمایت می‌کند و در وقت سختی پناهگاهی می‌یابد."
        },
        {
            id: 9,
            number: 9,
            name: "پیروزی بیرونی",
            persianName: "خانه نهم: دار الأسرار",
            arabicName: "له من الأشکال النصرة الخارجة",
            houseArabicName: "دار الأسرار - منزل الكشف",
            arabicText: "یدل على صلاح بیت النفس والحیاة والاتصال وقضاء الحاجات وخدمة رجل جلیل القدر ، وهو دلیل المسرات الحسنة و الحاجات مقضیة ، این الشکل سعد خارج کوکبه الشمس وهو دلیل الملوک این الشکل یدل على صلاح الاسباب والنجاة من کل شدة وخراب ولا بد از الاجتماع بالاحباب ورجوع الغایب وان سالت عن المريض فانه یبرا من الاسقام ویزول عنه الالم وان سالت عن الزواج فانه صالح وفی التجارة فالح ورابح ولا بد لک من طریق فاعزم علیه یا رفیق وتری منه الخیر ویزول عنک الحزن والضیر والحاجات مقضیة والامور مرضیة وان کنت من ارباب الاقلام تنال الدرجات والخیرات مع المسرات والذی خرج من یدک فانه راجع لا شک فیه والخوان جزاؤه القطع من مرفقیه وعلى وجهك اثر غیض ففارقه ففی فراقه السلامة ومفارقته من الکرامة وانت مهموم فابشر بزوال الغموم وان سالت عن صدیق فاترکه تسلم من الوبال ویزول عنک الجدال فالفل سعید والرای سدید وان نویت السفر فان طریقه مجلیة والامور مرضیة والحاجات مقضیة فهذا الشکل یدل على بلوغ الامال ونیل الوصال فاشکر الله واظهر البشر .",
            persianText: "نشان می‌دهد بر صلاح خانه نفس و زندگی و ارتباط و برآورده شدن نیازها و خدمت مردی بزرگ‌قدر. و او دلیل شادی‌های خوب و نیازها برآورده شده است. این شکل سعد خارج است ستاره‌اش خورشید و او دلیل پادشاهان است. این شکل نشان می‌دهد بر صلاح اسباب و نجات از هر سختی و خرابی. و واجب است از اجتماع با دوستان و بازگشت غایب. و اگر پرسیدی از بیمار، پس او شفا می‌یابد از بیماری‌ها و می‌رود از او درد. و اگر پرسیدی از ازدواج، پس آن شایسته است و در تجارت موفق و سودآور. و واجب است برای تو از راهی پس مصمم شو بر آن ای رفیق. و می‌بینی از آن خیر و می‌رود از تو غم و زیان. و نیازها برآورده شده و کارها پسندیده است. و اگر از صاحبان قلم هستی، می‌رسی بر درجات و نیکی‌ها با شادی‌ها. و آنچه خارج شد از دست تو پس آن بازمی‌گردد، هیچ شکی در آن نیست. و خیانتکار پاداشش قطع از آرنج‌هایش است. و بر صورت تو اثر خشم است. پس جدا شو از او، پس در جدایی او ایمنی است و جدا شدنش از کرامت است. و تو غمگین هستی، پس بشارت باد بر زوال غم‌ها. و اگر پرسیدی از دوست، پس رها کنش، نجات می‌یابی از بلا و می‌رود از تو جدال. پس فال خوشبخت است و رأی درست. و اگر قصد کردی سفر، پس راهش روشن است و کارها پسندیده و نیازها برآورده شده. پس این شکل نشان می‌دهد بر رسیدن آرزوها و رسیدن به وصال. پس شکر کن خدا و نشان بده شادمانی را.",
            summary: "موفقیت بزرگ. حل مشکلات. دیدار دوستان. درمان بیماری. سود زیاد.",
            shortResult: "بهترین نتایج در انتظار توست.",
            conclusion: "خانه اسرار، کشف و شهود. زمان مناسبی برای مدیتیشن و درک عمیق‌تر. امری را که پنهان بود آشکار می‌کند. رازی می‌آموزد و حقیقتی که آشکار نبود را می‌بیند."
        },
        {
            id: 10,
            number: 10,
            name: "گره/بند",
            persianName: "خانه دهم: دار النور",
            arabicName: "له من الأشکال العقلة",
            houseArabicName: "دار النور - منزل الهداية",
            arabicText: "قال تعالى : ولا تمشی فی الارض مرحا انک لن تخرق الارض ولن تبلغ الجبال طولا . یدل على صلاح المسالة بعد تعویقها الشدید والطویل وعلى ان السؤال عن حامل او مسجون او عن شئ عن العین وهو یرید ای جتماع به واکثر ما تظهر هذه العقلة اما للضائع او المريض او اما للمتهم این الشکل کوکبة زحل وهو نحس وهی دلیل العقد والسحر والربط وهو دلیل على الصبر والانتظار فاذا اردت تسهیل امورک فافرق ذهنک از الکدورات ومارس التامل واقرأ یا قیوم بنورک اهتدیت یا رب71 فی کل وقت وانت مستلهم للنور فرح مسرور",
            persianText: "خداوند متعال فرمود: و راه مرو در زمین با سرمستی که تو هرگز نخواهی شکافت زمین و نخواهی رسید به کوه‌ها در بلندی. نشان می‌دهد بر صلاح پرسش پس از بازداشت شدید و طولانی آن. و بر اینکه پرسش از حامل (باردار) یا زندانی یا از چیزی از چشم (نظربندی) است. و آن می‌خواهد هر اجتماعی با آن. و بیشترین چیزی که ظاهر می‌شود این گره یا برای گمشده یا بیمار یا یا برای متهم. این شکل ستاره زحل است و آن نحس است. و آن دلیل گره و جادو و بستن است. و او دلیل بر صبر و انتظار است. پس اگر خواستی آسان کردن کارهایت، پس جدا کن ذهنت را از پریشانی‌ها و تمرین کن تأمل را و بخوان 'ای قیوم به نورت هدایت یافتم ای پروردگار' ۷۱ بار در هر وقت. و تو الهام‌گیرنده به نور، شاد خوشحال.",
            summary: "کارها گیر دارد. نیاز به صبر. مشکلات موقتی. چشم‌زخم احتمالی.",
            shortResult: "کمی صبر کن، گره باز می‌شود.",
            conclusion: "خانه روشنگری، هدایت و وضوح. سوالات شما پاسخ می‌یابند و راه روشن می‌شود. به صحت امر هدایت می‌شود و از حیرت خود خارج می‌شود."
        },
        {
            id: 11,
            number: 11,
            name: "اجتماع",
            persianName: "خانه یازدهم: دار الفتح",
            arabicName: "له من الأشکال الاجتماع",
            houseArabicName: "دار الفتح - منزل النصر",
            arabicText: "قال تعالى : وَتَرَى الْمَلَائِكَةَ حَافِّينَ مِنْ حَوْلِ الْعَرْشِ يُسَبِّحُونَ بِحَمْدِ رَبِّهِمْ وَقُضِيَ بَيْنَهُمْ بِالْحَقِّ وَقِيلَ الْحَمْدُ لِلهِ رَبِّ الْعَالَمِينَ ... . فیها بشری باجتماع بالمطلوب ونیل المرغوب ویدل على عافیة النفس وطیب العیش وکثرة الارزاق وعلى الاجتماع والمودة باهله والناس هذا الشکل سعد ثابت کوکبة عطارد وهو دلیل المجتـمعین والکتاب واصحاب الاقلام یدل على اجتماع غایب وحیاة مـریض وصحته واجتمـاعه بمطلوبه .",
            persianText: "خداوند متعال فرمود: و می‌بینی فرشتگان را حلقه زده از اطراف عرش، تسبیح می‌کنند به ستایش پروردگارشان و قضاوت شد میان آنها به حق و گفته شد ستایش خداوند پروردگار جهانیان را. در آن بشارتی است به اجتماع با خواسته و رسیدن به مراد. و نشان می‌دهد بر عافیت نفس و خوبی زندگی و زیادی روزی‌ها و بر اجتماع و محبت با اهلش و مردم. این شکل سعد ثابت است ستاره‌اش عطارد و او دلیل اجتماع‌کنندگان و کتاب و صاحبان قلم است. نشان می‌دهد بر اجتماع غایب و زندگی بیمار و سلامتی‌اش و اجتماعش با خواسته‌اش.",
            summary: "دیدارهای خوب. ارتباطات مثبت. بهبود بیماری. رسیدن به خواسته.",
            shortResult: "زمان مناسبی برای ملاقات و ارتباط.",
            conclusion: "خانه پیروزی، موفقیت و گشایش. پروژه‌ها به ثمر می‌رسند و موانع برداشته می‌شوند. خواسته‌اش را محقق می‌کند و بر دشمنش پیروز می‌شود. خداوند درهای خیر را به رویش می‌گشاید و کارش را برایش آسان می‌کند."
        },
        {
            id: 12,
            number: 12,
            name: "پیروزی درونی",
            persianName: "خانه دوازدهم: دار الرحمة",
            arabicName: "له من الأشکال النصرة الداخلة",
            houseArabicName: "دار الرحمة - منزل العفو",
            arabicText: "قال تعالى : یستبشرون بنعمة من الله وفضل و ان الله لا یضیع اجر المؤمنین ... النصرة الداخلة ما ظهر لمدیون الا قضی دینه ولا لمسجون الا فک سجنه ویدل على صلاح بیت النفس وقوتها وعلى صلاح الجسم والعفاف وحسن الظن وحسن الحال وعلى الارزق الداخل مشکلات النصرة الداخلة این الشکل سعد داخل کوکبة المشتری وهی دلیل العلماء واهل الدین والزهاد والعبادة والاکثار از ذکر یا هو یامن لا هو الا هو .. فیه خیر وبرکة .",
            persianText: "خداوند متعال فرمود: شاد می‌شوند به نعمتی از خدا و فضلی و اینکه خدا تباه نمی‌کند پاداش مؤمنان را... پیروزی درونی آنچه ظاهر شد برای بدهکار مگر اینکه ادا شد دینش و نه برای زندانی مگر اینکه گشوده شد زندانش. و نشان می‌دهد بر صلاح خانه نفس و قوت آن و بر صلاح جسم و پاکدامنی و حسن ظن و حسن حال و بر روزی درونی. مشکلات پیروزی درونی... این شکل سعد داخل است ستاره‌اش مشتری و آن دلیل علما و اهل دین و زاهدان و عبادت است. و زیادی از ذکر 'ای او، ای آنکه نیست او مگر او'... در آن خیر و برکت است.",
            summary: "آرامش درونی. حل مشکلات پنهان. روزی پنهان. معنویت قوی.",
            shortResult: "تمرکز بر باطن و معنویت.",
            conclusion: "خانه بخشش، آشتی و آرامش. زمان مناسبی برای حل اختلافات و بهبود روابط. با کسی که با او اختلاف داشت صلح می‌کند و احساس آرامش می‌کند."
        },
        {
            id: 13,
            number: 13,
            name: "راه",
            persianName: "خانه سیزدهم: دار الابتلاء",
            arabicName: "له من الأشکال الطریق",
            houseArabicName: "دار الابتلاء - منزل الامتحان",
            arabicText: "قال تعالى : وما النصر الا من عند الله . نصر وخیر مقبل سریع فلا تعب فیه من الان ویدل على عافیة الجسم وطول الحیاة ولا بد فی الضمیر از طلب حاجة واجتماع بشئ او علی سفر او علی نقلة او علی حرکة این الشکل سعد منقلب کوکبة القمر وهو دلیل المیاه والامطار یدل على السلامة والنجاة از الاعداء والخلاص از کل هم وغم .",
            persianText: "خداوند متعال فرمود: و نیست پیروزی مگر از نزد خدا. پیروزی و خیری پیش رو سریع، پس نیست خستگی در آن از اکنون. و نشان می‌دهد بر عافیت جسم و طول حیات. و واجب است در وجدان از طلب نیازی و اجتماعی با چیزی یا بر سفری یا بر انتقالی یا بر حرکتی. این شکل سعد منقلب است ستاره‌اش ماه و او دلیل آب‌ها و باران‌هاست. نشان می‌دهد بر ایمنی و نجات از دشمنان و خلاص از هر غم و اندوهی.",
            summary: "مسیر روشن. سفر خوب. نجات از دشمن. سلامتی کامل.",
            shortResult: "راهت باز است، برو جلو.",
            conclusion: "خانه آزمون و رشد شخصیتی. چالش‌ها فرصتی برای قوی‌تر شدن هستند. آزموده می‌شود تا پاک شود و صبر می‌کند تا موفق شود. از آن قوی‌تر و حکیم‌تر خارج می‌شود."
        },
        {
            id: 14,
            number: 14,
            name: "گرفتن بیرونی",
            persianName: "خانه چهاردهم: دار التمام",
            arabicName: "له من الأشکال القبض الخارج",
            houseArabicName: "دار التمام - منزل الختام",
            arabicText: "القبض الخارج فهو شئ قد خرج وصعب رجوعه او تحصله ناری ،، نحس ، ،،له کوکب وهمی یسمى الراس الراس والخوف فی جمیع الاشیاء وعین السائل وعین المسؤول فی الاول یدل صحة ما یخرج من الید ویدع الیه وصحة حیاة الامور.",
            persianText: "گرفتن بیرونی پس آن چیزی است که خارج شده و سخت بازگشتش یا به‌دست‌آوردنش آتشین است. نحس است. برای او ستاره‌ای خیالی است نامیده می‌شود الراس الراس. و ترس در همه چیزها. و چشم پرسشگر و چشم مسئول در اول. نشان می‌دهد سلامت آنچه خارج می‌شود از دست و دعوت به آن و سلامت زندگی کارها.",
            summary: "از دست دادن. ترس و نگرانی. شرایط مبهم.",
            shortResult: "مراقب از دست دادن باش.",
            conclusion: "خانه تکمیل و نتیجه‌گیری. پروژه‌ها به پایان می‌رسند و زحمات به ثمر می‌نشینند. آنچه را آغاز کرده به پایان می‌رساند و آنچه خواسته محقق می‌کند. به هدفش می‌رسد و ثمره کارش را درو می‌کند."
        },
        {
            id: 15,
            number: 15,
            name: "جماعت",
            persianName: "خانه پانزدهم: دار البدء",
            arabicName: "له من الأشکال الجماعة",
            houseArabicName: "دار البدء - منزل التجديد",
            arabicText: "قال تعالى : متکئین على رفراف خضر وعبقری حسان . تدل على بلوغ المطلوب والاجتماع بالمحبوب فعاقبته جیدة وان طال الانتظار وهو ممتزج سعد بنحس له کوکب عطارد وما یتفق بین الطالب والمطلوب تدل على نجد السائل وحیاته من العدم هناک ید غیبیة معک وهناک من یمدک بالعون فاکثر از یا قیوم بلطفک اهتدیت وبفضلك نجوت .",
            persianText: "خداوند متعال فرمود: تکیه‌کنان بر بالش‌هایی سبز و فرش‌هایی زیبا. نشان می‌دهد بر رسیدن به خواسته و اجتماع با محبوب. پس عاقبتش خوب است و اگر طولانی شد انتظار. و آن آمیخته است سعد (خوشبختی) با نحس (بدبختی). برای او ستاره عطارد است. و آنچه مطابق است میان طالب و مطلوب. نشان می‌دهد بر نجات پرسشگر و زندگی‌اش از نیستی. آنجاست دست غیبی با تو و آنجاست کسی که می‌دهد تو را با کمک. پس زیاد کن از 'ای قیوم به لطفت هدایت یافتم و به فضلت نجات یافتم.'",
            summary: "رسیدن به هدف. کمک غیبی. نتیجه خوب پس از انتظار.",
            shortResult: "با کمک دیگران به نتیجه می‌رسی.",
            conclusion: "خانه شروع‌های جدید و فرصت‌های تازه. زمان مناسبی برای آغاز پروژه‌های نو. زندگی جدیدی یا پروژه جدیدی را آغاز می‌کند. امیدش تجدید می‌شود و حالش بهبود می‌یابد."
        },
        {
            id: 16,
            number: 16,
            name: "گرفتن درونی",
            persianName: "خانه شانزدهم: دار الوصل",
            arabicName: "له من الأشکال القبض الداخل",
            houseArabicName: "دار الوصل - منزل اللقاء",
            arabicText: "قال تعالى : وَإِن يَمْسَسْكَ اللهُ بِضُرٍّ فَلاَ كَاشِفَ لَهُ إِلاَّ هُوَ وَإِن يُرِدْكَ بِخَيْرٍ فَلاَ رَآدَّ لِفَضْلِهِ يُصِيبُ بِهِ مَن يَشَاء مِنْ عِبَادِهِ وَهُوَ الْغَفُورُ الرَّحِيمُ ... سعد ، کوکبه الشمس والقبض الداخل لا تنساه یعطی کل سائل مناه شئ مقبل وداخل علیک خبر تسمع او رزق یاتی.",
            persianText: "خداوند متعال فرمود: و اگر برساند تو را خدا به زیانی پس نیست برطرف‌کننده‌ای برای آن مگر او و اگر بخواهد تو را به خیری پس نیست بازدارنده‌ای برای فضلش. می‌رساند به آن هر که بخواهد از بندگانش و اوست آمرزنده مهربان... سعد (خوشبختی) است، ستاره‌اش خورشید و گرفتن درونی فراموشش نکن. می‌دهد هر پرسشگری آرزویش را، چیزی پیش رو و درونی. بر تو خبری می‌شنوی یا روزی می‌آید.",
            summary: "دریافت پنهان. خبر خوب. روزی ناگهانی. برکت الهی.",
            shortResult: "چیزهای خوب به سمت تو می‌آیند.",
            conclusion: "خانه اتحاد، دیدار و ارتباطات. روابط تقویت می‌شود و دوری‌ها به وصال می‌رسد. با کسی که مشتاقش است ملاقات می‌کند و آرزوی غریب محقق می‌شود. پراکندگان جمع می‌شوند و پیوندها برقرار می‌گردد."
        }
        ];

        function getMokashefeData() {
            // منبع کامل پیش‌فرض (عربی + فارسی + نتیجه‌گیری) اولویت دارد
            // مگر اینکه داده ابر/ذخیره‌شده واقعاً کامل باشد (persianText یا conclusion داشته باشد)
            function isFullHouse(h) {
                return !!(h && (h.persianText || h.conclusion));
            }
            try {
                if (Array.isArray(window.__MOKASHEFE_16) && window.__MOKASHEFE_16.length) {
                    var c0 = window.__MOKASHEFE_16[0];
                    if (isFullHouse(c0)) return JSON.parse(JSON.stringify(window.__MOKASHEFE_16));
                }
                var saved = localStorage.getItem('mokashefeData');
                if (saved) {
                    var parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length && isFullHouse(parsed[0])) return parsed;
                }
            } catch(e) {}
            return JSON.parse(JSON.stringify(defaultMokashefeData));
        }

        // ============================================================
        // داده‌های اسماء الحسنی
        // ============================================================
        var asmaDatabase = {
            1:"الاحد",2:"الصمد",3:"الودود",4:"القدوس",5:"السلام",6:"المؤمن",7:"المهیمن",8:"العزیز",9:"الجبار",10:"المتکبر",
            11:"الخالق",12:"البارئ",13:"المصور",14:"الغفار",15:"القهار",16:"الوهاب",17:"الرزاق",18:"الفتاح",19:"العلیم",20:"القابض",
            21:"الباسط",22:"الخافض",23:"الرافع",24:"المعز",25:"المذل",26:"السمیع",27:"البصیر",28:"الحکم",29:"العدل",30:"اللطیف",
            31:"الخبیر",32:"الحلیم",33:"العظیم",34:"الغفور",35:"الشکور",36:"العلی",37:"الکبیر",38:"الحفیظ",39:"المقیت",40:"الحسیب",
            41:"الجلیل",42:"الکریم",43:"الرقیب",44:"المجیب",45:"الواسع",46:"الحکیم",47:"الودود",48:"المجید",49:"الباعث",50:"الشهید",
            51:"الحق",52:"الوکیل",53:"القوی",54:"المتین",55:"الولی",56:"الحمید",57:"المحصی",58:"المبدی",59:"المعید",60:"المحیی",
            61:"الممیت",62:"الحی",63:"القیوم",64:"الواجد",65:"الماجد",66:"الواحد",67:"الاحد",68:"الصمد",69:"القادر",70:"المقتدر",
            71:"المقدم",72:"المؤخر",73:"الاول",74:"الآخر",75:"الظاهر",76:"الباطن",77:"الوالی",78:"المتعالی",79:"البر",80:"التواب",
            81:"المنتقم",82:"العفو",83:"الرئوف",84:"مالک",85:"ذوالجلال",86:"المقسط",87:"الجامع",88:"الغنی",89:"المغنی",90:"المانع",
            91:"الضار",92:"النافع",93:"النور",94:"الهادی",95:"البدیع",96:"الباقی",97:"الوارث",98:"الرشید",99:"الصبور",100:"الرحمن",
            110:"العلی",130:"الغنی",132:"الرحمن",136:"الرحیم",168:"الحی",200:"القادر",232:"الرحیم",260:"العظیم",290:"الکریم",300:"الرحیم",320:"الرحمن",1000:"الغفور"
        };

        function findAsma(number) {
            if (asmaDatabase[number]) {
                return { found: true, exact: true, name: asmaDatabase[number], number: number };
            }
            var closest = null;
            var minDiff = Infinity;
            for (var key in asmaDatabase) {
                if (asmaDatabase.hasOwnProperty(key)) {
                    var diff = Math.abs(number - parseInt(key));
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = parseInt(key);
                    }
                }
            }
            if (closest !== null) {
                return { found: true, exact: false, name: asmaDatabase[closest], number: closest, diff: minDiff };
            }
            return { found: false };
        }

        function numberToAbjadLetters(number) {
            var abjadLetters = {
                1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط',10:'ی',20:'ک',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص',100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ',1000:'غ'
            };
            var letters = "";
            var temp = number;
            var values = [1000,900,800,700,600,500,400,300,200,100,90,80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1];
            for (var i = 0; i < values.length; i++) {
                while (temp >= values[i]) {
                    if (abjadLetters[values[i]]) {
                        letters += abjadLetters[values[i]];
                    }
                    temp -= values[i];
                }
            }
            return letters;
        }

        // ============================================================
        // محصولات پیش‌فرض
        // ============================================================
        var defaultProducts = [
            { id: 1, title: 'کتاب جفر و ابجد', price: 150000, image: '📚', badge: 'جدید', desc: 'آموزش کامل حروف ابجد، جفر و استخراج احکام عملی برای اهل فن.' },
            { id: 2, title: 'دوره آموزشی رمل', price: 350000, image: '🎲', badge: 'محبوب', desc: 'دوره جامع رمل امام علی علیه‌السلام همراه با مثال‌های کاربردی.' },
            { id: 3, title: 'تفسیر خواب حرفه‌ای', price: 200000, image: '💭', badge: '', desc: 'روش‌های تخصصی تعبیر خواب بر پایه روایات و تجربه عملی.' },
            { id: 4, title: 'کتاب اسماء الحسنی', price: 120000, image: '📖', badge: '', desc: 'شرح و خواص اسماء الحسنی برای ذکر، ختم و کارگشایی.' },
            { id: 5, title: 'دوره مکاشفه موکلین', price: 450000, image: '👁️', badge: 'ویژه', desc: 'آموزش مکاشفه و ارتباط صحیح با موکلین با رعایت آداب شرعی.' },
            { id: 6, title: 'مشاوره تخصصی', price: 300000, image: '🎯', badge: '', desc: 'جلسه مشاوره خصوصی با استاد برای مسائل شخصی و معنوی.' },
            { id: 7, title: 'طلسم و وفق کامل', price: 500000, image: '🧿', badge: 'ویژه', desc: 'تهیه طلسم و وفق بر اساس نام و حاجت متقاضی.' },
            { id: 8, title: 'استخراج موکل شخصی', price: 280000, image: '📿', badge: '', desc: 'استخراج نام موکل و دستورالعمل ذکر و عمل مربوطه.' },
            { id: 9, title: 'پکیج طالع‌بینی سالانه', price: 180000, image: '⭐', badge: '', desc: 'تحلیل طالع و ستاره سال بر اساس نام و تاریخ.' },
            { id: 10, title: 'دوره همزاد و قرین', price: 320000, image: '👥', badge: '', desc: 'شناخت همزاد و قرین و روش‌های تعامل صحیح.' },
            { id: 11, title: 'کتاب رمل پیشرفته', price: 220000, image: '📕', badge: 'جدید', desc: 'مباحث پیشرفته خانه‌های رمل و احکام ترکیبی.' },
            { id: 12, title: 'ذکر و ختم اختصاصی', price: 150000, image: '🕯️', badge: '', desc: 'برنامه ذکر و ختم متناسب با حاجت شما.' },
            { id: 13, title: 'تحلیل ازدواج', price: 250000, image: '💍', badge: '', desc: 'بررسی عاقبت و سازگاری ازدواج از طریق روش‌های سنتی.' },
            { id: 14, title: 'رفع مشکلات معنوی', price: 400000, image: '🛡️', badge: 'محبوب', desc: 'بررسی و راهنمایی برای مسائل چشم‌زخم، سحر و اضطراب معنوی.' },
            { id: 15, title: 'پکیج مبتدی علوم غریبه', price: 190000, image: '🌱', badge: '', desc: 'شروع امن و اصولی برای علاقه‌مندان تازه‌کار.' },
            { id: 16, title: 'کارت مشاوره تلفنی', price: 100000, image: '📞', badge: '', desc: 'یک جلسه تماس تلفنی با استاد در ساعات پاسخگویی.' },
            { id: 17, title: 'دوره ابجد عملی', price: 270000, image: '🔢', badge: '', desc: 'کاربرد ابجد در زندگی روزمره، انتخاب اسم و تصمیم‌گیری.' },
            { id: 18, title: 'پکیج کامل سالانه', price: 900000, image: '👑', badge: 'ویژه', desc: 'دسترسی یک‌ساله به دوره‌ها و مشاوره محدود ماهانه.' }
        ];

        function getProducts() {
            // sync fallback from cache
            try {
                var saved = localStorage.getItem('cafeProducts');
                if (saved) return JSON.parse(saved);
            } catch(e) {}
            return JSON.parse(JSON.stringify(defaultProducts));
        }

        async function loadProductsFromCloud() {
            var data = await sbGet('products');
            if (data && data.length > 0) {
                // normalize fields
                var mapped = data.map(function(r) {
                    return {
                        id: (r.local_id != null ? Number(r.local_id) : r.id),
                        cloudId: r.id,
                        title: r.title || r.name || '',
                        price: Number(r.price) || 0,
                        image: r.image || r.emoji || '📦',
                        imageUrl: r.image_url || r.imageUrl || (r.image && String(r.image).indexOf('http') === 0 ? r.image : '') || '',
                        badge: r.badge || '',
                        desc: r.desc || r.description || ''
                    };
                });
                localStorage.setItem('cafeProducts', JSON.stringify(mapped));
                return mapped;
            }
            return getProducts();
        }

        async function saveProducts(products) {
            if (typeof saveProductsSafe !== 'function') {
                throw new Error('ذخیرهٔ امن محصولات آماده نیست.');
            }
            var result = await saveProductsSafe(products);
            if (!result || !result.ok) {
                throw new Error((result && result.reason) || 'تأیید ذخیرهٔ محصولات از سرور دریافت نشد.');
            }
            return result;
        }

        async function loadProductsFromServerStrict() {
            if (!supabaseClient) return { ok:false, reason:'no-client' };
            try {
                var result = await supabaseClient.from('products').select('*').order('local_id', {ascending:true});
                if (result.error) throw result.error;
                var rows = Array.isArray(result.data) ? result.data : [];
                var mapped = rows.map(function(r) {
                    return {
                        id: r.local_id != null ? Number(r.local_id) : r.id,
                        cloudId: r.id,
                        title: r.title || r.name || '',
                        price: Number(r.price) || 0,
                        image: r.image || '📦',
                        imageUrl: r.image_url || '',
                        badge: r.badge || '',
                        desc: r.desc || r.description || ''
                    };
                });
                return { ok:true, products:mapped, rows:rows };
            } catch (e) {
                console.warn('strict products read', e);
                return { ok:false, reason:String(e && e.message || e) };
            }
        }

        async function syncProductsToCloud(products) {
            if (!supabaseClient) return { ok:false, reason:'no-client' };
            if (!Array.isArray(products)) return { ok:false, reason:'invalid-products' };
            try {
                // Read current server rows first, and preserve every column not edited by this UI.
                var current = await supabaseClient.from('products').select('*');
                if (current.error) throw current.error;
                var remoteRows = Array.isArray(current.data) ? current.data : [];
                var remoteByLocalId = {};
                remoteRows.forEach(function(r) {
                    if (r.local_id != null) remoteByLocalId[String(Number(r.local_id))] = r;
                });
                for (var j = 0; j < products.length; j++) {
                    var p = products[j];
                    var localId = Number(p.id);
                    if (!Number.isFinite(localId) || localId <= 0) {
                        return { ok:false, reason:'invalid-local-id', index:j };
                    }
                    var existing = remoteByLocalId[String(localId)] || null;
                    var row = Object.assign({}, existing || {}, {
                        local_id: localId,
                        title: String(p.title || ''),
                        price: Number(p.price) || 0,
                        image: p.image || '',
                        image_url: p.imageUrl || '',
                        badge: p.badge || '',
                        desc: p.desc || '',
                        is_active: existing && typeof existing.is_active === 'boolean' ? existing.is_active : true,
                        updated_at: new Date().toISOString()
                    });
                    var saved = await sbUpsert('products', row, 'local_id');
                    if (!saved || !saved.length) {
                        return { ok:false, reason:'server-write-failed', index:j, product:row.title };
                    }
                }
                return { ok:true, count: products.length };
            } catch (e) {
                console.warn('syncProductsToCloud', e);
                return { ok:false, reason: String(e && e.message || e) };
            }
        }
        window.syncProductsToCloud = syncProductsToCloud;
        window.saveProductsToServer = async function() {
            if (!supabaseClient) {
                if (typeof showNotification === 'function') showNotification('❌ اتصال سرور برقرار نیست.', 'error');
                return { ok:false, reason:'no-client' };
            }
            if (typeof showNotification === 'function') showNotification('⏳ در حال تازه‌سازی محصولات از سرور...');
            var result = await loadProductsFromServerStrict();
            if (!result || !result.ok) {
                if (typeof showNotification === 'function') showNotification('❌ خواندن محصولات از سرور ناموفق بود؛ دادهٔ محلی تغییر نکرد.', 'error');
                return result || { ok:false, reason:'server-read-failed' };
            }
            try { localStorage.setItem('cafeProducts', JSON.stringify(result.products)); } catch(e) {}
            if (typeof renderProducts === 'function') renderProducts();
            if (typeof renderAdminProducts === 'function') renderAdminProducts();
            if (typeof showNotification === 'function') showNotification('✅ فهرست محصولات از سرور تازه شد (' + result.products.length + ' مورد).');
            return { ok:true, count:result.products.length };
        };

        function renderProducts() {
            var grid = document.getElementById('productsGrid');
            if (!grid) return;
            var esc = (typeof window.kafeEscapeHtml === 'function') ? window.kafeEscapeHtml : (typeof escapeHtml === 'function' ? escapeHtml : function(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); });
            var products = ((typeof getProductsSafe === 'function') ? getProductsSafe() : getProducts()).slice(0, 18);
            var html = '';
            products.forEach(function(p) {
                var media = '';
                var safeImg = esc(p.image || '📦');
                var safeUrl = esc(p.imageUrl || '');
                if (p.imageUrl) {
                    media = '<div class="product-img-wrap"><img class="product-img" src="' + safeUrl + '" alt="" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div class=product-icon>' + safeImg + '</div>\';"></div>';
                } else {
                    media = '<div class="product-img-wrap"><div class="product-icon">' + safeImg + '</div></div>';
                }
                var safeId = String(p.id == null ? '' : p.id).replace(/'/g, '');
                var safeTitle = esc(p.title || '');
                var safeBadge = p.badge ? '<span class="product-badge">' + esc(p.badge) + '</span>' : '';
                html += '<div class="product-card" onclick="openProductDetail(\'' + safeId + '\')">' +
                    safeBadge +
                    media +
                    '<div class="product-name">' + safeTitle + '</div>' +
                    '<div class="product-price">' + Number(p.price).toLocaleString('fa-IR') + ' تومان</div>' +
                    '</div>';
            });
            grid.innerHTML = html;
        }

        function addCurrentProductToCart() {
            if (window._currentProduct) addToCart(window._currentProduct);
            else if (typeof showNotification==='function') showNotification('محصولی انتخاب نشده', 'error');
        }
        function openProductDetail(id) {
            document.body.classList.add('modal-open');
            var list = (typeof getProductsSafe === 'function') ? getProductsSafe() : (typeof getProducts === 'function' ? getProducts() : []);
            var p = list.find(function(x) { return String(x.id) === String(id); });
            if (!p) {
                if (typeof showNotification === 'function') showNotification('محصول پیدا نشد', 'error');
                return;
            }
            window._currentProduct = p;
            var img = document.getElementById('igProductImage');
            var em = document.getElementById('igProductEmoji');
            var ti = document.getElementById('igProductTitle');
            var pr = document.getElementById('igProductPrice');
            var de = document.getElementById('igProductDesc');
            if (p.imageUrl && img) {
                img.src = p.imageUrl;
                img.style.display = 'block';
                if (em) em.style.display = 'none';
                img.onerror = function() {
                    img.style.display = 'none';
                    if (em) { em.style.display = 'block'; em.textContent = p.image || '📦'; }
                };
            } else {
                if (img) img.style.display = 'none';
                if (em) { em.style.display = 'block'; em.textContent = p.image || '📦'; }
            }
            if (ti) ti.textContent = p.title;
            if (pr) pr.textContent = Number(p.price).toLocaleString('fa-IR') + ' تومان';
            if (de) de.textContent = p.desc || 'توضیحات این محصول به‌زودی تکمیل می‌شود.';
            ['orderName','orderPhone','orderNote','orderMotherName','orderNationalId','orderAddress','orderPostalCode','orderReceiverName','orderReceiverPhone','orderReceiverAddress','orderProductName'].forEach(function(i) {
                var el = document.getElementById(i); if (el) el.value = '';
            });
            var ri = document.getElementById('orderReceipt'); if (ri) ri.value = '';
            var pv = document.getElementById('orderReceiptPreview');
            if (pv) { pv.style.display = 'none'; pv.src = ''; }
            window._orderReceiptData = null;
            hideOnlineOrderForm(); if(typeof hideCallPurchaseInfo==='function') hideCallPurchaseInfo();
            var modal = document.getElementById('productDetailModal');
            if (modal) { modal.classList.add('active'); document.body.classList.add('modal-open'); }
        }

        window.closeProductDetail = function closeProductDetail() {
            try {
                document.body.classList.remove('modal-open');
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
            } catch (e) {}
            var modal = document.getElementById('productDetailModal');
            if (modal) modal.classList.remove('active');
            try {
                if (typeof hideOnlineOrderForm === 'function') hideOnlineOrderForm();
                if (typeof hideCallPurchaseInfo === 'function') hideCallPurchaseInfo();
            } catch (e) {}
            window._currentProduct = null;
            window._orderReceiptData = null;
        }

        
        /** داده حساس پرداخت: فقط حافظه نشست (نه localStorage دائمی) */
        function getSensitivePayCache() {
            try {
                if (window.__paymentContactCache && typeof window.__paymentContactCache === 'object') {
                    return window.__paymentContactCache;
                }
                var raw = sessionStorage.getItem('kafe_pay_contact');
                if (raw) {
                    var p = JSON.parse(raw);
                    window.__paymentContactCache = p;
                    return p;
                }
            } catch (e) {}
            return {};
        }
        function setSensitivePayCache(pay) {
            pay = pay || {};
            window.__paymentContactCache = {
                paymentCard: pay.paymentCard || pay.card || '',
                paymentSheba: pay.paymentSheba || pay.sheba || '',
                paymentOwner: pay.paymentOwner || pay.owner || ''
            };
            try {
                sessionStorage.setItem('kafe_pay_contact', JSON.stringify(window.__paymentContactCache));
            } catch (e) {}
        }
        /** انتقال کارت/شبا از localStorage قدیمی به session و پاک‌کردن از حافظه دائمی */
        function migrateSensitivePayOutOfLocalStorage() {
            try {
                var s = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
                if (!s || (!s.paymentCard && !s.paymentSheba)) return;
                var cur = getSensitivePayCache();
                setSensitivePayCache({
                    paymentCard: cur.paymentCard || s.paymentCard || '',
                    paymentSheba: cur.paymentSheba || s.paymentSheba || '',
                    paymentOwner: cur.paymentOwner || s.paymentOwner || ''
                });
                delete s.paymentCard;
                delete s.paymentSheba;
                // owner و guide غیرحساس‌ترند؛ owner را می‌توان در local نگه داشت
                localStorage.setItem('cafeSettings', JSON.stringify(s));
            } catch (e) {}
        }
        function getAdminContact() {
            migrateSensitivePayOutOfLocalStorage();
            var phone = '09392979200';
            var hours = 'پنج‌روز هفته، ۱۸ الی ۲۱ — جمعه و دوشنبه پاسخ‌گو نیستیم؛ پیام بگذارید';
            var card = '';
            var sheba = '';
            var owner = '';
            var guide = 'پس از واریز، فیش را در همین فرم آپلود کنید.';
            try {
                var s = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
                if (s.managerPhone) phone = s.managerPhone;
                if (s.managerHours) hours = s.managerHours;
                if (s.paymentOwner) owner = s.paymentOwner;
                if (s.paymentGuide) guide = s.paymentGuide;
                // کارت/شبا دیگر از localStorage خوانده نمی‌شوند (امنیت)
            } catch (e) {}
            var pay = getSensitivePayCache();
            if (pay.paymentCard) card = pay.paymentCard;
            if (pay.paymentSheba) sheba = pay.paymentSheba;
            if (pay.paymentOwner) owner = pay.paymentOwner;
            return { phone: phone, hours: hours, card: card, sheba: sheba, owner: owner, guide: guide };
        }
        /** بارگذاری کارت/شبا از سرور به حافظه نشست */
        async function refreshPaymentContactFromCloud() {
            try {
                if (!supabaseClient) return false;
                var r = await supabaseClient.from('app_settings').select('key,value').eq('key', 'admin:cafeSettings').maybeSingle();
                if (r.error || !r.data || !r.data.value) return false;
                var val = r.data.value;
                if (typeof val === 'string') {
                    try { val = JSON.parse(val); } catch (e) { return false; }
                }
                if (!val || typeof val !== 'object') return false;
                setSensitivePayCache({
                    paymentCard: val.paymentCard || '',
                    paymentSheba: val.paymentSheba || '',
                    paymentOwner: val.paymentOwner || ''
                });
                // فیلدهای غیرحساس را در local هم هم‌خوان کن
                try {
                    var s = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
                    if (val.managerPhone) s.managerPhone = val.managerPhone;
                    if (val.managerHours) s.managerHours = val.managerHours;
                    if (val.paymentGuide) s.paymentGuide = val.paymentGuide;
                    if (val.paymentOwner) s.paymentOwner = val.paymentOwner;
                    delete s.paymentCard;
                    delete s.paymentSheba;
                    localStorage.setItem('cafeSettings', JSON.stringify(s));
                } catch (e2) {}
                return true;
            } catch (e) {
                console.warn('refreshPaymentContactFromCloud', e);
                return false;
            }
        }
        window.refreshPaymentContactFromCloud = refreshPaymentContactFromCloud;
        function fillPaymentInfoUI() {
            function apply() {
                var c = getAdminContact();
                var elCard = document.getElementById('orderPaymentCard');
                var elSheba = document.getElementById('orderPaymentSheba');
                var elOwner = document.getElementById('orderPaymentOwner');
                var elGuide = document.getElementById('orderPaymentGuide');
                if (elCard) elCard.textContent = c.card || 'توسط مدیریت تنظیم نشده';
                if (elSheba) elSheba.textContent = c.sheba || '—';
                if (elOwner) elOwner.textContent = c.owner || '—';
                if (elGuide) elGuide.textContent = c.guide || '';
                // فقط فرم‌های خرید (محصول / اشتراک) — نه صفحه فروشگاه
                var subCard = document.getElementById('subPaymentCard');
                var subSheba = document.getElementById('subPaymentSheba');
                var subOwner = document.getElementById('subPaymentOwner');
                if (subCard) subCard.textContent = c.card || 'توسط مدیریت تنظیم نشده';
                if (subSheba) subSheba.textContent = c.sheba || '—';
                if (subOwner) subOwner.textContent = c.owner || '—';
            }
            apply();
            // از سرور تازه کن (بدون بلاک کردن UI)
            if (typeof refreshPaymentContactFromCloud === 'function') {
                refreshPaymentContactFromCloud().then(function(ok){ if (ok) apply(); }).catch(function(){});
            }
        }
        window.copyPaymentCard = function copyPaymentCard() {
            var c = getAdminContact();
            var text = (c.card || '').replace(/\s/g, '');
            if (!text) {
                if (typeof showNotification === 'function') showNotification('شماره کارت هنوز تنظیم نشده', 'error');
                return;
            }
            function ok(){ if (typeof showNotification === 'function') showNotification('✅ شماره کارت کپی شد'); }
            function fail(){ if (typeof showNotification === 'function') showNotification('کپی نشد؛ دستی انتخاب کنید', 'error'); }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(ok).catch(fail);
            } else {
                try {
                    var ta = document.createElement('textarea');
                    ta.value = text; document.body.appendChild(ta); ta.select();
                    document.execCommand('copy'); document.body.removeChild(ta); ok();
                } catch (e) { fail(); }
            }
        }
        window.fillPaymentInfoUI = fillPaymentInfoUI;
        window.copyPaymentCard = copyPaymentCard;
        function toggleSameAddress() {
            var same = document.getElementById('orderSameAddress');
            var addr = document.getElementById('orderAddress');
            var recv = document.getElementById('orderReceiverAddress');
            if (same && same.checked && addr && recv) recv.value = addr.value;
        }
        window.showOnlineOrderForm = function showOnlineOrderForm() {
            var form = document.getElementById('igOrderForm');
            var callInfo = document.getElementById('igCallInfo');
            var actions = document.getElementById('igBuyActions');
            if (callInfo) callInfo.classList.remove('show');
            if (form) form.classList.add('show');
            if (actions) actions.style.display = 'none';
            var p = window._currentProduct;
            var pn = document.getElementById('orderProductName');
            if (pn && p) pn.value = p.title || '';
            if (typeof fillPaymentInfoUI === 'function') fillPaymentInfoUI();
        }
        window.hideOnlineOrderForm = function hideOnlineOrderForm() {
            var form = document.getElementById('igOrderForm');
            var actions = document.getElementById('igBuyActions');
            if (form) form.classList.remove('show');
            if (actions) actions.style.display = 'flex';
        }
        function showCallPurchaseInfo() {
            var form = document.getElementById('igOrderForm');
            var callInfo = document.getElementById('igCallInfo');
            var actions = document.getElementById('igBuyActions');
            if (form) form.classList.remove('show');
            if (callInfo) callInfo.classList.add('show');
            if (actions) actions.style.display = 'none';
            var contact = getAdminContact();
            var elP = document.getElementById('callAdminPhone');
            var elH = document.getElementById('callAdminHours');
            if (elP) elP.textContent = contact.phone;
            if (elH) elH.textContent = contact.hours;
            var p = window._currentProduct;
            if (p) {
                try {
                    var orders = JSON.parse(localStorage.getItem('cafeOrders') || '[]');
                    if (!Array.isArray(orders)) orders = [];
                    orders.unshift({
                        id: Date.now(), productId: p.id, product: p.title, price: p.price,
                        type: 'call', status: 'در انتظار تماس', date: new Date().toLocaleString('fa-IR')
                    });
                    localStorage.setItem('cafeOrders', JSON.stringify(orders));
                    if (typeof sbAdd === 'function') {
                        sbAdd('orders', {
                            name: '', phone: '', productName: p.title, productPrice: p.price,
                            details: 'درخواست تماس', status: 'در انتظار تماس',
                            date: new Date().toLocaleString('fa-IR'), type: 'call'
                        });
                    }
                } catch (e) {}
            }
        }
        window.hideCallPurchaseInfo = function hideCallPurchaseInfo() {
            var callInfo = document.getElementById('igCallInfo');
            var actions = document.getElementById('igBuyActions');
            if (callInfo) callInfo.classList.remove('show');
            if (actions) actions.style.display = 'flex';
        }
        window.dialAdminPhone = function dialAdminPhone() {
            var contact = getAdminContact();
            var p = window._currentProduct;
            if (typeof showNotification === 'function') {
                showNotification('📞 در حال تماس برای «' + (p ? p.title : 'سفارش') + '»');
            }
            try { window.location.href = 'tel:' + String(contact.phone).replace(/\s/g, ''); } catch (e) {}
        }

async function submitProductOrder() {
            var val = function(id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
            var name = val('orderName');
            var mother = val('orderMotherName');
            var nationalId = val('orderNationalId');
            var phone = val('orderPhone');
            var address = val('orderAddress');
            var postal = val('orderPostalCode');
            var receiverName = val('orderReceiverName');
            var receiverPhone = val('orderReceiverPhone');
            var receiverAddress = val('orderReceiverAddress');
            var note = val('orderNote');
            var productName = val('orderProductName');
            var p = window._currentProduct;

            if (!name || !mother || !nationalId || !phone || !address || !postal || !receiverName || !receiverPhone || !receiverAddress) {
                showNotification('❌ لطفاً تمام فیلدهای ستاره‌دار را پر کنید', 'error');
                return;
            }
            if (!/^09\d{9}$/.test(phone) && !/^09\d{9}$/.test(phone.replace(/\s/g,''))) {
                // soft check
            }
            if (nationalId.length !== 10 || !/^\d{10}$/.test(nationalId)) {
                showNotification('❌ کد ملی باید ۱۰ رقم باشد', 'error');
                return;
            }
            if (!window._orderReceiptData) {
                showNotification('❌ تصویر فیش واریزی الزامی است', 'error');
                return;
            }

            var orders = [];
            try { orders = JSON.parse(localStorage.getItem('cafeOrders') || '[]'); } catch (e) {}
            if (!Array.isArray(orders)) orders = [];
            var order = {
                id: Date.now(),
                productId: p ? p.id : null,
                product: productName || (p ? p.title : ''),
                price: p ? p.price : 0,
                name: name,
                motherName: mother,
                nationalId: nationalId,
                phone: phone,
                address: address,
                postalCode: postal,
                receiverName: receiverName,
                receiverPhone: receiverPhone,
                receiverAddress: receiverAddress,
                note: note,
                hasReceipt: true,
                receiptData: '',
                type: 'online',
                status: 'در انتظار تایید فیش',
                date: new Date().toLocaleString('fa-IR')
            };
            if (!supabaseClient || !supabaseClient.auth) {
                showNotification('❌ اتصال آنلاین در دسترس نیست؛ سفارش ثبت نشد', 'error');
                return;
            }
            var authState;
            try {
                authState = await supabaseClient.auth.getSession();
            } catch (authError) {
                showNotification('❌ بررسی نشست آنلاین ناموفق بود؛ سفارش ثبت نشد', 'error');
                return;
            }
            var session = authState && authState.data && authState.data.session;
            if (!authState || authState.error || !session || !session.user) {
                showNotification('❌ ابتدا وارد حساب کاربری شوید؛ سفارش ثبت نشد', 'error');
                return;
            }
            var receiptPath = await sbUploadReceipt(window._orderReceiptData, order.id);
            if (!receiptPath) {
                showNotification('❌ بارگذاری فیش در سرور انجام نشد؛ سفارش ثبت نشد', 'error');
                return;
            }
            var cloudRow = {
                local_id: order.id, user_id: session.user.id, name: name, phone: phone, customer_name:name, customer_phone:phone, shipping_address:address, notes:note,
                productName: order.product, productPrice: order.price,
                details: JSON.stringify({motherName:mother,nationalId:nationalId,address:address,postalCode:postal,receiverName:receiverName,receiverPhone:receiverPhone,receiverAddress:receiverAddress,note:note,hasReceipt:true}),
                receipt_path: receiptPath, has_receipt: true, status: order.status, date: order.date, type: order.type
            };
            var cloudResult = await sbAdd('orders', cloudRow);
            if (!cloudResult) {
                showNotification('❌ ثبت سفارش در سرور انجام نشد؛ سفارش محلی ذخیره نشد', 'error');
                return;
            }
            orders.unshift(order);
            try { localStorage.setItem('cafeOrders', JSON.stringify(orders.slice(0,200))); } catch(e) {}
            try {
                var hist = JSON.parse(localStorage.getItem('userPurchases') || '[]');
                if (!Array.isArray(hist)) hist = [];
                hist.unshift({ id: Date.now(), product: productName || (p && p.title) || '', price: p ? p.price : 0, date: new Date().toISOString(), status: 'در انتظار تایید' });
                localStorage.setItem('userPurchases', JSON.stringify(hist.slice(0, 100)));
            } catch (e) {}

            window._orderReceiptData = null;
            if (window._cartCheckoutMode) {
                try { localStorage.setItem('cafeCart', '[]'); } catch (e) {}
                window._cartCheckoutMode = false;
                if (typeof updateCartBadge === 'function') updateCartBadge();
            }
            showNotification('✅ سفارش ثبت شد و در انتظار تایید فیش است');
            hideOnlineOrderForm();
            closeProductDetail();
        }

        function previewReceipt(event) {
            var input = event && event.target ? event.target : document.getElementById('orderReceipt');
            var file = input && input.files && input.files[0] ? input.files[0] : null;
            var prev = document.getElementById('orderReceiptPreview');
            window._orderReceiptData = null;
            if (!file) {
                if (prev) { prev.style.display = 'none'; prev.removeAttribute('src'); }
                return;
            }
            var maxBytes = 3 * 1024 * 1024; // 3MB
            if (file.size > maxBytes) {
                if (typeof showNotification === 'function') showNotification('حجم فیش حداکثر ۳ مگابایت باشد', 'error');
                try { input.value = ''; } catch (e) {}
                if (prev) { prev.style.display = 'none'; prev.removeAttribute('src'); }
                return;
            }
            if (!/^image\//i.test(file.type || '')) {
                if (typeof showNotification === 'function') showNotification('فقط فایل تصویری مجاز است', 'error');
                try { input.value = ''; } catch (e) {}
                return;
            }
            var reader = new FileReader();
            reader.onload = function() {
                window._orderReceiptData = reader.result;
                if (prev) {
                    prev.src = reader.result;
                    prev.style.display = 'block';
                }
            };
            reader.onerror = function() {
                if (typeof showNotification === 'function') showNotification('خواندن فایل ناموفق بود', 'error');
            };
            reader.readAsDataURL(file);
        }

        
        // ============================================================
        // منطق مودال‌ها (همه از فایل اول)
        // ============================================================

        // 1. سبب القادم
        window.calculateSabab = function calculateSabab() {
            var name = document.getElementById('sababName').value.trim();
            var mother = document.getElementById('sababMother').value.trim();
            var day = document.getElementById('sababDay').value;
            if (!name || !mother) {
                showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
                return;
            }
            var nv = calculateAbjad(name, 'kabir');
            var mv = calculateAbjad(mother, 'kabir');
            var dv = calculateAbjad(day, 'kabir');
            var total = nv + mv + dv;
            var result = reduceByX(total, 7);
            var results = {
                1: 'برای مصلحت خاص (مربوط به یک هدف و نیت ویژه)',
                2: 'برای فکر فاسد (ناشی از تفکرات نادرست و منفی)',
                3: 'برای دزدی (مربوط به مال و اموال دیگران)',
                4: 'برای انجام کار خیر (نیت نیک و رفتار پسندیده)',
                5: 'برای انجام کار شر (عمل ناپسند و آسیب‌رسان)',
                6: 'به خاطر فساد بین زنان (ناشی از اختلافات و مشکلات میان زنان)',
                7: 'برای محبت (برآمده از عشق و علاقه قلبی)'
            };
            var steps = document.getElementById('sababCalcSteps');
            if (steps) {
                steps.style.display = 'none'; // محاسبات پنهان از کاربر
                setElementText('sababStep1', 'ابجد «' + name + '» = ' + nv);
                setElementText('sababStep2', 'ابجد مادر «' + mother + '» = ' + mv);
                setElementText('sababStep3', 'ابجد روز «' + day + '» = ' + dv);
                setElementText('sababStep4', 'جمع کل = ' + nv + ' + ' + mv + ' + ' + dv + ' = ' + total);
                setElementText('sababStep5', 'حاصل ۷–۷ = ' + result);
            }
            var __n=document.getElementById('sababNumber'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('sababDescription', results[result] || '');
            document.getElementById('sababResult').style.display = 'block';
            showNotification('محاسبه سبب القادم با موفقیت انجام شد');
        }

        // 2. محبت
        window.calculateMohabbat = function calculateMohabbat() {
            var w = document.getElementById('womanName').value.trim();
            var m = document.getElementById('manName').value.trim();
            if (!w || !m) {
                showNotification('لطفاً هر دو اسم را وارد کنید', 'error');
                return;
            }
            var wv = calculateAbjad(w, 'kabir');
            var mv = calculateAbjad(m, 'kabir');
            var result = reduceByX(wv + mv, 3);
            var results = {
                1: 'زن، مرد را دوست دارد (علاقه قلبی و صمیمیت وجود دارد)',
                2: 'زن، مرد را دوست ندارد (بهتر است انتظارات خود را تعدیل کنید)',
                3: 'وضعیت بین دوست داشتن و نداشتن است (نیاز به زمان و شناخت بیشتر دارد)'
            };
            var steps = document.getElementById('mohabbatCalcSteps');
            if (steps) {
                steps.style.display = 'none'; // محاسبات پنهان از کاربر
                setElementText('mohabbatStep1', 'ابجد زن «' + w + '» = ' + wv);
                setElementText('mohabbatStep2', 'ابجد مرد «' + m + '» = ' + mv);
                setElementText('mohabbatStep3', 'حاصل ۳–۳ = ' + result);
            }
            var __n=document.getElementById('mohabbatNumber'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('mohabbatDescription', results[result] || '');
            document.getElementById('mohabbatResult').style.display = 'block';
            showNotification('محاسبه محبت زن به مرد با موفقیت انجام شد');
        }

        // 3. راستگو
        window.calculateRastegoo = function calculateRastegoo() {
            var name = document.getElementById('rastegooName').value.trim();
            var day = document.getElementById('rastegooDay').value;
            if (!name) {
                showNotification('لطفاً اسم گوینده را وارد کنید', 'error');
                return;
            }
            var isTruthful = (calculateAbjad(name, 'kabir') + calculateAbjad(day, 'kabir')) % 2 === 1;
            setElementText('rastegooValue', isTruthful ? 'گوینده راستگو است' : 'گوینده دروغگو است');
            setElementText('rastegooDescription', isTruthful ?
                'این شخص حقیقت را می‌گوید و قابل اعتماد است.' :
                'گفته‌های این شخص نیاز به بررسی بیشتر دارد.');
            document.getElementById('rastegooResult').style.display = 'block';
            showNotification('تشخیص راستگویی انجام شد');
        }

        // 3b. شفای بیمار
        window.calculateBehbood = function calculateBehbood() {
            var name = document.getElementById('behboodName').value.trim();
            var mother = document.getElementById('behboodMother').value.trim();
            if (!name || !mother) {
                showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
                return;
            }
            var willRecover = reduceByX(calculateAbjad(name, 'kabir') + calculateAbjad(mother, 'kabir'), 12) % 2 === 1;
            setElementText('behboodValue', willRecover ? 'بیمار بهبود می‌یابد' : 'بیمار بهبود نمی‌یابد');
            setElementText('behboodDescription', willRecover ?
                'به اذن خداوند، بیمار شفا خواهد یافت.' :
                'نیاز به مراقبت و درمان بیشتر دارد.');
            document.getElementById('behboodResult').style.display = 'block';
            showNotification('تشخیص بهبود بیمار انجام شد');
        }

        // 4. شراکت
        window.calculateSherkat = function calculateSherkat() {
            var s1 = document.getElementById('sharik1').value.trim();
            var s2 = document.getElementById('sharik2').value.trim();
            if (!s1 || !s2) {
                showNotification('لطفاً اسم هر دو شریک را وارد کنید', 'error');
                return;
            }
            var result = calculateRemainder(calculateAbjad(s1, 'kabir') + calculateAbjad(s2, 'kabir'), 3);
            var results = { 1: 'سودی نخواهد بود', 2: 'به تدریج پیشرفت خواهد کرد', 3: 'خیر، برکت و تداوم دارد' };
            var __n=document.getElementById('sherkatValue'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('sherkatDescription', results[result] || '');
            document.getElementById('sherkatResult').style.display = 'block';
            showNotification('محاسبه شراکت تجاری انجام شد');
        }

        // 4b. دوست/دشمن
        window.calculateDost = function calculateDost() {
            var day = document.getElementById('dostDay').value;
            var name = document.getElementById('dostName').value.trim();
            var mother = document.getElementById('dostMother').value.trim();
            if (!day || !name || !mother) {
                showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
                return;
            }
            var result = reduceByX(calculateAbjad(day, 'kabir') + calculateAbjad(name, 'kabir') + calculateAbjad(mother, 'kabir'), 4);
            var results = { 1: 'دشمن تو است', 2: 'دوست تو است', 3: 'در ظاهر دوست تو است', 4: 'هیچ خیری برای تو در او نیست' };
            var __n=document.getElementById('dostValue'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('dostDescription', results[result] || '');
            document.getElementById('dostResult').style.display = 'block';
            showNotification('تشخیص دوست/دشمن انجام شد');
        }

        // 5. علت بیماری ۱۲تایی
        window.calculateBimari12 = function calculateBimari12() {
            var name = document.getElementById('bimari12Name').value.trim();
            var mother = document.getElementById('bimari12Mother').value.trim();
            var day = document.getElementById('bimari12Day').value;
            if (!name || !mother || !day) {
                showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
                return;
            }
            var result = reduceByX(calculateAbjad(name, 'kabir') + calculateAbjad(mother, 'kabir') + calculateAbjad(day, 'kabir'), 12);
            var results = {
                1: 'از سحر و جن است',
                2: 'از چشم (نظر) زن است',
                3: 'از بیماری علاج‌ناپذیر است',
                4: 'از چشم (نظر) مرد است',
                5: 'از قرین (همنشین) مذکر است',
                6: 'از باد طبیعی است یا باد اجنه یا نفخ است',
                7: 'از عارضه زمینی است',
                8: 'از تغییر خون است',
                9: 'از صفرا است',
                10: 'از سحر انسانی است',
                11: 'از قرین مؤنث است',
                12: 'از غم و اندوه است'
            };
            var __n=document.getElementById('bimari12Value'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('bimari12Description', results[result] || '');
            document.getElementById('bimari12Result').style.display = 'block';
            showNotification('تشخیص علت بیماری انجام شد');
        }

        // 6. آمدن غایب
        window.calculateGhaeb = function calculateGhaeb() {
            var name = document.getElementById('ghaebName').value.trim();
            var mother = document.getElementById('ghaebMother').value.trim();
            var day = document.getElementById('ghaebDay').value;
            if (!name || !mother) {
                showNotification('لطفاً اسم و اسم مادر را وارد کنید', 'error');
                return;
            }
            var result = reduceByX(calculateAbjad(name, 'special') + calculateAbjad(mother, 'special') + (day ? calculateAbjad(day, 'special') : 0), 4);
            var results = { 1: 'زود می‌آید', 2: 'توقف می‌کند (معطل می‌شود)', 3: 'می‌ماند و بازنمی‌گردد', 4: 'دیر می‌آید' };
            var __n=document.getElementById('ghaebValue'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('ghaebDescription', results[result] || '');
            document.getElementById('ghaebResult').style.display = 'block';
            showNotification('تشخیص آمدن غایب انجام شد');
        }

        // 7. بخت و اقبال
        window.calculateBaht = function calculateBaht() {
            var name = document.getElementById('bahtName').value.trim();
            var mother = document.getElementById('bahtMother').value.trim();
            if (!name || !mother) {
                showNotification('لطفاً اسم و اسم مادر را وارد کنید', 'error');
                return;
            }
            var r = reduceByX(calculateAbjad(name, 'kabir') + calculateAbjad(mother, 'kabir'), 4);
            if (r === 4) r = 0;
            var results = {
                0: 'طالع اشرافی - این فرد می‌تواند در طبقه‌ای از اجتماع قرار گیرد که مرفه و ثروتمندند',
                1: 'طالع حادثه‌ساز - این افراد تیرانداز هستند',
                2: 'طالع کم‌درآمد - این طبقه‌ای است که افراد به سختی امرار معاش می‌کنند',
                3: 'طالع عرفانی - این افراد به مسائل معنوی علاقه زیادی دارند'
            };
            var __n=document.getElementById('bahtValue'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('bahtDescription', results[r] || '');
            document.getElementById('bahtResult').style.display = 'block';
            showNotification('محاسبه بخت و اقبال انجام شد');
        }

        // 8. علت بیماری (عمومی)
        window.calculateBimari = function calculateBimari() {
            var name = document.getElementById('bimariName').value.trim();
            var mother = document.getElementById('bimariMother').value.trim();
            var day = document.getElementById('bimariDay').value;
            if (!name || !mother || !day) {
                showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
                return;
            }
            var result = reduceByX(calculateAbjad(name, 'kabir') + calculateAbjad(mother, 'kabir') + calculateAbjad(day, 'kabir'), 7);
            var results = {
                1: 'علت بیماری از جن و موجودات ماورایی است',
                2: 'بیماری از هوای آلوده یا تغییرات آب و هوایی ناشی شده است',
                3: 'بیماری ممکن است از سحر یا چشم زخم باشد',
                4: 'بیماری از چشم زخم یا حسادت دیگران است',
                5: 'بیماری مربوط به خون یا گردش خون است',
                6: 'بیماری از سودا یا افسردگی است',
                7: 'بیماری از صفرا یا مشکلات گوارشی است'
            };
            var __n=document.getElementById('bimariValue'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('bimariDescription', results[result] || '');
            document.getElementById('bimariResult').style.display = 'block';
            showNotification('تشخیص علت بیماری انجام شد');
        }

        // 9. ستاره طالع
        window.calculateSetare = function calculateSetare() {
            var name = document.getElementById('setareName').value.trim();
            var mother = document.getElementById('setareMother').value.trim();
            if (!name || !mother) {
                showNotification('لطفاً اسم و اسم مادر را وارد کنید', 'error');
                return;
            }
            var stars = [
                { star: 'برج جدی', taleh: 'مریخ', nature: 'آتشی' },
                { star: 'برج ثور', taleh: 'زهره', nature: 'خاکی' },
                { star: 'برج جوزا', taleh: 'عطارد', nature: 'هوایی' },
                { star: 'برج سرطان', taleh: 'ماه', nature: 'آبی' },
                { star: 'برج اسد', taleh: 'خورشید', nature: 'آتشی' },
                { star: 'برج سنبله', taleh: 'عطارد', nature: 'خاکی' },
                { star: 'برج میزان', taleh: 'زهره', nature: 'هوایی' },
                { star: 'برج عقرب', taleh: 'مریخ', nature: 'آبی' },
                { star: 'برج قوس', taleh: 'مشتری', nature: 'آتشی' },
                { star: 'برج جدی', taleh: 'زحل', nature: 'خاکی' },
                { star: 'برج دلو', taleh: 'عطارد', nature: 'هوایی' },
                { star: 'برج حوت', taleh: 'مشتری', nature: 'آبی' }
            ];
            var r = reduceByX(calculateAbjad(name, 'kabir') + calculateAbjad(mother, 'kabir'), 12);
            var st = stars[r - 1];
            var __n=document.getElementById('setareValue'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('setareDescription', 'برج: ' + st.star + ' - طالع: ' + st.taleh + ' - طبیعت: ' + st.nature);
            document.getElementById('setareResult').style.display = 'block';
            showNotification('محاسبه ستاره طالع انجام شد');
        }

        // 10. ابجد
        window.calculateAbjadCalc = function calculateAbjadCalc() {
            var text = document.getElementById('abjadText').value.trim();
            var type = document.getElementById('abjadType').value;
            if (!text) {
                showNotification('لطفاً متن را وارد کنید', 'error');
                return;
            }
            var total = 0;
            var tbl;
            switch (type) {
                case 'kabir': tbl = abjadKabir; break;
                case 'saghir': tbl = abjadSaghir; break;
                case 'vasit': tbl = abjadVasit; break;
                default: tbl = abjadKabir;
            }
            for (var i = 0; i < text.length; i++) {
                var c = text[i];
                var v = tbl[c] || 0;
                if (type === 'saghir') v = v % 9 || 9;
                else if (type === 'vasit' && v > 9) v = Math.floor(v / 2);
                total += v;
            }
            setElementText('abjadValue', 'مجموع: ' + total);
            var desc = total % 2 === 1 ? 'عدد فرد' : 'عدد زوج';
            if (total % 3 === 0) desc += ' | مضرب 3';
            if (total % 7 === 0) desc += ' | مضرب 7';
            if (total % 9 === 0) desc += ' | مضرب 9';
            setElementText('abjadDescription', desc);
            document.getElementById('abjadResult').style.display = 'block';
            showNotification('محاسبه ابجد انجام شد');
        }

        // 10b. ماشین حساب ساده
        window.calculateMath = function calculateMath() {
            var n1 = parseFloat(document.getElementById('num1').value);
            var n2 = parseFloat(document.getElementById('num2').value);
            var op = document.getElementById('operation').value;
            if (isNaN(n1) || isNaN(n2)) {
                showNotification('لطفاً اعداد معتبر وارد کنید', 'error');
                return;
            }
            var r;
            switch (op) {
                case '+': r = n1 + n2; break;
                case '-': r = n1 - n2; break;
                case '*': r = n1 * n2; break;
                case '/': if (n2 === 0) { showNotification('تقسیم بر صفر', 'error'); return; } r = n1 / n2; break;
                case '%': r = n1 % n2; break;
            }
            setElementText('mathValue', r.toString());
            document.getElementById('mathResult').style.display = 'block';
            showNotification('محاسبه انجام شد');
        }

        // 10c. ماشین حساب پیشرفته
        window.calculateAdvancedMath = function calculateAdvancedMath() {
            var exp = document.getElementById('mathExpression').value.trim();
            if (!exp) {
                showNotification('لطفاً عبارت را وارد کنید', 'error');
                return;
            }
            try {
                var clean = exp.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9\+\-\*\/\%\(\)\.]/g, '');
                if (!clean) { showNotification('عبارت نامعتبر', 'error'); return; }
                var result = new Function('return ' + clean)();
                if (isNaN(result) || !isFinite(result)) { showNotification('نتیجه نامعتبر', 'error'); return; }
                setElementText('advancedMathValue', result.toString());
                document.getElementById('advancedMathResult').style.display = 'block';
                showNotification('محاسبه انجام شد');
            } catch(e) {
                showNotification('خطا در محاسبه', 'error');
            }
        }

        // 11. عاقبت ازدواج
        window.calculateEzdevaj = function calculateEzdevaj() {
            var man = document.getElementById('ezdevajMan').value.trim();
            var woman = document.getElementById('ezdevajWoman').value.trim();
            if (!man || !woman) {
                showNotification('لطفاً هر دو اسم را وارد کنید', 'error');
                return;
            }
            var result = reduceByX(calculateAbjad(man, 'kabir') + calculateAbjad(woman, 'kabir') + 7, 9);
            var results = {
                1: 'ازدواج مناسب است - زن حاکم می‌شود',
                2: 'ازدواج خیر و برکت است',
                3: 'عاقبت می‌تواند ناخوش باشد',
                4: 'ازدواج همراه با دلسردی',
                5: 'ازدواج مناسب همراه با فرزند',
                6: 'اختلاف مشکلات و طلاق احتمال ۸۰ درصد',
                7: 'ازدواج عالی',
                8: 'مناسب نیست - سختی، جدایی و خیانت',
                9: 'همانند نتیجه ۸ است ولی فوت ندارد'
            };
            var __n=document.getElementById('ezdevajValue'); if(__n){__n.style.display='none'; __n.textContent='';}
            setElementText('ezdevajDescription', results[result] || '');
            document.getElementById('ezdevajResult').style.display = 'block';
            showNotification('محاسبه عاقبت ازدواج انجام شد');
        }

        // 12. دلیل الحیران
        var selectedType = 'adult';
        var selectedGender = 'male';

        window.selectType = function selectType(type) {
            selectedType = type;
            document.querySelectorAll('#dalilModal .radio-btn[data-type]').forEach(function(el) {
                el.classList.remove('active');
            });
            document.querySelector('#dalilModal .radio-btn[data-type="' + type + '"]').classList.add('active');
            var daySection = document.getElementById('daySection');
            if (type === 'child') {
                daySection.style.display = 'block';
            } else {
                daySection.style.display = 'none';
            }
        }

        window.selectGender = function selectGender(gender) {
            selectedGender = gender;
            document.querySelectorAll('#dalilModal .radio-btn[data-gender]').forEach(function(el) {
                el.classList.remove('active');
            });
            document.querySelector('#dalilModal .radio-btn[data-gender="' + gender + '"]').classList.add('active');
        }

        window.calculateHayran = function calculateHayran() {
            var name = document.getElementById('hayranName').value.trim();
            var mother = document.getElementById('hayranMother').value.trim();
            if (!name || !mother) {
                showNotification('لطفاً نام و نام مادر را وارد کنید', 'error');
                return;
            }
            var total;
            if (selectedType === 'adult') {
                total = calculateAbjad(name, 'hejai') + calculateAbjad(mother, 'hejai');
            } else {
                var dayEl = document.getElementById('hayranDay');
                total = calculateAbjad(name, 'hejai') + calculateAbjad(mother, 'hejai') + (dayEl ? calculateAbjad(dayEl.value, 'hejai') : 0);
            }
            var result = calculateRemainder(total, 9);
            var results = {
                1: 'طالع بلندپایه - زندگی مرفه و ثروتمند',
                2: 'طالع متوسط - زندگی متوسط با تلاش',
                3: 'طالع کوتاه - زندگی پرچالش',
                4: 'طالع هنرمند - خلاق، مشهور',
                5: 'طالع موسیقیدان - هنرمند، تیزهوش',
                6: 'طالع شاعر - عاطفی، علاقه‌مند به شعر',
                7: 'طالع ورزشکار - قوی، ورزشکار',
                8: 'طالع تاجر - باهوش، تاجر موفق',
                9: 'طالع عابد - معنوی، صبور'
            };
            setElementText('hayranNumber', 'مرتبه ' + result);
            setElementText('hayranDescription', results[result] || '');
            document.getElementById('hayranResult').style.display = 'block';
            showNotification('محاسبه دلیل الحیران انجام شد');
        
            try {
                var __r = (typeof result !== 'undefined' ? result : (typeof finalResult !== 'undefined' ? finalResult : null));
                if (__r != null && typeof showDalilRankImages === 'function') showDalilRankImages(__r, selectedType, selectedGender);
            } catch (e) {}
        }

        // 13. رمل
        window.calculateRaml = function calculateRaml() {
            var name = document.getElementById('ramlName').value.trim();
            var mother = document.getElementById('ramlMother').value.trim();
            var day = document.getElementById('ramlDay').value;
            var number = parseInt(document.getElementById('ramlNumber').value);
            var qid = parseInt(document.getElementById('ramlQuestion').value);
            if (!name || !mother || !day || !number || !qid) {
                showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
                return;
            }
            if (number < 1 || number > 1000) {
                showNotification('عدد باید بین 1 تا 1000 باشد', 'error');
                return;
            }
            var nv = calculateAbjad(name, 'kabir');
            var mv = calculateAbjad(mother, 'kabir');
            var dv = calculateAbjad(day, 'kabir');
            var total = nv + mv + dv + number;
            var result = calculateRemainder(total, 16);
            var question = ramlQuestions.find(function(q) { return q.id === qid; });
            if (!question) {
                showNotification('سوال یافت نشد', 'error');
                return;
            }
            setElementText('ramlQuestionTitle', question.title);
            setElementText('ramlAnswer', 'پاسخ شماره ' + result + ': ' + (question.opts[(result - 1) % question.opts.length] || 'نامشخص'));
            document.getElementById('ramlResult').style.display = 'block';
            showNotification('رمل امام علی با موفقیت انجام شد');
        }

        // 14. همزاد — الگوریتم مرجع (cleanName + letterScore بدون صفر + تاریخ میلادی)
        var HAMZAD_ABJAD = {
            'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
            'ی':10,'ک':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,
            'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000
        };
        var HAMZAD_VALUE_TO_LETTER = {
            1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط',
            10:'ی',20:'ک',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص',
            100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ',1000:'غ'
        };

        function hamzadCleanName(str) {
            return String(str || '')
                .replace(/موسئ/g, 'موسا')
                .replace(/مصطفئ/g, 'مصطفا')
                .replace(/چ/g, 'ج')
                .replace(/ژ/g, 'ز')
                .replace(/گ/g, 'ک')
                .replace(/ئ/g, 'ی')
                .replace(/ء/g, '')
                .replace(/[يى]/g, 'ی')
                .replace(/ك/g, 'ک')
                .replace(/ة/g, 'ه')
                .replace(/ؤ/g, 'و')
                .replace(/[أإآٱ]/g, 'ا')
                .replace(/\s+/g, '')
                .trim();
        }

        function hamzadJalaliToGregorian(jy, jm, jd) {
            jy += 1595;
            var days = -355668 + (365 * jy) + Math.floor(jy / 33) * 8 + Math.floor(((jy % 33) + 3) / 4) + jd;
            if (jm < 7) days += (jm - 1) * 31;
            else days += (jm - 7) * 30 + 186;
            var gy = 400 * Math.floor(days / 146097);
            days %= 146097;
            if (days > 36524) {
                gy += 100 * Math.floor(--days / 36524);
                days %= 36524;
                if (days >= 365) days++;
            }
            gy += 4 * Math.floor(days / 1461);
            days %= 1461;
            if (days > 365) {
                gy += Math.floor((days - 1) / 365);
                days = (days - 1) % 365;
            }
            var gd = days + 1;
            var sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            var gm = 0;
            for (; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
            return [gy, gm, gd];
        }

        function hamzadDecompose(num) {
            var parts = [];
            var units = [1000,900,800,700,600,500,400,300,200,100,90,80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1];
            var n = Math.abs(Math.floor(num || 0));
            for (var i = 0; i < units.length; i++) {
                var u = units[i];
                while (n >= u) { parts.push(u); n -= u; }
            }
            return parts;
        }

        function hamzadGetDateLetters(y, m, d) {
            var out = [];
            var parts = hamzadDecompose(y).concat(hamzadDecompose(m)).concat(hamzadDecompose(d));
            for (var i = 0; i < parts.length; i++) {
                var ch = HAMZAD_VALUE_TO_LETTER[parts[i]];
                if (ch) out.push(ch);
            }
            return out;
        }

        /** امتیاز حرف: حذف صفرهای ابجد و جمع ارقام (مثلاً ۴۰۰ → ۴) */
        function hamzadLetterScore(ch) {
            var val = HAMZAD_ABJAD[ch] || 0;
            if (!val) return 0;
            var s = String(val).replace(/0/g, '');
            var sum = 0;
            for (var i = 0; i < s.length; i++) sum += Number(s[i]) || 0;
            return sum;
        }

        function hamzadReduceBy28(n) {
            if (n <= 0) return 28;
            var r = n % 28;
            return r === 0 ? 28 : r;
        }

        function calculateHamzadReferenceResult(nameRaw, motherRaw, year, month, day, calendar) {
            var name = hamzadCleanName(nameRaw);
            var mother = hamzadCleanName(motherRaw);
            var gy = year, gm = month, gd = day;
            if (calendar === 'jalali' || calendar === 'شمسی' || !calendar) {
                var g = hamzadJalaliToGregorian(year, month, day);
                gy = g[0]; gm = g[1]; gd = g[2];
            }
            var allLetters = name.split('').concat(mother.split('')).concat(hamzadGetDateLetters(gy, gm, gd));
            var seen = {};
            var uniqueLetters = [];
            for (var i = 0; i < allLetters.length; i++) {
                var ch = allLetters[i];
                if (HAMZAD_ABJAD[ch] && !seen[ch]) {
                    seen[ch] = true;
                    uniqueLetters.push(ch);
                }
            }
            var total = 0;
            for (var j = 0; j < uniqueLetters.length; j++) total += hamzadLetterScore(uniqueLetters[j]);
            var finalNumber = hamzadReduceBy28(total);
            return {
                number: finalNumber,
                text: (typeof hamzadResults === 'object' && (ensureHamzadResultsSeeded(), hamzadResults)[finalNumber]) ? hamzadResults[finalNumber] : 'نتیجه نامشخص',
                totalBeforeReduce: total,
                uniqueLetters: uniqueLetters
            };
        }

        window.calculateHamzad = function calculateHamzad() {
            try {
                var nameEl = document.getElementById('name');
                var motherEl = document.getElementById('mother');
                var calendarEl = document.getElementById('calendar');
                var yearEl = document.getElementById('year');
                var monthEl = document.getElementById('month');
                var dayEl = document.getElementById('day');
                // فقط وقتی مودال همزاد باز است از این idها استفاده شود
                var modal = document.getElementById('hamzadModal');
                if (modal && !modal.classList.contains('active') && modal.style.display === 'none') {
                    /* still allow if fields filled */
                }
                var name = nameEl ? String(nameEl.value || '').trim() : '';
                var mother = motherEl ? String(motherEl.value || '').trim() : '';
                var calendar = calendarEl ? String(calendarEl.value || 'jalali') : 'jalali';
                var year = yearEl ? parseInt(yearEl.value, 10) : NaN;
                var month = monthEl ? parseInt(monthEl.value, 10) : NaN;
                var day = dayEl ? parseInt(dayEl.value, 10) : NaN;
                if (!name || !mother || !year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
                    if (typeof showNotification === 'function') showNotification('لطفاً همه فیلدها را به درستی پر کنید.', 'error');
                    return;
                }
                var result = calculateHamzadReferenceResult(name, mother, year, month, day, calendar);
                var num = result && result.number != null ? result.number : result;
                var text = result && result.text ? result.text : ((typeof hamzadResults === 'object' && hamzadResults[num]) ? hamzadResults[num] : 'نتیجه نامشخص');
                var nEl = document.getElementById('hamzadNumber');
                var dEl = document.getElementById('hamzadDescription');
                var box = document.getElementById('hamzadResult');
                if (nEl) {
                    nEl.style.display = 'block';
                    nEl.textContent = 'عدد همزاد: ' + num;
                }
                if (dEl) dEl.textContent = text;
                if (box) {
                    box.style.display = 'block';
                    try { box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
                }
                if (typeof showNotification === 'function') showNotification('محاسبه همزاد قرین انجام شد — نتیجه: ' + num);
            } catch (err) {
                console.error('calculateHamzad', err);
                if (typeof showNotification === 'function') showNotification('خطا در محاسبه همزاد: ' + (err.message || err), 'error');
            }
        }
        window.calculateHamzad = calculateHamzad;
        window.calculateHamzadReferenceResult = calculateHamzadReferenceResult;

        window.clearHamzadForm = function clearHamzadForm() {
            ['name','mother','year','month','day'].forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.value = '';
            });
            var box = document.getElementById('hamzadResult');
            if (box) box.style.display = 'none';
            var nEl = document.getElementById('hamzadNumber');
            if (nEl) nEl.textContent = '';
            var dEl = document.getElementById('hamzadDescription');
            if (dEl) dEl.textContent = '';
        }
        window.clearHamzadForm = clearHamzadForm;

        // سازگاری با کد قدیمی
        function hamzadNormalizeText(text) { return hamzadCleanName(text); }
        function hamzadUniqueLetters(text) {
            var s = hamzadCleanName(text), seen = {}, out = [];
            for (var i = 0; i < s.length; i++) {
                if (HAMZAD_ABJAD[s[i]] && !seen[s[i]]) { seen[s[i]] = true; out.push(s[i]); }
            }
            return out;
        }
        function hamzadAbjad(l) { return HAMZAD_ABJAD[l] || 0; }


        window.calculateMokashefe = function calculateMokashefe() {
            var name = document.getElementById('mokashefeName').value.trim();
            var mother = document.getElementById('mokashefeMother').value.trim();
            var day = document.getElementById('mokashefeDay').value;
            var number = parseInt(document.getElementById('mokashefeNumber').value);
            if (!name || !mother || !number) {
                showNotification('لطفاً تمام فیلدها را پر کنید', 'error');
                return;
            }
            if (number < 1 || number > 1000) {
                showNotification('عدد بین 1 تا 1000', 'error');
                return;
            }
            var nv = calculateAbjad(name, 'kabir');
            var mv = calculateAbjad(mother, 'kabir');
            var dv = calculateAbjad(day, 'kabir');
            var result = calculateRemainder(nv + mv + dv + number, 16);
            var data = getMokashefeData();
            var house = data.find(function(h) { return h.number === result; }) || data[0];
            var houseTitle = house.houseArabicName || house.persianName || house.name || ('خانه ' + house.number);
            setElementText('mokashefeHouseName', 'خانه ' + house.number + ' — ' + houseTitle);
            // ترتیب درخواستی کاربر: ۱ متن عربی کامل ۲ ترجمه فارسی کامل ۳ نتیجه‌گیری
            setElementText('mokashefeArabicText',
                '① متن عربی کامل\n' + (house.arabicText || '—')
            );
            setElementText('mokashefeDescription',
                '② ترجمه فارسی کامل\n' + (house.persianText || '—') +
                '\n\n③ نتیجه‌گیری\n' + (house.conclusion || house.shortResult || house.summary || '—')
            );
            document.getElementById('mokashefeResult').style.display = 'block';
            showNotification('مکاشفه با موفقیت انجام شد');
        }

        // 16. ستاره چینی
        window.calculateSotareChini = function calculateSotareChini() {
            var manName = document.getElementById('sotareManName').value.trim();
            var manMother = document.getElementById('sotareManMother').value.trim();
            var womanName = document.getElementById('sotareWomanName').value.trim();
            var womanMother = document.getElementById('sotareWomanMother').value.trim();
            if (!manName || !manMother || !womanName || !womanMother) {
                showNotification('لطفاً همه فیلدها را پر کنید', 'error');
                return;
            }
            var manSum = calculateAbjad(manName, 'kabir') + calculateAbjad(manMother, 'kabir');
            var womanSum = calculateAbjad(womanName, 'kabir') + calculateAbjad(womanMother, 'kabir');
            var total = manSum + womanSum;
            var remainder = total % 5;
            var resultType, resultText;
            if (remainder === 1 || remainder === 3) {
                resultType = "✅ سازگار";
                resultText = "این دو نفر از لحاظ اخلاقی و رفتاری با هم سازگاری دارند. تفاهم و همدلی خوبی بین آنها وجود خواهد داشت.";
            } else if (remainder === 2 || remainder === 4) {
                resultType = "❌ ناسازگار";
                resultText = "این دو نفر از لحاظ اخلاقی و رفتاری سازگاری ندارند. نیاز به تلاش و گذشت بیشتری برای تفاهم دارند.";
            } else {
                resultType = "⚠️ دخالت خانواده";
                resultText = "ممکن است مخالفت و دخالت خانواده‌ها باعث ایجاد مشکل در این ارتباط شود. نیاز به مدیریت روابط خانوادگی دارید.";
            }
            document.getElementById('sotareResult').innerHTML =
                '<h3 style="color:#1A365D;text-align:center;">' + resultType + '</h3>' +
                '<p style="line-height:1.6;color:#1A1A1A;">' + resultText + '</p>' +
                '<div style="margin-top:10px;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px;color:#1A1A1A;font-size:0.8rem;">' +
                '🔢 جمع کل: ' + total + ' | باقیمانده: ' + remainder + ' | تقسیم بر ۵' +
                '</div>';
            document.getElementById('sotareResult').style.display = 'block';
            showNotification('محاسبه ستاره چینی انجام شد');
        }

        // 17. استخراج موکل
        window.calculateMokel = function calculateMokel() {
            var name = document.getElementById('mokelName').value.trim();
            if (!name) {
                showNotification('لطفاً اسم شخص را وارد کنید', 'error');
                return;
            }
            var abjadValue = calculateAbjad(name, 'kabir');
            var letters = numberToAbjadLetters(abjadValue);
            var mokelName = letters + "ائیل";
            var asmaResult = findAsma(abjadValue);
            var asma = asmaResult.found ? asmaResult.name : "اسم متناظر یافت نشد";
            var request = prompt("خواسته خود را وارد کنید (کاری که می‌خواهید انجام شود):", "هر آنچه صلاح است");
            if (request === null) request = "آنچه خواسته شده";
            var tokil = "یا " + mokelName + " أقسم علیک بال" + asma + " الا ما فعلت " + request;
            document.getElementById('mokelResult').innerHTML =
                '<h3 style="color:#1A365D;text-align:center;">📿 نتیجه استخراج</h3>' +
                '<p style="color:#1A1A1A;"><strong>اسم شخص:</strong> ' + name + '</p>' +
                '<p style="color:#1A1A1A;"><strong>ابجد اسم:</strong> ' + abjadValue + '</p>' +
                '<p style="color:#1A1A1A;"><strong>اسم موکل:</strong> ' + mokelName + '</p>' +
                '<p style="color:#1A1A1A;"><strong>اسم متناظر از اسماء الحسنی:</strong> ' + asma + '</p>' +
                '<div style="margin-top:15px;padding:10px;background:rgba(201,168,76,0.08);border-radius:8px;border:1px solid rgba(255,215,0,0.15);">' +
                '<p style="color:#1A365D;"><strong>📿 توکیل:</strong></p>' +
                '<p style="font-family:monospace;font-size:14px;color:#1A1A1A;direction:ltr;">' + tokil + '</p>' +
                '<p style="margin-top:10px;color:#1A1A1A;font-size:0.8rem;">🔁 تعداد تکرار: ' + abjadValue + ' بار</p>' +
                '<p style="color:#1A1A1A;font-size:0.8rem;">🕯️ عمل: عود + صلوات</p>' +
                '</div>';
            document.getElementById('mokelResult').style.display = 'block';
            showNotification('استخراج موکل انجام شد');
        }

        // 18. اسماء الحسنی
        window.calculateAsmani = function calculateAsmani() {
            var number = parseInt(document.getElementById('asmaniNumber').value);
            if (!number || number < 1 || number > 1000) {
                showNotification('لطفاً عددی بین 1 تا 1000 وارد کنید', 'error');
                return;
            }
            var result = findAsma(number);
            var exact = result.exact ? "دقیق" : "نزدیکترین";
            var resultText = '';
            if (result.found) {
                var extraInfo = '';
                if (!result.exact) {
                    extraInfo = ' (نزدیکترین: ' + result.number + ' | اختلاف: ' + result.diff + ')';
                }
                resultText =
                    '<h3 style="color:#1A365D;text-align:center;">🌟 اسماء الحسنی</h3>' +
                    '<p style="color:#1A1A1A;"><strong>عدد مورد نظر:</strong> ' + number + '</p>' +
                    '<p style="color:#1A1A1A;"><strong>اسم متناظر (' + exact + '):</strong> ' + result.name + extraInfo + '</p>' +
                    '<div style="margin-top:10px;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px;">' +
                    '<small style="color:#1A1A1A;">✨ برای عبادت و ذکر روزانه می‌توانید این اسم را تکرار کنید</small>' +
                    '</div>';
            } else {
                resultText =
                    '<h3 style="color:#1A365D;text-align:center;">🌟 اسماء الحسنی</h3>' +
                    '<p style="color:#1A1A1A;"><strong>عدد مورد نظر:</strong> ' + number + '</p>' +
                    '<p style="color:#ff6b6b;">❌ اسمی برای این عدد یافت نشد</p>';
            }
            document.getElementById('asmaniResult').innerHTML = resultText;
            document.getElementById('asmaniResult').style.display = 'block';
            showNotification('جستجوی اسماء الحسنی انجام شد');
        }

        // ============================================================
        // تنظیمات کاربر
        // ============================================================
        

        function updateUserPurchaseHistory() {
            var purchases = JSON.parse(localStorage.getItem('userPurchases') || '[]');
            var subscription = JSON.parse(localStorage.getItem('userSubscription') || '{"active":false,"expiry":null}');
            document.getElementById('purchaseCount').textContent = purchases.length;
            document.getElementById('subscriptionStatus').textContent = subscription.active ? '✅ فعال' : '❌ غیرفعال';
            document.getElementById('subscriptionExpiry').textContent = subscription.expiry ? new Date(subscription.expiry).toLocaleDateString('fa-IR') : '-';
        }

        // ============================================================
        // مدیریت (ادمین)
        // ============================================================
        var adminPassword = '';
        var adminRemember = false;
        var DEFAULT_ADMIN_PASS = '';

        function normalizePass(p) {
            if (p == null) return '';
            return String(p).replace(/\u200c/g, '').replace(/\s+/g, ' ').trim();
        }

        async function verifyOnlineAdmin() {
            if (!supabaseClient || !supabaseClient.auth) return false;
            try {
                // تلاش برای تازه‌سازی session قبل از بررسی نقش
                try {
                    var sess = await supabaseClient.auth.getSession();
                    if (sess && sess.data && sess.data.session) {
                        var exp = sess.data.session.expires_at ? (sess.data.session.expires_at * 1000) : 0;
                        if (exp && exp - Date.now() < 120000) {
                            await supabaseClient.auth.refreshSession();
                        }
                    }
                } catch (eRef) { /* ignore refresh errors */ }

                var userResult = await supabaseClient.auth.getUser();
                var user = userResult && userResult.data && userResult.data.user;
                if (userResult && userResult.error) return false;
                if (!user || !user.id || user.is_anonymous) return false;

                var prof = await supabaseClient
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .maybeSingle();

                return !!(prof && !prof.error && prof.data && prof.data.role === 'admin');
            } catch (e) {
                console.warn('verifyOnlineAdmin', e);
                return false;
            }
        }

        // Telegram OTP admin login: no email/password is requested from the admin.
        function withTimeout(promise, ms, label) {
            var timer;
            return Promise.race([
                Promise.resolve(promise),
                new Promise(function(_, reject) {
                    timer = setTimeout(function() { reject(new Error(label || 'timeout')); }, ms);
                })
            ]).finally(function() {
                if (timer) clearTimeout(timer);
            });
        }
        async function signInOrBootstrapAdmin() {
            if (!supabaseClient) {
                showNotification('اتصال امن به سرور برقرار نیست.', 'error');
                return false;
            }

            /*
             * V7 REAL ONLINE:
             * The deployed server function is `admin-telegram-otp` version 3.
             * Contract:
             *   request -> { ok, challengeId, expiresIn }
             *   verify  -> { ok, access_token, refresh_token }
             * Do NOT use the older `telegram-otp` request_otp/verify_otp contract here.
             */
            const STORAGE_KEY = 'kafe_miad_admin_telegram_otp_v7';

            async function invokeAdminTelegram(payload, attempts = 2) {
                let lastError = null;
                let lastData = null;
                let lastDetail = '';

                for (let i = 0; i < attempts; i++) {
                    try {
                        const result = await supabaseClient.functions.invoke('admin-telegram-otp', {
                            body: payload
                        });

                        lastError = result.error || null;
                        lastData = result.data || null;

                        if (!lastError) return result;

                        try {
                            const ctx = lastError.context;
                            if (ctx && typeof ctx.clone === 'function') {
                                lastDetail = await ctx.clone().text();
                            } else if (ctx && typeof ctx.text === 'function') {
                                lastDetail = await ctx.text();
                            }
                        } catch (_) {}

                    } catch (e) {
                        lastError = e;
                    }

                    if (i < attempts - 1) {
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }

                return {
                    error: lastError,
                    data: lastData,
                    detail: lastDetail
                };
            }

            function getPending() {
                try {
                    const p = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
                    if (!p || !p.createdAt || !p.challengeId) return null;

                    const age = Date.now() - Number(p.createdAt);
                    const ttlMs = Math.max(1, Math.min(300, Number(p.expiresIn) || 300)) * 1000;
                    // Expire the browser-side challenge slightly before the server TTL,
                    // so clock/network delay does not keep offering a code at its edge.
                    if (age < 0 || age >= ttlMs - 15000) {
                        sessionStorage.removeItem(STORAGE_KEY);
                        return null;
                    }
                    return p;
                } catch (_) {
                    return null;
                }
            }

            function setPending(challengeId, expiresIn) {
                try {
                    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
                        challengeId: String(challengeId),
                        createdAt: Date.now(),
                        expiresIn: Number(expiresIn) || 300
                    }));
                } catch (_) {}
            }

            function clearPending() {
                try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
            }

            function parseServerError(result) {
                let message = '';

                if (result && result.data) {
                    message = result.data.message || result.data.error || result.data.msg || '';
                }

                if (!message && result && result.detail) {
                    try {
                        const parsed = JSON.parse(result.detail);
                        message = parsed.message || parsed.error || parsed.msg || '';
                    } catch (_) {
                        message = String(result.detail)
                            .replace(/<[^>]*>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim()
                            .slice(0, 300);
                    }
                }

                return message;
            }

            function openOtpModal(challengeId, expiresIn) {
                return new Promise(resolve => {
                    // Create the OTP dialog at runtime so it can never depend on
                    // a hidden/missing HTML fragment or a parent stacking context.
                    const old = document.getElementById('telegramOtpModal');
                    if (old) old.remove();

                    const modal = document.createElement('div');
                    modal.id = 'telegramOtpModal';
                    modal.setAttribute('role', 'dialog');
                    modal.setAttribute('aria-modal', 'true');
                    modal.setAttribute('aria-hidden', 'false');
                    modal.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;direction:rtl;overscroll-behavior:contain;touch-action:none;';
                    modal.innerHTML =
                        '<div style="width:min(420px,96vw);max-height:calc(100dvh - 32px);overflow:auto;background:#fffaf2;border-radius:22px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.55);font-family:Tahoma,Arial,sans-serif;box-sizing:border-box;color:#1A1408;touch-action:auto;overscroll-behavior:contain;">' +
                        '<div style="text-align:center;font-size:24px;font-weight:800;color:#8B4513;">🔐 ورود مدیریت</div>' +
                        '<div style="text-align:center;margin:10px 0 16px;color:#444;line-height:1.8;">کد ۶ رقمی ارسال‌شده به تلگرام مدیریت را وارد کنید.</div>' +
                        '<input id="telegramOtpInput" type="tel" inputmode="numeric" maxlength="6" autocomplete="one-time-code" aria-label="کد شش رقمی مدیریت" placeholder="کد ۶ رقمی" style="display:block;width:100%;height:58px;box-sizing:border-box;text-align:center;font-size:28px;font-weight:800;letter-spacing:8px;direction:ltr;padding:10px;border:2px solid #d4af37;border-radius:14px;background:#fff;color:#111;outline:none;">' +
                        '<div id="telegramOtpCountdown" style="text-align:center;margin:10px 0;color:#777;font-size:13px;min-height:20px;"></div>' +
                        '<div style="display:flex;gap:8px;">' +
                        '<button type="button" id="telegramOtpVerifyBtn" style="flex:1;padding:13px;border:0;border-radius:12px;background:#8B4513;color:#fff;font-weight:800;">تأیید و ورود به پنل</button>' +
                        '<button type="button" id="telegramOtpCancelBtn" style="flex:1;padding:13px;border:1px solid #ccc;border-radius:12px;background:#fff;color:#555;">انصراف</button>' +
                        '</div></div>';
                    document.body.appendChild(modal);

                    const input = document.getElementById('telegramOtpInput');
                    const verifyBtn = document.getElementById('telegramOtpVerifyBtn');
                    const cancelBtn = document.getElementById('telegramOtpCancelBtn');
                    const countdown = document.getElementById('telegramOtpCountdown');
                    let finished = false;
                    const ttl = Math.max(1, Number(expiresIn) || 300);
                    const expiresAt = Date.now() + ttl * 1000;
                    const oldOverflow = document.body.style.overflow;
                    const oldTouchAction = document.body.style.touchAction;

                    function updateCountdown() {
                        const left = Math.max(0, expiresAt - Date.now());
                        const sec = Math.ceil(left / 1000);
                        countdown.textContent = left ? ('اعتبار کد: ' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0')) : 'کد منقضی شده است.';
                    }
                    const timer = setInterval(updateCountdown, 1000);

                    function cleanup() {
                        if (finished) return;
                        finished = true;
                        clearInterval(timer);
                        window.removeEventListener('pageshow', refocus);
                        document.removeEventListener('visibilitychange', onVisible);
                        window.removeEventListener('resize', refocus);
                        if (verifyBtn) verifyBtn.onclick = null;
                        if (cancelBtn) cancelBtn.onclick = null;
                        if (input) { input.oninput = null; input.onkeydown = null; }
                        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
                        document.body.style.overflow = oldOverflow;
                        document.body.style.touchAction = oldTouchAction;
                    }
                    function finish(value) { cleanup(); resolve(value); }
                    function refocus() {
                        if (finished || !modal.parentNode) return;
                        setTimeout(() => {
                            if (finished || !modal.parentNode) return;
                            try { input.focus({preventScroll:true}); } catch (_) { try { input.focus(); } catch (_) {} }
                        }, 120);
                    }
                    function onVisible() { if (!document.hidden) refocus(); }

                    document.body.style.overflow = 'hidden';
                    document.body.style.touchAction = 'none';
                    updateCountdown();
                    input.oninput = function() { input.value = String(input.value || '').replace(/\D/g, '').slice(0, 6); };
                    input.onkeydown = function(e) { if (e.key === 'Enter') { e.preventDefault(); verifyBtn.click(); } };
                    verifyBtn.onclick = function(e) {
                        e.preventDefault();
                        const code = String(input.value || '').replace(/\D/g, '').slice(0, 6);
                        if (!/^\d{6}$/.test(code)) { showNotification('کد باید دقیقاً ۶ رقم باشد.', 'error'); refocus(); return; }
                        finish(code);
                    };
                    cancelBtn.onclick = function(e) { e.preventDefault(); finish(null); };
                    modal.onclick = function(e) { if (e.target === modal) { e.preventDefault(); e.stopPropagation(); } };
                    modal.ontouchmove = function(e) { if (e.target === modal) e.preventDefault(); };
                    window.addEventListener('pageshow', refocus);
                    document.addEventListener('visibilitychange', onVisible);
                    window.addEventListener('resize', refocus);
                    refocus();
                    setTimeout(refocus, 350);
                    setTimeout(refocus, 1000);
                });
            }

            try {
                let pending = getPending();

                if (!pending) {
                    // Requesting an OTP creates server state and sends a Telegram message.
                    // Do not replay it automatically after a transport error: the first request
                    // may already have succeeded and the server enforces a 45-second cooldown.
                    const request = await withTimeout(invokeAdminTelegram({
                        action: 'request'
                    }, 1), 15000, 'telegram_otp_request_timeout');

                    if (request.error || !request.data || request.data.ok !== true) {
                        console.warn(
                            'Telegram OTP request failed:',
                            request.error || request.data,
                            request.detail || ''
                        );

                        const serverMessage = parseServerError(request);

                        showNotification(
                            serverMessage ||
                            'ارسال کد ورود به تلگرام انجام نشد. سرویس ورود مدیریت را بررسی کنید.',
                            'error'
                        );
                        return false;
                    }

                    const challengeId = request.data.challengeId;
                    const expiresIn = Number(request.data.expiresIn) || 300;

                    if (!challengeId) {
                        showNotification('شناسه امن درخواست ورود از سرور دریافت نشد.', 'error');
                        return false;
                    }

                    setPending(challengeId, expiresIn);
                    pending = getPending() || {
                        challengeId: String(challengeId),
                        createdAt: Date.now(),
                        expiresIn: expiresIn
                    };

                    showNotification('✅ کد ورود به تلگرام مدیر ارسال شد.');
                } else {
                    showNotification('کد قبلی هنوز معتبر است؛ کد جدید ارسال نمی‌کنیم.');
                }

                const code = await openOtpModal(
                    pending.challengeId,
                    pending.expiresIn || 300
                );

                if (code === null) return false;

                // OTP verification is a one-time, state-changing operation.
                // Never replay the same code automatically after a transport/HTTP error:
                // the server may already have consumed it, or counted the failed attempt.
                const verify = await withTimeout(invokeAdminTelegram({
                    action: 'verify',
                    challengeId: pending.challengeId,
                    code: code
                }, 1), 15000, 'telegram_otp_verify_timeout');

                if (verify.error || !verify.data || verify.data.ok !== true) {
                    console.warn(
                        'Telegram OTP verify failed:',
                        verify.error || verify.data,
                        verify.detail || ''
                    );

                    const serverMessage = parseServerError(verify);
                    const status = verify.error && verify.error.context && Number(verify.error.context.status);
                    const ambiguousFailure = !!verify.error && (!Number.isFinite(status) || status === 0 || status >= 500);

                    if (ambiguousFailure) {
                        // The server may have consumed the one-time code even if its response was lost.
                        // Drop the browser challenge rather than trapping the next attempt on a used code.
                        clearPending();
                        showNotification(
                            'پاسخ نهایی سرویس ورود دریافت نشد؛ کد قبلی کنار گذاشته شد. برای کد تازه، در صورت نمایش محدودیت، ۴۵ ثانیه صبر کنید.',
                            'error'
                        );
                    } else {
                        showNotification(
                            serverMessage || 'تأیید کد توسط سرور انجام نشد.',
                            'error'
                        );
                        // For an explicit invalid/expired code, keep the challenge while it remains valid.
                    }
                    return false;
                }

                const accessToken = verify.data.access_token;
                const refreshToken = verify.data.refresh_token;

                if (!accessToken || !refreshToken) {
                    // The server has already consumed this OTP. Do not leave a
                    // browser-side challenge that can only fail on the next attempt.
                    clearPending();
                    console.warn('Verified OTP but no session returned:', verify.data);
                    showNotification(
                        'کد تأیید شد، اما نشست امن مدیریت از سرور دریافت نشد. برای کد تازه دوباره تلاش کنید.',
                        'error'
                    );
                    return false;
                }

                const sessionSet = await supabaseClient.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });

                if (sessionSet.error) {
                    // A successful OTP verification consumes the code server-side.
                    // If local session establishment fails, discard the consumed challenge.
                    clearPending();
                    console.warn('setSession failed:', sessionSet.error);
                    showNotification('کد تأیید شد، اما برقراری نشست مدیریت انجام نشد. دوباره برای کد تازه تلاش کنید.', 'error');
                    return false;
                }

                clearPending();

                if (!(await verifyOnlineAdmin())) {
                    try { await supabaseClient.auth.signOut(); } catch (_) {}
                    showNotification('این حساب دسترسی مدیریت ندارد.', 'error');
                    return false;
                }

                showNotification('✅ ورود مدیریت با کد تلگرام موفق شد');
                return true;

            } catch (e) {
                clearPending();
                console.warn('telegram admin auth:', e);
                if (/timeout/i.test(String(e && e.message || e))) {
                    showNotification(
                        'پاسخ سرویس ورود بیش از ۱۵ ثانیه طول کشید؛ برای جلوگیری از تکرار کد مصرف‌شده، درخواست فعلی کنار گذاشته شد. اگر کد تازه محدود شد، ۴۵ ثانیه صبر کنید.',
                        'error'
                    );
                } else {
                    showNotification(
                        'ارتباط با سامانه ورود تلگرامی برقرار نشد؛ وضعیت کد قبلی نامطمئن است و برای ادامه باید کد تازه درخواست شود.',
                        'error'
                    );
                }
                return false;
            }
        }
        async function checkAdminPass(input) {
            return await verifyOnlineAdmin();
        }

        window.toggleAdmin = async function toggleAdmin() {
            // احراز هویت مدیر و بازکردن پنل در یک مسیر کنترل‌شده انجام می‌شود.
            // احراز هویت فقط بر اساس Session واقعی Supabase و profiles.role=admin است.
            var panel = document.getElementById('adminPanel');
            if (!panel) { showNotification('پنل مدیریت پیدا نشد', 'error'); return; }

            // اگر پنل از قبل باز است، همان دکمه آن را می‌بندد.
            if (panel.classList.contains('active')) {
                closeAdmin();
                return;
            }

            if (!supabaseClient) {
                showNotification('برای ورود مدیریت، اتصال آنلاین لازم است.', 'error');
                return;
            }

            var registerScreen = document.getElementById('registerScreen');
            var app = document.getElementById('app');
            var termsScreen = document.getElementById('termsScreen');
            var splashScreen = document.getElementById('splashScreen');

            // ابتدا Session فعلی مدیر بررسی می‌شود؛ در صورت نبودن مدیر معتبر، OTP تلگرام اجرا می‌شود.
            var ok = await verifyOnlineAdmin();
            if (!ok) ok = await signInOrBootstrapAdmin();
            if (!ok) return;

            // بعد از احراز موفق، UI اصلی فعال می‌شود.
            if (termsScreen) termsScreen.style.display = 'none';
            if (splashScreen) splashScreen.style.display = 'none';
            if (registerScreen) {
                registerScreen.classList.remove('active');
                registerScreen.classList.add('hidden');
                registerScreen.style.display = 'none';
            }
            if (app) {
                app.style.display = 'block';
                app.classList.remove('hidden');
            }

            // نام و اطلاعات مدیر فقط از پروفایل واقعی Supabase خوانده می‌شود.
            try {
                var sessionNow = await supabaseClient.auth.getSession();
                var uNow = sessionNow && sessionNow.data && sessionNow.data.session && sessionNow.data.session.user;
                if (uNow) {
                    var pNow = await supabaseClient.from('profiles').select('id,name,phone,role').eq('id', uNow.id).maybeSingle();
                    if (pNow && !pNow.error && pNow.data && typeof updateUserDisplay === 'function') {
                        updateUserDisplay(pNow.data);
                    }
                }
            } catch (e) {
                console.warn('admin post-login UI sync', e);
            }

            // پس از احراز موفق، خود پنل با همان Session مدیر باز می‌شود.
            var opened = await openAdmin();
            if (!opened) return;
            showNotification('✅ ورود مدیریت موفق بود؛ پنل مدیریت باز شد.');
        }

        const ADMIN_MEDIA_SETTING_KEYS = ['cafeSettings','cafeCustomCSS','discountSettings'];
        async function cloudSaveAdminSetting(key,value){
            if(!supabaseClient) return false;
            try{
                if(!(await verifyOnlineAdmin())) return false;
                var ses=await supabaseClient.auth.getSession();
                if(!ses.data||!ses.data.session)return false;
                var r=await supabaseClient.from('app_settings').upsert([{key:'admin:'+key,value:value,updated_at:new Date().toISOString()}],{onConflict:'key'});
                if(r.error){console.warn('cloudSaveAdminSetting',r.error);return false}
                return true;
            }catch(e){console.warn(e);return false}
        }
        async function cloudLoadAdminSettings(){
            if(!supabaseClient)return false;
            try{var r=await supabaseClient.from('app_settings').select('key,value').like('key','admin:%');if(r.error)return false;(r.data||[]).forEach(function(x){var k=String(x.key||'').replace(/^admin:/,'');if(ADMIN_MEDIA_SETTING_KEYS.indexOf(k)>=0){try{var val=x.value;if(k==='cafeSettings'){if(typeof val==='string'){try{val=JSON.parse(val);}catch(eP){val={};}}if(val&&typeof val==='object'){setSensitivePayCache({paymentCard:val.paymentCard||'',paymentSheba:val.paymentSheba||'',paymentOwner:val.paymentOwner||''});var loc=Object.assign({},val);delete loc.paymentCard;delete loc.paymentSheba;localStorage.setItem(k,JSON.stringify(loc));} }else{if(val!=null&&typeof val!=='string')val=JSON.stringify(val);if(typeof val==='string')localStorage.setItem(k,val);} }catch(e){}}});try{if(typeof window.applyGalleryImagesToUI==='function')window.applyGalleryImagesToUI();}catch(e){}return true}catch(e){return false}
        }

        var __adminHeartbeatTimer = null;
        function stopAdminHeartbeat() {
            if (__adminHeartbeatTimer) {
                try { clearInterval(__adminHeartbeatTimer); } catch (e) {}
                __adminHeartbeatTimer = null;
            }
        }
        function startAdminHeartbeat() {
            stopAdminHeartbeat();
            __adminHeartbeatTimer = setInterval(async function () {
                try {
                    var panel = document.getElementById('adminPanel');
                    if (!panel || panel.style.display === 'none' || !panel.classList.contains('active')) {
                        stopAdminHeartbeat();
                        return;
                    }
                    if (!(await verifyOnlineAdmin())) {
                        stopAdminHeartbeat();
                        closeAdmin();
                        if (typeof showNotification === 'function') {
                            showNotification('نشست مدیریت منقضی شد؛ پنل بسته شد.', 'error');
                        }
                    }
                } catch (e) {
                    console.warn('admin heartbeat', e);
                }
            }, 90000);
        }
        /** فقط با session واقعی و role=admin پنل/عملیات مدیریت مجاز است */
        async function requireAdminOrClose(silent) {
            if (!supabaseClient || !supabaseClient.auth) {
                closeAdmin();
                if (!silent && typeof showNotification === 'function') {
                    showNotification('اتصال امن سرور برای مدیریت لازم است.', 'error');
                }
                return false;
            }
            var ok = await verifyOnlineAdmin();
            if (!ok) {
                stopAdminHeartbeat();
                closeAdmin();
                if (!silent && typeof showNotification === 'function') {
                    showNotification('دسترسی مدیریت معتبر نیست یا نشست منقضی شده.', 'error');
                }
                return false;
            }
            return true;
        }

        async function openAdmin() {
            if (!(await requireAdminOrClose(false))) return false;
            // دوباره session را از auth بخوان — فقط token واقعی
            try {
                var ses = await supabaseClient.auth.getSession();
                if (!ses || !ses.data || !ses.data.session || !ses.data.session.access_token) {
                    closeAdmin();
                    showNotification('نشست مدیریت یافت نشد.', 'error');
                    return false;
                }
            } catch (eSes) {
                closeAdmin();
                showNotification('بررسی نشست مدیریت ناموفق بود.', 'error');
                return false;
            }
            var panel=document.getElementById('adminPanel');
            if (panel) {
                panel.style.display = 'block';
                panel.style.visibility = 'visible';
                panel.style.opacity = '1';
                panel.style.zIndex = '99999';
                panel.style.pointerEvents = 'auto';
                panel.classList.add('active');
            }
            try { document.body.style.overflow = 'hidden'; } catch (e) {}
            try{await cloudLoadAdminSettings()}catch(e){}
            try{await sbPullAdminData()}finally{switchAdminTab('dashboard');try{window.applyGalleryImagesToUI()}catch(e){}}
            startAdminHeartbeat();
            return true;
        }

        window.closeAdmin = function closeAdmin() {
            stopAdminHeartbeat();
            var panel = document.getElementById('adminPanel');
            if (panel) {
                panel.classList.remove('active');
                panel.style.display = 'none';
                panel.style.visibility = '';
                panel.style.opacity = '';
                panel.style.pointerEvents = '';
            }
            try { document.body.style.overflow = ''; } catch (e) {}
        }
        window.openAdmin = openAdmin;
        window.closeAdmin = closeAdmin;


        function switchAdminTab(tabId) {
            // تب‌های حساس: دوباره اعتبار مدیر را چک کن
            var sensitive = {settings:1, products:1, otp:1, users:1, messages:1, modals:1, media:1};
            if (sensitive[tabId]) {
                verifyOnlineAdmin().then(function(ok){
                    if (!ok) {
                        stopAdminHeartbeat();
                        closeAdmin();
                        if (typeof showNotification === 'function') showNotification('نشست مدیریت نامعتبر است.', 'error');
                    }
                }).catch(function(){});
            }
            if (tabId === 'settings' && typeof loadAdminPaymentForm === 'function') try { loadAdminPaymentForm(); } catch (e) {}

            document.querySelectorAll('.admin-tab').forEach(function(tab) {
                tab.classList.toggle('active', tab.dataset.tab === tabId);
            });
            document.querySelectorAll('.admin-content').forEach(function(content) {
                var want = 'admin' + tabId.charAt(0).toUpperCase() + tabId.slice(1);
                content.classList.toggle('active', content.id === want);
            });
            try {
                if (tabId === 'dashboard' && typeof loadAdminData === 'function') loadAdminData();
                else if (tabId === 'products') {
                    try { if (typeof window.renderAdminProducts === 'function') window.renderAdminProducts(); else if (typeof renderAdminProducts === 'function') renderAdminProducts(); } catch(e){console.warn(e);}
                    try { if (typeof window.renderAdminOrders === 'function') window.renderAdminOrders(); } catch(e){}
                }
                else if (tabId === 'subscriptions') { if (typeof window.renderAdminSubscriptions === 'function') window.renderAdminSubscriptions(); if (typeof renderVipLockAdmin === 'function') renderVipLockAdmin(); }
                else if (tabId === 'modals' && typeof renderAdminModals === 'function') renderAdminModals();
                else if (tabId === 'media' && typeof loadMediaSettings === 'function') loadMediaSettings();
                else if (tabId === 'dalilImages' && typeof renderDalilImagesAdmin === 'function') renderDalilImagesAdmin();
                else if (tabId === 'css' && typeof loadCustomCSSIntoForm === 'function') loadCustomCSSIntoForm();
                else if (tabId === 'otp' && typeof renderAdminOTPs === 'function') renderAdminOTPs();
                else if (tabId === 'discount' && typeof loadDiscountSettings === 'function') loadDiscountSettings();
            } catch (e) { console.warn('switchAdminTab', tabId, e); }
        }

        function loadAdminData() {
            try {
                var products = getProducts();
                if (!Array.isArray(products)) products = [];
                var el;
                el = document.getElementById('adminTotalProducts'); if (el) el.textContent = products.length;
                renderAdminProducts();
                if (typeof window.renderAdminOrders === 'function') window.renderAdminOrders();

                var subscriptions = [];
                try { subscriptions = JSON.parse(localStorage.getItem('adminSubscriptions') || '[]'); } catch(e) {}
                if (!Array.isArray(subscriptions)) subscriptions = [];
                el = document.getElementById('adminTotalSubscriptions'); if (el) el.textContent = subscriptions.length;
                if (typeof window.renderAdminSubscriptions === 'function') window.renderAdminSubscriptions();

                var users = [];
                try { users = JSON.parse(localStorage.getItem('cafeUsers') || '[]'); } catch(e) {}
                if (!Array.isArray(users)) users = [];
                el = document.getElementById('adminTotalUsers'); if (el) el.textContent = users.length;

                renderAdminModals();
                loadDiscountSettings();
                if (typeof loadMediaSettingsForm === 'function') loadMediaSettingsForm();
            } catch (e) {
                console.error('loadAdminData', e);
            }
        }

        // ============================================================
        // مدیریت تخفیف
        // ============================================================
        function loadDiscountSettings() {
            var discount = JSON.parse(localStorage.getItem('discountSettings') || '{"title":"تخفیف ویژه تابستانه","sub":"تا ۵۰٪ تخفیف برای همه محصولات","icon":"🔥","active":true}');
            document.getElementById('discountTitleInput').value = discount.title;
            document.getElementById('discountSubInput').value = discount.sub;
            document.getElementById('discountIconInput').value = discount.icon;
            var toggle = document.getElementById('discountToggle');
            if (discount.active) {
                toggle.classList.add('active');
            } else {
                toggle.classList.remove('active');
            }
            updateDiscountPreview();
            applyDiscountToBanner();
        }

        window.toggleDiscount = function toggleDiscount() {
            var toggle = document.getElementById('discountToggle');
            toggle.classList.toggle('active');
        }

        async function saveDiscountSettings() {
            if (!supabaseClient) { showNotification('❌ اتصال سرور برقرار نیست؛ تخفیف ذخیره نشد.', 'error'); return false; }
            if (typeof verifyOnlineAdmin !== 'function' || !(await verifyOnlineAdmin())) {
                showNotification('❌ برای ذخیره تخفیف، ورود امن مدیر لازم است.', 'error'); return false;
            }
            var titleEl = document.getElementById('discountTitleInput');
            var subEl = document.getElementById('discountSubInput');
            var iconEl = document.getElementById('discountIconInput');
            var toggle = document.getElementById('discountToggle');
            var discount = {
                title: titleEl ? titleEl.value : '',
                sub: subEl ? subEl.value : '',
                icon: iconEl ? iconEl.value : '🔥',
                active: !!(toggle && toggle.classList.contains('active'))
            };
            try {
                var ok = await cloudSaveAdminSetting('discountSettings', discount);
                if (!ok) throw new Error('ذخیره تخفیف روی سرور تأیید نشد.');
                localStorage.setItem('discountSettings', JSON.stringify(discount));
                updateDiscountPreview();
                applyDiscountToBanner();
                showNotification('✅ تخفیف با تأیید سرور ذخیره شد.');
                return true;
            } catch (e) {
                console.warn('saveDiscountSettings', e);
                showNotification('❌ تخفیف ذخیره نشد؛ تغییر محلی اعمال نشد. ' + (e.message || ''), 'error');
                return false;
            }
        }
        window.saveDiscount = function saveDiscount() { return saveDiscountSettings(); }

        function updateDiscountPreview() {
            var titleEl = document.getElementById('discountTitleInput');
            var subEl = document.getElementById('discountSubInput');
            var iconEl = document.getElementById('discountIconInput');
            var t = titleEl ? titleEl.value : '';
            var s = subEl ? subEl.value : '';
            var ic = iconEl ? iconEl.value : '🔥';
            // پیش‌نمایش داخل پنل ادمین
            var pIcon = document.getElementById('discountPreviewIcon');
            var pTitle = document.getElementById('discountPreviewTitle');
            var pSub = document.getElementById('discountPreviewSub');
            if (pIcon) pIcon.textContent = ic;
            if (pTitle) pTitle.textContent = t;
            if (pSub) pSub.textContent = s;
            // بنر واقعی فروشگاه (پیش‌نمایش زنده)
            var bIcon = document.getElementById('discountIcon');
            var bTitle = document.getElementById('discountTitle');
            var bSub = document.getElementById('discountSub');
            if (bIcon) bIcon.textContent = ic;
            if (bTitle) bTitle.textContent = t;
            if (bSub) bSub.textContent = s;
        }

        function applyDiscountToBanner() {
            var discount = JSON.parse(localStorage.getItem('discountSettings') || '{"title":"تخفیف ویژه تابستانه","sub":"تا ۵۰٪ تخفیف برای همه محصولات","icon":"🔥","active":true}');
            var banner = document.getElementById('discountBanner');
            var icon = document.getElementById('discountIcon');
            var title = document.getElementById('discountTitle');
            var sub = document.getElementById('discountSub');
            if (!banner) return;
            if (discount.active) {
                banner.style.display = 'flex';
                if (icon) icon.textContent = discount.icon || '🔥';
                if (title) title.textContent = discount.title || '';
                if (sub) sub.textContent = discount.sub || '';
            } else {
                banner.style.display = 'none';
            }
        }

        function getDiscountText() {
            var discount = JSON.parse(localStorage.getItem('discountSettings') || '{"title":"تخفیف ویژه تابستانه","sub":"تا ۵۰٪ تخفیف برای همه محصولات","icon":"🔥","active":true}');
            return discount.active ? discount.icon + ' ' + discount.title + ' - ' + discount.sub : 'تخفیف غیرفعال است';
        }


        // ============================================================
        // مدیریت محصولات (ادمین) — نسخه پایدار
        // ============================================================
        function getProductsSafe() {
            try {
                var saved = localStorage.getItem('cafeProducts');
                if (saved) {
                    var arr = JSON.parse(saved);
                    if (Array.isArray(arr)) return arr;
                }
            } catch (e) {}
            try {
                if (typeof defaultProducts !== 'undefined' && Array.isArray(defaultProducts)) {
                    return JSON.parse(JSON.stringify(defaultProducts));
                }
            } catch (e2) {}
            return [];
        }
        async function saveProductsSafe(products) {
            if (!Array.isArray(products)) return { ok:false, reason:'invalid-products' };
            // Server is authoritative: update the local display cache only after every upsert succeeds.
            var result;
            try {
                if (typeof syncProductsToCloud !== 'function') return { ok:false, reason:'sync-unavailable' };
                result = await syncProductsToCloud(products);
            } catch (e) {
                console.warn('product server save', e);
                return { ok:false, reason: String(e && e.message || e) };
            }
            if (!result || !result.ok) return result || { ok:false, reason:'server-write-failed' };
            try {
                var cache = products.map(function(p){
                    var q = Object.assign({}, p);
                    if (q.imageUrl && String(q.imageUrl).indexOf('data:image/') === 0 && String(q.imageUrl).length > 200000) q.imageUrl = '';
                    return q;
                });
                localStorage.setItem('cafeProducts', JSON.stringify(cache));
            } catch (e) {
                console.warn('saveProductsSafe local cache', e);
                if (typeof showNotification === 'function') showNotification('⚠️ سرور ذخیره شد، اما حافظهٔ نمایشی گوشی به‌روز نشد.', 'warning');
            }
            return result;
        }
        // override getProducts/saveProducts to use safe versions
        window.getProducts = function() { return getProductsSafe(); };
        window.saveProducts = function(p) { return saveProductsSafe(p); };

        function renderAdminProducts() {
            var products = getProductsSafe();
            var countEl = document.getElementById('adminProductCount');
            if (countEl) countEl.textContent = products.length;
            var totalEl = document.getElementById('adminTotalProducts');
            if (totalEl) totalEl.textContent = products.length;
            var list = document.getElementById('adminProductsList');
            if (!list) return;
            if (!products.length) {
                list.innerHTML = '<p style="color:#666;font-size:0.85rem;">محصولی نیست — از فرم بالا اضافه کنید</p>';
                return;
            }
            var html = '';
            products.forEach(function(p) {
                var imgHint = p.imageUrl ? '🖼️' : (p.image || '📦');
                var safeTitle = String(p.title || 'بدون عنوان').replace(/</g, '&lt;');
                var pid = String(p.id);
                html += '<div class="admin-item" style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;padding:10px;margin-bottom:8px;background:#fff;border-radius:10px;border:1px solid #e0d5e8;">' +
                    '<span style="flex:1;min-width:120px;color:#1A1A1A;">' + imgHint + ' <strong>' + safeTitle + '</strong><br><small>' +
                    Number(p.price || 0).toLocaleString('fa-IR') + ' تومان' + (p.badge ? ' · ' + p.badge : '') + '</small></span>' +
                    '<div style="display:flex;gap:6px;">' +
                    '<button type="button" style="padding:8px 12px;border-radius:8px;border:1px solid #c9a84c;background:#fff8e7;cursor:pointer;font-family:inherit;" onclick="window.editProduct(\'' + pid.replace(/'/g, '') + '\')">✏️ ویرایش</button>' +
                    '<button type="button" style="padding:8px 12px;border-radius:8px;border:none;background:#ffebee;color:#c62828;cursor:pointer;font-family:inherit;" onclick="window.deleteProduct(\'' + pid.replace(/'/g, '') + '\')">🗑️ حذف</button>' +
                    '</div></div>';
            });
            list.innerHTML = html;
        }
        window.renderAdminProducts = renderAdminProducts;

        function resetProductForm() {
            ['editProductId','newProductTitle','newProductPrice','newProductBadge','newProductImageUrl','newProductDesc'].forEach(function(id) {
                var el = document.getElementById(id); if (el) el.value = '';
            });
            var img = document.getElementById('newProductImage'); if (img) img.value = '📚';
            var prev = document.getElementById('newProductImagePreview');
            if (prev) { prev.style.display = 'none'; prev.removeAttribute('src'); }
            var file = document.getElementById('newProductImageFile'); if (file) file.value = '';
        }
        window.resetProductForm = resetProductForm;

        async function addProduct() {
            try {
                var titleEl = document.getElementById('newProductTitle');
                var priceEl = document.getElementById('newProductPrice');
                if (!titleEl || !priceEl) {
                    alert('فرم محصول پیدا نشد');
                    return;
                }
                var title = (titleEl.value || '').trim();
                var price = parseInt(priceEl.value, 10);
                var image = ((document.getElementById('newProductImage') || {}).value || '').trim() || '📚';
                var badge = ((document.getElementById('newProductBadge') || {}).value || '').trim();
                var imageUrl = ((document.getElementById('newProductImageUrl') || {}).value || '').trim();
                if (imageUrl && imageUrl.indexOf('data:image/') === 0) {
                    var uploaded = await uploadProductDataUrl(imageUrl);
                    if (!uploaded || String(uploaded).indexOf('data:image/') === 0) {
                        if (typeof showNotification === 'function') {
                            showNotification('❌ تصویر روی Storage ذخیره نشد. محصول بدون تصویر ابری ذخیره نمی‌شود — باکت public-assets را چک کنید', 'error');
                        }
                        return;
                    }
                    imageUrl = uploaded;
                    var imageInput = document.getElementById('newProductImageUrl');
                    if (imageInput) imageInput.value = imageUrl;
                }
                var desc = ((document.getElementById('newProductDesc') || {}).value || '').trim();
                var editId = ((document.getElementById('editProductId') || {}).value || '').trim();
                if (!title) {
                    if (typeof showNotification === 'function') showNotification('❌ عنوان محصول لازم است', 'error');
                    else alert('عنوان محصول لازم است');
                    return;
                }
                if (isNaN(price) || price < 0) {
                    if (typeof showNotification === 'function') showNotification('❌ قیمت معتبر وارد کنید', 'error');
                    else alert('قیمت معتبر وارد کنید');
                    return;
                }
                var serverProducts = await loadProductsFromServerStrict();
                if (!serverProducts.ok) {
                    if (typeof showNotification === 'function') showNotification('❌ دریافت فهرست محصولات از سرور ناموفق بود؛ تغییری اعمال نشد.', 'error');
                    return;
                }
                var products = serverProducts.products;
                if (editId) {
                    var idx = products.findIndex(function(p){ return String(p.id) === String(editId); });
                    if (idx < 0) {
                        if (typeof showNotification === 'function') showNotification('❌ محصول پیدا نشد', 'error');
                        return;
                    }
                    products[idx] = {
                        id: products[idx].id,
                        title: title,
                        price: price,
                        image: image,
                        badge: badge,
                        imageUrl: imageUrl,
                        desc: desc
                    };

                } else {
                    var maxId = 0;
                    products.forEach(function(p){ var n = parseInt(p.id, 10); if (!isNaN(n) && n > maxId) maxId = n; });
                    products.push({
                        id: maxId + 1,
                        title: title,
                        price: price,
                        image: image,
                        badge: badge,
                        imageUrl: imageUrl,
                        desc: desc
                    });

                }
                var savedResult = await saveProductsSafe(products);
                if (!savedResult || !savedResult.ok) {
                    if (typeof showNotification === 'function') showNotification('❌ سرور ذخیرهٔ محصول را تأیید نکرد؛ تغییر اعمال نشد.', 'error');
                    return;
                }
                if (typeof showNotification === 'function') showNotification(editId ? '✅ ویرایش محصول در سرور ثبت شد.' : '✅ محصول در سرور ثبت شد (' + products.length + ')');
                if (typeof renderProducts === 'function') renderProducts();
                renderAdminProducts();
                resetProductForm();
            } catch (e) {
                console.error('addProduct', e);
                alert('خطا در ذخیره محصول: ' + (e && e.message ? e.message : e));
            }
        }
        window.addProduct = addProduct;
        // aliases for older report / external hooks
        window.v18SaveProduct = addProduct;
        window.openAddProductModal = function() {
            try {
                if (typeof window.toggleAdmin === 'function') window.toggleAdmin();
                var tab = document.querySelector('.admin-tab[data-tab="products"], .admin-tab[onclick*="products"]');
                if (tab) tab.click();
                var form = document.getElementById('newProductTitle');
                if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } catch (e) {}
        };


        function editProduct(id) {
            try {
                var products = getProductsSafe();
                var product = products.find(function(p){ return String(p.id) === String(id); });
                if (!product) {
                    if (typeof showNotification === 'function') showNotification('محصول پیدا نشد', 'error');
                    return;
                }
                var el;
                el = document.getElementById('editProductId'); if (el) el.value = product.id;
                el = document.getElementById('newProductTitle'); if (el) el.value = product.title || '';
                el = document.getElementById('newProductPrice'); if (el) el.value = product.price || '';
                el = document.getElementById('newProductImage'); if (el) el.value = product.image || '📚';
                el = document.getElementById('newProductBadge'); if (el) el.value = product.badge || '';
                el = document.getElementById('newProductImageUrl'); if (el) el.value = product.imageUrl || '';
                el = document.getElementById('newProductDesc'); if (el) el.value = product.desc || '';
                var prev = document.getElementById('newProductImagePreview');
                if (prev && product.imageUrl) { prev.src = product.imageUrl; prev.style.display = 'block'; }
                if (typeof switchAdminTab === 'function') switchAdminTab('products');
                if (typeof showNotification === 'function') showNotification('✏️ فرم پر شد — بعد از تغییر ذخیره کنید');
                var formCard = document.getElementById('newProductTitle');
                if (formCard) try { formCard.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
            } catch (e) {
                console.error('editProduct', e);
            }
        }
        window.editProduct = editProduct;

        async function deleteProduct(id) {
            try {
                if (!confirm('این محصول حذف شود؟\n\nحذف فقط پس از تأیید سرور انجام می‌شود.')) return;
                if (!supabaseClient) {
                    if (typeof showNotification === 'function') showNotification('❌ اتصال سرور برقرار نیست؛ محصول حذف نشد.', 'error');
                    return;
                }
                var serverProducts = await loadProductsFromServerStrict();
                if (!serverProducts.ok) {
                    if (typeof showNotification === 'function') showNotification('❌ دریافت محصول از سرور ناموفق بود؛ حذف انجام نشد.', 'error');
                    return;
                }
                var all = serverProducts.products;
                var victim = null;
                for (var i = 0; i < all.length; i++) {
                    if (String(all[i].id) === String(id) || String(all[i].cloudId || '') === String(id)) { victim = all[i]; break; }
                }
                if (!victim) {
                    if (typeof showNotification === 'function') showNotification('محصول پیدا نشد؛ فهرست را از سرور تازه‌سازی کنید.', 'error');
                    return;
                }
                var deleted = false;
                try {
                    if (victim.cloudId) {
                        var byCloudId = await supabaseClient.from('products').delete().eq('id', victim.cloudId).select('id');
                        if (byCloudId.error) throw byCloudId.error;
                        deleted = Array.isArray(byCloudId.data) && byCloudId.data.length > 0;
                    }
                    if (!deleted && victim.id != null) {
                        var byLocalId = await supabaseClient.from('products').delete().eq('local_id', Number(victim.id)).select('id');
                        if (byLocalId.error) throw byLocalId.error;
                        deleted = Array.isArray(byLocalId.data) && byLocalId.data.length > 0;
                    }
                } catch (serverError) {
                    console.warn('delete product server confirmation', serverError);
                    if (typeof showNotification === 'function') showNotification('❌ سرور حذف محصول را تأیید نکرد؛ محصول باقی ماند.', 'error');
                    return;
                }
                if (!deleted) {
                    if (typeof showNotification === 'function') showNotification('❌ محصول در سرور پیدا یا حذف نشد؛ فهرست محلی تغییر نکرد.', 'error');
                    return;
                }
                var products = all.filter(function(p) {
                    return String(p.id) !== String(victim.id) && String(p.cloudId || '') !== String(victim.cloudId || '');
                });
                try {
                    var cache = products.map(function(p) {
                        var q = Object.assign({}, p);
                        if (q.imageUrl && String(q.imageUrl).indexOf('data:image/') === 0 && String(q.imageUrl).length > 200000) q.imageUrl = '';
                        return q;
                    });
                    localStorage.setItem('cafeProducts', JSON.stringify(cache));
                } catch (cacheError) { console.warn('product cache update', cacheError); }
                if (typeof renderProducts === 'function') renderProducts();
                renderAdminProducts();
                if (typeof showNotification === 'function') showNotification('✅ محصول با تأیید سرور حذف شد.');
            } catch (e) {
                console.error('deleteProduct', e);
                if (typeof showNotification === 'function') showNotification('❌ خطا در حذف محصول: ' + (e && e.message ? e.message : e), 'error');
            }
        }
        window.deleteProduct = deleteProduct;


        function renderAdminOrders() {
            var list = document.getElementById('adminOrdersList');
            if (!list) return;
            var orders = [];
            try { orders = JSON.parse(localStorage.getItem('cafeOrders') || '[]'); } catch(e) {}
            if (!Array.isArray(orders)) orders = [];
            if (!orders.length) {
                list.innerHTML = '<p style="color:var(--text-secondary);font-size:0.8rem;">خریدی ثبت نشده</p>';
                return;
            }
            var html = '';
            orders.slice(0, 50).forEach(function(o) {
                var details = '';
                if (o.motherName) details += ' · مادر: ' + o.motherName;
                if (o.nationalId) details += ' · ملی: ' + o.nationalId;
                if (o.address) details += '<br><small>آدرس: ' + o.address + (o.postalCode ? ' | کدپستی: ' + o.postalCode : '') + '</small>';
                if (o.receiverName) details += '<br><small>تحویل: ' + o.receiverName + ' / ' + (o.receiverPhone || '') + '</small>';
                html += '<div class="admin-item" style="flex-direction:column;align-items:stretch;gap:6px;">' +
                    '<div><strong>' + (o.product || 'محصول') + '</strong> — ' + Number(o.price || 0).toLocaleString('fa-IR') + ' تومان</div>' +
                    '<small style="color:#1A1A1A;">' + (o.type === 'call' ? '📞 تماس' : '🛒 آنلاین') +
                    (o.name ? ' · ' + o.name : '') + (o.phone ? ' · ' + o.phone : '') +
                    ' · <b>' + (o.status || '') + '</b> · ' + (o.date || '') +
                    (o.hasReceipt ? ' · 🧾 فیش' : '') + details + '</small>' +
                    '<div class="admin-item-actions" style="justify-content:flex-start;">' +
                    '<button type="button" onclick="updateOrderStatus(' + kafeHtmlJsArg(String(o.id)) + ',\'تایید شده\')">✅ تایید</button>' +
                    '<button type="button" onclick="updateOrderStatus(' + kafeHtmlJsArg(String(o.id)) + ',\'رد شده\')">❌ رد</button>' +
                    '<button type="button" class="danger" onclick="deleteOrderAdmin(' + kafeHtmlJsArg(String(o.id)) + ')">🗑️</button>' +
                    '</div></div>';
            });
            list.innerHTML = html;
        }
        async function updateOrderStatus(id, status) {
            if (!supabaseClient) { showNotification('❌ اتصال سرور برقرار نیست؛ وضعیت سفارش تغییر نکرد', 'error'); return; }
            var orders = [];
            try { orders = JSON.parse(localStorage.getItem('cafeOrders') || '[]'); } catch(e) {}
            if (!Array.isArray(orders)) orders = [];
            var index = orders.findIndex(function(o) { return String(o.id) === String(id); });
            if (index < 0) { showNotification('سفارش پیدا نشد', 'error'); return; }
            var saved = await sbSyncOrderLocalId(id, {status: status});
            if (!saved || !saved.length) {
                showNotification('❌ سرور تغییر وضعیت سفارش را تأیید نکرد؛ تغییری اعمال نشد', 'error');
                return;
            }
            orders[index].status = status;
            try { localStorage.setItem('cafeOrders', JSON.stringify(orders)); } catch(e) {}
            renderAdminOrders();
            showNotification('✅ وضعیت سفارش در سرور ثبت شد: ' + status);
        }
        async function sbDeleteOrderLocalId(localId) {
            if (!supabaseClient || localId == null) return false;
            try {
                var r = await supabaseClient.from('orders').delete().eq('local_id', localId).select('id');
                if (r.error) throw r.error;
                if (Array.isArray(r.data) && r.data.length) return true;
                if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(localId))) {
                    var byId = await supabaseClient.from('orders').delete().eq('id', String(localId)).select('id');
                    if (byId.error) throw byId.error;
                    if (Array.isArray(byId.data) && byId.data.length) return true;
                }
                return false;
            } catch(e) { console.warn('order deletion was not confirmed by server', e); return false; }
        }
        async function deleteOrderAdmin(id) {
            if (!confirm('حذف این سفارش؟')) return;
            if (!supabaseClient) { showNotification('❌ اتصال سرور برقرار نیست؛ سفارش حذف نشد', 'error'); return; }
            var current = [];
            try { current = JSON.parse(localStorage.getItem('cafeOrders') || '[]'); } catch(e) {}
            if (!Array.isArray(current)) current = [];
            if (!current.some(function(o){ return String(o.id) === String(id); })) {
                showNotification('سفارش پیدا نشد', 'error'); return;
            }
            var deleted = await sbDeleteOrderLocalId(id);
            if (!deleted) {
                showNotification('❌ سرور حذف سفارش را تأیید نکرد؛ سفارش همچنان باقی است', 'error');
                return;
            }
            var orders = current.filter(function(o){ return String(o.id) !== String(id); });
            try { localStorage.setItem('cafeOrders', JSON.stringify(orders)); } catch(e) {}
            renderAdminOrders();
            showNotification('🗑️ سفارش با تأیید سرور حذف شد');
        }
        function loadMediaSettingsForm() {
            var s = {};
            try { s = JSON.parse(localStorage.getItem('cafeSettings') || '{}'); } catch(e) {}
            var map = {
                mediaHeaderLogo: s.headerLogo || '',
                mediaRegisterLogo: s.registerLogo || '',
                mediaSplashBg: s.splashBg || '',
                mediaManagerPhone: s.managerPhone || '09392979200',
                mediaManagerHours: s.managerHours || 'پنج‌روز هفته، ۱۸ الی ۲۱ — جمعه و دوشنبه پاسخ‌گو نیستیم؛ پیام بگذارید'
            };
            Object.keys(map).forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.value = map[id];
            });
        }
        window.saveMediaSettings = async function saveMediaSettings() {
            if (!supabaseClient) {
                showNotification('❌ اتصال سرور برقرار نیست؛ تنظیمات ذخیره نشد.', 'error');
                return;
            }
            if (typeof verifyOnlineAdmin !== 'function' || !(await verifyOnlineAdmin())) {
                showNotification('❌ برای ذخیره تنظیمات، ورود امن مدیر لازم است.', 'error');
                return;
            }
            var local = {};
            try { local = JSON.parse(localStorage.getItem('cafeSettings') || '{}'); } catch(e) {}
            var headerLogo = (document.getElementById('mediaHeaderLogo') || {}).value || '';
            var registerLogo = (document.getElementById('mediaRegisterLogo') || {}).value || '';
            var splashBg = (document.getElementById('mediaSplashBg') || {}).value || '';
            var managerPhone = (document.getElementById('mediaManagerPhone') || {}).value || '';
            var managerHours = (document.getElementById('mediaManagerHours') || {}).value || 'پنج‌روز هفته، ۱۸ الی ۲۱ — جمعه و دوشنبه پاسخ‌گو نیستیم؛ پیام بگذارید';
            if ([headerLogo, registerLogo, splashBg].some(function(v) { return /^data:image\//i.test(String(v)); })) {
                showNotification('❌ برای ذخیره پایدار، ابتدا تصویر را در Storage بارگذاری کنید و لینک آن را وارد کنید.', 'error');
                return;
            }
            try {
                var remote = await supabaseClient.from('app_settings').select('value').eq('key', 'admin:cafeSettings').maybeSingle();
                if (remote.error) throw remote.error;
                var serverSettings = remote.data && remote.data.value ? remote.data.value : {};
                if (typeof serverSettings === 'string') {
                    try { serverSettings = JSON.parse(serverSettings); } catch(e) { serverSettings = {}; }
                }
                if (!serverSettings || typeof serverSettings !== 'object' || Array.isArray(serverSettings)) serverSettings = {};
                // Keep sensitive payment fields from the server; never overwrite them with stale local copies.
                delete local.paymentCard;
                delete local.paymentSheba;
                var full = Object.assign({}, serverSettings, local, {
                    headerLogo: headerLogo,
                    registerLogo: registerLogo,
                    splashBg: splashBg,
                    managerPhone: managerPhone,
                    managerHours: managerHours
                });
                var saved = await cloudSaveAdminSetting('cafeSettings', full);
                if (!saved) throw new Error('ذخیره تنظیمات روی سرور تأیید نشد.');
                var localSafe = Object.assign({}, full);
                delete localSafe.paymentCard;
                delete localSafe.paymentSheba;
                localStorage.setItem('cafeSettings', JSON.stringify(localSafe));
                if (headerLogo) { var h = document.getElementById('headerLogoImg'); if (h) h.src = headerLogo; }
                if (registerLogo) { var r = document.getElementById('registerLogoImg'); if (r) r.src = registerLogo; }
                if (splashBg) { var sp = document.getElementById('splashBgImg'); if (sp) sp.src = splashBg; }
                showNotification('✅ تنظیمات با تأیید سرور ذخیره شد.');
            } catch(e) {
                console.warn('saveMediaSettings server-first', e);
                showNotification('❌ تنظیمات ذخیره نشد؛ نسخه محلی تغییر نکرد. ' + (e.message || ''), 'error');
            }
        }
        function loadMediaSettings() {
            var s = {};
            try { s = JSON.parse(localStorage.getItem('cafeSettings')||'{}'); } catch(e){}
            var map = {mediaHeaderLogo:'headerLogo', mediaRegisterLogo:'registerLogo', mediaSplashBg:'splashBg', mediaManagerPhone:'managerPhone'};
            Object.keys(map).forEach(function(id){ var el=document.getElementById(id); if(el && s[map[id]]) el.value=s[map[id]]; });
        }

        // ============================================================
        // مدیریت اشتراک‌ها (ادمین)
        // ============================================================
        function renderAdminSubscriptions() {
            var subscriptions = JSON.parse(localStorage.getItem('adminSubscriptions') || '[]');
            var html = '';
            if (subscriptions.length === 0) {
                html = '<p style="color:var(--text-secondary);font-size:0.8rem;">کد اشتراکی وجود ندارد</p>';
            } else {
                subscriptions.forEach(function(s) {
                    html +=
                        '<div class="admin-item">' +
                        '<span>🔑 ' + s.code + ' - ' + s.days + ' روز ' + (s.used ? '✅ استفاده شده' : '🟢 فعال') + '</span>' +
                        '<div class="admin-item-actions">' +
                        '<button class="danger" onclick="deleteSubscription(\'' + s.code + '\')">🗑️</button>' +
                        '</div>' +
                        '</div>';
                });
            }
            document.getElementById('adminSubscriptionsList').innerHTML = html;
        }

        window.addSubscription = function addSubscription() {
            var code = document.getElementById('subscriptionCode').value.trim();
            var days = parseInt(document.getElementById('subscriptionDays').value);
            if (!code || !days) {
                showNotification('لطفاً کد و تعداد روز را وارد کنید', 'error');
                return;
            }
            var subscriptions = JSON.parse(localStorage.getItem('adminSubscriptions') || '[]');
            if (subscriptions.find(function(s) { return s.code === code; })) {
                showNotification('این کد قبلاً وجود دارد', 'error');
                return;
            }
            subscriptions.push({ code: code, days: days, used: false });
            localStorage.setItem('adminSubscriptions', JSON.stringify(subscriptions));
            renderAdminSubscriptions();
            document.getElementById('subscriptionCode').value = '';
            document.getElementById('subscriptionDays').value = '30';
            showNotification('✅ کد اشتراک اضافه شد');
        }

        function deleteSubscription(code) {
            if (!confirm('آیا از حذف این کد اشتراک اطمینان دارید؟')) return;
            var subscriptions = JSON.parse(localStorage.getItem('adminSubscriptions') || '[]');
            subscriptions = subscriptions.filter(function(s) { return s.code !== code; });
            localStorage.setItem('adminSubscriptions', JSON.stringify(subscriptions));
            renderAdminSubscriptions();
            showNotification('🗑️ کد اشتراک حذف شد');
        }


        // ============================================================
        // مدیریت مودال‌ها (ادمین) — ویرایش عنوان/راهنما/آیکون
        // ============================================================
        var modalList = [
            {id:'sababModal', title:'سبب القادم', icon:'👁️'},
            {id:'mohabbatModal', title:'محبت زن به مرد', icon:'💖'},
            {id:'rastegooModal', title:'راستگو و شفای بیمار', icon:'✅'},
            {id:'dostDoshmaniModal', title:'دوست.دشمنی.تجاری', icon:'🤝'},
            {id:'elateBimari12Modal', title:'علت بیماری ۱۲تایی', icon:'🩺'},
            {id:'elateBimariModal', title:'علت بیماری', icon:'💊'},
            {id:'amadanModal', title:'آمدن غایب', icon:'⏰'},
            {id:'bahtModal', title:'بخت و اقبال', icon:'🍀'},
            {id:'setareModal', title:'ستاره طالع', icon:'⭐'},
            {id:'aghatModal', title:'عاقبت ازدواج', icon:'💍'},
            {id:'calculatorModal', title:'ماشین حساب + ابجد', icon:'🧮'},
            {id:'dalilModal', title:'دلیل الحیران', icon:'❓'},
            {id:'ramlModal', title:'رمل امام علی', icon:'🎲'},
            {id:'hamzadModal', title:'همزاد قرین', icon:'👥'},
            {id:'mokashefeModal', title:'مکاشفه موکلین', icon:'🔮'},
            {id:'sotareChiniModal', title:'ستاره چینی', icon:'⭐'},
            {id:'mokelModal', title:'استخراج موکل', icon:'📿'},
            {id:'asmaniModal', title:'اسماء الحسنی', icon:'🌟'},
            {id:'vefqModal', title:'طلسم‌ساز وفق', icon:'🔮'},
            {id:'marriageAgeModal', title:'سن ازدواج', icon:'💍'},
            {id:'developingModal', title:'در حال توسعه', icon:'🚧'}
        ];

        // ============================================================
        // مدیریت مودال‌ها — نسخه پایدار V22.6.1
        // منبع اصلی داده = Supabase /modal_data؛ localStorage فقط fallback آفلاین است.
        // ============================================================
        window.__modalCloudData = window.__modalCloudData || {};
        function getModalMetaMap() {
            try { return JSON.parse(localStorage.getItem('cafeModalMeta') || '{}'); } catch (e) { return {}; }
        }
        function saveModalMetaMap(map) {
            try { localStorage.setItem('cafeModalMeta', JSON.stringify(map)); } catch (e) {}
        }
        function getModalMeta(id) {
            var cloud=window.__modalCloudData[id]||{}, local=getModalMetaMap()[id]||{}, base=null;
            for(var i=0;i<modalList.length;i++) if(modalList[i].id===id){base=modalList[i];break;}
            var m=Object.assign({},local,cloud);
            return {id:id,title:m.title||(base?base.title:id),icon:m.icon||(base?base.icon:'📜'),guide:m.guide||'',notes:m.notes||'',question:m.question||'',answers:Array.isArray(m.answers)?m.answers:[],results:m.results||null,houses:Array.isArray(m.houses)?m.houses:null,questionBank:Array.isArray(m.questionBank)?m.questionBank:null};
        }
        function getModalDataSupabase(){ return window.supabaseClient || window.v12Supabase || null; }
        async function loadModalDataCloud(modalId){
            try{
                var client=getModalDataSupabase(); if(!client)return null;
                var r=await client.from('modal_data').select('content,version,updated_at').eq('modal_id',modalId).maybeSingle();
                if(r.error) throw r.error;
                if(!r.data||!r.data.content)return null;
                window.__modalCloudData[modalId]=r.data.content;
                return r.data.content;
            }catch(e){console.warn('modal_data read',modalId,e);return null;}
        }
        async function saveModalDataCloud(modalId,content){
            try{
                if(typeof verifyOnlineAdmin!=='function'||!(await verifyOnlineAdmin()))throw new Error('Verified admin session required');
                var client=getModalDataSupabase(); if(!client)throw new Error('Supabase client unavailable');
                var r=await client.from('modal_data').upsert({modal_id:modalId,content:content,version:1,updated_at:new Date().toISOString()},{onConflict:'modal_id'});
                if(r.error)throw r.error;
                window.__modalCloudData[modalId]=content;
                return true;
            }catch(e){console.error('modal_data save',modalId,e);return false;}
        }
        function currentMokashefeData(){
            if (typeof getMokashefeData === 'function') {
                try { return getMokashefeData(); } catch (e) {}
            }
            if(Array.isArray(window.__MOKASHEFE_16) && window.__MOKASHEFE_16.length && (window.__MOKASHEFE_16[0].persianText || window.__MOKASHEFE_16[0].conclusion || window.__MOKASHEFE_16[0].arabicText))
                return window.__MOKASHEFE_16;
            if(typeof window.MOKASHEFE_16!=='undefined' && Array.isArray(window.MOKASHEFE_16)) return window.MOKASHEFE_16;
            return [];
        }
        function currentRamlQuestions(){
            if(Array.isArray(window.__RAML_QUESTIONS)) return window.__RAML_QUESTIONS;
            if(typeof ramlQuestions!=='undefined' && Array.isArray(ramlQuestions)) return ramlQuestions;
            if(Array.isArray(window.RAML_QUESTIONS)) return window.RAML_QUESTIONS;
            return [];
        }
        function currentDalilResults(){
            if(window.__DALIL_HAYRAN_RESULTS && typeof window.__DALIL_HAYRAN_RESULTS==='object') return window.__DALIL_HAYRAN_RESULTS;
            if(window.DALIL_HAYRAN_RESULTS && typeof window.DALIL_HAYRAN_RESULTS==='object') return window.DALIL_HAYRAN_RESULTS;
            return {};
        }
        function getModalEditorModel(modalId){
            var model={modalId:modalId,type:'generic',label:'داده‌های مودال',question:'',items:[],data:null,note:''};
            var cloud=(window.__modalCloudData&&window.__modalCloudData[modalId])||{};

            // --- مودال‌های ساختاری ویژه ---
            if(modalId==='hamzadModal'){
                model.type='resultMap'; model.label='نتایج همزاد قرین (۲۸)';
                var hs=(typeof hamzadResults==='object'&&hamzadResults)?hamzadResults:{};
                if(cloud.results) hs=Object.assign({},hs,cloud.results);
                for(var i=1;i<=28;i++) model.items.push({key:String(i),text:String(hs[i]||hs[String(i)]||''),label:'نتیجه '+i});
                return model;
            }
            if(modalId==='dalilModal'){
                model.type='resultMap'; model.label='نتایج دلیل الحیران (۹)';
                var dr=currentDalilResults();
                if(cloud.results) dr=Object.assign({},dr,cloud.results);
                for(var d=1;d<=9;d++) model.items.push({key:String(d),text:String(dr[d]||dr[String(d)]||''),label:'نتیجه '+d});
                return model;
            }
            if(modalId==='mokashefeModal'){
                model.type='houseList'; model.label='۱۶ خانه مکاشفه';
                model.data=JSON.parse(JSON.stringify(typeof getMokashefeData==='function'?getMokashefeData():currentMokashefeData()));
                return model;
            }
            if(modalId==='ramlModal'){
                model.type='questionBank'; model.label='قرعه / رمل امام علی — سؤال و پاسخ';
                model.data=JSON.parse(JSON.stringify(currentRamlQuestions()));
                return model;
            }
            if(modalId==='vefqModal'||modalId==='vefghModal'||modalId==='talismanModal'){
                model.type='formula'; model.label='طلسم‌ساز (محاسبه‌محور)';
                model.note='نتیجه از فرمول ابجد/برج ساخته می‌شود. عنوان و راهنما را از فیلدهای بالا ویرایش کنید. در صورت نیاز متن‌های کمکی را در بخش متن‌های آزاد پایین اضافه کنید.';
                // also allow free texts
                model.type='textList';
                model.label='طلسم‌ساز — متن‌های کمکی مدیر';
                model.items=[];
                var tlist=Array.isArray(cloud.texts)?cloud.texts:(Array.isArray(cloud.answers)?cloud.answers:[]);
                if(!tlist.length) tlist=[''];
                for(var ti=0;ti<tlist.length;ti++) model.items.push({key:String(ti+1),text:String(tlist[ti]||''),label:'متن کمکی '+(ti+1)});
                model.note='طلسم‌ساز محاسبه‌محور است؛ این کادرها برای یادداشت/متن ثابت قابل نمایش یا آرشیو مدیر است. عنوان و راهنما را بالا ویرایش کنید.';
                return model;
            }

            // --- مودال‌هایی که از resultsDB تغذیه می‌شوند ---
            var resultsDbMap={
                sababModal:'sabab',
                mohabbatModal:'mohabbat',
                setareModal:'setare',
                bahtModal:'baht',
                aghatModal:'ezdevaj',
                elateBimariModal:'bimari'
            };
            var dbKey=resultsDbMap[modalId];
            if(dbKey && typeof resultsDB==='object' && resultsDB[dbKey]){
                model.type='resultMap';
                model.label='نتایج ثابت مودال';
                model.dbKey=dbKey;
                var src=Object.assign({},resultsDB[dbKey]);
                if(cloud.results) src=Object.assign({},src,cloud.results);
                var keys=Object.keys(src).sort(function(a,b){return Number(a)-Number(b);});
                for(var ki=0;ki<keys.length;ki++){
                    var k=keys[ki];
                    model.items.push({key:String(k),text:String(src[k]||''),label:'نتیجه '+k});
                }
                if(!model.items.length){
                    for(var z=1;z<=7;z++) model.items.push({key:String(z),text:'',label:'نتیجه '+z});
                }
                return model;
            }

            // --- اگر ابر results عددی دارد ---
            if(cloud.results && typeof cloud.results==='object' && !Array.isArray(cloud.results)){
                model.type='resultMap'; model.label='نتایج ذخیره‌شده مودال';
                var ck=Object.keys(cloud.results).sort(function(a,b){return Number(a)-Number(b);});
                for(var cj=0;cj<ck.length;cj++){
                    model.items.push({key:String(ck[cj]),text:String(cloud.results[ck[cj]]||''),label:'نتیجه '+ck[cj]});
                }
                if(model.items.length) return model;
            }

            // --- همه مودال‌های دیگر: لیست متن آزاد (افزودن / حذف) ---
            model.type='textList';
            model.label='متن‌های قابل ویرایش این مودال';
            model.note='می‌توانید هر تعداد متن نتیجه/پاسخ/توضیح اضافه یا حذف کنید. پس از ذخیره روی سرور می‌ماند.';
            var texts=Array.isArray(cloud.texts)?cloud.texts:(Array.isArray(cloud.answers)?cloud.answers:[]);
            // تلاش برای خواندن از DOM گزینه‌ها به‌عنوان شروع
            if(!texts.length){
                var modal=document.getElementById(modalId);
                if(modal){
                    var q=modal.querySelector('[data-question],.modal-question,.question-title,.question-text,.modal-guide');
                    if(q) model.question=(q.textContent||'').trim();
                    var nodes=modal.querySelectorAll('[data-answer],.answer-option,.option-btn,.answer-btn');
                    for(var n=0;n<nodes.length;n++) texts.push((nodes[n].textContent||'').trim());
                }
            }
            if(!texts.length) texts=[''];
            for(var x=0;x<texts.length;x++) model.items.push({key:String(x+1),text:String(texts[x]||''),label:'متن '+(x+1)});
            return model;
        }

        function renderModalAnswerEditor(answers,model){
            var box=document.getElementById('modalEditAnswers'); if(!box)return;
            model=model||getModalEditorModel(document.getElementById('modalEditId').value);
            var html='<div class="modal-edit-answers-title">'+escapeHtml(model.label)+'</div>';
            if(model.type==='resultMap'){
                html+='<div class="modal-editor-structure-note">تعداد نتایج این مودال ثابت است (مثلاً همزاد: ۲۸). حذف = پاک‌کردن متن همان شماره. برای نوشتن متن بلند از کادر استفاده کنید.</div>';
                for(var i=0;i<model.items.length;i++){
                    var it=model.items[i];
                    html+='<div class="modal-answer-edit" data-editor-item="'+i+'" style="margin:10px 0;padding:10px;border:1px solid rgba(201,168,76,0.25);border-radius:10px"><div class="modal-answer-edit-head"><label style="font-weight:800">'+escapeHtml(it.label)+'</label><button type="button" class="danger modal-answer-delete" onclick="window.deleteModalEditorItem('+i+')">🗑️ حذف متن</button></div><textarea data-modal-answer-index="'+i+'" data-result-key="'+escapeHtml(it.key||String(i+1))+'" rows="4" style="width:100%;font-family:inherit" placeholder="متن کامل '+escapeHtml(it.label)+'">'+escapeHtml(it.text||'')+'</textarea></div>';
                }
                html+='<button type="button" class="btn" onclick="window.addModalEditorItem()">➕ رفتن به اولین جای خالی</button>';
            }else if(model.type==='questionBank'){
                html+='<div class="modal-editor-structure-note">ساختار واقعی: '+model.data.length+' سؤال. هر سؤال پاسخ‌های واقعی خودش را دارد و بدون ساختن داده جعلی قابل ویرایش است.</div>';
                html+='<select id="modalRamlQuestionSelect" style="width:100%;padding:10px;border-radius:10px;margin:8px 0;font-family:inherit;">';
                for(var q=0;q<model.data.length;q++)html+='<option value="'+q+'">سؤال '+(q+1)+' — '+escapeHtml(model.data[q].title||'')+'</option>';
                html+='</select><div id="modalRamlQuestionEditor"></div>';
                html+='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px"><button type="button" class="btn" onclick="window.addRamlQuestionOption()">➕ افزودن پاسخ</button><button type="button" class="danger" onclick="window.deleteRamlQuestionOption()">🗑️ حذف پاسخ آخر</button></div>';
            }else if(model.type==='houseList'){
                html+='<div class="modal-editor-structure-note">۱۶ خانه ثابت است (نگاشت محاسبه). برای هر خانه ترتیب ویرایش: ۱ عربی کامل ۲ فارسی کامل ۳ نتیجه‌گیری. حذف = پاک‌کردن متن همان فیلد/خانه.</div>';
                var houseFields=[
                    {key:'arabicText',label:'① متن عربی کامل',rows:5},
                    {key:'persianText',label:'② ترجمه فارسی کامل',rows:5},
                    {key:'conclusion',label:'③ نتیجه‌گیری',rows:3},
                    {key:'summary',label:'خلاصه (اختیاری)',rows:2},
                    {key:'shortResult',label:'نتیجه کوتاه (اختیاری)',rows:2},
                    {key:'name',label:'نام نمایشی خانه',rows:1},
                    {key:'houseArabicName',label:'نام عربی/عنوان خانه',rows:1}
                ];
                for(var h=0;h<model.data.length;h++){
                    var house=model.data[h]||{};
                    html+='<div class="modal-house-edit" style="border:1px solid rgba(201,168,76,0.35);border-radius:12px;padding:12px;margin:12px 0;background:rgba(0,0,0,0.15)">';
                    html+='<div class="modal-answer-edit-head"><b>خانه '+escapeHtml(String(house.number||h+1))+' — '+escapeHtml(house.houseArabicName||house.persianName||house.name||'')+'</b>';
                    html+='<button type="button" class="danger modal-answer-delete" onclick="window.clearModalHouse('+h+')">🗑️ پاک‌کردن همه متن‌های این خانه</button></div>';
                    for(var fi=0;fi<houseFields.length;fi++){
                        var f=houseFields[fi];
                        html+='<label style="display:block;margin-top:8px;font-weight:700">'+escapeHtml(f.label)+'</label>';
                        html+='<textarea data-house-index="'+h+'" data-house-field="'+f.key+'" rows="'+f.rows+'" style="width:100%;margin-top:4px;font-family:inherit" placeholder="'+escapeHtml(f.label)+'">'+escapeHtml(house[f.key]||'')+'</textarea>';
                    }
                    html+='</div>';
                }
                html+='<div class="modal-editor-structure-note">افزودن خانهٔ هفدهم مجاز نیست تا شمارهٔ محاسبه (باقی‌مانده بر ۱۶) خراب نشود. برای خالی‌کردن از «پاک‌کردن» استفاده کنید.</div>';
            }else if(model.type==='textList'){
                html+='<div class="modal-editor-structure-note">'+(model.note?escapeHtml(model.note):'متن‌های این مودال را ویرایش، اضافه یا حذف کنید.')+'</div>';
                for(var i=0;i<model.items.length;i++){
                    var it=model.items[i];
                    html+='<div class="modal-answer-edit" data-editor-item="'+i+'" style="margin:10px 0;padding:10px;border:1px solid rgba(201,168,76,0.25);border-radius:10px"><div class="modal-answer-edit-head"><label style="font-weight:800">'+escapeHtml(it.label)+'</label><button type="button" class="danger modal-answer-delete" onclick="window.deleteTextListItem('+i+')">🗑️ حذف</button></div><textarea data-text-list-index="'+i+'" rows="4" style="width:100%;font-family:inherit" placeholder="متن">'+escapeHtml(it.text||'')+'</textarea></div>';
                }
                html+='<button type="button" class="btn" onclick="window.addTextListItem()">➕ افزودن متن جدید</button>';
            }else if(model.type==='formula'){
                html+='<div class="modal-editor-structure-note">'+(model.note?escapeHtml(model.note):'این مودال محاسبه‌محور است. عنوان و راهنما را از فیلدهای بالا ذخیره کنید.')+'</div>';
            }else{
                if(model.items.length){for(var g=0;g<model.items.length;g++)html+='<div class="modal-answer-edit"><label>'+escapeHtml(model.items[g].label||('گزینه '+(g+1)))+'</label><textarea data-modal-answer-index="'+g+'" rows="2">'+escapeHtml(model.items[g].text||'')+'</textarea></div>';
                    html+='<button type="button" class="btn" onclick="window.addModalEditorItem()">➕ افزودن در اولین جای خالی</button>';
                }else html+='<div class="modal-editor-structure-note">این مودال دادهٔ نتیجه‌ای ثابت در کد ندارد؛ هیچ دادهٔ ساختگی اضافه نشده است.</div>';
            }
            box.innerHTML=html;
            if(model.type==='questionBank'){
                var sel=document.getElementById('modalRamlQuestionSelect');
                if(sel)sel.onchange=function(){renderRamlQuestionEditor(model.data[parseInt(this.value,10)||0]);};
                renderRamlQuestionEditor(model.data[0]||{opts:[]});
            }
        }
        function renderRamlQuestionEditor(question){
            var box=document.getElementById('modalRamlQuestionEditor');if(!box)return;
            var opts=Array.isArray(question.opts)?question.opts:[],html='<div class="modal-editor-question-title">✏️ '+escapeHtml(question.title||'سؤال')+'</div>';
            for(var i=0;i<opts.length;i++)html+='<div class="modal-answer-edit" style="margin:8px 0;padding:8px;border:1px solid rgba(201,168,76,0.2);border-radius:8px"><div class="modal-answer-edit-head"><label style="font-weight:700">پاسخ '+(i+1)+'</label><button type="button" class="danger modal-answer-delete" onclick="window.deleteRamlOption('+i+')">🗑️ حذف متن</button></div><textarea data-raml-opt-index="'+i+'" rows="3" style="width:100%;font-family:inherit">'+escapeHtml(opts[i]||'')+'</textarea></div>';
            if(!opts.length)html+='<div class="modal-editor-structure-note">این سؤال فعلاً پاسخ ثبت‌شده ندارد.</div>';
            box.innerHTML=html;
        }
        function collectModalEditorData(modalId){
            var model=getModalEditorModel(modalId),out={};
            if(model.type==='resultMap'){
                out.results={};var els=document.querySelectorAll('#modalEditAnswers [data-modal-answer-index]');
                for(var i=0;i<els.length;i++){var v=(els[i].value||'').trim();var rk=els[i].getAttribute('data-result-key')||String(i+1);out.results[String(rk)]=v;}
            }else if(model.type==='questionBank'){
                var sel=document.getElementById('modalRamlQuestionSelect'),idx=sel?parseInt(sel.value,10):0;
                var all=currentRamlQuestions();var q=JSON.parse(JSON.stringify(all[idx]||model.data[idx]||{id:idx+1,title:'',opts:[]}));
                var opts=document.querySelectorAll('#modalRamlQuestionEditor [data-raml-opt-index]');q.opts=[];
                for(var k=0;k<opts.length;k++)q.opts.push((opts[k].value||'').trim());
                model.data[idx]=q; out.questionBank=model.data;
            }else if(model.type==='houseList'){
                var fields=document.querySelectorAll('#modalEditAnswers [data-house-index]');
                for(var h=0;h<fields.length;h++){
                    var hi=parseInt(fields[h].getAttribute('data-house-index'),10),key=fields[h].getAttribute('data-house-field');
                    if(!model.data[hi]) model.data[hi]={number:hi+1};
                    model.data[hi][key]=(fields[h].value||'').trim();
                    model.data[hi].number = model.data[hi].number || (hi+1);
                }
                out.houses=model.data;
            }else if(model.type==='textList'){
                out.texts=[];var tl=document.querySelectorAll('#modalEditAnswers [data-text-list-index]');
                for(var t=0;t<tl.length;t++){var tv=(tl[t].value||'').trim();if(tv)out.texts.push(tv);}
                out.answers=out.texts.slice();
            }else{
                out.answers=[];var a=document.querySelectorAll('#modalEditAnswers [data-modal-answer-index]');for(var j=0;j<a.length;j++)out.answers.push((a[j].value||'').trim());
            }
            return out;
        }
        window.deleteModalEditorItem=function(index){var el=document.querySelector('#modalEditAnswers [data-modal-answer-index="'+index+'"]');if(el)el.value='';};
        window.addModalEditorItem=function(){var box=document.querySelector('#modalEditAnswers textarea[data-modal-answer-index]:not(:placeholder-shown)');var els=document.querySelectorAll('#modalEditAnswers [data-modal-answer-index]');for(var i=0;i<els.length;i++){if(!(els[i].value||'').trim()){els[i].focus();return;}}showNotification('ظرفیت این محاسبه تکمیل است؛ ابتدا یک نتیجه را حذف کنید.','error');};
        window.clearModalHouse=function(i){document.querySelectorAll('#modalEditAnswers [data-house-index="'+i+'"]').forEach(function(e){e.value='';});};
        window.addModalHouse=function(){showNotification('ساختار ۱۶ خانهٔ این محاسبه ثابت است؛ برای جلوگیری از خراب‌شدن نگاشت نتیجه، خانه جدید به‌صورت جعلی ساخته نمی‌شود.','error');};
        window.deleteRamlOption=function(i){var e=document.querySelector('#modalRamlQuestionEditor [data-raml-opt-index="'+i+'"]');if(e)e.value='';};
        window.addRamlQuestionOption=function(){var sel=document.getElementById('modalRamlQuestionSelect'),idx=sel?parseInt(sel.value,10):0,q=currentRamlQuestions()[idx];if(!q)return;var e=document.createElement('textarea');e.setAttribute('data-raml-opt-index',String(q.opts.length));e.rows=2;e.style.width='100%';e.placeholder='پاسخ جدید';var wrap=document.createElement('div');wrap.className='modal-answer-edit';wrap.innerHTML='<label>پاسخ '+(q.opts.length+1)+'</label>';wrap.appendChild(e);document.getElementById('modalRamlQuestionEditor').appendChild(wrap);};
        window.deleteRamlQuestionOption=function(){var box=document.getElementById('modalRamlQuestionEditor');if(!box)return;var es=box.querySelectorAll('[data-raml-opt-index]');if(es.length)es[es.length-1].value='';};
        function renderAdminModals(){
            var container=document.getElementById('adminModalsList');if(!container)return;var html='';
            modalList.forEach(function(m){var meta=getModalMeta(m.id),exists=!!document.getElementById(m.id),locked=(typeof isVipLocked==='function')?isVipLocked(m.id):false,model=getModalEditorModel(m.id),structure='';
                if(model.type==='resultMap')structure=model.items.length+' نتیجه';else if(model.type==='houseList')structure=model.data.length+' خانه';else if(model.type==='questionBank')structure=model.data.length+' سؤال';
                html+='<div class="admin-item modal-admin-item"><span class="modal-admin-name">'+escapeHtml(meta.icon)+' <b>'+escapeHtml(meta.title)+'</b> <span class="admin-structure">'+structure+'</span>'+(locked?' <span class="admin-state vip">VIP 🔒</span>':' <span class="admin-state free">آزاد 🔓</span>')+(!exists?' <span class="admin-state missing">(DOM نیست)</span>':'')+'</span><div class="modal-admin-actions"><label class="vip-lock-label"><input type="checkbox" '+(locked?'checked':'')+' onchange="window.setVipLock && window.setVipLock(\''+m.id+'\', this.checked)"> '+(locked?'قفل VIP':'قفل کردن')+'</label><button type="button" onclick="editModalMetaAdmin(\''+m.id+'\')">✏️ ویرایش کامل</button></div></div>';
            });
            container.innerHTML=html||'<p class="settings-empty">مودالی تعریف نشده</p>';
        }
        window.renderAdminModals=renderAdminModals;
        async function editModalMetaAdmin(modalId){
            var meta=getModalMeta(modalId),cloud=await loadModalDataCloud(modalId);if(cloud)meta=Object.assign(meta,cloud);
            var card=document.getElementById('modalEditFormCard');if(!card)return;
            document.getElementById('modalEditId').value=modalId;document.getElementById('modalEditTitle').value=meta.title||'';document.getElementById('modalEditIcon').value=meta.icon||'';document.getElementById('modalEditGuide').value=meta.guide||'';document.getElementById('modalEditQuestion').value=meta.question||'';
            var model=getModalEditorModel(modalId);
            if(model.type==='resultMap'&&cloud&&cloud.results){for(var r=1;r<=model.items.length;r++)if(cloud.results[String(r)]!==undefined)model.items[r-1].text=cloud.results[String(r)];}
            if(model.type==='houseList'){
                var baseHouses=(typeof getMokashefeData==='function')?getMokashefeData():(model.data||[]);
                if(cloud&&Array.isArray(cloud.houses)&&cloud.houses.length){
                    var merged=[];
                    for(var hi=0;hi<16;hi++){
                        var b=baseHouses[hi]||{number:hi+1};
                        var c=cloud.houses[hi]||{};
                        merged.push(Object.assign({},b,c,{number:(c.number||b.number||hi+1)}));
                    }
                    model.data=merged;
                } else model.data=JSON.parse(JSON.stringify(baseHouses));
            }
            if(model.type==='questionBank'&&cloud&&Array.isArray(cloud.questionBank))model.data=cloud.questionBank;
            renderModalAnswerEditor(meta.answers||[],model);document.getElementById('modalEditFormTitle').textContent='✏️ ویرایش کامل: '+meta.title;card.style.display='block';try{card.scrollIntoView({behavior:'smooth',block:'nearest'});}catch(e){}
        }
        window.cancelModalMetaEdit = function cancelModalMetaEdit(){var card=document.getElementById('modalEditFormCard');if(card)card.style.display='none';}
        window.saveModalMetaAdmin = async function saveModalMetaAdmin(){
            var id=(document.getElementById('modalEditId')||{}).value;if(!id)return;
            var title=((document.getElementById('modalEditTitle')||{}).value||'').trim(),icon=((document.getElementById('modalEditIcon')||{}).value||'').trim(),guide=((document.getElementById('modalEditGuide')||{}).value||'').trim(),question=((document.getElementById('modalEditQuestion')||{}).value||'').trim();
            var content={title:title,icon:icon,guide:guide,question:question};Object.assign(content,collectModalEditorData(id));
            var ok=await saveModalDataCloud(id,content);
            if(!ok){showNotification('❌ ذخیره سرور انجام نشد؛ تغییرات اعمال نشد. اتصال و دسترسی مدیر را بررسی کنید.','error');return;}
            window.__modalCloudData[id]=content;var map2=getModalMetaMap();delete map2[id];saveModalMetaMap(map2);
            
            // اعمال resultsDB برای مودال‌های عمومی
            try{
                var _dbMap={sababModal:'sabab',mohabbatModal:'mohabbat',setareModal:'setare',bahtModal:'baht',aghatModal:'ezdevaj',elateBimariModal:'bimari'};
                if(_dbMap[id]&&content.results&&typeof resultsDB==='object'&&resultsDB[_dbMap[id]]){
                    for(var _rk in content.results){ if(content.results.hasOwnProperty(_rk)) resultsDB[_dbMap[id]][_rk]=content.results[_rk]; }
                }
            }catch(_eDb){}

            if(id==='hamzadModal'&&content.results&&typeof hamzadResults==='object')for(var hk=1;hk<=28;hk++)hamzadResults[hk]=content.results[String(hk)]||'';
            if(id==='dalilModal'&&content.results){window.__DALIL_HAYRAN_RESULTS=content.results;if(window.DALIL_HAYRAN_RESULTS&&typeof window.DALIL_HAYRAN_RESULTS==='object')for(var dk=1;dk<=9;dk++)window.DALIL_HAYRAN_RESULTS[dk]=content.results[String(dk)]||'';}
            if(id==='mokashefeModal'&&Array.isArray(content.houses)){window.__MOKASHEFE_16=content.houses;}
            if(id==='ramlModal'&&Array.isArray(content.questionBank)){window.__RAML_QUESTIONS=content.questionBank;ramlQuestions=content.questionBank;}
            applyModalMetaToUI(id);cancelModalMetaEdit();renderAdminModals();if(typeof renderModalsHomeGrid==='function')renderModalsHomeGrid();if(typeof renderDrawerItems==='function')renderDrawerItems();showNotification('✅ داده واقعی مودال در Supabase ذخیره شد');
        }
        async function resetModalMetaAdmin(modalId){
            if(!confirm('بازنشانی این مودال به حالت اولیه؟'))return;
            if(typeof verifyOnlineAdmin!=='function'||!(await verifyOnlineAdmin())){showNotification('❌ برای بازنشانی، ورود امن مدیر لازم است.','error');return;}
            var client=getModalDataSupabase();var ok=false;
            try{if(client){var r=await client.from('modal_data').delete().eq('modal_id',modalId).select('modal_id');if(r.error)throw r.error;ok=Array.isArray(r.data)&&r.data.length>0;}}catch(e){console.error(e);}
            if(!ok){showNotification('❌ سرور حذف داده را تأیید نکرد؛ اطلاعات تغییری نکرد.','error');return;}
            delete window.__modalCloudData[modalId];try{var map=getModalMetaMap();delete map[modalId];saveModalMetaMap(map);}catch(e){}
            showNotification('✅ داده سفارشی با تأیید سرور حذف شد');setTimeout(function(){location.reload();},500);
        }
        async function loadAllModalDataCloud(){
            try{
                var client=getModalDataSupabase();if(!client)return;
                var r=await client.from('modal_data').select('modal_id,content');if(r.error)throw r.error;
                (r.data||[]).forEach(function(row){if(row&&row.modal_id&&row.content)window.__modalCloudData[row.modal_id]=row.content;});
                var h=window.__modalCloudData.hamzadModal&&window.__modalCloudData.hamzadModal.results;
                if(h&&typeof hamzadResults==='object')for(var k=1;k<=28;k++)if(h[String(k)]!==undefined)hamzadResults[k]=h[String(k)]||'';
                var d=window.__modalCloudData.dalilModal&&window.__modalCloudData.dalilModal.results;
                if(d){window.__DALIL_HAYRAN_RESULTS=d;if(window.DALIL_HAYRAN_RESULTS)for(var dk=1;dk<=9;dk++)window.DALIL_HAYRAN_RESULTS[dk]=d[String(dk)]||'';}
                var mo=window.__modalCloudData.mokashefeModal&&window.__modalCloudData.mokashefeModal.houses;if(Array.isArray(mo)&&mo[0]&&(mo[0].persianText||mo[0].conclusion))window.__MOKASHEFE_16=mo;
                var rq=window.__modalCloudData.ramlModal&&window.__modalCloudData.ramlModal.questionBank;if(Array.isArray(rq)){window.__RAML_QUESTIONS=rq;ramlQuestions=rq;}
                modalList.forEach(function(m){applyModalMetaToUI(m.id);});
                if(typeof renderModalsHomeGrid==='function')renderModalsHomeGrid();if(typeof renderDrawerItems==='function')renderDrawerItems();
            }catch(e){console.warn('modal_data load all',e);}
        }
        window.loadAllModalDataCloud=loadAllModalDataCloud;
        function applyAllModalMeta(){try{modalList.forEach(function(m){applyModalMetaToUI(m.id);});}catch(e){}}
        function editModalAdmin(modalId){editModalMetaAdmin(modalId);}function saveModalAdmin(){saveModalMetaAdmin();}function resetModalAdmin(modalId){resetModalMetaAdmin(modalId);}
        function applyModalMetaToUI(modalId){var meta=getModalMeta(modalId),modal=document.getElementById(modalId);if(!modal)return;var titleEl=modal.querySelector('.modal-glass-title');if(titleEl&&meta.title)titleEl.textContent=(meta.icon?meta.icon+' ':'')+meta.title;var logoEl=modal.querySelector('.modal-glass-logo');if(logoEl&&meta.icon)logoEl.textContent=meta.icon;var guideEl=modal.querySelector('.modal-guide');if(guideEl&&meta.guide)guideEl.textContent=meta.guide;}

        // ============================================================
        // تنظیمات مدیریت
        // ============================================================
        window.saveAdminSettings = async function saveAdminSettings() {
            if (typeof verifyOnlineAdmin !== 'function' || !(await verifyOnlineAdmin())) {
                showNotification('فقط مدیر واردشده می‌تواند تنظیمات پرداخت را ذخیره کند', 'error');
                return;
            }
            if (!supabaseClient) {
                showNotification('❌ اتصال سرور برقرار نیست؛ تنظیمات پرداخت ذخیره نشد.', 'error');
                return;
            }
            var local = {};
            try { local = JSON.parse(localStorage.getItem('cafeSettings') || '{}'); } catch (e) {}
            var cardEl = document.getElementById('paymentCardNumber');
            var shebaEl = document.getElementById('paymentSheba');
            var ownerEl = document.getElementById('paymentCardOwner');
            var guideEl = document.getElementById('paymentGuide');
            var card = cardEl ? (cardEl.value || '').trim() : '';
            var sheba = shebaEl ? (shebaEl.value || '').trim() : '';
            var owner = ownerEl ? (ownerEl.value || '').trim() : (local.paymentOwner || '');
            var guide = guideEl ? (guideEl.value || '').trim() : (local.paymentGuide || '');

            try {
                var remote = await supabaseClient.from('app_settings').select('value').eq('key', 'admin:cafeSettings').maybeSingle();
                if (remote.error) throw remote.error;
                var serverSettings = remote.data && remote.data.value ? remote.data.value : {};
                if (typeof serverSettings === 'string') {
                    try { serverSettings = JSON.parse(serverSettings); } catch(e) { serverSettings = {}; }
                }
                if (!serverSettings || typeof serverSettings !== 'object' || Array.isArray(serverSettings)) serverSettings = {};
                // Preserve all current server settings; only payment fields are changed here.
                var full = Object.assign({}, serverSettings, {
                    paymentCard: card,
                    paymentSheba: sheba,
                    paymentOwner: owner,
                    paymentGuide: guide
                });
                var cloudOk = typeof cloudSaveAdminSetting === 'function' && await cloudSaveAdminSetting('cafeSettings', full);
                if (!cloudOk) throw new Error('ذخیره تنظیمات پرداخت روی سرور تأیید نشد.');
                var localSafe = Object.assign({}, serverSettings, { paymentOwner: owner, paymentGuide: guide });
                delete localSafe.paymentCard;
                delete localSafe.paymentSheba;
                localStorage.setItem('cafeSettings', JSON.stringify(localSafe));
                setSensitivePayCache({ paymentCard: card, paymentSheba: sheba, paymentOwner: owner });
                try { localStorage.removeItem('adminPassword'); } catch (e) {}
                if (typeof fillPaymentInfoUI === 'function') fillPaymentInfoUI();
                showNotification('✅ تنظیمات پرداخت با تأیید سرور ذخیره شد؛ اطلاعات حساس دائمی روی گوشی ذخیره نشد.');
            } catch (e) {
                console.warn('saveAdminSettings server-first', e);
                showNotification('❌ تنظیمات پرداخت ذخیره نشد؛ نسخه محلی تغییر نکرد. ' + (e.message || ''), 'error');
            }
        }
        async function loadAdminPaymentForm() {
            try { await refreshPaymentContactFromCloud(); } catch (e) {}
            var s = {};
            try { s = JSON.parse(localStorage.getItem('cafeSettings') || '{}'); } catch (e) { s = {}; }
            var pay = getSensitivePayCache();
            var map = {
                paymentCardNumber: pay.paymentCard || '',
                paymentSheba: pay.paymentSheba || '',
                paymentCardOwner: pay.paymentOwner || s.paymentOwner || '',
                paymentGuide: s.paymentGuide || ''
            };
            Object.keys(map).forEach(function(id) {
                var el = document.getElementById(id);
                if (el) el.value = map[id];
            });
        }
        window.loadAdminPaymentForm = loadAdminPaymentForm;
        window.saveAdminSettings = saveAdminSettings;


        // ============================================================
        // پشتیبان‌گیری
        // ============================================================
        window.exportData = function exportData() {
            var data = {
                products: getProducts(),
                subscriptions: JSON.parse(localStorage.getItem('adminSubscriptions') || '[]'),
                users: JSON.parse(localStorage.getItem('cafeUsers') || '[]'),
                discount: JSON.parse(localStorage.getItem('discountSettings') || '{}'),
                modals: {}
            };
            modalList.forEach(function(m) {
                var saved = localStorage.getItem('modalData_' + m.id);
                if (saved) data.modals[m.id] = saved;
            });
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'cafe_backup_' + new Date().toISOString().slice(0,10) + '.json';
            a.click();
            URL.revokeObjectURL(url);
            showNotification('📤 خروجی گرفته شد');
        }

        function importData(event) {
            var file = event.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    var data = JSON.parse(e.target.result);
                    if (data.products) { await saveProducts(data.products); }
                    if (data.subscriptions) { localStorage.setItem('adminSubscriptions', JSON.stringify(data.subscriptions)); }
                    if (data.users) { localStorage.setItem('cafeUsers', JSON.stringify(data.users)); }
                    if (data.discount) { localStorage.setItem('discountSettings', JSON.stringify(data.discount)); }
                    if (data.modals) {
                        for (var key in data.modals) {
                            if (data.modals.hasOwnProperty(key)) {
                                localStorage.setItem('modalData_' + key, data.modals[key]);
                            }
                        }
                    }
                    showNotification('✅ داده‌ها با موفقیت وارد شدند');
                    location.reload();
                } catch(err) {
                    showNotification('❌ خطا در وارد کردن داده‌ها', 'error');
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }

        // ============================================================


        // تنظیمات کاربر (تم، فونت) — فعال برای موبایل
        // ============================================================
        function changeTheme(theme) {
            try {
                theme = theme || 'default';
                // map default -> gold
                var key = (theme === 'default') ? 'gold' : theme;
                var themes = {
                    gold:   { header:'#1a1520', header2:'#2a2030', page:'#0d0f1a', accent:'#c9a84c', text:'#f0e6d3', card:'#161820' },
                    dark:   { header:'#0d0f1a', header2:'#12141c', page:'#080a10', accent:'#c9a84c', text:'#e8e8e8', card:'#12141c' },
                    blue:   { header:'#1e3a5f', header2:'#1e40af', page:'#0f172a', accent:'#3b82f6', text:'#e2e8f0', card:'#1e293b' },
                    green:  { header:'#064e3b', header2:'#047857', page:'#022c22', accent:'#10b981', text:'#d1fae5', card:'#064e3b' },
                    purple: { header:'#4c1d95', header2:'#6d28d9', page:'#1e1b4b', accent:'#8b5cf6', text:'#ede9fe', card:'#2e1065' },
                    rose:   { header:'#9f1239', header2:'#e11d48', page:'#4c0519', accent:'#ec4899', text:'#fce7f3', card:'#881337' }
                };
                var t = themes[key] || themes.gold;
                localStorage.setItem('cafeTheme', theme);
                localStorage.setItem('cafeThemeName', key);

                var btns = document.querySelectorAll('.color-btn');
                for (var i = 0; i < btns.length; i++) {
                    var dt = btns[i].getAttribute('data-theme');
                    var active = (dt === theme) || (theme === 'default' && dt === 'default') || (theme === 'gold' && (dt === 'gold' || dt === 'default'));
                    if (theme === 'gold' && dt === 'default') active = true;
                    if (theme === 'default' && dt === 'gold') active = true;
                    btns[i].classList.toggle('active', active);
                }

                var names = { default:'طلایی', gold:'طلایی', dark:'تاریک', blue:'آبی', green:'سبز', purple:'بنفش', rose:'رز' };
                var disp = document.getElementById('selectedThemeDisplay');
                if (disp) disp.textContent = 'تم فعلی: ' + (names[theme] || theme);

                var st = document.getElementById('runtimeThemeCSS');
                if (!st) { st = document.createElement('style'); st.id = 'runtimeThemeCSS'; document.head.appendChild(st); }
                st.textContent =
                    'body{background:' + t.page + ' !important;}' +
                    'header,.bottom-nav{background:linear-gradient(180deg,' + t.header + ',' + t.header2 + ') !important;}' +
                    '.product-card,.admin-card,.dashboard-welcome,.modals-home-item,.settings-section{background:' + t.card + ' !important;}' +
                    '.btn,.ig-buy-online,button.btn{background:linear-gradient(135deg,' + t.accent + ',' + t.header2 + ') !important;}' +
                    '.modal-glass.active .modal-glass-content{border-color:' + t.accent + ' !important;}' +
                    '#appVersionBadge{background:' + t.accent + ' !important;color:#111 !important;}';

                // body theme class
                var keep = [];
                (document.body.className || '').split(/\s+/).forEach(function(cl) {
                    if (cl && cl.indexOf('theme-') !== 0 && cl !== 'modal-open') keep.push(cl);
                });
                keep.push('theme-' + key);
                document.body.className = keep.join(' ');

                if (typeof showNotification === 'function') showNotification('تم «' + (names[theme] || theme) + '» اعمال شد');
            } catch (e) { console.warn('changeTheme', e); }
        }

        function changeFontSize(size) {
            try {
                size = size || 'medium';
                var names = { small: 'کوچک', medium: 'متوسط', large: 'بزرگ', xlarge: 'خیلی بزرگ' };
                var sizes = { small: '0.85rem', medium: '1rem', large: '1.12rem', xlarge: '1.25rem' };

                var btns = document.querySelectorAll('.font-btn');
                for (var i = 0; i < btns.length; i++) {
                    var b = btns[i];
                    var label = (b.textContent || '').trim();
                    if (label === names[size] || b.getAttribute('data-size') === size) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                }

                document.documentElement.style.setProperty('--font-scale', sizes[size] || '1rem');
                document.body.style.fontSize = sizes[size] || '1rem';
                localStorage.setItem('appFontSize', size);

                var disp = document.getElementById('selectedFontDisplay');
                if (disp) disp.textContent = 'سایز فعلی: ' + (names[size] || 'متوسط');
                if (typeof showNotification === 'function') showNotification('🔤 فونت: ' + (names[size] || size));
            } catch (e) {
                console.error('changeFontSize', e);
                alert('خطا در تغییر فونت');
            }
        }

        function getFontName(size) {
            var names = { small: 'کوچک', medium: 'متوسط', large: 'بزرگ', xlarge: 'خیلی بزرگ' };
            return names[size] || 'متوسط';
        }

        function saveAllSettings() {
            try {
                var theme = localStorage.getItem('appTheme') || 'default';
                var font = localStorage.getItem('appFontSize') || 'medium';
                localStorage.setItem('appTheme', theme);
                localStorage.setItem('appFontSize', font);
                if (typeof showNotification === 'function') {
                    showNotification('💾 تنظیمات ذخیره شد');
                } else {
                    alert('ذخیره شد');
                }
            } catch (e) {
                alert('خطا در ذخیره');
            }
        }

        function loadSettings() {
            try {
                var theme = localStorage.getItem('appTheme') || 'default';
                var fontSize = localStorage.getItem('appFontSize') || 'medium';
                changeTheme(theme);
                changeFontSize(fontSize);
            } catch (e) {
                console.warn('loadSettings', e);
            }
        }

        function toggleUserSettings() {
            var panel = document.getElementById('settingsPanel');
            if (!panel) return;
            var isOpen = panel.style.display === 'block' || panel.classList.contains('active');
            if (isOpen) {
                panel.style.display = 'none';
                panel.classList.remove('active');
            } else {
                panel.style.display = 'block';
                panel.classList.add('active');
                try {
                    if (typeof updateUserDisplay === 'function') updateUserDisplay();
                    if (typeof updateUserPurchaseHistory === 'function') updateUserPurchaseHistory();
                    // همگام‌سازی وضعیت دکمه‌ها
                    var theme = localStorage.getItem('appTheme') || 'default';
                    var font = localStorage.getItem('appFontSize') || 'medium';
                    var cb = document.querySelectorAll('.color-btn');
                    for (var i = 0; i < cb.length; i++) {
                        cb[i].classList.toggle('active', cb[i].getAttribute('data-theme') === theme);
                    }
                    var names = { small: 'کوچک', medium: 'متوسط', large: 'بزرگ', xlarge: 'خیلی بزرگ' };
                    var fb = document.querySelectorAll('.font-btn');
                    for (var j = 0; j < fb.length; j++) {
                        fb[j].classList.toggle('active', (fb[j].textContent || '').trim() === names[font]);
                    }
                } catch (e) {}
            }
        }



        // ============================================================
        // منوی کشویی مودال‌ها (از پایین به بالا)
        // ============================================================
        window.toggleMenuDrawer = function toggleMenuDrawer() {
            var overlay = document.getElementById('menuDrawerOverlay');
            var drawer = document.getElementById('menuDrawer');
            overlay.classList.toggle('active');
            drawer.classList.toggle('active');
            if (drawer.classList.contains('active')) {
                renderDrawerItems();
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }

        window.closeMenuDrawer = function closeMenuDrawer() {
            var overlay = document.getElementById('menuDrawerOverlay');
            var drawer = document.getElementById('menuDrawer');
            overlay.classList.remove('active');
            drawer.classList.remove('active');
            document.body.style.overflow = '';
        }

        function renderDrawerItems() {
            var grid = document.getElementById('drawerGrid');
            if (!grid) return;
            var items = (typeof modalList !== 'undefined' && Array.isArray(modalList)) ? modalList.slice() : [];
            var html = '';
            items.forEach(function(item) {
                var meta = (typeof getModalMeta === 'function') ? getModalMeta(item.id) : item;
                html +=
                    '<div class="drawer-item" onclick="closeMenuDrawer();openModalGlass(\'' + item.id + '\')">' +
                    '<span class="drawer-icon">' + (meta.icon || item.icon || '📜') + '</span>' +
                    '<span class="drawer-label">' + (meta.title || item.title || item.id) + '</span>' +
                    '</div>';
            });
            grid.innerHTML = html;
        }

        // ============================================================
        // ثبت نام
        // ============================================================
        function registerUser() {
            // Fail closed if the server-confirmed registration module did not load.
            if (typeof window.registerUser === 'function' && window.registerUser !== registerUser) {
                return window.registerUser.apply(this, arguments);
            }
            if (typeof showNotification === 'function') {
                showNotification('ثبت‌نام امن آنلاین بارگذاری نشده است؛ صفحه را تازه‌سازی کنید.', 'error');
            }
            return false;
        }

        function updateUserDisplay(user) {
            // یک نقطه واحد: اگر نسخه پیشرفته ثبت شده، همان را صدا بزن
            if (typeof window.__updateUserDisplayCore === 'function') {
                return window.__updateUserDisplayCore(user);
            }
            if (!user) {
                try {
                    var saved = localStorage.getItem('cafeUser');
                    if (saved) user = JSON.parse(saved);
                } catch(e) {}
            }
            if (user) {
                var nameEl = document.getElementById('userDisplayName');
                var phoneEl = document.getElementById('userDisplayPhone');
                var userName = document.getElementById('userName');
                if (nameEl) nameEl.value = user.name || '';
                if (phoneEl) phoneEl.value = user.phone || '';
                if (userName) userName.textContent = user.name || '';
            }
        }
        window.updateUserDisplay = updateUserDisplay;

        function logoutUser() {
            if (confirm('آیا از خروج اطمینان دارید؟')) {
                localStorage.removeItem('cafeUser');
                document.getElementById('app').style.display = 'none';
                document.getElementById('registerScreen').style.display = 'flex';
                showNotification('👋 خروج انجام شد');
            }
        }

        // ============================================================
        // Swipe بین صفحات
        // ============================================================
        window.scrollToPage = function scrollToPage(index) {
            var container = document.getElementById('pagesContainer');
            if (!container) return;
            var target = container.children[index];
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', inline: 'start' });
                updateSwipeDots(index);
                updateBottomNav(index);
            }
        }

        function updateSwipeDots(index) {
            document.querySelectorAll('.swipe-dot').forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function updateBottomNav(index) {
            // 0 فروشگاه | 2 ابزارها — ناو: 0=فروشگاه، 1=اشتراک، 2=منو، 3=ابزار، 4=تنظیمات
            var items = document.querySelectorAll('.bottom-nav .nav-item-bottom');
            var map = { 0: 0, 2: 3 };
            var activeBtn = map[index];
            items.forEach(function(item, i) {
                if (i === 2 || i === 4) {
                    item.classList.remove('active');
                    return;
                }
                item.classList.toggle('active', i === activeBtn);
            });
        }

        function initSwipe() {
            var container = document.getElementById('pagesContainer');
            if (!container) return;
            container.addEventListener('scroll', function() {
                var width = container.offsetWidth || 1;
                // پشتیبانی از RTL: در برخی مرورگرها scrollLeft منفی است
                var scrollPos = Math.abs(container.scrollLeft);
                var index = Math.round(scrollPos / width);
                if (index > 2) index = 2;
                if (index < 0) index = 0;
                updateSwipeDots(index);
                updateBottomNav(index);
            });
        }

        // ============================================================
        // ابزارهای صفحه دوم
        // ============================================================
        var toolsData = [
            {id:'sabab', title:'سبب القادم', icon:'👁️', desc:'دلیل آمدن شخص را کشف کنید', inputs:['name','mother','day'], mod:7},
            {id:'mohabbat', title:'محبت زن به مرد', icon:'💖', desc:'میزان علاقه را بسنجید', inputs:['name','mother'], mod:3},
            {id:'setare', title:'ستاره طالع', icon:'⭐', desc:'طالع خود را بشناسید', inputs:['name','mother'], mod:12},
            {id:'baht', title:'بخت و اقبال', icon:'🍀', desc:'اقبال خود را محاسبه کنید', inputs:['name','mother'], mod:4},
            {id:'ezdevaj', title:'عاقبت ازدواج', icon:'💍', desc:'سازگاری زوج را بسنجید', inputs:['name','mother'], mod:9},
            {id:'bimari', title:'علت بیماری', icon:'💊', desc:'ریشه بیماری را پیدا کنید', inputs:['name','mother','day'], mod:7},
            {id:'hamzad', title:'همزاد قرین', icon:'👥', desc:'قرین خود را بشناسید', inputs:['name','mother'], mod:28},
            {id:'raml', title:'رمل امام علی', icon:'🎲', desc:'فال رمل بگیرید', inputs:['name','mother','day','number'], mod:16},
            {id:'mokashefe', title:'مکاشفه موکلین', icon:'🔮', desc:'موکل خود را ببینید', inputs:['name','mother','day','number'], mod:16},
            {id:'mokel', title:'استخراج موکل', icon:'📿', desc:'موکل خود را استخراج کنید', inputs:['name'], mod:0},
            {id:'asmani', title:'اسماء الحسنی', icon:'🌟', desc:'اسم متناسب با عدد', inputs:['number'], mod:0},
            {id:'calculator', title:'ماشین حساب ابجد', icon:'🧮', desc:'محاسبه ابجد و ریاضی', inputs:['text'], mod:0},
            {id:'marriageAge', title:'سن ازدواج', icon:'💍', desc:'محاسبه و راهنمای تقریبی سن ازدواج', inputs:['birthYear','gender','region'], mod:0}
        ];

        var resultsDB = {
            sabab:{1:'برای مصلحت خاص',2:'برای فکر فاسد',3:'برای دزدی',4:'برای انجام کار خیر',5:'برای انجام کار شر',6:'به خاطر فساد بین زنان',7:'برای محبت'},
            mohabbat:{1:'زن، مرد را دوست دارد',2:'زن، مرد را دوست ندارد',3:'وضعیت بین دوست داشتن و نداشتن'},
            setare:{1:'برج جدی - مریخ - آتشی',2:'برج ثور - زهره - خاکی',3:'برج جوزا - عطارد - هوایی',4:'برج سرطان - ماه - آبی',5:'برج اسد - خورشید - آتشی',6:'برج سنبله - عطارد - خاکی',7:'برج میزان - زهره - هوایی',8:'برج عقرب - مریخ - آبی',9:'برج قوس - مشتری - آتشی',10:'برج جدی - زحل - خاکی',11:'برج دلو - عطارد - هوایی',12:'برج حوت - مشتری - آبی'},
            baht:{0:'طالع اشرافی - ثروتمند',1:'طالع حادثه‌ساز',2:'طالع کم‌درآمد',3:'طالع عرفانی'},
            ezdevaj:{1:'زن حاکم می‌شود',2:'خیر و برکت',3:'عاقبت ناخوش',4:'همراه با دلسردی',5:'مناسب با فرزند',6:'اختلاف و طلاق 80٪',7:'ازدواج عالی',8:'سختی و جدایی',9:'همانند 8 ولی فوت ندارد'},
            bimari:{1:'از جن و موجودات ماورایی',2:'هوای آلوده',3:'سحر یا چشم زخم',4:'چشم زخم یا حسادت',5:'مربوط به خون',6:'از سودا یا افسردگی',7:'از صفرا یا گوارش'}
        };

        var currentTool = null;
        var calcHistory = (function(){ try { var h = JSON.parse(localStorage.getItem('cafeHistory')||'[]'); return Array.isArray(h) ? h : []; } catch(e) { return []; } })();

        function renderQuickTools() {
            var quick = ['sabab','mohabbat','setare','baht','ezdevaj','bimari'];
            var container = document.getElementById('quickTools');
            if (!container) return;
            container.innerHTML = quick.map(function(id) {
                var t = toolsData.find(function(x) { return x.id === id; });
                if (!t) return '';
                return '<div class="tool-chip" onclick="openTool(\'' + t.id + '\')"><span class="chip-icon">' + t.icon + '</span><span class="chip-text">' + t.title + '</span></div>';
            }).join('');
        }

        window.showToolDashboard = function showToolDashboard() {
            document.getElementById('dashboardContent').style.display = 'block';
            document.getElementById('toolPageContent').style.display = 'none';
        }

        window.showDashboard = function showDashboard() {
            showToolDashboard();
        }

        window.showHistoryDashboard = function showHistoryDashboard() {
            showToolDashboard();
            setTimeout(function() {
                document.getElementById('historyList')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

        function openTool(toolId) {
            var tool = toolsData.find(function(t) { return t.id === toolId; });
            if (!tool) return;
            currentTool = tool;
            document.getElementById('toolTitle').textContent = tool.icon + ' ' + tool.title;
            document.getElementById('toolDesc').textContent = tool.desc;

            var html = '';
            if (tool.inputs.includes('name')) html += createToolInput('toolName', 'نام شما', 'text');
            if (tool.inputs.includes('mother')) html += createToolInput('toolMother', 'نام مادر', 'text');
            if (tool.inputs.includes('day')) html += createToolSelect('toolDay', 'روز هفته');
            if (tool.inputs.includes('number')) html += createToolInput('toolNumber', 'عدد انتخابی (1-1000)', 'number');
            if (tool.inputs.includes('text')) html += createToolInput('toolText', 'متن برای ابجد', 'text');

            document.getElementById('toolForm').innerHTML = html;
            document.getElementById('toolResult').classList.remove('show');
            document.getElementById('dashboardContent').style.display = 'none';
            document.getElementById('toolPageContent').style.display = 'block';
        }

        function createToolInput(id, label, type) {
            return '<div style="margin-bottom:12px;"><label style="display:block;color:var(--text-secondary);font-size:0.8rem;margin-bottom:4px;">' + label + '</label><input type="' + type + '" class="hub-input" id="' + id + '" placeholder="' + label + '..."></div>';
        }

        function createToolSelect(id, label) {
            return '<div style="margin-bottom:12px;"><label style="display:block;color:var(--text-secondary);font-size:0.8rem;margin-bottom:4px;">' + label + '</label><select class="hub-input" id="' + id + '"><option value="">انتخاب کنید</option><option value="السبت">شنبه</option><option value="الاحد">یکشنبه</option><option value="الاثنین">دوشنبه</option><option value="الثلاث">سه‌شنبه</option><option value="الاربعا">چهارشنبه</option><option value="الخمیس">پنجشنبه</option><option value="الجمعه">جمعه</option></select></div>';
        }

        window.runCurrentTool = function runCurrentTool() {
            if (!currentTool) return;
            var t = currentTool;

            if (t.id === 'calculator') {
                var txt = document.getElementById('toolText')?.value || '';
                var total = calculateAbjad(txt, 'kabir');
                showToolResult(total, 'ابجد کبیر عبارت "' + txt + '": ' + total);
                addHistory(t.title, total, 'ابجد: ' + txt);
                return;
            }

            if (t.id === 'asmani') {
                var num = parseInt(document.getElementById('toolNumber')?.value) || 0;
                var asma = ['الرحمن','الرحیم','الملک','القدوس','السلام','المؤمن','المهیمن','العزیز','الجبار','المتکبر','الخالق','البارئ','المصور','الغفار','القهار','الوهاب','الرزاق','الفتاح','العلیم','القابض','الباسط','الخافض','الرافع','المعز','المذل','السمیع','البصیر','الحکم','العدل','اللطیف'];
                var name = asma[(num-1) % asma.length] || 'نامشخص';
                showToolResult(num, 'اسم متناظر: ' + name);
                addHistory(t.title, num, name);
                return;
            }

            if (t.id === 'mokel') {
                var name = document.getElementById('toolName')?.value || '';
                var val = calculateAbjad(name, 'kabir');
                var letters = val.toString().split('').map(function(n) {
                    var map = ['ا','ب','ج','د','ه','و','ز','ح','ط'];
                    return map[parseInt(n)] || '';
                }).join('');
                var mokel = letters + "ائیل";
                showToolResult(val, 'اسم موکل: ' + mokel + '<br>تعداد تکرار: ' + val + ' بار<br>عمل: عود + صلوات');
                addHistory(t.title, val, mokel);
                return;
            }

            var total = 0;
            if (t.inputs.includes('name')) total += calculateAbjad(document.getElementById('toolName')?.value, 'kabir');
            if (t.inputs.includes('mother')) total += calculateAbjad(document.getElementById('toolMother')?.value, 'kabir');
            if (t.inputs.includes('day')) total += calculateAbjad(document.getElementById('toolDay')?.value, 'kabir');
            if (t.inputs.includes('number')) total += parseInt(document.getElementById('toolNumber')?.value) || 0;

            var result = reduceByX(total, t.mod);
            var text = resultsDB[t.id]?.[result] || 'عدد محاسبه شده: ' + result;
            showToolResult(result, text);
            addHistory(t.title, result, text);
        }

        
        var MODAL_GUIDES = {
            sababModal: 'با وارد کردن نام، نام مادر و روز هفته، علت و انگیزه آمدن شخص بر اساس روش سنتی سبب‌القادم مشخص می‌شود. فقط نتیجه نهایی نمایش داده می‌شود.',
            mohabbatModal: 'میزان محبت و علاقه بین دو نفر از روی نام‌ها محاسبه می‌شود. نتیجه به‌صورت توصیفی اعلام می‌گردد.',
            bimariModal: 'ریشه احتمالی بیماری یا ناراحتی از منظر سنتی بررسی می‌شود. این بخش جایگزین مراجعه پزشکی نیست.',
            setareModal: 'ستاره و برج طالع بر اساس نام و نام مادر استخراج می‌شود و ویژگی‌های کلی اعلام می‌گردد.',
            bahtModal: 'وضعیت کلی بخت و اقبال بر پایه محاسبه ابجد نام‌ها بیان می‌شود.',
            aghatModal: 'عاقبت و فضای کلی ازدواج از روی نام طرفین به‌صورت توصیفی اعلام می‌شود.',
            ramlModal: 'رمل بر اساس سؤال و اطلاعات واردشده انجام می‌شود و حکم نهایی بدون جزئیات میانی نشان داده می‌شود.',
            hamzadModal: 'همزاد و قرین مرتبط با نام استخراج و توضیح داده می‌شود.',
            mokashefeModal: 'مکاشفه موکلین بر اساس ورودی‌ها انجام و نتیجه نهایی اعلام می‌شود.',
            mokelModal: 'نام موکل و دستور کلی عمل استخراج می‌شود.',
            asmaniModal: 'اسم متناسب از اسماء الحسنی بر اساس عدد واردشده معرفی می‌شود.',
            calculatorModal: 'ماشین حساب ابجد برای تبدیل حروف به عدد؛ نتیجه نهایی نمایش داده می‌شود.',
            dalilModal: 'دلیل حیرانی و سردرگمی بر اساس روش سنتی بررسی و نتیجه اعلام می‌شود.',
        };
        function ensureModalGuide(modalId) {
            var modal = document.getElementById(modalId);
            if (!modal) return;
            var body = modal.querySelector('.modal-glass-body') || modal.querySelector('.modal-glass-content');
            if (!body) return;
            if (body.querySelector('.modal-guide')) return;
            var text = MODAL_GUIDES[modalId];
            if (!text) return;
            var div = document.createElement('div');
            div.className = 'modal-guide';
            div.innerHTML = '<i class="fas fa-info-circle"></i> ' + text;
            body.insertBefore(div, body.firstChild);
        }

        function showToolResult(num, text) {
            var rn = document.getElementById('resultNumber');
            if (rn) { rn.textContent = ''; rn.style.display = 'none'; }
            document.getElementById('resultText').innerHTML = text;
            document.getElementById('toolResult').classList.add('show');
            document.getElementById('toolResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        function addHistory(tool, result, desc) {
            calcHistory.unshift({ tool: tool, result: result, desc: desc, time: new Date().toLocaleString('fa-IR'), id: Date.now() });
            if (calcHistory.length > 50) calcHistory.pop();
            localStorage.setItem('cafeHistory', JSON.stringify(calcHistory));
            renderHistory();
            updateStats();
        }

        function renderHistory() {
            var container = document.getElementById('historyList');
            if (!container) return;
            if (!calcHistory.length) {
                container.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:0.8rem;padding:20px;">هنوز محاسبه‌ای انجام نداده‌اید.</div>';
                return;
            }
            container.innerHTML = calcHistory.slice(0, 5).map(function(h) {
                return '<div class="history-item"><div class="history-icon">🧮</div><div class="history-content"><h4>' + h.tool + '</h4><p>' + (h.desc.substring(0, 60) + (h.desc.length > 60 ? '...' : '')) + '</p></div><div class="history-time">' + (h.time.split(' ')[1] || '') + '</div></div>';
            }).join('');
        }

        window.clearHistory = function clearHistory() {
            calcHistory = [];
            localStorage.removeItem('cafeHistory');
            renderHistory();
            updateStats();
            showNotification('📜 تاریخچه پاک شد');
        }

        function updateStats() {
            var statHistory = document.getElementById('statHistory');
            var statTools = document.getElementById('statTools');
            if (statHistory) statHistory.textContent = calcHistory.length;
            if (statTools) statTools.textContent = toolsData.length;
        }

        window.copyResult = function copyResult() {
            var text = document.getElementById('resultText').textContent;
            navigator.clipboard.writeText(text).then(function() {
                showNotification('📋 کپی شد');
            });
        }

        window.shareResult = function shareResult() {
            var text = document.getElementById('resultText').textContent;
            if (navigator.share) {
                navigator.share({ title: 'کافه سرکتاب میعاد', text: text });
            } else {
                showNotification('📤 اشتراک‌گذاری در دسترس نیست', 'error');
            }
        }

        window.saveResult = function saveResult() {
            showNotification('🔖 نتیجه ذخیره شد');
        }

        // ============================================================
        // اعلان‌های واقعی سرور — فهرست خوانا + وضعیت سبز/قرمز
        // ============================================================
        var notifications = [];
        window.showNotifications = async function showNotifications() {
            var user = null, rows = [], live = false;
            try {
                if (window.supabaseClient && window.supabaseClient.auth) {
                    var sessionResult = await window.supabaseClient.auth.getSession();
                    user = sessionResult && sessionResult.data && sessionResult.data.session && sessionResult.data.session.user;
                    if (user) {
                        var result = await window.supabaseClient.from('notifications')
                            .select('id,user_id,message,type,read,created_at,created_at_ts,related_id,action_url')
                            .eq('user_id', user.id)
                            .order('created_at_ts', { ascending: false, nullsFirst: false })
                            .limit(100);
                        if (!result.error) {
                            rows = result.data || [];
                            live = true;
                            try { localStorage.setItem('cafeUserNotifications', JSON.stringify(rows)); } catch (e) {}
                        } else console.warn('Could not load server notifications', result.error);
                    }
                }
            } catch (e) { console.warn('Notification list fetch failed', e); }
            if (!live) {
                try {
                    var cached = JSON.parse(localStorage.getItem('cafeUserNotifications') || '[]');
                    if (Array.isArray(cached)) rows = cached;
                } catch (e) {}
            }
            var badge = document.getElementById('notifBadge');
            var unread = rows.filter(function (n) { return !n.read; }).length;
            if (badge) badge.textContent = String(unread);
            if (typeof window.kafeSetNotificationState === 'function') window.kafeSetNotificationState(unread);
            var prior = document.getElementById('kafeNotificationsModal');
            if (prior) prior.remove();
            var esc = function (v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); };
            var stateOf = function (n) {
                var msg = String(n.message || '');
                if (/رد شد|رد گردید|تأیید نشد|تایید نشد|رد درخواست|رد شده/i.test(msg)) return { label: 'رد شده', color: '#ff7272', bg: 'rgba(160,35,45,.2)' };
                if (/تأیید شد|تایید شد|تأیید و فعال|تایید و فعال|فعال شد|با موفقیت تأیید/i.test(msg)) return { label: 'تأیید شد', color: '#71e6a2', bg: 'rgba(25,135,84,.2)' };
                if (n.type === 'order_status' || n.type === 'subscription_status') return { label: 'وضعیت درخواست', color: '#ffd479', bg: 'rgba(201,168,76,.14)' };
                return { label: 'اعلان', color: '#a9d9ff', bg: 'rgba(45,115,170,.18)' };
            };
            var modal = document.createElement('div');
            modal.id = 'kafeNotificationsModal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.style.cssText = 'position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;justify-content:center;padding:0;direction:rtl;';
            var cards = rows.length ? rows.map(function (n) {
                var st = stateOf(n), date = n.created_at_ts || n.created_at || '', dt = '';
                try { if (date) dt = new Date(date).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) {}
                return '<article style="padding:13px;border:1px solid '+st.color+'55;border-radius:14px;background:'+st.bg+';margin:9px 0;text-align:right;">' +
                    '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:7px;">' +
                    '<strong style="color:'+st.color+'">'+st.label+'</strong><span style="font-size:.72rem;color:#c9c2b6">'+esc(dt)+'</span></div>' +
                    '<div style="color:#f3e6c8;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere">'+esc(n.message || 'اعلان جدید')+'</div>' +
                    (!n.read ? '<button type="button" data-read-notification="'+esc(n.id)+'" style="margin-top:10px;padding:7px 12px;border:1px solid #c7984e;border-radius:9px;background:#c7984e;color:#10131b;font-weight:800;">خواندم ✓</button>' : '<span style="display:inline-block;margin-top:8px;font-size:.72rem;color:#a9b5a7;">خوانده شده</span>') +
                    '</article>';
            }).join('') : '<div style="padding:28px 12px;text-align:center;color:#d4c4a0;line-height:2;">'+(user ? 'فعلاً اعلانی برای این حساب ثبت نشده است.' : 'برای دیدن اعلان‌های سرور، ابتدا وارد حساب کاربری شوید.')+'</div>';
            modal.innerHTML = '<section style="width:min(520px,100%);max-height:88dvh;overflow:auto;background:linear-gradient(160deg,#12101c,#0b1424 65%,#171126);color:#f3e6c8;border:1px solid #c7984e;border-radius:22px 22px 0 0;padding:16px;box-sizing:border-box;box-shadow:0 -12px 50px #0008;">' +
                '<header style="position:static;height:auto;padding:0;background:none;border:0;box-shadow:none;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;">' +
                '<div><strong style="font-size:1.1rem;color:#ffdc9a;">🔔 اعلان‌های کافه میعاد</strong><div style="font-size:.75rem;color:#c9c2b6;margin-top:4px;">'+(live ? 'به‌روزرسانی مستقیم از سرور' : 'نمایش اطلاعات ذخیره‌شده در این گوشی')+' · '+unread+' خوانده‌نشده</div></div>' +
                '<button type="button" id="kafeNotificationsClose" aria-label="بستن اعلان‌ها" style="flex:0 0 auto;padding:8px 12px;border-radius:10px;border:1px solid #c7984e;background:#211b2a;color:#ffdc9a;font-size:1rem;">✕</button></header>' +
                '<div style="max-height:70dvh;overflow:auto;">'+cards+'</div></section>';
            document.body.appendChild(modal);
            function close() { var el = document.getElementById('kafeNotificationsModal'); if (el) el.remove(); }
            document.getElementById('kafeNotificationsClose').addEventListener('click', close);
            modal.addEventListener('click', function (ev) { if (ev.target === modal) close(); });
            modal.querySelectorAll('[data-read-notification]').forEach(function (btn) {
                btn.addEventListener('click', async function () {
                    var id = btn.getAttribute('data-read-notification');
                    btn.disabled = true; btn.textContent = 'در حال ثبت…';
                    try {
                        if (!window.supabaseClient || !live || !user) throw new Error('اتصال سرور در دسترس نیست');
                        var update = await window.supabaseClient.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id);
                        if (update.error) throw update.error;
                        var item = rows.find(function (n) { return String(n.id) === String(id); });
                        if (item) item.read = true;
                        try { localStorage.setItem('cafeUserNotifications', JSON.stringify(rows)); } catch (e) {}
                        if (badge) badge.textContent = String(rows.filter(function (n) { return !n.read; }).length);
                        btn.outerHTML = '<span style="display:inline-block;margin-top:8px;font-size:.72rem;color:#a9b5a7;">خوانده شده ✓</span>';
                    } catch (e) {
                        btn.disabled = false; btn.textContent = 'دوباره تلاش کن';
                        if (typeof showNotification === 'function') showNotification('وضعیت خوانده‌شدن روی سرور ذخیره نشد: ' + (e.message || e), 'error');
                    }
                });
            });
        }

        // ============================================================
        // پر کردن سوالات رمل
        // ============================================================
        function populateRamlQuestions() {
            var select = document.getElementById('ramlQuestion');
            if (!select) return;
            select.innerHTML = '';
            for (var i = 0; i < ramlQuestions.length; i++) {
                var option = document.createElement('option');
                option.value = ramlQuestions[i].id;
                option.textContent = ramlQuestions[i].id + '. ' + ramlQuestions[i].title;
                select.appendChild(option);
            }
        }

        // ============================================================
        // ستارگان
        // ============================================================
        function initStars() {
            var canvas = document.getElementById('stars-canvas');
            if (!canvas) return;
            var ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            var stars = [];
            for (var i = 0; i < 120; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    r: Math.random() * 1.5 + 0.5,
                    opacity: Math.random() * 0.8 + 0.2,
                    speed: Math.random() * 0.003 + 0.001
                });
            }

            function drawStars() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (var i = 0; i < stars.length; i++) {
                    var s = stars[i];
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 215, 0, ' + s.opacity + ')';
                    ctx.fill();
                    s.y += s.speed;
                    if (s.y > canvas.height) {
                        s.y = 0;
                        s.x = Math.random() * canvas.width;
                    }
                }
                requestAnimationFrame(drawStars);
            }
            drawStars();
            window.addEventListener('resize', function() {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        }

        // ============================================================
        // به‌روزرسانی تاریخ و ساعت
        // ============================================================
        function updateDateTime() {
            var now = new Date();
            var dateEl = document.getElementById('dateDisplay');
            var timeEl = document.getElementById('timeDisplay');
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('fa-IR');
            }
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
            }
        }

        // ============================================================
        // بارگذاری ویرایش‌های مودال
        // ============================================================
        function loadModalEdits() {
            modalList.forEach(function(m) {
                var saved = localStorage.getItem('modalData_' + m.id);
                if (saved) {
                    try {
                        var modal = document.getElementById(m.id);
                        if (modal) {
                            var body = modal.querySelector('.modal-glass-body');
                            if (body) {
                                body.innerHTML = saved;
                            }
                        }
                    } catch(e) {}
                }
            });
        }

        // ============================================================
        // راه‌اندازی
        // ============================================================

        // ===== تصاویر پیش‌فرض دائمی (embedded) =====
        var DEFAULT_SPLASH_IMAGE = './assets/splash.jpg';
        var DEFAULT_LOGO_IMAGE = 'data:image/png;base64,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';
        var DEFAULT_LOGO_SMALL = 'data:image/png;base64,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';

        function applyDefaultImages() {
            var splashBg = document.getElementById('splashBgImg');
            var splashLogo = document.getElementById('splashLogoImg');
            var regLogo = document.getElementById('registerLogoImg');
            var headerLogo = document.getElementById('headerLogoImg');
            if (splashBg) splashBg.src = DEFAULT_SPLASH_IMAGE;
            if (splashLogo) splashLogo.src = DEFAULT_LOGO_SMALL;
            if (regLogo) regLogo.src = DEFAULT_LOGO_SMALL;
            if (headerLogo) headerLogo.src = DEFAULT_LOGO_SMALL;
            // اسپلیش فقط تصویر پس‌زمینه دارد؛ لوگو جداگانه در هدر/ثبت‌نام
        };

        
        (function seedAdminContact() {
            try {
                var s = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
                var changed = false;
                if (!s.managerPhone) { s.managerPhone = '09392979200'; changed = true; }
                if (!s.managerHours) { s.managerHours = 'پنج‌روز هفته، ۱۸ الی ۲۱ — جمعه و دوشنبه پاسخ‌گو نیستیم؛ پیام بگذارید'; changed = true; }
                if (changed) localStorage.setItem('cafeSettings', JSON.stringify(s));
            } catch (e) {}
        })();

        
        /* ===== اشتراک و OTP FINAL-31 ===== */
        
        function getVipLocks() {
            try {
                var s = JSON.parse(localStorage.getItem('cafeVipLocks') || 'null');
                if (s && typeof s === 'object') return s;
            } catch (e) {}
            return {
                mokashefeModal: true, mokelModal: true, dalilModal: true,
                ramlModal: true, vefqModal: true, vefghModal: true, talismanModal: true
            };
        }
        function setVipLock(modalId, locked) {
            var locks = getVipLocks();
            locks[modalId] = !!locked;
            localStorage.setItem('cafeVipLocks', JSON.stringify(locks));
            if (typeof renderVipLockAdmin === 'function') renderVipLockAdmin();
            if (typeof renderAdminModals === 'function') renderAdminModals();
            if (typeof renderModalsHomeGrid === 'function') renderModalsHomeGrid();
            if (typeof renderDrawerItems === 'function') renderDrawerItems();
            if (typeof showNotification === 'function') {
                showNotification(locked ? ('🔒 قفل شد: ' + modalId) : ('🔓 باز شد: ' + modalId));
            }
        }
        window.setVipLock = setVipLock;
        function isVipLocked(modalId) {
            var locks = getVipLocks();
            if (modalId in locks) return !!locks[modalId];
            // پیش‌فرض: فقط مودال‌های تعریف‌شده در SUBSCRIPTION_MODALS قفل‌اند
            return !!(typeof SUBSCRIPTION_MODALS !== 'undefined' && SUBSCRIPTION_MODALS[modalId]);
        }
        function renderVipLockAdmin() {
            var box = document.getElementById('vipLocksAdminList');
            if (!box) return;
            var names = (typeof SUBSCRIPTION_MODALS !== 'undefined') ? SUBSCRIPTION_MODALS : {
                mokashefeModal: 'مکاشفه موکلین', mokelModal: 'استخراج موکل', dalilModal: 'دلیل الحیران', ramlModal: 'رمل امام علی'
            };
            var locks = getVipLocks();
            box.innerHTML = Object.keys(names).map(function (id) {
                var on = locks[id] !== false;
                return '<div class="admin-item"><span>' + names[id] + '</span>' +
                    '<label style="display:flex;align-items:center;gap:6px;color:#1A1A1A;">' +
                    '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="setVipLock(\'' + id + '\', this.checked)"> قفل VIP</label></div>';
            }).join('');
        }

        var SUBSCRIPTION_MODALS = {
            mokashefeModal: 'مکاشفه موکلین',
            mokelModal: 'استخراج موکل',
            dalilModal: 'دلیل الحیران',
            ramlModal: 'قرعه رمل امام علی',
            vefqModal: 'طلسم‌ساز وفق',
            vefghModal: 'طلسم‌ساز وفق',
            talismanModal: 'طلسم‌ساز وفق'
        };
        async function isAdminSession() {
            return await verifyOnlineAdmin();
        }
        function getSubscriptionState() {
            try {
                var s = JSON.parse(localStorage.getItem('userSubscription') || '{"active":false,"expiry":null,"plan":null}');
                if (s.active && s.expiry && new Date(s.expiry) < new Date()) {
                    s.active = false;
                    localStorage.setItem('userSubscription', JSON.stringify(s));
                }
                return s;
            } catch (e) { return { active: false, expiry: null, plan: null }; }
        }
        function isSubscriptionActive() { return !!getSubscriptionState().active; }
        function requireSubscription(name) {
            if (isSubscriptionActive()) return true;
            if (typeof showNotification === 'function') showNotification('برای «' + (name || 'این بخش') + '» اشتراک لازم است', 'error');
            openSubscriptionPurchase();
            return false;
        }
        function previewSubscriptionReceipt(event){
          var f=event.target.files&&event.target.files[0];
          if(!f){window._subscriptionReceiptFile=null;updateSubscriptionFormState();return;}
          if(f.size>10*1024*1024){showNotification('❌ حجم فیش نباید بیشتر از ۱۰ مگابایت باشد','error');event.target.value='';window._subscriptionReceiptFile=null;updateSubscriptionFormState();return;}
          if(!/^image\/(jpeg|png|webp)$|^application\/pdf$/.test(String(f.type||''))){showNotification('❌ فقط تصویر JPG/PNG/WebP یا PDF مجاز است','error');event.target.value='';window._subscriptionReceiptFile=null;updateSubscriptionFormState();return;}
          window._subscriptionReceiptFile=f;
          var p=document.getElementById('subscriptionReceiptPreview');
          if(p){
            if(String(f.type||'').indexOf('image/')===0){p.src=URL.createObjectURL(f);p.style.display='block';}
            else {p.removeAttribute('src');p.style.display='none';}
          }
          var rs=document.getElementById('subscriptionReceiptStatus');
          if(rs)rs.textContent='✅ فیش انتخاب شد: '+f.name;
          updateSubscriptionFormState();
        }
        window._subscriptionSelectedPlanDays=null;
        function selectSubscriptionPlan(days){
          days=parseInt(days,10)||0;
          var labels={30:'یک ماهه',90:'سه ماهه',180:'شش ماهه',365:'یک ساله'};
          if(!labels[days])return;
          window._subscriptionSelectedPlanDays=days;
          var buttons=document.querySelectorAll('#subscriptionPlanButtons .subscription-plan-btn');
          for(var i=0;i<buttons.length;i++){
            var active=parseInt(buttons[i].getAttribute('data-plan-days'),10)===days;
            buttons[i].style.opacity=active?'1':'.75';
            buttons[i].style.border=active?'2px solid #E6C878':'1px solid rgba(201,168,76,0.35)';
            buttons[i].style.boxShadow=active?'0 0 0 2px rgba(201,168,76,.25),0 6px 18px rgba(201,168,76,.2)':'0 4px 14px rgba(0,0,0,0.3)';
            buttons[i].style.fontWeight=active?'900':'800';
            buttons[i].style.transform=active?'scale(1.03)':'scale(1)';
            buttons[i].style.background=active?'linear-gradient(135deg,#8F6F28,#C9A84C,#E6C878)':'linear-gradient(145deg,#1a1530,#0d1a2e)';
            buttons[i].style.color=active?'#0d0f1a':'#F5E6C8';
            buttons[i].setAttribute('aria-pressed',active?'true':'false');
          }
          var ps=document.getElementById('subscriptionPlanStatus');
          if(ps)ps.textContent='✅ طرح انتخاب‌شده: '+labels[days];
          updateSubscriptionFormState();
        }
        function updateSubscriptionFormState(){
          var name=((document.getElementById('subscriptionName')||{}).value||'').trim();
          var phoneRaw=((document.getElementById('subscriptionPhone')||{}).value||'').replace(/\s/g,'').trim();
          // ارقام فارسی/عربی → انگلیسی
          var phone=phoneRaw.replace(/[۰-۹]/g,function(d){return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d));}).replace(/[٠-٩]/g,function(d){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d));});
          var ok=!!name&&/^09\d{9}$/.test(phone)&&!!window._subscriptionSelectedPlanDays&&!!window._subscriptionReceiptFile;
          var btn=document.getElementById('subscriptionSubmitBtn');
          if(btn){btn.disabled=!ok;btn.style.opacity=ok?'1':'.55';}
          var st=document.getElementById('subscriptionSubmitStatus');
          if(st&&!btn?.dataset?.sending){
            if(!name||!phone)st.textContent='نام و شماره تماس را کامل کنید.';
            else if(!window._subscriptionSelectedPlanDays)st.textContent='طرح موردنظر را انتخاب کنید.';
            else if(!window._subscriptionReceiptFile)st.textContent='فیش واریزی را انتخاب کنید.';
            else st.textContent='✅ همه موارد کامل است؛ درخواست آماده ارسال است.';
          }
        }
        async function submitSubscriptionRequest(){
          if(window._subscriptionSubmitting)return;
          var days=parseInt(window._subscriptionSelectedPlanDays,10)||0;
          var labels={30:'یک ماهه',90:'سه ماهه',180:'شش ماهه',365:'یک ساله'};
          var plan=labels[days];
          var name=((document.getElementById('subscriptionName')||{}).value||'').trim();
          var phone=((document.getElementById('subscriptionPhone')||{}).value||'').replace(/\s/g,'').trim()
            .replace(/[۰-۹]/g,function(d){return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d));})
            .replace(/[٠-٩]/g,function(d){return String('٠١٢٣٤٥٦٧٨٩'.indexOf(d));});
          var receipt=window._subscriptionReceiptFile||null;
          if(!name||!phone){showNotification('❌ نام و شماره تماس الزامی است','error');return;}
          if(!/^09\d{9}$/.test(phone)){showNotification('❌ شماره تماس نامعتبر است','error');return;}
          if(!plan){showNotification('❌ ابتدا طرح اشتراک را انتخاب کنید','error');return;}
          if(!receipt){showNotification('❌ ابتدا فیش واریزی را انتخاب کنید','error');return;}
          if(!supabaseClient){showNotification('❌ اتصال آنلاین در دسترس نیست','error');return;}
          var btn=document.getElementById('subscriptionSubmitBtn');
          var st=document.getElementById('subscriptionSubmitStatus');
          window._subscriptionSubmitting=true;
          if(btn){btn.disabled=true;btn.dataset.sending='1';btn.textContent='⏳ در حال ارسال و ثبت روی سرور...';btn.style.opacity='1';}
          if(st)st.textContent='لطفاً صبر کنید؛ فیش در سرور بارگذاری و درخواست ثبت می‌شود.';
          try{
            var authState=await supabaseClient.auth.getSession();
            var session=authState&&authState.data&&authState.data.session;
            if(!session||!session.user)throw new Error('ابتدا وارد حساب کاربری شوید؛ ثبت اشتراک انجام نشد.');
            var path=await sbUploadSubscriptionReceipt(receipt,session.user.id);
            var row={user_id:session.user.id,name:name,phone:phone,plan:plan,plan_id:String(days),plan_days:days,amount:null,receipt_path:path,status:'pending',receipt_note:'',created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
            var r=await supabaseClient.from('subscription_requests').insert([row]).select().single();
            if(r.error)throw r.error;
            if(!r.data||!r.data.id||String(r.data.user_id)!==String(session.user.id)||String(r.data.status)!=='pending'){
              throw new Error('ثبت درخواست اشتراک از سرور تأیید نشد؛ لطفاً وضعیت درخواست را بررسی کنید.');
            }
            window._subscriptionReceiptFile=null;
            window._subscriptionSelectedPlanDays=null;
            if(btn)btn.textContent='✅ درخواست با موفقیت ارسال شد';
            if(st)st.textContent='درخواست شما روی سرور ثبت شد و در انتظار بررسی مدیریت است.';
            showNotification('✅ درخواست اشتراک و فیش با موفقیت روی سرور ثبت شد و منتظر تأیید مدیریت است.');
            setTimeout(function(){var b=document.getElementById('subscriptionModalBox');if(b)b.remove();},900);
            if(typeof updateUserPurchaseHistory==='function')updateUserPurchaseHistory();
          }catch(e){
            console.error('submitSubscriptionRequest',e);
            if(btn){btn.disabled=false;btn.dataset.sending='';btn.textContent='📤 ارسال درخواست اشتراک';btn.style.opacity='1';}
            if(st)st.textContent='❌ ارسال انجام نشد؛ اطلاعات را بررسی و دوباره تلاش کنید.';
            showNotification('❌ ثبت درخواست اشتراک انجام نشد: '+(e.message||e),'error');
          }finally{window._subscriptionSubmitting=false;}
        }
        window.openSubscriptionPurchase = function openSubscriptionPurchase() {
            var old=document.getElementById('subscriptionModalBox'); if(old) old.remove();
            window._subscriptionSelectedPlanDays=null;
            window._subscriptionReceiptFile=null;
            var box=document.createElement('div'); box.id='subscriptionModalBox';
            box.style.cssText='position:fixed;inset:0;z-index:6000;background:rgba(0,0,0,.5);display:flex;align-items:flex-end;justify-content:center;padding:0;';
            /* استایل خودکفا با کنتراست بالا — مستقل از تم تاریک سراسری */
            var field='width:100%;box-sizing:border-box;padding:12px 14px;border:1.5px solid rgba(201,168,76,0.45);border-radius:12px;background:rgba(8,12,24,0.92);color:#F5E6C8;font-size:0.95rem;font-family:inherit;outline:none;';
            var label='display:block;margin-bottom:6px;color:#E8D5A3;font-weight:700;font-size:0.82rem;';
            var planBtn='padding:14px 10px;border:1px solid rgba(201,168,76,0.45);border-radius:14px;font-weight:800;font-size:0.9rem;font-family:inherit;cursor:pointer;color:#F5E6C8;background:linear-gradient(145deg,#1a1530,#0d1a2e);box-shadow:0 4px 16px rgba(0,0,0,0.35);';
            box.innerHTML=
              '<div style="background:linear-gradient(165deg,#12101c 0%,#0c1424 45%,#15102a 100%);width:100%;max-width:430px;border-radius:22px 22px 0 0;padding:18px;max-height:92vh;overflow:auto;color:#F0E6D3;border:2px solid #c9a84c;box-sizing:border-box;">'+
              '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">'+
                '<strong style="color:#E8D5A3;font-size:1.1rem;">⭐ خرید اشتراک VIP</strong>'+
                '<button type="button" onclick="document.getElementById(\'subscriptionModalBox\').remove()" style="border:0;background:rgba(201,168,76,0.2);border-radius:9px;padding:7px 12px;font-size:1rem;cursor:pointer;color:#E8D5A3;">✕</button>'+
              '</div>'+
              '<div style="margin-bottom:12px;line-height:1.85;color:#C9C2B6;font-size:0.88rem;">اشتراک پس از بررسی فیش و تأیید مدیریت فعال می‌شود. اطلاعات درخواست در سرور ذخیره می‌شود.</div>'+
              '<div style="margin-bottom:14px;padding:10px 12px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.35);border-radius:12px;font-size:.78rem;color:#E8D5A3;line-height:1.85;">۱) مشخصات را وارد کنید ← ۲) طرح را انتخاب کنید ← ۳) فیش را انتخاب کنید ← ۴) ارسال درخواست را بزنید</div>'+
              '<div style="margin-bottom:14px;padding:12px;border-radius:14px;border:1px solid rgba(201,168,76,0.4);background:rgba(8,12,24,0.75);text-align:center;">'+
                '<div style="font-size:0.8rem;color:#E8D5A3;font-weight:800;margin-bottom:6px;">💳 اطلاعات واریز</div>'+
                '<div style="font-size:0.7rem;color:#C9C2B6;">شماره کارت</div>'+
                '<div id="subPaymentCard" style="font-size:1.05rem;font-weight:800;letter-spacing:1px;direction:ltr;font-family:monospace;color:#F5E6C8;margin:4px 0;">—</div>'+
                '<div id="subPaymentOwner" style="font-size:0.8rem;color:#C9C2B6;"></div>'+
                '<div id="subPaymentSheba" style="font-size:0.72rem;direction:ltr;color:#A39888;margin-bottom:8px;"></div>'+
                '<button type="button" class="btn" onclick="copyPaymentCard()" style="width:100%;padding:10px;font-size:0.85rem;">📋 کپی شماره کارت</button>'+
              '</div>'+
              '<div style="margin-bottom:14px;">'+
                '<label style="'+label+'">۱️⃣ نام و نام خانوادگی *</label>'+
                '<input id="subscriptionName" type="text" placeholder="مثال: علی رضایی" style="'+field+'" autocomplete="name">'+
              '</div>'+
              '<div style="margin-bottom:14px;">'+
                '<label style="'+label+'">۲️⃣ شماره تماس *</label>'+
                '<input id="subscriptionPhone" type="tel" inputmode="numeric" placeholder="09xxxxxxxxx" style="'+field+'" autocomplete="tel">'+
              '</div>'+
              '<div style="font-size:.85rem;color:#E8D5A3;font-weight:800;margin:4px 0 10px;">۳️⃣ انتخاب طرح اشتراک *</div>'+
              '<div id="subscriptionPlanButtons" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
                '<button type="button" data-plan-days="30" class="subscription-plan-btn" style="'+planBtn+'" onclick="selectSubscriptionPlan(30)">یک ماهه</button>'+
                '<button type="button" data-plan-days="90" class="subscription-plan-btn" style="'+planBtn+'" onclick="selectSubscriptionPlan(90)">سه ماهه</button>'+
                '<button type="button" data-plan-days="180" class="subscription-plan-btn" style="'+planBtn+'" onclick="selectSubscriptionPlan(180)">شش ماهه</button>'+
                '<button type="button" data-plan-days="365" class="subscription-plan-btn" style="'+planBtn+'" onclick="selectSubscriptionPlan(365)">یک ساله</button>'+
              '</div>'+
              '<div id="subscriptionPlanStatus" style="margin-top:8px;font-size:.8rem;color:#A9A093;">هنوز طرحی انتخاب نشده است.</div>'+
              '<div style="margin-top:14px;padding:12px;background:#fff;border:1.5px solid #c9a84c;border-radius:14px;">'+
                '<label style="'+label+'">۴️⃣ فیش واریزی * (حداکثر ۳ مگابایت)</label>'+
                '<input id="subscriptionReceiptFile" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onchange="previewSubscriptionReceipt(event)" style="width:100%;padding:8px;color:#F5E6C8;background:rgba(8,12,24,0.9);border:1px solid rgba(201,168,76,0.35);border-radius:8px;">'+
                '<img id="subscriptionReceiptPreview" alt="" style="display:none;max-width:100%;max-height:150px;margin-top:8px;border-radius:10px;">'+
                '<div id="subscriptionReceiptStatus" style="margin-top:7px;font-size:.78rem;color:#A9A093;">هنوز فیشی انتخاب نشده است.</div>'+
              '</div>'+
              '<button id="subscriptionSubmitBtn" type="button" style="width:100%;margin-top:16px;padding:14px;font-weight:900;font-size:1rem;font-family:inherit;border:1px solid rgba(201,168,76,0.5);border-radius:14px;cursor:pointer;background:linear-gradient(135deg,#8F6F28,#C9A84C,#E6C878);color:#0d0f1a;opacity:.55;" onclick="submitSubscriptionRequest()" disabled>📤 ارسال درخواست اشتراک</button>'+
              '<div id="subscriptionSubmitStatus" style="margin-top:10px;text-align:center;font-size:.8rem;color:#A9A093;line-height:1.7;">برای ارسال، نام، شماره، طرح و فیش را کامل کنید.</div>'+
              '<p style="font-size:.72rem;color:#8A8478;line-height:1.75;margin:14px 0 4px;">پس از ارسال، درخواست و فیش روی سرور ثبت می‌شود و فقط بعد از تأیید مدیریت فعال می‌گردد.</p>'+
              '</div>';
            document.body.appendChild(box);
            if (typeof fillPaymentInfoUI === 'function') fillPaymentInfoUI();
            if (typeof refreshPaymentContactFromCloud === 'function') {
              refreshPaymentContactFromCloud().then(function(){ if (typeof fillPaymentInfoUI === 'function') fillPaymentInfoUI(); }).catch(function(){});
            }
            try{
              var u=JSON.parse(localStorage.getItem('cafeUser')||'{}');
              if(u.name){var n=document.getElementById('subscriptionName'); if(n) n.value=u.name;}
              if(u.phone){var p=document.getElementById('subscriptionPhone'); if(p) p.value=u.phone;}
            }catch(e){}
            var sn=document.getElementById('subscriptionName');
            var sp=document.getElementById('subscriptionPhone');
            function onField(){ try{ updateSubscriptionFormState(); }catch(e){} }
            if(sn){ sn.addEventListener('input', onField); sn.addEventListener('change', onField); }
            if(sp){ sp.addEventListener('input', onField); sp.addEventListener('change', onField); }
            try{ updateSubscriptionFormState(); }catch(e){}
            // جلوگیری از بسته شدن با کلیک روی پس‌زمینه اشتباه
            box.addEventListener('click', function(ev){ if(ev.target===box) box.remove(); });
        }
        function purchasePlan(days) { selectSubscriptionPlan(days); }
        function requestOTPCode(){showNotification('برای دریافت رمز خرید، درخواست و فیش واریزی را ارسال کنید؛ رمز فقط پس از تایید مدیریت صادر می‌شود','error')}
        async function verifyOTPCode(){
          var code=((document.getElementById('otpInput')||{}).value||'').trim();if(!code){showNotification('کد را وارد کنید','error');return}
          try{
            var u={};try{u=JSON.parse(localStorage.getItem('cafeUser')||'{}')}catch(e){}
            var r=await supabaseClient.from('subscriptions').select('*').eq('code',code).eq('active',true).maybeSingle();
            if(r.error||!r.data){showNotification('کد نامعتبر یا منقضی است','error');return}
            if(r.data.user_id && r.data.user_id!==(await ensureSupabaseSession()).user.id){showNotification('این کد برای کاربر دیگری صادر شده است','error');return}
            await supabaseClient.from('subscriptions').update({used:true,active:false,updated_at:new Date().toISOString()}).eq('id',r.data.id);
            var exp=r.data.expiry_date||new Date(Date.now()+Number(r.data.days||1)*86400000).toISOString();
            localStorage.setItem('userSubscription',JSON.stringify({active:true,expiry:exp,plan:r.data.plan||'otp'}));
            showNotification('✅ رمز خرید تایید شد و اشتراک شما فعال گردید');
            var b=document.getElementById('subscriptionModalBox');if(b)b.remove();
          }catch(e){console.warn('verifyOTPCode',e);showNotification('❌ بررسی رمز انجام نشد','error')}
        }

        /** پاکسازی OTPهای منقضی و محدود کردن ذخیرهٔ محلی (بدون نگه داشتن لیست بلند کدهای خام) */
        function pruneCafeOtpsStore() {
            try {
                var otps = []; try { otps = JSON.parse(localStorage.getItem('cafeOTPs') || '[]'); } catch (e) { otps = []; }
                var now = Date.now();
                otps = (otps || []).filter(function (o) {
                    return o && (o.expires || 0) > now && (o.uses || 0) > 0;
                }).slice(0, 5);
                // کد کامل فقط برای آخرین مورد نگه داشته می‌شود؛ بقیه mask
                otps = otps.map(function (o, idx) {
                    if (idx === 0) return o;
                    var c = String(o.code || '');
                    return Object.assign({}, o, { code: c.length > 2 ? ('****' + c.slice(-2)) : '****', masked: true });
                });
                if (otps.length) localStorage.setItem('cafeOTPs', JSON.stringify(otps));
                else localStorage.removeItem('cafeOTPs');
            } catch (e) { try { localStorage.removeItem('cafeOTPs'); } catch (e2) {} }
        }

        function renderAdminOTPs() {
            pruneCafeOtpsStore();
            var box = document.getElementById('adminOTPList'); if (!box) return;
            var otps = []; try { otps = JSON.parse(localStorage.getItem('cafeOTPs') || '[]'); } catch (e) {}
            if (!otps.length) {
                box.innerHTML = '<p style="font-size:0.8rem;color:#666;">OTPای در حافظهٔ موقت نیست. کدهای خرید باید از سرور (subscriptions) تأیید شوند.</p>';
                return;
            }
            var now = Date.now();
            box.innerHTML = otps.slice(0, 10).map(function (o) {
                var ok = (o.expires || 0) > now && (o.uses || 0) > 0;
                var shown = o.masked ? o.code : String(o.code || '');
                return '<div class="admin-item"><span>🔑 <b>' + shown + '</b> · ' + (o.uses || 0) + ' · ' + (ok ? 'فعال' : 'منقضی') + (o.server ? ' · سرور' : ' · موقت') + '</span>' +
                    '<button type="button" class="danger" onclick="deleteOTPAdmin(\'' + o.id + '\')">🗑️</button></div>';
            }).join('');
        }
        function deleteOTPAdmin(id) {
            var otps = []; try { otps = JSON.parse(localStorage.getItem('cafeOTPs') || '[]'); } catch (e) {}
            otps = otps.filter(function (o) { return String(o.id) !== String(id); });
            if (otps.length) localStorage.setItem('cafeOTPs', JSON.stringify(otps));
            else try { localStorage.removeItem('cafeOTPs'); } catch (e) {}
            renderAdminOTPs();
        }
        window.generateAdminOTP = async function generateAdminOTP() {
            if (typeof verifyOnlineAdmin === 'function') {
                var okAd = await verifyOnlineAdmin();
                if (!okAd) { showNotification('فقط مدیر واردشده می‌تواند OTP بسازد', 'error'); return; }
            }
            var code = String(Math.floor(100000 + Math.random() * 900000));
            var uses = parseInt((document.getElementById('otpUsesInput') || {}).value, 10) || 1;
            var hours = parseInt((document.getElementById('otpHoursInput') || {}).value, 10) || 24;
            var phone = ((document.getElementById('otpPhoneNote') || {}).value || '').trim();
            var days = Math.max(1, Math.ceil(hours / 24));
            var serverOk = false;
            try {
                if (supabaseClient) {
                    var expIso = new Date(Date.now() + hours * 3600 * 1000).toISOString();
                    var ins = await supabaseClient.from('subscriptions').insert([{
                        code: code,
                        active: true,
                        used: false,
                        days: days,
                        plan: 'otp',
                        expiry_date: expIso,
                        note: phone || null
                    }]).select();
                    if (ins && !ins.error) serverOk = true;
                    else if (ins && ins.error) console.warn('OTP server insert', ins.error);
                }
            } catch (eIns) { console.warn('OTP server insert', eIns); }

            // حافظه موقت محلی فقط برای نمایش مدیر — نه منبع تأیید کاربر
            var otps = []; try { otps = JSON.parse(localStorage.getItem('cafeOTPs') || '[]'); } catch (e) {}
            otps.unshift({
                id: Date.now(),
                code: code,
                uses: uses,
                expires: Date.now() + hours * 3600 * 1000,
                created: new Date().toLocaleString('fa-IR'),
                phone: phone,
                server: serverOk
            });
            localStorage.setItem('cafeOTPs', JSON.stringify(otps.slice(0, 5)));
            pruneCafeOtpsStore();
            // کد کامل فقط در حافظهٔ نشست صفحه (نه دائمی)
            try { sessionStorage.setItem('kafe_last_otp', code); } catch (e) {}
            window._lastOTP = code;

            var box = document.getElementById('otpLastGenerated');
            if (box) box.style.display = 'block';
            var c = document.getElementById('otpLastCode'); if (c) c.textContent = code;
            var meta = document.getElementById('otpLastMeta');
            if (meta) meta.textContent = (serverOk ? 'ثبت روی سرور ✅ · ' : 'فقط موقت ⚠️ · ') + uses + ' بار · ' + hours + ' ساعت' + (phone ? ' · برای: ' + phone : '');
            renderAdminOTPs();
            if (typeof showNotification === 'function') {
                showNotification(serverOk
                    ? ('OTP روی سرور ثبت شد: ' + code)
                    : ('OTP موقت ساخته شد (سرور در دسترس نبود): ' + code));
            }
        }
        window.copyLastOTP = function copyLastOTP() {

            var code = window._lastOTP || (function(){try{return sessionStorage.getItem('kafe_last_otp')||'';}catch(e){return '';}})() || ((document.getElementById('otpLastCode') || {}).textContent || '');
            if (!code || code === '------') { if (typeof showNotification === 'function') showNotification('کدی نیست', 'error'); return; }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(function(){
                    if (typeof showNotification === 'function') showNotification('کپی شد: ' + code);
                }).catch(function(){ prompt('کپی کنید:', code); });
            } else {
                prompt('کپی کنید:', code);
            }
        }

        
        // ===== تنظیمات CSS سفارشی =====
        var DEFAULT_CUSTOM_CSS = {
            cyan: '#C9A84C', gold: '#E8C96A', mint: '#8F6F28', header: '#070B12',
            page: '#070B12', modal: '#121820', card: '#1A2230', bottom: '#070B12',
            admin: '#070B12', text: '#EDE8DC', heading: '#E8C96A'
        };
        function getCustomCSS() {
            try { var s = JSON.parse(localStorage.getItem('cafeCustomCSS') || 'null'); if (s && typeof s === 'object') return Object.assign({}, DEFAULT_CUSTOM_CSS, s); } catch (e) {}
            return Object.assign({}, DEFAULT_CUSTOM_CSS);
        }
        function applyCustomCSS(save) {
            var css = {
                cyan:(document.getElementById('cssCyan')||{}).value||DEFAULT_CUSTOM_CSS.cyan,
                gold:(document.getElementById('cssGold')||{}).value||DEFAULT_CUSTOM_CSS.gold,
                mint:(document.getElementById('cssMint')||{}).value||DEFAULT_CUSTOM_CSS.mint,
                header:(document.getElementById('cssHeader')||{}).value||DEFAULT_CUSTOM_CSS.header,
                page:(document.getElementById('cssPage')||{}).value||DEFAULT_CUSTOM_CSS.page,
                modal:(document.getElementById('cssModal')||{}).value||DEFAULT_CUSTOM_CSS.modal,
                card:(document.getElementById('cssCard')||{}).value||DEFAULT_CUSTOM_CSS.card,
                bottom:(document.getElementById('cssBottom')||{}).value||DEFAULT_CUSTOM_CSS.bottom,
                admin:(document.getElementById('cssAdmin')||{}).value||DEFAULT_CUSTOM_CSS.admin,
                text:(document.getElementById('cssText')||{}).value||DEFAULT_CUSTOM_CSS.text,
                heading:(document.getElementById('cssHeading')||{}).value||DEFAULT_CUSTOM_CSS.heading
            };
            if (save) {
                try { localStorage.setItem('cafeCustomCSS', JSON.stringify(css)); } catch (e) {}
                try { if (typeof cloudSaveAdminSetting === 'function') cloudSaveAdminSetting('cafeCustomCSS', css); } catch (e) {}
            }
            var st=document.getElementById('runtimeCustomCSS'); if(!st){st=document.createElement('style');st.id='runtimeCustomCSS';document.head.appendChild(st);}
            st.textContent=
                ':root{--c-cyan:'+css.cyan+';--c-gold:'+css.gold+';--c-mint:'+css.mint+';--c-header:'+css.header+';--c-page:'+css.page+';--c-modal:'+css.modal+';--c-card:'+css.card+';--c-bottom:'+css.bottom+';--c-admin:'+css.admin+';--c-text:'+css.text+';--c-heading:'+css.heading+';}'+
                'body{background:'+css.page+' !important;color:'+css.text+' !important;}'+
                'header{background:'+css.header+' !important;border-bottom-color:'+css.cyan+' !important;}'+
                '.bottom-nav{background:'+css.bottom+' !important;border-top-color:'+css.cyan+' !important;}'+
                '.bottom-nav .nav-item-bottom{color:'+css.text+' !important;}'+
                '.bottom-nav .nav-item-bottom.active,.bottom-nav .nav-item-bottom:hover{color:'+css.heading+' !important;background:rgba(255,255,255,.55) !important;}'+
                '.menu-drawer{background:'+css.bottom+' !important;border-color:'+css.cyan+' !important;}'+
                '.drawer-title{color:'+css.heading+' !important;}'+
                '.btn,.ig-buy-online,button.btn{background:linear-gradient(135deg,#8F6F28,#C9A84C,#E6C878) !important;color:#0d0f1a !important;}'+
                '.ig-buy-call,.bottom-nav .nav-item-bottom.center-btn{background:'+css.gold+' !important;color:'+css.header+' !important;}'+
                '.modal-glass .modal-glass-content,#productDetailModal .modal-glass-content,#settingsPanel{background:'+css.modal+' !important;color:'+css.text+' !important;}'+
                '#adminPanel{background:'+css.admin+' !important;color:'+css.text+' !important;}'+
                '.admin-card,.stat-card,.product-card,.section-card{background:'+css.card+' !important;color:'+css.text+' !important;}'+
                'h1,h2,h3,h4,.page-header h2,.section-title h2,.product-name,.modal-glass-title,.admin-card h4{color:'+css.heading+' !important;}'+
                'p,span,label,li,.product-price,.admin-card,.stat-card,.product-card{color:'+css.text+' !important;}'+
                '.admin-tab.active{background:linear-gradient(135deg,#8F6F28,#C9A84C,#E6C878) !important;color:#0d0f1a !important;}'+
                '#appVersionBadge{background:linear-gradient(135deg,#8F6F28,#C9A84C) !important;color:#0d0f1a !important;}'+
                '#termsScreen{background:linear-gradient(180deg,'+css.header+' 0%,'+css.page+' 100%) !important;color:'+css.text+' !important;}'+
                '.terms-card{background:rgba(255,255,255,.72) !important;border-color:'+css.gold+' !important;color:'+css.text+' !important;}'+
                '.terms-header h1,.terms-header p,.terms-card h3{color:'+css.heading+' !important;}'+
                '.terms-footer-bar{background:linear-gradient(180deg,transparent,'+css.header+' 45%,'+css.header+') !important;}'+
                '.terms-agree-btn{background:linear-gradient(135deg,'+css.gold+','+css.cyan+') !important;color:'+css.header+' !important;}'+
                '#splashScreen{background:'+css.header+' !important;}';
            if(save&&typeof showNotification==='function')showNotification('🎨 تم رنگ‌بندی ذخیره و اعمال شد');
        }
        window.resetCustomCSS = function resetCustomCSS() {
            try { localStorage.removeItem('cafeCustomCSS'); } catch (e) {}
            var d = DEFAULT_CUSTOM_CSS;
            var map = { cssCyan:d.cyan, cssGold:d.gold, cssMint:d.mint, cssHeader:d.header, cssPage:d.page, cssModal:d.modal, cssCard:d.card, cssBottom:d.bottom, cssAdmin:d.admin, cssText:d.text, cssHeading:d.heading };
            Object.keys(map).forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.value = map[id];
            });
            var st = document.getElementById('runtimeCustomCSS');
            if (st) st.textContent = '';
            if (typeof showNotification === 'function') showNotification('بازگشت به پیش‌فرض');
        }
        function loadCustomCSSIntoForm() {
            var css = getCustomCSS();
            var map = { cssCyan:css.cyan, cssGold:css.gold, cssMint:css.mint, cssHeader:css.header, cssPage:css.page, cssModal:css.modal, cssCard:css.card, cssBottom:css.bottom, cssAdmin:css.admin, cssText:css.text, cssHeading:css.heading };
            Object.keys(map).forEach(function (id) {
                var el = document.getElementById(id);
                if (el) el.value = map[id];
            });
            // apply saved without requiring save click
            try {
                if (localStorage.getItem('cafeCustomCSS')) {
                    // fill then apply without notification
                    Object.keys(map).forEach(function (id) {
                        var el = document.getElementById(id);
                        if (el) el.value = map[id];
                    });
                    applyCustomCSS(false);
                }
            } catch (e) {}
        }

        
        function renderModalsHomeGrid() {
            var grid = document.getElementById('modalsHomeGrid');
            if (!grid) return;
            var items = [
                {id:'abjadModal', title:'ابجد کبیر', icon:'🔢'},
                {id:'jafrModal', title:'جفر جامع', icon:'📖'},
                {id:'horoscopeModal', title:'طالع بینی', icon:'🔮'},
                {id:'loveModal', title:'محبت زن به مرد', icon:'❤️'},
                {id:'sababModal', title:'سبب القادم', icon:'📜'},
                {id:'aghatModal', title:'عاقبت ازدواج', icon:'💍'},
                {id:'calculatorModal', title:'ماشین حساب + ابجد', icon:'🧮'},
                {id:'dalilModal', title:'دلیل الحیران', icon:'❓'},
                {id:'ramlModal', title:'رمل امام علی', icon:'🎲'},
                {id:'hamzadModal', title:'همزاد قرین', icon:'👥'},
                {id:'mokashefeModal', title:'مکاشفه موکلین', icon:'🔮'},
                {id:'sotareChiniModal', title:'ستاره چینی', icon:'⭐'},
                {id:'mokelModal', title:'استخراج موکل', icon:'📿'},
                {id:'asmaniModal', title:'اسماء الحسنی', icon:'🌟'},
                {id:'marriageAgeModal', title:'سن ازدواج', icon:'💍'},
                {id:'developingModal', title:'در حال توسعه', icon:'🚧'}
            ];
            // اگر modalList سراسری هست از آن استفاده کن
            try {
                if (typeof modalList !== 'undefined' && Array.isArray(modalList) && modalList.length) {
                    items = modalList.map(function(m) {
                        return { id: m.id || m.modalId, title: m.title || m.name, icon: m.icon || '📜' };
                    }).filter(function(m){ return m.id; });
                }
            } catch (e) {}
            grid.innerHTML = items.map(function(item) {
                var meta = (typeof getModalMeta === 'function') ? getModalMeta(item.id) : item;
                return '<div class="modals-home-item" onclick="openModalGlass(\'' + item.id + '\')">' +
                    '<span class="mh-icon">' + (meta.icon || item.icon || '📜') + '</span>' +
                    '<span class="mh-label">' + (meta.title || item.title || item.id) + '</span></div>';
            }).join('');
        }

        
        
        // ===== سبد خرید واقعی (RELEASE-2) =====
        function getCart() {
            try {
                var arr = JSON.parse(localStorage.getItem('cafeCart') || '[]');
                return Array.isArray(arr) ? arr : [];
            } catch (e) { return []; }
        }
        function saveCart(items) {
            localStorage.setItem('cafeCart', JSON.stringify(items || []));
            updateCartBadge();
        }
        function updateCartBadge() {
            var items = getCart();
            var n = 0;
            for (var i = 0; i < items.length; i++) n += (parseInt(items[i].qty, 10) || 1);
            var badge = document.getElementById('cartBadge');
            if (badge) {
                badge.textContent = String(n);
                badge.style.display = n > 0 ? 'flex' : 'none';
            }
            var lab = document.getElementById('cartCountLabel');
            if (lab) lab.textContent = '(' + n + ' مورد)';
        }
        function addToCart(product) {
            if (!product || product.id === undefined || product.id === null) {
                if (typeof showNotification === 'function') showNotification('محصول نامعتبر است', 'error');
                return;
            }
            var items = getCart();
            var id = String(product.id);
            var found = null;
            for (var i = 0; i < items.length; i++) {
                if (String(items[i].id) === id) { found = items[i]; break; }
            }
            if (found) {
                found.qty = (parseInt(found.qty, 10) || 1) + 1;
            } else {
                items.push({
                    id: product.id,
                    title: product.title || product.name || 'محصول',
                    price: parseInt(product.price, 10) || 0,
                    image: product.imageUrl || product.image || '',
                    qty: 1
                });
            }
            saveCart(items);
            if (typeof showNotification === 'function') {
                showNotification('✅ «' + (product.title || product.name || '') + '» به سبد اضافه شد');
            }
            updateCartBadge();
        }
        function addCurrentProductToCart() {
            if (window._currentProduct) {
                addToCart(window._currentProduct);
            } else if (typeof showNotification === 'function') {
                showNotification('ابتدا یک محصول را باز کنید', 'error');
            }
        }
        function removeFromCart(id) {
            saveCart(getCart().filter(function (it) { return String(it.id) !== String(id); }));
            renderCartPanel();
        }
        function changeCartQty(id, delta) {
            var items = getCart();
            for (var i = 0; i < items.length; i++) {
                if (String(items[i].id) === String(id)) {
                    var q = (parseInt(items[i].qty, 10) || 1) + delta;
                    if (q < 1) {
                        items.splice(i, 1);
                    } else {
                        items[i].qty = q;
                    }
                    break;
                }
            }
            saveCart(items);
            renderCartPanel();
        }
        function cartTotal() {
            var t = 0;
            getCart().forEach(function (it) {
                t += (parseInt(it.price, 10) || 0) * (parseInt(it.qty, 10) || 1);
            });
            return t;
        }
        function renderCartPanel() {
            var box = document.getElementById('cartItemsList');
            if (!box) return;
            var items = getCart();
            updateCartBadge();
            if (!items.length) {
                box.innerHTML = '<p style="text-align:center;padding:24px;color:#1A1A1A;">سبد خرید خالی است.<br><small>از فروشگاه محصول را باز کنید و «افزودن به سبد» را بزنید.</small></p>';
                var t = document.getElementById('cartTotalValue');
                if (t) t.textContent = '۰ تومان';
                var chk = document.getElementById('cartCheckoutBtn');
                if (chk) chk.disabled = true;
                return;
            }
            box.innerHTML = items.map(function (it) {
                var line = (parseInt(it.price, 10) || 0) * (parseInt(it.qty, 10) || 1);
                return '<div class="admin-item" style="flex-direction:column;align-items:stretch;gap:8px;background:#fff;padding:12px;border-radius:12px;margin-bottom:8px;">' +
                    '<div style="display:flex;justify-content:space-between;gap:8px;">' +
                    '<strong style="color:#0A3545;">' + (it.title || '') + '</strong>' +
                    '<button type="button" onclick="removeFromCart(\'' + String(it.id).replace(/'/g, '') + '\')" style="background:#e53935;color:#fff;border:none;border-radius:8px;padding:4px 10px;">حذف</button></div>' +
                    '<div style="display:flex;justify-content:space-between;align-items:center;color:#1A1A1A;">' +
                    '<span>' + (parseInt(it.price, 10) || 0).toLocaleString('fa-IR') + ' تومان</span>' +
                    '<span style="display:flex;align-items:center;gap:8px;">' +
                    '<button type="button" onclick="changeCartQty(\'' + String(it.id).replace(/'/g, '') + '\',-1)" style="width:32px;height:32px;border-radius:8px;border:1px solid #ccc;">−</button>' +
                    '<b>' + (it.qty || 1) + '</b>' +
                    '<button type="button" onclick="changeCartQty(\'' + String(it.id).replace(/'/g, '') + '\',1)" style="width:32px;height:32px;border-radius:8px;border:1px solid #ccc;">+</button>' +
                    '</span></div>' +
                    '<div style="text-align:left;font-size:0.85rem;color:#333;">جمع این ردیف: ' + line.toLocaleString('fa-IR') + ' ت</div></div>';
            }).join('');
            var t = document.getElementById('cartTotalValue');
            if (t) t.textContent = cartTotal().toLocaleString('fa-IR') + ' تومان';
            var chk = document.getElementById('cartCheckoutBtn');
            if (chk) chk.disabled = false;
        }
        function openCartPanel() {
            var p = document.getElementById('cartPanel');
            if (!p) {
                alert('پنل سبد پیدا نشد');
                return;
            }
            renderCartPanel();
            p.style.display = 'block';
            try { document.body.classList.add('modal-open'); } catch (e) {}
        }
        function closeCartPanel() {
            var p = document.getElementById('cartPanel');
            if (p) p.style.display = 'none';
            try { document.body.classList.remove('modal-open'); } catch (e) {}
        }
        function startCartCheckout() {
            var items = getCart();
            if (!items.length) {
                if (typeof showNotification === 'function') showNotification('سبد خالی است', 'error');
                return;
            }
            // یک سفارش جمعی از کل سبد
            window._cartCheckoutMode = true;
            window._currentProduct = {
                id: 'cart-' + Date.now(),
                title: items.map(function (it) { return (it.title || '') + ' ×' + (it.qty || 1); }).join(' | '),
                price: cartTotal(),
                image: items[0].image || '',
                _cartItems: items.slice()
            };
            closeCartPanel();
            // باز کردن مودال محصول و فرم سفارش
            var modal = document.getElementById('productDetailModal');
            if (modal) {
                var ti = document.getElementById('igProductTitle');
                var pr = document.getElementById('igProductPrice');
                var de = document.getElementById('igProductDesc');
                if (ti) ti.textContent = 'تسویه سبد خرید';
                if (pr) pr.textContent = cartTotal().toLocaleString('fa-IR') + ' تومان';
                if (de) de.textContent = window._currentProduct.title;
                modal.classList.add('active');
                document.body.classList.add('modal-open');
                if (typeof showOnlineOrderForm === 'function') showOnlineOrderForm();
                var pn = document.getElementById('orderProductName');
                if (pn) pn.value = window._currentProduct.title;
            } else {
                if (typeof showNotification === 'function') showNotification('فرم سفارش در دسترس نیست', 'error');
            }
        }



        
        async function uploadProductDataUrl(dataUrl) {
            /* V22.9-RC1: در شکست Storage هرگز Base64 برنگردان — فقط URL عمومی یا null */
            if (!dataUrl || dataUrl.indexOf('data:image/') !== 0) return null;
            if (!supabaseClient) {
                console.warn('uploadProductDataUrl: Supabase client missing');
                return null;
            }
            try {
                var a=dataUrl.split(','), mime=(a[0].match(/data:([^;]+);base64/)||[,'image/jpeg'])[1];
                var bin=atob(a[1]), bytes=new Uint8Array(bin.length);
                for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
                var blob=new Blob([bytes],{type:mime});
                var ext=(mime.split('/')[1]||'jpg').replace(/[^a-z0-9]/gi,'')||'jpg';
                var path='products/'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.'+ext;
                var up=await supabaseClient.storage.from('public-assets').upload(path,blob,{upsert:true,contentType:mime});
                if(up.error) throw up.error;
                var pub=supabaseClient.storage.from('public-assets').getPublicUrl(path);
                var url = pub.data && pub.data.publicUrl ? pub.data.publicUrl : null;
                if (!url) throw new Error('publicUrl empty');
                return url;
            } catch(e) {
                console.warn('uploadProductDataUrl',e);
                if (typeof showNotification === 'function') {
                    showNotification('❌ آپلود تصویر محصول ناموفق بود. باکت public-assets یا دسترسی Storage را چک کنید', 'error');
                }
                return null;
            }
        }

        document.addEventListener('change', function (ev) {
            var t = ev.target;
            if (!t || t.id !== 'newProductImageFile') return;
            var file = t.files && t.files[0];
            if (!file) return;
            if (file.size > 2.5 * 1024 * 1024) {
                if (typeof showNotification === 'function') showNotification('حداکثر ۲.۵ مگابایت', 'error');
                return;
            }
            var reader = new FileReader();
            reader.onload = async function () {
                var data = reader.result;
                var urlInput = document.getElementById('newProductImageUrl');
                if (urlInput) urlInput.value = data;
                var prev = document.getElementById('newProductImagePreview');
                if (prev) { prev.src = data; prev.style.display = 'block'; }
                var cloudUrl = await uploadProductDataUrl(data);
                if (cloudUrl && String(cloudUrl).indexOf('http') === 0) {
                    if (urlInput) urlInput.value = cloudUrl;
                    if (prev) prev.src = cloudUrl;
                    if (typeof showNotification === 'function') showNotification('✅ تصویر محصول در فضای ابری آماده شد');
                } else {
                    if (urlInput) urlInput.value = '';
                    if (typeof showNotification === 'function') showNotification('❌ آپلود تصویر ناموفق — محصول را بدون تصویر ابری ذخیره نکنید', 'error');
                }
            };
            reader.readAsDataURL(file);
        });

        
        function getDalilImages() {
            try { var s = JSON.parse(localStorage.getItem('cafeDalilImages') || '{}'); return s && typeof s === 'object' ? s : {}; }
            catch (e) { return {}; }
        }
        function dalilImageKey(type, gender, rank) {
            if (type === 'child') return 'child_' + rank;
            return (gender === 'female' ? 'female_' : 'male_') + rank;
        }
        function showDalilRankImages(rank, type, gender) {
            type = type || selectedType || 'adult'; gender = gender || selectedGender || 'male';
            var key = dalilImageKey(type, gender, rank), all = getDalilImages(), d = all[key] || {};
            var box = document.getElementById('dalilRankImagesBox');
            if (!box) {
                box = document.createElement('div'); box.id='dalilRankImagesBox';
                box.style.cssText='display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:12px 0;';
                var res=document.getElementById('hayranResult'); if(res && res.parentNode) res.parentNode.insertBefore(box,res.nextSibling); else return;
            }
            box.innerHTML='';
            [d.img1,d.img2].forEach(function(src){ if(!src)return; var im=document.createElement('img'); im.src=src; im.alt='مرتبه '+rank; im.style.cssText='width:48%;max-width:190px;max-height:180px;border-radius:12px;border:2px solid #c9a84c;object-fit:cover;'; box.appendChild(im); });
            if (!box.children.length) box.innerHTML='<div style="width:100%;text-align:center;color:#777;font-size:.8rem;">برای این مرتبه هنوز تصویری ثبت نشده است.</div>';
        }
        function renderDalilImagesAdmin() {
            var box=document.getElementById('dalilImagesAdmin'); if(!box)return;
            var all=getDalilImages(), html='';
            [['male','آقایان','مرد'],['female','خانم‌ها','زن'],['child','اطفال','کودک']].forEach(function(group){
                html+='<div style="margin:14px 0 8px;padding:10px;border-radius:10px;background:#f5efe5;font-weight:800;color:#0A3545;">'+group[1]+' — ۹ مرتبه</div>';
                for(var r=1;r<=9;r++){
                    var key=dalilImageKey(group[0],group[0]==='child'?'male':group[0],r), d=all[key]||{};
                    html+='<div class="admin-card" style="margin-bottom:8px;padding:10px;"><strong style="color:#0A3545;">'+group[1]+' — مرتبه '+r+' — دو تصویر</strong>'+
                    '<div style="font-size:.72rem;color:#666;margin:4px 0;">تصویر ۱ '+(d.img1?'✅':'❌')+' | تصویر ۲ '+(d.img2?'✅':'❌')+'</div>'+
                    '<input type="file" accept="image/*" data-dalil-type="'+group[0]+'" data-rank="'+r+'" data-slot="1" class="dalil-img-file" style="width:100%;margin:4px 0;">'+
                    '<input type="file" accept="image/*" data-dalil-type="'+group[0]+'" data-rank="'+r+'" data-slot="2" class="dalil-img-file" style="width:100%;margin:4px 0;"></div>';
                }
            });
            box.innerHTML=html;
        }
        document.addEventListener('change',function(ev){
            var t=ev.target; if(!t || !t.classList || !t.classList.contains('dalil-img-file'))return;
            var rank=t.getAttribute('data-rank'), slot=t.getAttribute('data-slot'), type=t.getAttribute('data-dalil-type'), file=t.files&&t.files[0]; if(!file)return;
            var reader=new FileReader(); reader.onload=function(){ var all=getDalilImages(), key=dalilImageKey(type,type==='female'?'female':'male',rank), cur=all[key]||{img1:'',img2:''}; if(slot==='1')cur.img1=reader.result;else cur.img2=reader.result;all[key]=cur; try{localStorage.setItem('cafeDalilImages',JSON.stringify(all));}catch(e){showNotification('حافظه گوشی برای تصویر کافی نیست','error');return;} renderDalilImagesAdmin(); if(typeof showNotification==='function')showNotification('تصویر ذخیره شد'); };
            reader.readAsDataURL(file);
        });

        var APP_THEMES = {
            gold: { header:'#1a1520', accent:'#c9a84c', page:'#0d0f1a' },
            dark: { header:'#0d0f1a', accent:'#c9a84c', page:'#0a0c12' },
            blue: { header:'#1e3a5f', accent:'#3b82f6', page:'#0f172a' },
            green: { header:'#064e3b', accent:'#10b981', page:'#022c22' },
            purple: { header:'#4c1d95', accent:'#8b5cf6', page:'#1e1b4b' },
            rose: { header:'#9f1239', accent:'#ec4899', page:'#4c0519' }
        };
        function applyAppTheme(name) {
            var t = APP_THEMES[name] || APP_THEMES.gold;
            localStorage.setItem('cafeThemeName', name);
            var st = document.getElementById('runtimeThemeCSS');
            if (!st) { st = document.createElement('style'); st.id = 'runtimeThemeCSS'; document.head.appendChild(st); }
            st.textContent = 'header,.bottom-nav{background:' + t.header + ' !important;}';
            if (typeof showNotification === 'function') showNotification('تم اعمال شد: ' + name);
        }

        document.addEventListener('DOMContentLoaded', function(){ try{ updateCartBadge(); }catch(e){} try{ setTimeout(function(){ scrollToPage(0); }, 80); }catch(e){} });
        document.addEventListener('DOMContentLoaded', function(){ try{ loadSettings(); }catch(e){} try{ loadCustomCSSIntoForm(); }catch(e){} });
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 برنامه در حال راه‌اندازی...');
            try { if (typeof pruneCafeOtpsStore === 'function') pruneCafeOtpsStore(); } catch (ePrune) {}
            try { if (typeof migrateSensitivePayOutOfLocalStorage === 'function') migrateSensitivePayOutOfLocalStorage(); } catch (eMig) {}
            try { if (typeof refreshPaymentContactFromCloud === 'function') refreshPaymentContactFromCloud().then(function(){ if (typeof fillPaymentInfoUI === 'function') fillPaymentInfoUI(); }); } catch (ePay) {}
            applyDefaultImages();
            // بارگذاری ابری محصولات قبل از رندر نهایی؛ تا محصولات قدیمیِ کش‌شده جایگزین نشوند.
            refreshOnlineData().then(function(){
                try { renderProducts(); renderAdminProducts(); } catch(e) { console.warn('product cloud render', e); }
            }).catch(function(e){ console.warn('product cloud load', e); });

            /* اسپلش و ورود فقط بعد از قبول شرایط — acceptTermsAndContinue */
            console.log('منتظر قبول شرایط کاربر...');

            loadSettings();
            loadModalEdits();
            try{ renderDalilImagesAdmin(); }catch(e){}
            populateRamlQuestions();
            renderProducts();
            renderQuickTools();
            renderHistory();
            updateStats();
            updateDateTime();
            setInterval(updateDateTime, 30000);
            setTimeout(initStars, 200);
            initSwipe();

            document.getElementById('searchInput')?.addEventListener('input', function(e) {
                var q = e.target.value.trim();
                if (q.length > 2) {
                    var products = getProducts();
                    var results = products.filter(function(p) {
                        return p.title.includes(q);
                    });
                    showNotification('🔍 ' + results.length + ' نتیجه برای "' + q + '"');
                }
            });

            console.log('✅ برنامه با موفقیت راه‌اندازی شد!');
        });


/* ===== 02-feature-a.js ===== */
/* ============================================================
   KAFE MIAD — STAGE 1 HARDENING PATCH
   هدف: اصلاح ایرادهای اجرایی خارج از داده‌های مودال‌ها
   - فیش‌ها: نگهداری کامل در IndexedDB محلی، نه localStorage
   - جلوگیری از ثبت تکراری درخواست تماس
   - نمایش واقعی فیش ذخیره‌شده در پنل ادمین
   - ثبت کاربر در کش محلی + تلاش برای همگام‌سازی با Supabase
   - ثبت پیام در کش محلی + تلاش برای همگام‌سازی با Supabase
   - escape کردن داده‌های کاربر در خروجی پنل ادمین
   - بدون تغییر در محتوای modalData_*
   ============================================================ */
(function(){
  'use strict';

  function escapeHtml(v){
    return String(v == null ? '' : v)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  /* kafeEscapeHtml already provided by 00-safety.js — local escapeHtml kept for this IIFE */

  /* ---------- IndexedDB: local receipt vault ---------- */
  var DB_NAME='kafeMiadLocalDB', DB_VERSION=1, STORE='receipts';
  function openReceiptDB(){
    return new Promise(function(resolve,reject){
      if(!window.indexedDB){ reject(new Error('IndexedDB unavailable')); return; }
      var req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=function(e){
        var db=e.target.result;
        if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE,{keyPath:'id'});
      };
      req.onsuccess=function(){ resolve(req.result); };
      req.onerror=function(){ reject(req.error||new Error('IndexedDB error')); };
    });
  }
  function saveReceipt(id,data){
    return openReceiptDB().then(function(db){
      return new Promise(function(resolve,reject){
        var tx=db.transaction(STORE,'readwrite');
        tx.objectStore(STORE).put({id:String(id),data:data,createdAt:new Date().toISOString()});
        tx.oncomplete=function(){db.close();resolve(true);};
        tx.onerror=function(){db.close();reject(tx.error||new Error('save receipt failed'));};
      });
    });
  }
  function getReceipt(id){
    return openReceiptDB().then(function(db){
      return new Promise(function(resolve,reject){
        var req=db.transaction(STORE,'readonly').objectStore(STORE).get(String(id));
        req.onsuccess=function(){db.close();resolve(req.result ? req.result.data : null);};
        req.onerror=function(){db.close();reject(req.error||new Error('read receipt failed'));};
      });
    });
  }
  function deleteReceipt(id){
    return openReceiptDB().then(function(db){
      return new Promise(function(resolve,reject){
        var tx=db.transaction(STORE,'readwrite');
        tx.objectStore(STORE).delete(String(id));
        tx.oncomplete=function(){db.close();resolve(true);};
        tx.onerror=function(){db.close();reject(tx.error||new Error('delete receipt failed'));};
      });
    });
  }
  window.kafeReceiptDB={save:saveReceipt,get:getReceipt,remove:deleteReceipt};

  /* ---------- safer receipt preview ---------- */
  window.previewReceipt=function(event){
    var file=event && event.target && event.target.files ? event.target.files[0] : null;
    var preview=document.getElementById('orderReceiptPreview');
    if(!file || !preview) return;
    if(file.type && file.type.indexOf('image/')!==0){
      if(typeof showNotification==='function') showNotification('❌ فقط فایل تصویری برای فیش مجاز است','error');
      return;
    }
    if(file.size > 3*1024*1024){
      if(typeof showNotification==='function') showNotification('❌ حجم فیش حداکثر ۳ مگابایت باشد','error');
      try { if(event && event.target) event.target.value=''; } catch(e) {}
      return;
    }
    var reader=new FileReader();
    reader.onload=function(e){
      window._orderReceiptData=e.target.result;
      preview.src=e.target.result;
      preview.style.display='block';
    };
    reader.onerror=function(){
      if(typeof showNotification==='function') showNotification('❌ خواندن فیش ناموفق بود','error');
    };
    reader.readAsDataURL(file);
  };

  /* ---------- fix duplicate call orders ---------- */
  var originalShowCallPurchaseInfo=window.showCallPurchaseInfo;
  var callOrderKeys={};
  window.showCallPurchaseInfo=function(){
    var p=window._currentProduct;
    var key=p ? String(p.id) : 'none';
    if(p && callOrderKeys[key]){
      if(typeof showNotification==='function') showNotification('ℹ️ درخواست تماس این محصول قبلاً ثبت شده است');
      var ci=document.getElementById('igCallInfo'); if(ci) ci.classList.add('show');
      var ac=document.getElementById('igBuyActions'); if(ac) ac.style.display='none';
      return;
    }
    if(p) callOrderKeys[key]=true;
    try { return originalShowCallPurchaseInfo.apply(this,arguments); }
    catch(e){ console.warn('showCallPurchaseInfo',e); }
  };

  /* ---------- receipt-aware order submit wrapper (await + exact order id) ---------- */
  var originalSubmitProductOrder=window.submitProductOrder;
  var receiptSubmitRunning=false;
  window.submitProductOrder=async function(){
    if(receiptSubmitRunning){
      if(typeof showNotification==='function') showNotification('درخواست سفارش در حال ثبت است؛ لطفاً صبر کنید.','info');
      return;
    }
    var receipt=window._orderReceiptData;
    if(!receipt){
      if(typeof showNotification==='function') showNotification('❌ تصویر فیش واریزی الزامی است','error');
      return;
    }
    if(typeof originalSubmitProductOrder!=='function'){
      if(typeof showNotification==='function') showNotification('ثبت سفارش آماده نیست؛ صفحه را دوباره باز کنید.','error');
      return;
    }
    receiptSubmitRunning=true;
    var beforeIds={};
    try{
      var before=JSON.parse(localStorage.getItem('cafeOrders')||'[]');
      if(Array.isArray(before)) before.forEach(function(o){if(o&&o.id!=null)beforeIds[String(o.id)]=true;});
    }catch(e){}
    try{
      // The original async flow uploads the receipt and requires a confirmed Supabase order insert.
      await originalSubmitProductOrder.apply(this,arguments);
      var latest=[];
      try{latest=JSON.parse(localStorage.getItem('cafeOrders')||'[]');}catch(e){}
      if(!Array.isArray(latest)) latest=[];
      // Never assume orders[0] is the order just submitted.
      var order=latest.find(function(o){return o&&o.id!=null&&!beforeIds[String(o.id)];});
      if(!order) return; // No newly server-confirmed local order was created.
      var orderId=String(order.id);
      var receiptId='receipt-'+orderId;
      try{
        await saveReceipt(receiptId,receipt);
        var refreshed=[];
        try{refreshed=JSON.parse(localStorage.getItem('cafeOrders')||'[]');}catch(e){}
        if(!Array.isArray(refreshed)) refreshed=[];
        var exact=refreshed.find(function(o){return o&&String(o.id)===orderId;});
        if(!exact) return;
        exact.receiptId=receiptId;
        exact.receiptStoredLocally=true;
        /* Keep the image out of localStorage; the server already stores the receipt path. */
        exact.receiptData='';
        localStorage.setItem('cafeOrders',JSON.stringify(refreshed));
        if(typeof window.renderAdminOrders==='function') window.renderAdminOrders();
      }catch(e){
        console.warn('receipt vault failed for order '+orderId,e);
        if(typeof showNotification==='function') showNotification('⚠️ سفارش در سرور ثبت شد، اما ذخیره محلی تصویر فیش انجام نشد.','error');
      }
    }catch(e){
      console.error('submitProductOrder',e);
      if(typeof showNotification==='function') showNotification('ثبت سفارش کامل نشد؛ وضعیت سرور را بررسی کنید.','error');
    }finally{
      receiptSubmitRunning=false;
    }
  };

  window.viewLocalReceipt=function(orderId){
    var order=null;
    try{
      var orders=JSON.parse(localStorage.getItem('cafeOrders')||'[]');
      order=(orders||[]).find(function(o){return String(o.id)===String(orderId);});
    }catch(e){}
    var rid=order && order.receiptId;
    if(!rid){
      if(typeof showNotification==='function') showNotification('فیش ذخیره‌شده‌ای برای این سفارش پیدا نشد','error');
      return;
    }
    getReceipt(rid).then(function(src){
      if(!src){throw new Error('receipt not found');}
      var old=document.getElementById('kafeReceiptViewer');
      if(old) old.remove();
      var wrap=document.createElement('div');
      wrap.id='kafeReceiptViewer';
      wrap.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl;';
      wrap.innerHTML='<div style="position:relative;max-width:95vw;max-height:95vh;background:#111;border:1px solid #c9a84c;border-radius:14px;padding:12px;text-align:center">'+
        '<button type="button" style="position:absolute;top:6px;left:6px;border:0;border-radius:8px;padding:6px 10px;background:#c9a84c;color:#111;font-weight:700" onclick="document.getElementById(\'kafeReceiptViewer\').remove()">✕</button>'+
        '<img src="'+escapeHtml(src)+'" alt="فیش سفارش" style="display:block;max-width:90vw;max-height:86vh;object-fit:contain;border-radius:8px;margin-top:28px">'+
        '</div>';
      document.body.appendChild(wrap);
    }).catch(function(){
      if(typeof showNotification==='function') showNotification('خواندن فیش ناموفق بود','error');
    });
  };

  /* window.renderAdminOrders (localStorage) removed — superseded by server version in 18-final-production.js */

  /* Registration is owned by registration-recovery.js; do not duplicate auth writes here. */

  /* ---------- local safety on order deletion ---------- */
  var originalDeleteOrderAdmin=window.deleteOrderAdmin;
  window.deleteOrderAdmin=function(id){
    var order=null;
    try{var a=JSON.parse(localStorage.getItem('cafeOrders')||'[]');order=(a||[]).find(function(o){return String(o.id)===String(id)});}catch(e){}
    try{return originalDeleteOrderAdmin.apply(this,arguments);}finally{
      if(order && order.receiptId)deleteReceipt(order.receiptId).catch(function(){});
    }
  };

  // Initial product sync is owned by the single DOMContentLoaded startup path below.
  console.log('✅ Kafe Miad Stage 2 online connection loaded');
})();


/* ===== 03-feature-b.js ===== */
// نسخه اصلاح‌شده مرحله دوم: اتصال Supabase اضافه شده؛ localStorage همچنان به‌عنوان fallback آفلاین حفظ می‌شود.
// Optional install prompt
var deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredPrompt = e;
  console.log('💡 App can be installed');
});
window.installKafeApp = function() {
  if (!deferredPrompt) {
    alert('برای نصب: از منوی مرورگر گزینه Add to Home Screen / نصب برنامه را بزنید');
    return;
  }
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(function() { deferredPrompt = null; });
};


/* ===== 04-feature-c.js ===== */
/* PHONE_GALLERY_REAL_V5 */
(function(){
function settings(){try{return JSON.parse(localStorage.getItem('cafeSettings')||'{}')}catch(e){return {}}}
function put(s){try{localStorage.setItem('cafeSettings',JSON.stringify(s));return true}catch(e){console.warn(e);return false}}
async function resizeInstallIcon(dataUrl,size){
return new Promise(function(resolve,reject){
var img=new Image();
img.onload=function(){
try{
var canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
var ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas برای ساخت آیکون نصب در دسترس نیست.');
var scale=Math.max(size/img.width,size/img.height),sw=size/scale,sh=size/scale;
ctx.clearRect(0,0,size,size);
ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,size,size);
resolve(canvas.toDataURL('image/png'));
}catch(e){reject(e)}
};
img.onerror=function(){reject(new Error('تصویر آیکون برای ساخت اندازه نصب خوانده نشد.'))};
img.src=dataUrl;
});
}
async function upload(data,key){/* V22.9-RC1: شکست Storage = null، نه Base64 */if(!data||String(data).indexOf('data:image/')!==0)return null;if(!supabaseClient){console.warn('media upload: no client');return null;}try{var a=data.split(','),mime=(a[0].match(/data:([^;]+);base64/)||[,'image/jpeg'])[1],bin=atob(a[1]),b=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)b[i]=bin.charCodeAt(i);var blob=new Blob([b],{type:mime}),ext=(mime.split('/')[1]||'jpg').replace(/[^a-z0-9]/gi,'')||'jpg',path='app-media/'+key+'-'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.'+ext,r=await supabaseClient.storage.from('public-assets').upload(path,blob,{upsert:true,contentType:mime});if(r.error)throw r.error;var u=supabaseClient.storage.from('public-assets').getPublicUrl(path);var url=u.data&&u.data.publicUrl?u.data.publicUrl:null;if(!url)throw new Error('publicUrl empty');return url}catch(e){console.warn('media upload',key,e);return null}}
function apply(s){if(!s)return;if(s.headerLogo){var h=document.getElementById('headerLogoImg');if(h)h.src=s.headerLogo}if(s.registerLogo){var r=document.getElementById('registerLogoImg')||document.querySelector('#registerScreen img');if(r)r.src=s.registerLogo}if(s.splashBg){var spImg=document.getElementById('splashBgImg');if(spImg){spImg.src=s.splashBg;spImg.style.display='block';spImg.style.opacity='1';}var sp=document.getElementById('splashScreen');if(sp){sp.style.backgroundImage='url(\"'+s.splashBg+'\")';sp.style.backgroundSize='cover';sp.style.backgroundPosition='center';}}if(s.appBg){try{document.documentElement.style.setProperty('--app-user-bg','url(\"'+s.appBg+'\")');document.body.style.setProperty('background-image','url(\"'+s.appBg+'\")','important');document.body.style.setProperty('background-size','cover','important');document.body.style.setProperty('background-attachment','fixed','important');document.body.style.setProperty('background-position','center','important');var app=document.getElementById('app');if(app){app.style.setProperty('background-image','url(\"'+s.appBg+'\")','important');app.style.setProperty('background-size','cover','important');app.style.setProperty('background-position','center','important');}}catch(e){console.warn('appBg',e)}}if(s.appIcon){try{localStorage.setItem('cafeAppIcon',s.appIcon)}catch(e){}if(typeof applyAppIcon==='function')applyAppIcon(s.appIcon);else{document.querySelectorAll('link[rel=\"icon\"],link[rel=\"apple-touch-icon\"],link[rel=\"shortcut icon\"]').forEach(function(l){l.href=s.appIcon})}}}
window.saveAndApplyAllMediaImages=async function(){
var b=document.getElementById('saveAllMediaImagesBtn'),oldText=b?b.textContent:'';
if(b){b.disabled=true;b.textContent='⏳ در حال ذخیره روی سرور...'}
try{
if(!supabaseClient||typeof cloudSaveAdminSetting!=='function'||typeof verifyOnlineAdmin!=='function'||!(await verifyOnlineAdmin()))throw new Error('اتصال سرور یا ورود امن مدیر در دسترس نیست.');
var previous=settings(),s=Object.assign({},previous),originalAppIcon=s.appIcon,keys=['headerLogo','registerLogo','splashBg','appBg','appIcon'];
for(var i=0;i<keys.length;i++){
var key=keys[i];
if(s[key]&&String(s[key]).indexOf('data:image/')===0){
var upUrl=await upload(s[key],key);
if(!upUrl||String(upUrl).indexOf('http')!==0)throw new Error('بارگذاری تصویر «'+key+'» روی سرور ناموفق بود؛ تنظیمات قبلی حفظ شد.');
s[key]=upUrl;
}
}
// Generate real PNG files at the exact PWA install sizes from the newly selected source image.
// These are stored in Supabase Storage; GitHub's static icon files and the manifest stay intact.
if(originalAppIcon&&String(originalAppIcon).indexOf('data:image/')===0){
for(var si=0;si<2;si++){
var iconSize=si===0?192:512;
var iconPng=await resizeInstallIcon(originalAppIcon,iconSize);
var iconUrl=await upload(iconPng,'appIcon'+iconSize);
if (!iconUrl || String(iconUrl).indexOf("http") !== 0) {
  throw new Error("ساخت یا ذخیره آیکون نصب " + iconSize + "x" + iconSize + " ناموفق بود؛ تنظیمات قبلی حفظ شد.");
}
s['appIcon'+iconSize]=iconUrl;
}
}
var cloudOk=await cloudSaveAdminSetting('cafeSettings',s);
if(!cloudOk)throw new Error('سرور ذخیره تنظیمات تصاویر را تأیید نکرد؛ تنظیمات قبلی حفظ شد.');
if(!put(s))throw new Error('سرور ذخیره کرد، اما حافظه نمایشی گوشی به‌روز نشد؛ صفحه را تازه کنید.');
if(s.appIcon)try{localStorage.setItem('cafeAppIcon',s.appIcon)}catch(e){}
apply(s);
if(typeof showNotification==='function')showNotification('✅ تصاویر و تنظیمات فقط پس از تأیید سرور اعمال شدند.');
}catch(e){
console.warn('save media images server-first',e);
if(typeof showNotification==='function')showNotification('❌ '+(e.message||'ذخیره تصاویر ناموفق بود.'),'error');
}finally{if(b){b.disabled=false;b.textContent=oldText||'💾 ذخیره و اعمال همه تصاویر'}}
}
window.applyGalleryImagesToUI=function(){var s=settings();apply(s);[['headerLogo','previewHeaderLogo'],['registerLogo','previewRegisterLogo'],['splashBg','previewSplash'],['appBg','previewAppBg'],['appIcon','previewAppIcon']].forEach(function(x){var e=document.getElementById(x[1]);if(e&&s[x[0]]){e.src=s[x[0]];e.style.display='block'}})};
window.clearGalleryImages=async function(){if(!confirm('همه تصاویر گالری از تنظیمات سرور پاک شوند؟'))return;if(!supabaseClient||typeof verifyOnlineAdmin!=='function'||!(await verifyOnlineAdmin())){if(typeof showNotification==='function')showNotification('❌ اتصال سرور یا ورود امن مدیر در دسترس نیست؛ تصاویر حذف نشدند.','error');return;}var s=settings();['headerLogo','registerLogo','splashBg','appBg','appIcon','appIcon192','appIcon512'].forEach(function(k){delete s[k]});try{var ok=await cloudSaveAdminSetting('cafeSettings',s);if(!ok)throw new Error('سرور حذف تصاویر را تأیید نکرد.');put(s);document.body.style.backgroundImage='';if(typeof applyGalleryImagesToUI==='function')applyGalleryImagesToUI();if(typeof showNotification==='function')showNotification('✅ تصاویر از تنظیمات سرور حذف شدند.');}catch(e){if(typeof showNotification==='function')showNotification('❌ تصاویر حذف نشدند؛ '+(e.message||''),'error');}};
function read(file,mb,cb){if(!file)return;if(file.size>mb*1024*1024){alert('حداکثر '+mb+' مگابایت');return}var r=new FileReader();r.onload=function(){cb(r.result)};r.readAsDataURL(file)}
document.addEventListener('change',function(ev){var t=ev.target;if(!t||!t.id)return;var c={galleryHeaderLogo:['headerLogo','previewHeaderLogo',1.5],galleryRegisterLogo:['registerLogo','previewRegisterLogo',1.5],gallerySplash:['splashBg','previewSplash',2],galleryAppBg:['appBg','previewAppBg',2],galleryAppIcon:['appIcon','previewAppIcon',1.2]}[t.id];if(!c)return;var f=t.files&&t.files[0];if(!f)return;read(f,c[2],function(data){var s=settings();s[c[0]]=data;put(s);var p=document.getElementById(c[1]);if(p){p.src=data;p.style.display='block'}apply(s);if(typeof showNotification==='function')showNotification('🖼️ تصویر انتخاب شد؛ برای ذخیره دائمی «ذخیره و اعمال همه تصاویر» را بزنید')})});
document.addEventListener('DOMContentLoaded',function(){try{window.applyGalleryImagesToUI()}catch(e){}});setTimeout(function(){try{window.applyGalleryImagesToUI()}catch(e){}},500);setTimeout(function(){try{window.applyGalleryImagesToUI()}catch(e){}},1500);setTimeout(function(){try{window.applyGalleryImagesToUI()}catch(e){}},3500);
})();


/* ===== 05-feature-d.js ===== */
/* THEME_BOOT */
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    try {
      var th = localStorage.getItem('cafeTheme') || localStorage.getItem('cafeThemeName') || 'default';
      if (typeof changeTheme === 'function') changeTheme(th);
    } catch(e) {}
  });
})();


/* ===== 06-feature-e.js ===== */
/* V8 TALISMAN BUILDER — combined two-part modal */
(function(){
  const ABJ={ا:1,ب:2,ج:3,د:4,ه:5,و:6,ز:7,ح:8,ط:9,ی:10,ک:20,ل:30,م:40,ن:50,س:60,ع:70,ف:80,ص:90,ق:100,ر:200,ش:300,ت:400,ث:500,خ:600,ذ:700,ض:800,ظ:900,غ:1000,ة:5,أ:1,إ:1,آ:1,ئ:10,ى:10,ك:20,ي:10};
  const Z={1:['حمل','آتش','🔥','مریخ','سه‌شنبه'],2:['ثور','خاک','🌍','زهره','جمعه'],3:['جوزا','هوا','🌬️','عطارد','چهارشنبه'],4:['سرطان','آب','💧','ماه','دوشنبه'],5:['اسد','آتش','🔥','خورشید','یکشنبه'],6:['سنبله','خاک','🌍','عطارد','چهارشنبه'],7:['میزان','هوا','🌬️','زهره','جمعه'],8:['عقرب','آب','💧','مریخ','سه‌شنبه'],9:['قوس','آتش','🔥','مشتری','پنج‌شنبه'],10:['جدی','خاک','🌍','زحل','شنبه'],11:['دلو','هوا','🌬️','زحل','شنبه'],12:['حوت','آب','💧','مشتری','پنج‌شنبه']};
  const S={1:['فاتحه',7],2:['بقره',286],3:['آل عمران',200],4:['نساء',176],5:['مائده',120],6:['انعام',165],7:['اعراف',206],8:['انفال',75],9:['توبه',129],10:['یونس',109],11:['هود',123],12:['یوسف',111],13:['رعد',43],14:['ابراهیم',52],15:['حجر',99],16:['نحل',128],17:['اسراء',111],18:['کهف',110],19:['مریم',98],20:['طه',135],21:['انبیاء',112],22:['حج',78],23:['مؤمنون',118],24:['نور',64],25:['فرقان',77],26:['شعراء',227],27:['نمل',93],28:['قصص',88],29:['عنکبوت',69],30:['روم',60],31:['لقمان',34],32:['سجده',30],33:['احزاب',73],34:['سبأ',54],35:['فاطر',45],36:['یس',83],37:['صافات',182],38:['ص',88],39:['زمر',75],40:['غافر',85],41:['فصلت',54],42:['شوری',53],43:['زخرف',89],44:['دخان',59],45:['جاثیه',37],46:['احقاف',35],47:['محمد',38],48:['فتح',29],49:['حجرات',18],50:['ق',45],51:['ذاریات',60],52:['طور',49],53:['نجم',62],54:['قمر',55],55:['الرحمن',78],56:['واقعه',96],57:['حدید',29],58:['مجادله',22],59:['حشر',24],60:['ممتحنه',13],61:['صف',14],62:['جمعه',11],63:['منافقون',11],64:['تغابن',18],65:['طلاق',12],66:['تحریم',12],67:['ملک',30],68:['قلم',52],69:['حاقه',52],70:['معارج',44],71:['نوح',28],72:['جن',28],73:['مزمل',20],74:['مدثر',56],75:['قیامت',40],76:['انسان',31],77:['مرسلات',50],78:['نبأ',40],79:['نازعات',46],80:['عبس',42],81:['تکویر',29],82:['انفطار',19],83:['مطففین',36],84:['انشقاق',25],85:['بروج',22],86:['طارق',17],87:['اعلی',19],88:['غاشیه',26],89:['فجر',30],90:['بلد',20],91:['شمس',15],92:['لیل',21],93:['ضحی',11],94:['شرح',8],95:['تین',8],96:['علق',19],97:['قدر',5],98:['بینه',8],99:['زلزال',8],100:['عادیات',11],101:['قارعه',11],102:['تکاثر',8],103:['عصر',3],104:['همزه',9],105:['فیل',5],106:['قریش',4],107:['ماعون',7],108:['کوثر',3],109:['کافرون',6],110:['نصر',3],111:['مسد',5],112:['اخلاص',4],113:['فلق',5],114:['ناس',6]};
  const BASE={1:500,2:510,3:520,4:530,5:540,6:550,7:560,8:570,9:580,10:590,11:600,12:610};
  function ab(t){return [...String(t||'')].reduce((n,c)=>n+(ABJ[c]||0),0)}
  function n2l(n,rev){if(n<=0)return '';let ks=Object.keys(ABJ).map(k=>ABJ[k]).filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>b-a),r='',x=n;ks.forEach(v=>{while(x>=v){let k=Object.keys(ABJ).find(k=>ABJ[k]===v);r+=k;x-=v}});return rev?[...r].reverse().join(''):r}
  function safe(t){return String(t??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
  function get(id){return (document.getElementById(id)||{}).value||''}
  function zodiac(n,m){let total=ab(n)+ab(m),r=total%12||12;return {total,r,d:Z[r]}}
  function saveEvent(type,payload){try{if(typeof window.v8ServerFirstSave==='function')window.v8ServerFirstSave(type,payload)}catch(e){}}
  window.switchTalismanPart=function(id){document.querySelectorAll('.v8-talisman-tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));document.getElementById('talismanPart1').style.display=id==='t1'?'block':'none';document.getElementById('talismanPart2').style.display=id==='t2'?'block':'none'};
  window.generateTalismanPart1=function(){
    let n=get('t1UserName').trim(),m=get('t1MotherName').trim(),h=get('t1HajatSubject'),note=get('t1ExtraNote').trim();
    if(!n||!m){showNotification('لطفاً نام و نام مادر را وارد کنید','error');return}
    let z=zodiac(n,m),total=z.total+(h?ab(h):0),sn=total;while(sn>114)sn-=114;if(sn===0)sn=114;let si=S[sn]||['نامشخص',1],ay=sn%si[1]||si[1],days=sn;
    let html=`<div class="v8-talisman-output"><b>🔢 ابجد کل:</b> ${total}<br><b>🌟 برج:</b> ${z.d[0]} (${z.r}) ${z.d[2]}<br><b>🔥 عنصر:</b> ${z.d[1]}<br><b>🪐 سیاره:</b> ${z.d[3]}<br><b>📅 روز مناسب:</b> ${z.d[4]}<br><b>📖 سوره:</b> ${si[0]} (${sn})<br><b>📄 آیه:</b> ${ay} از ${si[1]}<br><b>🎯 حاجت:</b> ${safe(h||'بدون حاجت')}${note?'<br><b>📝 توضیح:</b> '+safe(note):''}<hr><b>📖 روش ختم:</b><br>به مدت ${days} روز، هر روز ۱ بار سوره ${safe(si[0])} خوانده شود؛ یا در ۱ روز ${days} بار. پس از هر بار یک صلوات و در پایان دعا برای حاجت.</div>`;
    document.getElementById('talismanPart1Result').innerHTML=html;document.getElementById('talismanPart1Result').style.display='block';
    saveEvent('talisman_part1',{name:n,mother:m,hajat:h,birthDate:get('t1BirthDate'),result:{abjad:total,zodiac:z.r,surah:sn,ayah:ay}});
  };
  window.generateTalismanPart2=function(){
    let n=get('t2UserName').trim(),m=get('t2MotherName').trim(),h=get('t2HajatSubject'),target=get('t2TargetName').trim();
    if(!n||!m){showNotification('لطفاً نام و نام مادر را وارد کنید','error');return}
    let z=zodiac(n,m),base=BASE[z.r]||500,w=[[base+4,base+9,base+2],[base+3,base+5,base+7],[base+8,base+1,base+6]];
    let right=[w[0][2],w[1][2],w[2][2]],left=[w[0][0],w[1][0],w[2][0]];
    let al=right.map(x=>{let c=x-51;return {num:x,calc:c,name:n2l(c,false)+'ئیل'}}),sf=left.map(x=>{let c=x-319;return {num:x,calc:c,name:n2l(c,true)+'طیش'}});
    let amc=al.reduce((a,x)=>a+x.calc,0)-51,smc=sf.reduce((a,x)=>a+x.calc,0);let am=n2l(amc,false)+'ئیل',sm=n2l(smc,true)+'طیش';
    let grid=w.flat().map(x=>`<div class="v8-waqf-cell">${x}</div>`).join('');
    let text=`یا العون العلوی ${al.map(x=>x.name).join(' و ')}\nو بحق الملک الحاکم علیکم ${am}\n\nیا العون السفلی ${sf.map(x=>x.name).join(' و ')}\nو بحق الملک الحاکم علیکم ${sm}\n\n${target?`اجیبوا و احضرولی ${target} ابن ${m}`:'بحق هذه الأسماء المباركة اقضوا حاجتی'}\n\n${h?`﴿ برای ${h} ﴾`:''}`;
    let html=`<div class="v8-talisman-output"><b>🌟 برج:</b> ${z.d[0]} (${z.r})<div class="v8-waqf-grid">${grid}</div><b>🌟 موکلین علوی:</b> ${al.map(x=>safe(x.name)).join(' — ')}<br><b>👑 ملک حاکم علوی:</b> ${safe(am)}<br><br><b>👿 موکلین سفلی:</b> ${sf.map(x=>safe(x.name)).join(' — ')}<br><b>👑 ملک حاکم سفلی:</b> ${safe(sm)}<br><br><b>🎯 حاجت:</b> ${safe(h)}<pre style="white-space:pre-wrap;direction:rtl;text-align:right;color:#f5d76e;font-family:inherit;line-height:2;margin-top:10px;">${safe(text)}</pre><button class="v8-copy-btn" type="button" onclick="copyV8TalismanText()">📋 کپی متن توکیل</button></div>`;
    document.getElementById('talismanPart2Result').innerHTML=html;document.getElementById('talismanPart2Result').style.display='block';window._v8TalismanText=text;
    saveEvent('talisman_part2',{name:n,mother:m,hajat:h,target:target,zodiac:z.r,base:base,waqf:w,alawi:al,safli:sf,masters:{alawi:am,safli:sm},text:text});
  };
  window.calculateVefq=function(){window.generateTalismanPart1()};
  window.copyV8TalismanText=function(){navigator.clipboard?.writeText(window._v8TalismanText||'').then(()=>showNotification('متن توکیل کپی شد')).catch(()=>showNotification('کپی خودکار در دسترس نیست','error'))};
})();


/* ===== 07-feature-f.js ===== */
/* SUB_ORDERS_PANEL + NO_CART + APP_ICON */
(function(){
  /* openSubOrdersPanel removed: superseded by server-truth version in 18-final-production.js */
  window.closeSubOrdersPanel = function(){
    var p = document.getElementById('subOrdersPanel');
    if (p) p.style.display = 'none';
  };
  window.redeemUserOTPFromPanel = function(){
    var code = ((document.getElementById('userOtpInput') || {}).value || '').trim();
    if (!code) { if (typeof showNotification==='function') showNotification('کد را وارد کنید','error'); return; }
    // فقط مسیر سرور — دیگر از localStorage اشتراک فعال نمی‌شود
    if (typeof verifyOTPCode === 'function') {
      var inp = document.getElementById('otpInput');
      if (inp) inp.value = code;
      else {
        // اگر فیلد otpInput نیست، موقتاً بساز
        var h = document.createElement('input'); h.id = 'otpInput'; h.value = code; h.style.display = 'none'; document.body.appendChild(h);
      }
      Promise.resolve(verifyOTPCode()).then(function(){
        setTimeout(function(){ if (typeof openSubOrdersPanel==='function') openSubOrdersPanel(); }, 400);
      });
      return;
    }
    if (typeof redeemOTP === 'function') {
      redeemOTP(code);
      setTimeout(function(){ if (typeof openSubOrdersPanel==='function') openSubOrdersPanel(); }, 300);
      return;
    }
    if (typeof showNotification==='function') showNotification('تأیید کد فقط از طریق سرور ممکن است. اتصال را بررسی کنید.','error');
  };
  // disable cart UI paths
  window.openCartPanel = function(){ if (typeof openSubOrdersPanel==='function') openSubOrdersPanel(); };
  window.addToCart = function(product){
    // instead of cart: open product order if possible
    if (product && typeof openProductDetail === 'function') {
      openProductDetail(product.id || product);
      if (typeof showNotification==='function') showNotification('سبد خرید حذف شده — مستقیم سفارش دهید');
    } else if (typeof openSubOrdersPanel==='function') openSubOrdersPanel();
  };
  window.addCurrentProductToCart = function(){
    if (window._currentProduct && typeof startProductOrder === 'function') {
      try { startProductOrder(window._currentProduct); return; } catch(e){}
    }
    // fall through to show order form in product modal
    var form = document.getElementById('igOrderForm');
    if (form) { form.style.display = 'block'; form.scrollIntoView({behavior:'smooth',block:'nearest'}); }
    else if (typeof showNotification==='function') showNotification('از دکمه خرید آنلاین/تماس استفاده کنید');
  };
  // App icon from gallery
  window.applyAppIcon = function(dataUrl){
    if (!dataUrl) return;
    try { localStorage.setItem('cafeAppIcon', dataUrl); } catch(e){}
    try {
      var s = {};
      try { s = JSON.parse(localStorage.getItem('cafeSettings')||'{}'); } catch(e2){}
      s.appIcon = dataUrl;
      localStorage.setItem('cafeSettings', JSON.stringify(s));
    } catch(e){}
    // App icon is independent from the header logo. Update browser icons and the install manifest.
    var sels = 'link[rel="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]';
    var links = document.querySelectorAll(sels);
    var iconType = 'image/png';
    if (/^data:image\/svg\+xml/i.test(dataUrl) || /\.svg(?:[?#]|$)/i.test(dataUrl)) iconType = 'image/svg+xml';
    else if (/^data:image\/webp/i.test(dataUrl) || /\.webp(?:[?#]|$)/i.test(dataUrl)) iconType = 'image/webp';
    else if (/^data:image\/jpeg/i.test(dataUrl) || /\.jpe?g(?:[?#]|$)/i.test(dataUrl)) iconType = 'image/jpeg';
    if (!links.length) {
      var l1 = document.createElement('link'); l1.rel='icon'; l1.type=iconType; l1.href=dataUrl; document.head.appendChild(l1);
      var l2 = document.createElement('link'); l2.rel='apple-touch-icon'; l2.href=dataUrl; document.head.appendChild(l2);
    } else {
      links.forEach(function(l){ l.href = dataUrl; if (l.rel === 'icon' || l.rel === 'shortcut icon') l.type = iconType; });
    }
    // Ask the server-backed manifest to refresh only for a permanently uploaded icon.
    if (/^https:\/\/evxxvnlwtbaqpjbjaxdk\.supabase\.co\/storage\/v1\/object\/public\/public-assets\/app-media\//i.test(dataUrl)) {
      var manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) manifestLink.href = 'https://evxxvnlwtbaqpjbjaxdk.supabase.co/functions/v1/app-manifest?v=20261014-rc19&t=' + Date.now();
    }
    // Keep the install banner aligned with appIcon, never with headerLogo.
    if (typeof window.syncKafeInstallIcon === 'function') window.syncKafeInstallIcon();
    var installIcon = document.querySelector('#kafe-install-banner .kafe-install-icon');
    if (installIcon) installIcon.src = dataUrl;
    // Preview in admin panel.
    var prev = document.getElementById('previewAppIcon');
    if (prev) { prev.src = dataUrl; prev.style.display = 'block'; }
    if (typeof window.syncKafeInstallIcon === 'function') window.syncKafeInstallIcon();
  };
  document.addEventListener('DOMContentLoaded', function(){
    try {
      var ic = localStorage.getItem('cafeAppIcon');
      var s = {};
      try { s = JSON.parse(localStorage.getItem('cafeSettings')||'{}'); } catch(e2){}
      if (s.appIcon) ic = s.appIcon;
      if (ic && typeof applyAppIcon === 'function') applyAppIcon(ic);
      if (s.appBg) {
        document.documentElement.style.setProperty('--app-user-bg', 'url("'+s.appBg+'")');
        document.body.style.setProperty('background-image', 'url("'+s.appBg+'")', 'important');
        document.body.style.setProperty('background-size', 'cover', 'important');
        document.body.style.setProperty('background-attachment', 'fixed', 'important');
      }
    } catch(e){}
    var btn = document.getElementById('floatingCartBtn');
    if (btn) btn.style.display = 'none';
  });
})();


/* ===== 08-feature-g.js ===== */
/* TERMS_GATE — تأیید شرایط و ثبت‌نام فقط بار اول */
(function(){
  var TERMS_KEY = 'kafeTermsAccepted';
  function hideEl(id){
    var el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'none';
    el.classList.add('hidden');
  }
  function showEl(id, display){
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    el.classList.remove('waiting');
    el.style.display = display || 'flex';
  }
  function savedUser(){
    try {
      var u = JSON.parse(localStorage.getItem('cafeUser') || 'null');
      if (u && (u.name || u.phone)) return u;
    } catch (e) {}
    return null;
  }
  function termsOk(){
    try { if (localStorage.getItem(TERMS_KEY) === '1') return true; } catch (e) {}
    return !!savedUser();
  }
  function openApp(user){
    hideEl('termsScreen');
    hideEl('splashScreen');
    hideEl('registerScreen');
    showEl('app', 'block');
    if (user && typeof updateUserDisplay === 'function') {
      try { updateUserDisplay(user); } catch (e) {}
    }
  }
  function showSplashThen(next, ms){
    var splash = document.getElementById('splashScreen');
    var img = document.getElementById('splashBgImg');
    if (img && img.getAttribute('data-src') && !img.getAttribute('src')) img.src = img.getAttribute('data-src');
    if (splash) {
      splash.classList.remove('waiting', 'hidden');
      splash.style.display = 'flex';
      var bar = document.getElementById('splashLoaderBar') || splash.querySelector('.splash-loader-bar');
      if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = 'loadBar ' + (ms/1000) + 's linear forwards'; }
    }
    setTimeout(function(){
      if (splash) { splash.classList.add('hidden'); splash.style.display = 'none'; }
      next();
    }, ms);
  }
  window.acceptTermsAndContinue = function(){
    try { localStorage.setItem(TERMS_KEY, '1'); } catch (e) {}
    hideEl('termsScreen');
    if (savedUser()) {
      bootGate();
      return;
    }
    showSplashThen(function(){ hideEl('splashScreen'); bootGate(); }, 700);
  };
  function startupRequestTimeout(promise, ms, label){
    return Promise.race([promise, new Promise(function(_, reject){
      setTimeout(function(){ reject(new Error(label + ' timeout')); }, ms);
    })]);
  }
  function blockForOnlineRegistration(message){
    hideEl('splashScreen');
    hideEl('termsScreen');
    hideEl('app');
    showEl('registerScreen', 'flex');
    if (message && typeof showNotification === 'function') {
      try { showNotification(message, 'error'); } catch (e) {}
    }
  }
  async function bootGate(){
    var user = savedUser();
    var accepted = termsOk();
    hideEl('splashScreen');
    hideEl('app');

    if (!accepted) {
      hideEl('registerScreen');
      showEl('termsScreen', 'flex');
      return;
    }
    if (navigator.onLine === false) {
      blockForOnlineRegistration('برای ورود و استفاده، اتصال به سرور لازم است. پس از اتصال دوباره تلاش کنید.');
      return;
    }
    if (!window.supabaseClient || !window.supabaseClient.auth) {
      blockForOnlineRegistration('اتصال امن به سرور آماده نیست؛ ورود انجام نشد.');
      return;
    }

    try {
      var sr = await startupRequestTimeout(window.supabaseClient.auth.getSession(), 8000, 'Supabase session');
      if (!sr || sr.error) {
        blockForOnlineRegistration(user ? 'بررسی نشست آنلاین ناموفق بود؛ ورود انجام نشد.' : '');
        return;
      }
      var session = sr.data && sr.data.session;
      if (!session || !session.user || !session.user.id) {
        blockForOnlineRegistration(user ? 'نشست آنلاین معتبر پیدا نشد؛ برای ادامه دوباره ثبت‌نام کنید.' : '');
        return;
      }
      var pr = await startupRequestTimeout(window.supabaseClient.from('profiles')
        .select('id,name,phone,role,registered_at')
        .eq('id', session.user.id)
        .maybeSingle(), 8000, 'Supabase profile');
      if (!pr || pr.error) {
        blockForOnlineRegistration('تأیید حساب از سرور انجام نشد؛ اتصال را بررسی و دوباره تلاش کنید.');
        return;
      }
      if (!pr.data) {
        blockForOnlineRegistration(user ? 'حساب این نشست در سرور ثبت نشده است؛ ثبت‌نام آنلاین لازم است.' : '');
        return;
      }
      user = {
        name: pr.data.name || '',
        phone: pr.data.phone || '',
        registeredAt: pr.data.registered_at || '',
        user_id: pr.data.id,
        role: pr.data.role || 'user'
      };
      try { localStorage.setItem('cafeUser', JSON.stringify(user)); } catch (e) {}
      openApp(user);
    } catch (e) {
      console.warn('Online-only startup gate blocked access:', e);
      blockForOnlineRegistration('ارتباط با سرور برقرار نشد؛ تا زمان اتصال، برنامه وارد محیط اصلی نمی‌شود.');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootGate, true);
  else bootGate();
})();


/* ===== 09-feature-h.js ===== */
/* ===== FINAL PRODUCTION HARDENING ===== */
(function(){
  // Bind critical globals
  try {
    if (typeof addProduct === 'function') window.addProduct = addProduct;
    if (typeof deleteProduct === 'function') window.deleteProduct = deleteProduct;
    if (typeof editProduct === 'function') window.editProduct = editProduct;
    if (typeof resetProductForm === 'function') window.resetProductForm = resetProductForm;
    if (typeof renderAdminProducts === 'function') window.renderAdminProducts = renderAdminProducts;
    if (typeof renderAdminModals === 'function') window.renderAdminModals = renderAdminModals;
    if (typeof setVipLock === 'function') window.setVipLock = setVipLock;
    /* openSubOrdersPanel is provided by 18-final-production.js (server truth) */
    if (typeof acceptTermsAndContinue === 'function') window.acceptTermsAndContinue = acceptTermsAndContinue;
    if (typeof openProductDetail === 'function') window.openProductDetail = openProductDetail;
  } catch (e) {}

  // Hide cart UI remnants
  document.addEventListener('DOMContentLoaded', function(){
    var fab = document.getElementById('floatingCartBtn');
    if (fab) fab.style.display = 'none';
    var cart = document.getElementById('cartPanel');
    if (cart) cart.style.display = 'none';
  });

  // Safe openProductDetail wrapper if missing string compare
  var _opd = window.openProductDetail;
  if (typeof _opd === 'function') {
    window.openProductDetail = function(id) {
      try { return _opd(id); } catch (e) { console.warn(e); }
    };
  }
})();

        // ===== سن ازدواج V8 — فرمول اصلی: روز و ماه دو رقمی × سال شمسی =====
var selectedMarriageGender='male';
window.calculateMarriageAge = function calculateMarriageAge(){
  var d=parseInt((document.getElementById('birthDay')||{}).value,10),m=parseInt((document.getElementById('birthMonth')||{}).value,10),y=parseInt((document.getElementById('birthYear')||{}).value,10);
  if(!d||d<1||d>31||!m||m<1||m>12||!y||y<1200||y>1450){showNotification('روز ۱ تا ۳۱، ماه ۱ تا ۱۲ و سال ۱۲۰۰ تا ۱۴۵۰ وارد کنید','error');return;}
  var dm=parseInt(String(d).padStart(2,'0')+String(m).padStart(2,'0'),10), result=dm*y, digits=String(result).replace(/[^0-9]/g,'').split('').map(Number).filter(Boolean), primary=digits.length?Math.max.apply(null,digits):0;
  var box=document.getElementById('marriageAgeResult'),value=document.getElementById('marriageAgeValue'),desc=document.getElementById('marriageAgeDescription'),advice=document.getElementById('marriageAgeAdvice');
  if(value)value.textContent='عدد محاسبه: '+result;
  if(desc)desc.innerHTML='📅 تاریخ ورودی: '+String(d).padStart(2,'0')+'/'+String(m).padStart(2,'0')+'/'+y+'<br>🔢 عدد روز-ماه: '+dm+'<br>⭐ بزرگ‌ترین رقم نتیجه (شاخص اصلی): '+primary;
  if(advice)advice.innerHTML='<strong>راهنما:</strong><br>این ابزار بر اساس فرمول داده‌شده یک شاخص عددی ارائه می‌کند و به‌تنهایی پیش‌بینی قطعی درباره ازدواج نیست.';
  if(box)box.style.display='block';
  var three=document.getElementById('marriageThreeResult');if(three)three.style.display='none';
  try{if(typeof window.v8ServerFirstSave==='function')window.v8ServerFirstSave('marriage_age',{day:d,month:m,year:y,result:result,primaryIndex:primary})}catch(e){}
};


/* ===== 10-feature-i.js ===== */
/* V7_REAL_OPERATIONAL_NOTIFICATIONS */
(function(){
  async function getSessionUser(){
    if(!window.supabaseClient)return null;
    try{var r=await supabaseClient.auth.getSession();return r.data&&r.data.session&&r.data.session.user||null;}catch(e){return null;}
  }
  function escN(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function showOperationalModal(n){
    if(!n||!n.id)return;
    var old=document.getElementById('v7OperationalResultModal');if(old)old.remove();
    var approved=String(n.type||'').indexOf('status')>=0 && String(n.message||'').indexOf('رد')<0 && String(n.message||'').indexOf('تأیید نشد')<0;
    var title=String(n.type||'').indexOf('subscription')>=0?'⭐ نتیجه درخواست اشتراک':'🛒 نتیجه خرید محصول';
    var box=document.createElement('div');box.id='v7OperationalResultModal';
    box.style.cssText='position:fixed;inset:0;z-index:2147482999;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:14px;direction:rtl;';
    // بدون onclick با JSON.stringify — آن روش با کوتیشن HTML تداخل داشت و SyntaxError می‌داد
    box.innerHTML='<div style="width:min(460px,96vw);max-height:88vh;overflow:auto;background:#121820;color:#EDE8DC;border:2px solid #c9a84c;border-radius:20px;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.45)">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong style="font-size:1.08rem;color:#E8C96A">'+escN(title)+'</strong><button type="button" id="v7OpModalCloseX" style="border:0;border-radius:9px;padding:6px 10px;cursor:pointer;background:#1A2230;color:#E8C96A">✕</button></div>'+
      '<div style="margin-top:14px;padding:14px;border-radius:13px;background:'+(approved?'#1a2820':'#2a1818')+';border:1px solid '+(approved?'#C9A84C':'#C45C5C')+';color:#EDE8DC;line-height:2;white-space:pre-wrap">'+escN(n.message||'نتیجه درخواست شما ثبت شد.')+'</div>'+
      '<div style="font-size:.72rem;color:#777;margin-top:10px">شناسه پیگیری: '+escN(n.related_id||n.id)+'</div>'+
      '<button type="button" id="v7OpModalGotIt" style="width:100%;margin-top:14px;padding:12px;border:0;border-radius:12px;background:#c9a84c;color:#111;font-weight:800;cursor:pointer">متوجه شدم</button>'+
      '</div>';
    document.body.appendChild(box);
    var notifId = String(n.id);
    function closeModal(){
      var m=document.getElementById('v7OperationalResultModal');
      if(m)m.remove();
    }
    var btnX=document.getElementById('v7OpModalCloseX');
    var btnGot=document.getElementById('v7OpModalGotIt');
    if(btnX)btnX.addEventListener('click', function(){ closeModal(); });
    if(btnGot)btnGot.addEventListener('click', function(){
      closeModal();
      try{
        if(typeof window.v6MarkNotificationRead==='function') window.v6MarkNotificationRead(notifId);
      }catch(err){ console.warn('mark read', err); }
    });
  }
  async function poll(){
    var u=await getSessionUser();if(!u)return;
    try{
      var r=await supabaseClient.from('notifications').select('*').eq('user_id',u.id).order('created_at_ts',{ascending:false,nullsFirst:false}).limit(100);
      if(r.error)throw r.error;
      var rows=r.data||[];
      localStorage.setItem('cafeUserNotifications',JSON.stringify(rows));
      var unread=rows.filter(function(n){return !n.read}).length;
      var badge=document.getElementById('notifBadge');if(badge)badge.textContent=String(unread);
      var bell=badge&&badge.closest('button');
      if(bell){bell.classList.toggle('kafe-notif-unread',unread>0);bell.classList.toggle('kafe-notif-clear',unread===0);bell.setAttribute('aria-label',unread>0?'اعلان‌ها — '+unread+' اعلان خوانده‌نشده':'اعلان‌ها — همه خوانده شده');}
      if(typeof window.kafeSetNotificationState==='function')window.kafeSetNotificationState(unread);
      var shown={};try{shown=JSON.parse(localStorage.getItem('v7ShownOperationalNotifications')||'{}')}catch(e){shown={};}
      var candidate=rows.find(function(n){return !n.read && (n.type==='order_status'||n.type==='subscription_status'||n.type==='message') && !shown[String(n.id)];});
      if(candidate){shown[String(candidate.id)]=Date.now();localStorage.setItem('v7ShownOperationalNotifications',JSON.stringify(shown));showOperationalModal(candidate);}
    }catch(e){console.warn('notification poll',e);}
  }
  window.v6MarkNotificationRead=async function(id){try{if(window.supabaseClient)await supabaseClient.from('notifications').update({read:true}).eq('id',id);await poll();}catch(e){}}
  window.v6PollNotifications=poll;
  window.v7ShowOperationalNotification=showOperationalModal;
  document.addEventListener('DOMContentLoaded',function(){setTimeout(poll,1500);setInterval(poll,10000);});
})();


/* ===== 13-vip-data.js ===== */
/* * Cafe Sarketab Miad — VIP DATA
 * V8 data extraction source: kafe-miad-FINAL-ONLINE(2).html
 * This file contains editable text/data only. UI and calculation controllers should read from it.
 * Generated from existing library source; no new result text was invented.
 */
(function(){
  'use strict';

  const HAMZAD_RESULTS = {
        1: "قرین علوی قویتر است پس اسم مناسب است",
        2: "قرین علوی قویتر است و بسیار خیر می‌بیند",
        3: "قرین سفلی بسیار از قرین علوی قویتر است؛ اسم مناسب نیست و فقر می‌آورد",
        4: "مناسب است؛ قرین علوی قویتر است",
        5: "قرین سفلی قویتر است خیلی خیلی زیاد",
        6: "قرین علوی قویتر است و شخص خیر زیادی می‌بیند",
        7: "قرین علوی قویتر است و شخص خیر زیادی می‌بیند",
        8: "قرین علوی قویتر است و شخص خیر زیادی می‌بیند",
        9: "قرین سفلی زیاد قویتر از قرین علوی نیست؛ حامل این اسم همیشه مریض و بدحال خواهد بود",
        10: "قرین از جنس شیطانی است؛ اگر شخص نجنبد و مشکل را حل نکند، بدبخت خواهد شد",
        11: "اسم مناسب است",
        12: "مناسب است",
        13: "تابع قرینی دارد: أم‌الصبیان",
        14: "تابع قرینی دارد: أم‌الصبیان",
        15: "بسیار مناسب است",
        16: "قرین علوی با قرین سفلی در یک اندازه هستند",
        17: "قرین سفلی قویتر است",
        18: "مناسب است",
        19: "اسم مناسب است و برای صاحب اسم رزق بسیار می‌آورد",
        20: "قرین سفلی قویتر است خیلی خیلی زیاد",
        21: "تابع قرینی دارد: أم‌الصبیان (قرین سفلی بیش از اندازه قوی است)",
        22: "مناسب است",
        23: "اسم خوب است؛ هر دو قرین در یک اندازه‌اند اما حامل اسم از چیزی می‌ترسد که از جن به او ضرر می‌رسد",
        24: "مناسب است",
        25: "هر دو قرین در یک اندازه‌اند ولی این شخص ممکن است در تصادف یا اتفاقی بدنش توسط جن تسخیر شود",
        26: "مناسب است و خیر و رزق برایش می‌آورد",
        27: "قرین علوی بسیار قویتر است و این شخص خیر زیادی در زندگی می‌بیند",
        28: "هر دو قرین در یک اندازه‌اند ولی ممکن است در خواب/حمام/تصادف بدنش توسط جن تسخیر شود"
        };

  const DALIL_HAYRAN_RESULTS = {
                1: 'طالع بلندپایه - زندگی مرفه و ثروتمند',
                2: 'طالع متوسط - زندگی متوسط با تلاش',
                3: 'طالع کوتاه - زندگی پرچالش',
                4: 'طالع هنرمند - خلاق، مشهور',
                5: 'طالع موسیقیدان - هنرمند، تیزهوش',
                6: 'طالع شاعر - عاطفی، علاقه‌مند به شعر',
                7: 'طالع ورزشکار - قوی، ورزشکار',
                8: 'طالع تاجر - باهوش، تاجر موفق',
                9: 'طالع عابد - معنوی، صبور'
  };

  const DALIL_RANK_META = {
    1:{name:"طالع بلندپایه",desc:"قد بلند، سفیدپوست، باهوش، سخاوتمند"},
    2:{name:"طالع متوسط",desc:"قد متوسط، عاقل، صبور"},
    3:{name:"طالع کوتاه",desc:"کوتاه قد، عصبانی، بخیل"},
    4:{name:"طالع هنرمند",desc:"قدبلند، آرام"},
    5:{name:"طالع موسیقیدان",desc:"قد متوسط، تیزهوش"},
    6:{name:"طالع شاعر",desc:"کوتاه قد، عاطفی"},
    7:{name:"طالع ورزشکار",desc:"قدبلند، قوی"},
    8:{name:"طالع تاجر",desc:"قد متوسط، باهوش"},
    9:{name:"طالع عابد",desc:"کوتاه قد، صبور"}
  };

  const MOKASHEFE_16 = [
        {
        number: 1,
        name: "دار القمر - منزل العلوم",
        summary: "خبرهای خوب می‌آید. نامه یا پیام مثبت دریافت می‌کنی. غایب برمی‌گردد. کارت برکت دارد. ازدواج موفق است. بیمار بهبود می‌یابد.",
        arabicText: "الله متعال فرمود. قالوا أتعجبین من قضای الله رحمة الله و برکاته علیکم أهل البیت إنه حمید مجید. و سعد منقلب کوکبه الزهرة تدل على ورود کتاب من عند الاحباب و تدل على الاجتماع و الاتصال و تدل على قدوم الغائب. و هی علامة الافراح و تدل على الشموع الموقودة هذا الشکل یدل على الرزق الموجود و على دفع کید الحسود و على کثرة الافراح و الایام الملاة و انت ناوی على حرکة فیها برکة و ان سالت عن الغائب الذی قلبک من اجله فی متاعب و قلبه من اجلک فی لظی و وجد فانه یاتیک بکل السعد و ان شاء الله عن قریب قادم و یاتی الیک سالم و ان سالت عن الحمل فانه ذکر و لابد من بلوغ الامال و ان سالت من الزواج فانه صالح و الحج الیک ناجح و الفرح واصل و المقصود الیک حاصل و ان سالت عن المريض فان الشفاء من بعد الاسقام و نجات له من سائر الآلام و شموع عزک موقودة و الحواسد مكمودة و حاجتك مقضية و امورك مرضية.",
        mood: "روشنایی و امید"
        },
        {
        number: 2,
        name: "دار عطارد - منزل التجارة",
        summary: "خیر و برکت در انتظار توست. تفکر کن اما ترس نداشته باش. کارت موفق می‌شود. سود مالی داری. سفر مبارک است.",
        arabicText: "قال تعالى: سلام علیکم طبتم فادخلوها خالدین. یدل على الخیر والسعادة ویدل على کثرة التفکر والخوف. ان هذا الشکل سعد خارج کوکبة المشتری و هو دلیل العلم والدین والقضاء انة یدل على الامر الرشید وعلى بعد التنکید وعلى الامور الحمیدة والثورات الشدیدة.",
        mood: "ثبات و پیروزی"
        },
        {
        number: 3,
        name: "دار الزهرة - منزل المحبة",
        summary: "سلامتی و طول عمر داری. عشق و محبت در راه است. از مشکلات رها می‌شوی. تصمیم‌گیری‌هایت درست است.",
        arabicText: "قال تعالى: یا نار کونی بردا وسلاما علی ابراهیم. یدل على صحة الجسم وقوة النفس وطول الحیاة والمعیشة الحسنة ویدل على السؤال عن خطبة او عشق او مودة او اتصال وعلى رجوع ما خرج از الید وصحة المريض.",
        mood: "عشق و سلامت"
        },
        {
        number: 4,
        name: "دار الشمس - منزل السلطة",
        summary: "غم‌ها می‌رود. موفقیت در کار. پول به دست می‌آوری. روزی نزدیک است. صبر نتیجه می‌دهد.",
        arabicText: "قال تعالى: الحمد لله الذی اذهب عنا الحزن ان ربنا لغفور شکور. هذا الشکل سعد ثابت کوکبة القمر وهو دلیل النقلة والحرکات والاسفار والفتوح هذا الشکل یدل على الفرح والسرور ونجاح الامر ولا بد از قبض مال وتنصلح لک کل الاحوال.",
        mood: "قدرت و گشایش"
        },
        {
        number: 5,
        name: "دار المريخ - منزل الجهاد",
        summary: "خوشبختی همراه توست. بیمار بهبود می‌یابد. آرزوها برآورده می‌شود. شادی پایدار است.",
        arabicText: "قال تعالی: فاذا عزمت فتوکل. قیل ان کوکبة المریخ وهو دلیل الجند والسلاح والحرب هذا الشکل یدل على السعد القائم مع الخیرات ویدل على حصول المسرات ورایة الفرح لک تدوم ویدل على حیاة المريض وصحته وذهاب الامراض العارضة و رجوع الهارب.",
        mood: "اقتدار و حرکت"
        },
        {
        number: 6,
        name: "دار المشتری - منزل البركة",
        summary: "دوره‌ای سخت در پیش است. چیزی از دست می‌رود. شادی کم می‌شود. سفر نکن.",
        arabicText: "قال تعالى: والذین اذا اصابتهم مصیبة قالوا انا لله وانا الیه راجعون. یدل على کثرة الهم والغم ولا بد از خروج شئ من الید ویدل على تلف الاحوال هذا الشکل نحس خارج وهی دلیل على الارذال من الناس.",
        mood: "احتیاط"
        },
        {
        number: 7,
        name: "دار زحل - منزل الصبر",
        summary: "خطر فاش شدن راز. ترس و نگرانی. آتش و آسیب. اعتماد نکن.",
        arabicText: "قال تعلی: واصبر وما صبرک الا بالله. لا بد از کتم السر والرجوع عن هذا الامر واحذر یفشی سرک للغیر وتدل على الفزع والخوف وانت تریید اتصال امراة، ویدل على الحرق والنار ویدل على الخروج عن الطاعة وعلى ضیق الصدور.",
        mood: "هشدار"
        },
        {
        number: 8,
        name: "دار الثوابت - منزل الأمان",
        summary: "مشکلات پیچیده. خیانت و بی‌اعتمادی. کارها وارونه پیش می‌رود.",
        arabicText: "قال تعالى: ان الله مع الصابرین. وقال تعالى: وسیق الذین اتقوا ربهم الى الجنة زمرا. هذا شکل نحییس دنیوی وهو بلاء واجره علی الله وعاقبته عند الله عظیمة.",
        mood: "صبر و استقامت"
        },
        {
        number: 9,
        name: "دار الأسرار - منزل الكشف",
        summary: "موفقیت بزرگ. حل مشکلات. دیدار دوستان. درمان بیماری. سود زیاد.",
        arabicText: "یدل على صلاح بیت النفس والحیاة والاتصال وقضاء الحاجات وخدمة رجل جلیل القدر، وهو دلیل المسرات الحسنة و الحاجات مقضیة. هذا الشکل سعد خارج کوکبه الشمس وهو دلیل الملوک.",
        mood: "گشایش بزرگ"
        },
        {
        number: 10,
        name: "دار النور - منزل الهداية",
        summary: "کارها گیر دارد. نیاز به صبر. مشکلات موقتی. چشم‌زخم احتمالی.",
        arabicText: "قال تعالى: ولا تمشی فی الارض مرحا انک لن تخرق الارض ولن تبلغ الجبال طولا. یدل على صلاح المسالة بعد تعویقها الشدید والطویل وعلى ان السؤال عن حامل او مسجون او عن شئ عن العین وهو یرید ای جتماع به.",
        mood: "تأمل و انتظار"
        },
        {
        number: 11,
        name: "دار الفتح - منزل النصر",
        summary: "دیدارهای خوب. ارتباطات مثبت. بهبود بیماری. رسیدن به خواسته.",
        arabicText: "قال تعالى: وَتَرَى الْمَلَائِكَةَ حَافِّينَ مِنْ حَوْلِ الْعَرْشِ يُسَبِّحُونَ بِحَمْدِ رَبِّهِمْ... فیها بشری باجتماع بالمطلوب ونیل المرغوب ویدل على عافیة النفس وطیب العیش وکثرة الارزاق.",
        mood: "پیروزی و موفقیت"
        },
        {
        number: 12,
        name: "دار الرحمة - منزل العفو",
        summary: "آرامش درونی. حل مشکلات پنهان. روزی پنهان. معنویت قوی.",
        arabicText: "قال تعالى: یستبشرون بنعمة من الله وفضل و ان الله لا یضیع اجر المؤمنین... النصرة الداخلة ما ظهر لمدیون الا قضی دینه ولا لمسجون الا فک سجنه.",
        mood: "آرامش و بخشش"
        },
        {
        number: 13,
        name: "دار الابتلاء - منزل الامتحان",
        summary: "مسیر روشن. سفر خوب. نجات از دشمن. سلامتی کامل.",
        arabicText: "قال تعالى: وما النصر الا من عند الله. نصر وخیر مقبل سریع فلا تعب فیه من الان ویدل على عافیة الجسم وطول الحیاة.",
        mood: "آزمون و موفقیت"
        },
        {
        number: 14,
        name: "دار التمام - منزل الختام",
        summary: "از دست دادن. ترس و نگرانی. شرایط مبهم.",
        arabicText: "القبض الخارج فهو شئ قد خرج وصعب رجوعه او تحصله ناری، نحس، له کوکب وهمی یسمى الراس والخوف فی جمیع الاشیاء.",
        mood: "احتیاط کامل"
        },
        {
        number: 15,
        name: "دار البدء - منزل التجديد",
        summary: "رسیدن به هدف. کمک غیبی. نتیجه خوب پس از انتظار.",
        arabicText: "قال تعالى: متکئین على رفراف خضر وعبقری حسان. تدل على بلوغ المطلوب والاجتماع بالمحبوب فعاقبته جیدة وان طال الانتظار وهو ممتزج سعد بنحس.",
        mood: "شروع تازه"
        },
        {
        number: 16,
        name: "دار الوصل - منزل اللقاء",
        summary: "دریافت پنهان. خبر خوب. روزی ناگهانی. برکت الهی.",
        arabicText: "قال تعالى: وَإِن يَمْسَسْكَ اللهُ بِضُرٍّ فَلاَ كَاشِفَ لَهُ إِلاَّ هُوَ... سعد، کوکبه الشمس والقبض الداخل لا تنساه یعطی کل سائل مناه شئ مقبل وداخل علیک خبر تسمع او رزق یاتی.",
        mood: "وصال و دیدار"
        }
        ];

  const RAML_QUESTIONS = [
        { id: 1, title: "آیا حاجت برآورده می‌شود یا خیر؟", opts: ["در یُسْت و زود برآورده می‌شود", "بعد از تنگی و سختی برآورده می‌شود", "برآورده نمی‌شود و مانع آن مرد یا شخصی است", "در یُسر و از آن خیر و گشایش حاصل می‌شود", "پس از انتظار طولانی برآورده می‌شود", "به‌سرعت برآورده می‌شود", "در سختی و پس از انتظار طولانی برآورده می‌شود", "برآورده نمی‌شود و مانع آن حسد و کینه است", "برآورده می‌شود و از آن خیر و روزی نصیب می‌شود", "پس از سختی و تلاش و رنج برآورده می‌شود", "در یسر و شادمانی برآورده می‌شود", "پس از ناامیدی و دل‌زدگی برآورده می‌شود", "برآورده نمی‌شود و مانع آن مکر و فریب است", "پس از مدت طولانی برآورده می‌شود", "در یُسر و با خیری برآورده می‌شود", "پس از شدت و زحمت برآورده می‌شود"] },
        { id: 2, title: "آیا کار انجام می‌شود یا خیر؟", opts: ["کار انجام می‌شود", "کار انجام می‌شود", "کار انجام می‌شود", "کار انجام می‌شود اما بعد از زحمت و نزدیک به عدم انجام", "کار انجام می‌شود", "کار انجام نمی‌شود", "کار انجام نمی‌شود", "در آخر خراب می‌شود", "کار انجام می‌شود", "کار انجام نمی‌شود", "کار انجام می‌شود", "کار انجام می‌شود", "کار انجام می‌شود", "کار انجام نمی‌شود", "کار انجام نمی‌شود", "کار انجام می‌شود"] },
        { id: 3, title: "عاقبت سؤال‌کننده در خواسته‌اش چیست؟", opts: ["عاقبت نیک و پسندیده", "عاقبت نیک اما همراه تلاش و رنج", "مطلوب حاصل می‌شود و به مراد می‌رسد", "عاقبت مختلط از خوبی و بدی", "عاقبت ناپسند مگر اینکه صاحب منصب باشد؛ در آن صورت خوب است", "عاقبت نیک و پسندیده", "عاقبت بد و ناپسند", "عاقبت بد و ناپسند", "عاقبت نیک و پسندیده", "عاقبت همراه رنج ولی در نهایت نیکو", "عاقبت ناپسند", "آغاز با سختی و پایان با یسر و شادمانی", "عاقبت خوب", "عاقبت خوب اما همراه زحمت و تلاش", "عاقبت خوب ولی آغازش نزاع و اختلاف دارد", "ابتدا غم و اندوه سپس خوشی و سعادت"] },
        { id: 4, title: "آیا اتصال به مطلوب حاصل می‌شود یا خیر؟", opts: ["ارتباط حاصل نمی‌شود", "ارتباط حاصل می‌شود", "ارتباط دور است", "ارتباط حاصل می‌شود", "ارتباط از راه نظر است اما اجتماع نیست", "ارتباط بعد از مدت طولانی حاصل می‌شود", "ارتباط از جانب مطلوب خواهد بود", "ارتباط حاصل نمی‌شود", "ارتباط حاصل می‌شود", "ارتباط هنگام حضور خویشاوندان یا اعضاء فامیل خواهد بود", "ارتباط دور است", "ارتباط حاصل نمی‌شود", "ارتباط کامل حاصل می‌شود", "ارتباط بعد از مدت طولانی حاصل می‌شود", "ارتباط کامل حاصل می‌شود", "ارتباط حاصل نمی‌شود"] },
        { id: 5, title: "مطلوب در چه مکانی است؟", opts: ["پیش برادران و نزدیکانش (خویشاوندان)", "پیش دوستان و عزیزانش", "در میان همسایگان یا نزدیکان ساکن", "در منزل و خانهٔ خودش", "پیش پدر و بزرگان خانواده", "در جای شاد و خوشایند", "پیش برادران و نزدیکانش", "پیش دوستان و عزیزانش", "پیش دوستان و عزیزانش", "در میان همسایگان یا نزدیکان", "در مکان شادی و فرح", "پیش دوستان و عزیزانش", "در حال بیماری یا زندان", "پیش دوستان و عزیزانش", "در منزل و محل سکونتش شناخته‌شده", "پیش پدر یا بزرگان خانواده"] },
        { id: 6, title: "آیا مطلوب به شما می‌آید یا باید دنبال آن بروید؟", opts: ["مطلوب به تو می‌آید", "مطلوب به تو می‌آید", "لازم است که تو برایش تلاش کنی", "لازم است تلاش کنی", "لازم است تلاش کنی", "مطلوب پس از زمان طولانی می‌آید", "مطلوب به تو می‌آید", "مطلوب به تو می‌آید", "مطلوب به تو می‌آید", "باید برای آن تلاش کنی", "تماس و اجتماع بین طالب و مطلوب صورت نمی‌پذیرد", "باید برای آن تلاش کنی", "مطلوب به تو می‌آید", "باید برای آن تلاش کنی", "تماس رخ نمی‌دهد و اجتماع پیش نمی‌آید", "باید برای آن تلاش کنی"] },
        { id: 7, title: "اتصال به آنچه می‌طلبید نزدیک است یا دور؟", opts: ["اتصال نزدیک است", "اتصال دور است", "اتصال صورت نمی‌پذیرد", "اتصال دور است", "اتصال نزدیک است", "اتصال نزدیک است", "اتصال نزدیک است", "یا اتصال صورت نمی‌پذیرد یا دور خواهد بود", "اتصال دور است", "اتصال دور است", "اتصال نزدیک است", "اتصال دور است", "اتصال نزدیک است", "اتصال نزدیک است", "اتصال دور است", "اتصال دور است"] },
        { id: 8, title: "آیا کرب و بلا رفع می‌شود یا خیر؟", opts: ["پس از زمان طولانی رفع می‌شود", "مصیبت طولانی می‌شود", "به‌سرعت و عاجل رفع می‌شود", "پس از هفت روز رفع می‌شود", "پس از چند روز رفع می‌شود", "پس از زمان طولانی رفع می‌شود", "به‌سرعت رفع می‌شود", "طول می‌کشد سپس رفع می‌شود", "پس از سه روز رفع می‌شود", "به‌سرعت رفع می‌شود", "پس از زمان طولانی رفع می‌شود", "طول می‌کشد سپس رفع می‌شود", "به‌سرعت رفع می‌شود", "به‌سرعت رفع می‌شود", "پس از هفت روز رفع می‌شود", "طول می‌کشد سپس رفع می‌شود"] },
        { id: 9, title: "آیا آنچه می‌آید خیر است یا شر؟", opts: ["آینده خیر است", "آینده خیر است", "آینده خیر است", "مخلوطی از خیر و شر", "مخلوطی از خیر و شر", "آینده شر است", "آینده شر است", "آینده شر است", "آینده خیر است", "مخلوطی اما گرایش به خیر", "آینده خیر است", "مخلوطی اما گرایش به شر", "آینده شر است", "آینده خیر است", "آینده خیر است", "در آن خیر و شر هست"] },
        { id: 10, title: "آیا راز محفوظ می‌ماند یا فاش می‌شود؟", opts: ["راز فاش نمی‌شود", "راز فاش و برملا می‌شود", "راز مخفی و محفوظ می‌ماند", "راز فاش می‌شود", "راز فاش می‌شود", "راز محفوظ و مخفی می‌ماند", "راز نزد افراد ناشناس فاش می‌شود", "راز فاش و آشکار می‌شود", "راز نزد کسانی که نمی‌شناسی فاش می‌شود", "دیگران از آن اطلاع پیدا می‌کنند", "راز محفوظ و مخفی می‌ماند", "راز فاش می‌شود", "راز مخفی نگه داشته می‌شود", "راز فاش و شناخته می‌شود", "راز فاش می‌شود و معلوم می‌گردد", "راز محفوظ و مخفی می‌ماند"] },
        { id: 11, title: "حرکت در روز بهتر است یا در شب؟", opts: ["حرکت در روز بهتر است", "حرکت در شب بهتر است", "در شب و روز تفاوتی نیست", "حرکت در روز بهتر است", "حرکت در روز بهتر است", "حرکت در شب بهتر است", "حرکت در شب بهتر است", "حرکت در شب بهتر است", "در شب و روز تفاوتی نیست", "حرکت در روز مناسب‌تر است", "حرکت در روز بهتر است", "حرکت در روز بهتر است", "حرکت در شب بهتر است", "حرکت در شب بهتر است", "حرکت در روز بهتر است", "حرکت در شب بهتر است"] },
        { id: 12, title: "عاقبت سفر چیست؟", opts: ["سفر همراه فرح و آسایش است", "سفر همراه رنج و زحمت است", "سفر خیر و روزی به همراه دارد", "سفر شاد و مفرح است", "سفر همراه خسارت و رنج است", "سفر همراه خیر و روزی است", "سفر سختی دارد اما با سود", "سفر همراه روزی و خیر و زحمت است", "سفر شاد و سرورآفرین است", "سفر همراه رنج و تلاش است", "سفر شاد و مفرح است", "سفر روزی دارد اما با زحمت", "سفر آسایش و روزی و خیر دارد", "سفر آسوده و شادی دارد اما خسارت مالی", "سفر روزی‌آور و پرثمر است با تلاش", "سفر آسوده و مفرح و همراه خیر و روزی است"] },
        { id: 13, title: "عاقبت تجارت چیست؟", opts: ["تجارت همراه سود و فراوانی است", "سود کم دارد", "زحمت و تلاش بیش از سود است", "تجارت خسارت دارد", "سود و روزی نصیب می‌شود", "سود کمتر از سرمایه اولیه دارد", "خسارت و زحمت دارد", "زحمت با سود اندک", "رزق و سود دارد", "خسارت همراه رنج", "سود و روزی دارد", "سود فراوان دارد", "زحمت و تلاش با سود کم", "سود کم با تلاش زیاد", "سود و روزی فراوان", "سود و روزی در پی دارد"] },
        { id: 14, title: "عاقبت خرید چیست؟", opts: ["خرید همراه نحسی است", "خوش‌یُمنی در خرید", "خوش‌یُمنی در خرید", "نحسی در خرید", "نحسی در خرید", "خیر در خرید", "خیر در خرید", "باید قرعه را در زمان دیگر تکرار کرد", "نحسی در خرید", "نحسی در خرید", "خیر در خرید", "خیر در خرید", "خیر در خرید", "خیر در خرید", "خیر در خرید", "نحسی در خرید"] },
        { id: 15, title: "عاقبت فروش چیست؟", opts: ["فروش با سود و منفعت است", "بین سود و ضرر در نوسان است", "فروشنده در ضرر است", "فروش همراه سود است", "سودی که تکرار نمی‌شود", "خرابی و ضرر", "فروش با سود و منفعت", "نه ضرر دارد نه منفعت", "خسارت در فروش", "فروش با سود و منفعت", "فروش با سود و منفعت", "نه منفعت نه زیان", "فروش بهتر است", "خسارت دارد؛ بهتر صبر شود", "فروش سودآور است", "فروش مفید و سودآور است"] },
        { id: 16, title: "عاقبت دوستی چیست؟", opts: ["دوستی با مهر و احترام و فداکاری و اتحاد", "دوستی همراه خنده، تمسخر، جدایی و اختلاف", "دوستی با نجابت، صدق، بخشش و آرامش قلب", "ابتدا شادمانی و سپس نزاع و اختلاف", "دوستی پایدار و در ارتباط و موافق", "دوستی همراه حسد، غیبت و بدخواهی", "دوستی همراه خیر، خوشی و انس", "شادی و انس ولی سپس جدایی", "نجابت، بخشش، خیر و روزی", "محبت و مهربانی همراه انس و شادی", "انس، بخشش، روزی، صدق و برادری", "بخشنده ولی ناپاسخ", "شادی و اخذ و اهداء", "دوستی همراه مکر، حیله و نزاع", "دوستی خوب با انس و صدق ولی گاهی نزاع", "دوستی با عشق، فداکاری و خیر"] },
        { id: 17, title: "آیا شخص به وعده خود عمل می‌کند یا خیر؟", opts: ["وعده را اجرا می‌کند", "پس از مدت طولانی وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را وفا نمی‌کند", "پس از اختلاف و وعید وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "نیت او نقض عهد است", "وعده را اجرا می‌کند", "پس از تأخیر و بهانه وعده را اجرا می‌کند", "وعده را اجرا می‌کند", "نقض عهد می‌کند", "نقض عهد می‌کند", "وعده را به‌طور کامل اجرا می‌کند"] },
        { id: 18, title: "آیا مدیون بدهی خود را می‌پردازد یا خیر؟", opts: ["مدیون بدهی خود را می‌پردازد", "پس از تأخیر و طول انتظار آن را می‌پردازد", "مدیون پرداخت می‌کند", "پس از وعده و تأخیر پرداخت می‌شود", "مدیون بدهی را بازپس نمی‌دهد", "مدیون بازنمی‌پردازد", "طلبکار دِین خود را پس می‌گیرد", "مدیون بدهی خود را می‌پردازد", "طلبکار دِین را پس می‌گیرد", "مدیون بدهی را می‌پردازد", "مدیون از دین انکار می‌کند", "مدیون دین را بازنمی‌گرداند", "پس از تأخیر و وعید دین پرداخت می‌شود", "طلبکار دِین را پس می‌گیرد", "مدیون بدهی را می‌پردازد", "مدیون دین را بازنمی‌گرداند"] },
        { id: 19, title: "آیا دین ادا می‌شود یا خیر؟", opts: ["دین سریعاً ادا می‌شود", "دین قسطی و پراکنده ادا می‌شود", "دین فقط پس از زمان طولانی و رنج ادا می‌شود", "دین با سختی ادا می‌شود و نزدیک است ادا نشود", "دین پیش از موعد ادا می‌شود", "دین با سختی و پراکنده ادا می‌شود", "طلبکار جای دیگری را نشان می‌دهد", "دین ناقص ادا می‌شود", "پرداخت دین با تأخیر انجام می‌شود", "بخشی نقد و بخشی به‌صورت چیز دیگری ادا می‌شود", "پس از صلح دین ادا می‌شود", "دین با تأخیر ادا می‌شود", "دین ناقص ادا می‌شود", "دین با تأخیر ادا می‌شود", "دین با سختی ادا می‌شود و نزدیک است ادا نشود", "دین سریعاً ادا می‌شود"] },
        { id: 20, title: "آیا امانت بازگردانده می‌شود یا خیر؟", opts: ["اگر خدا بخواهد بازمی‌گردد", "امانت بازنمی‌گردد", "پس از تذکر و وعید بازمی‌گردد", "امانت بازگردانده می‌شود", "امانت فاسد می‌شود", "پس از تأخیر و سختی بازمی‌گردد", "امانت بازمی‌گردد", "امانت بازمی‌گردد", "امانت بازمی‌گردد", "پس از زمان طولانی بازمی‌گردد", "امانت بازمی‌گردد", "امانت بازنمی‌گردد", "امانت بازمی‌گردد", "امانت فاسد می‌شود", "امانت بازنمی‌گردد", "امانت بازمی‌گردد"] },
        { id: 21, title: "آیا خبر صحیح است یا دروغ؟", opts: ["خبر حقیقت و صادق است", "آنچه شنیدی درست نیست", "مخلوطی از صدق و کذب", "غیرصحیح و دروغ است", "خبر حق و صادق است", "خبر حق و صادق است", "در آن صدق و کذب هست", "باطل و دروغ", "خبر حق و صادق است", "در آن صدق و کذب هست", "خبر حقیقت دارد", "خبر حقیقت دارد", "باطل و دروغ", "باطل و دروغ", "در آن صدق و کذب هست", "در آن صدق و کذب هست"] },
        { id: 22, title: "مدت زمان چقدر است؟", opts: ["یک روز", "سه روز", "پنج روز", "هفت روز", "یک جمعه (هفته)", "دو جمعه (دو هفته)", "سه جمعه (سه هفته)", "چهار جمعه (چهار هفته)", "سه ماه", "پنج ماه", "هفت ماه", "ده ماه", "یک سال", "دو سال", "سه سال", "چهار سال"] },
        { id: 23, title: "عاقبت ازدواج چیست؟", opts: ["اتفاق و خیر و پیوند", "اختلاف و تنگی و ناراحتی", "مخلوطی از روزهای موافق و مخالف", "شاد و ساکن، آرامش و هم‌نشینی", "راحتی و کمی سختی", "نحسی و جدایی", "اتفاق با اندکی اختلاف", "اتفاق و خوشی و آرامش", "اختلاف و جدایی", "خوشی و آرامش ولی گاهی دوری در بستر", "آرامش، خیر و توافق", "نزاع و جدایی و دوری در بستر", "خوشی و آرامش و محبّت", "آغاز خوش و پایان با سختی", "آرامش و خوشی و سعادت", "فراق و وصال متناوب"] }
        ] .concat([
        { id: 24, title: "آیا مطلّقه به همسر خود بازمی‌گردد یا خیر؟", opts: ["برنمی‌گردد و طرف تمایل ندارد", "بازمی‌گردد", "پس از مدت طولانی بازمی‌گردد", "تمایل دارد و بازمی‌گردد", "تمایل دارد ولی بازنمی‌گردد", "تمایل دارد ولی بازنمی‌گردد", "او تمایل دارد ولی برگردانده نمی‌شود", "بازمی‌گردد", "بازمی‌گردد و پذیرفته می‌شود", "نه تمایل دارد نه بازمی‌گردد", "بازمی‌گردد", "تمایل دارد اما پذیرفته نمی‌شود", "تمایل دارد ولی بازنمی‌گردد", "بازمی‌گردد", "بازمی‌گردد", "تمایل دارد اما بازگردانده نمی‌شود"] },
        { id: 25, title: "آیا فرزندی حاصل می‌شود یا خیر؟", opts: ["فرزندی حاصل نمی‌شود", "رزق فرزند خواهد شد", "رزق فرزند نصیب می‌شود", "پس از انتظار طولانی فرزند حاصل می‌شود", "رزق فرزند خواهد شد", "رزق فرزند خواهد شد", "خطر عقیم بودن هست", "پس از انتظار طولانی صاحب فرزند می‌شود", "رزق فرزند خواهد شد", "رزق فرزند خواهد شد", "پس از انتظار طولانی صاحب فرزند می‌شود", "پس از انتظار طولانی و نگرانی از عقیم بودن", "رزق فرزند خواهد شد", "رزق فرزند خواهد شد", "رزق فرزند پس از انتظار طولانی", "پس از انتظار طولانی صاحب فرزند می‌شود؛ اگر بیش از 9 سال گذرد نگرانی از عقیم بودن"] },
        { id: 26, title: "آیا زن حامله است یا خیر؟", opts: ["حامل نیست", "حامل است", "حامل نیست", "حامل است", "حامل نیست", "حامل نیست", "حامل نیست", "حامل است", "حامل است", "حامل است", "حامل است", "حامل نیست", "حامل نیست", "حامل نیست", "حامل است", "حامل است"] },
        { id: 27, title: "آیا حاملگی تثبیت می‌شود یا خیر؟", opts: ["حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود", "حاملگی تثبیت می‌شود", "خطر سقط وجود دارد", "حاملگی تثبیت می‌شود"] },
        { id: 28, title: "تعداد فرزند در شکم مادر چقدر است؟", opts: ["تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "دو قلو", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "تک‌نوزاد", "دو قلو"] },
        { id: 29, title: "جنسیت نوزاد چیست؟", opts: ["نوزاد پسر", "نوزاد پسر", "نوزاد دختر", "نوزاد پسر", "نوزاد دختر", "نوزاد دختر", "نوزاد دختر", "نوزاد دختر", "نوزاد دختر", "نوزاد پسر", "نوزاد پسر", "نوزاد دختر", "نوزاد پسر", "نوزاد پسر", "نوزاد دختر", "نوزاد دختر"] },
        { id: 30, title: "در چه روزی زن زایمان می‌کند؟", opts: ["دوشنبه", "سه‌شنبه", "پنج‌شنبه", "جمعه", "چهارشنبه", "دوشنبه", "شنبه", "یک‌شنبه", "یک‌شنبه", "شنبه", "پنج‌شنبه", "چهارشنبه", "شنبه", "جمعه", "سه‌شنبه", "شنبه"] },
        { id: 31, title: "وضعیت غایب چیست؟", opts: ["در خوبی و سلامت", "در خوبی و سلامت", "دل‌مشغولی، افکار پریشان، کمی بی‌پولی", "ممکن است فوت کرده باشد", "در خوبی و سلامت", "در خوبی و سلامت", "در تنگنا و درد", "ممکن است فوت کرده باشد", "ممکن است فوت کرده باشد", "در درد و عذاب", "احتمالاً محبوس است", "در خوبی و سلامت", "محبوس در جهت شرق", "در خوبی و سلامت", "محبوس است", "در خوبی و سلامت"] },
        { id: 32, title: "آیا غایب بازمی‌گردد یا خیر؟", opts: ["به‌زودی بازمی‌گردد", "پس از هفت روز؛ اگر نشد پس از هفت ماه؛ اگر باز نشد پس از هفت سال", "به‌زودی بازمی‌گردد", "بازنمی‌گردد", "پس از سه روز یا هفت روز بازمی‌گردد", "پس از چند روز بازمی‌گردد", "پس از یک یا چند روز بازمی‌گردد", "بازنمی‌گردد", "بازنمی‌گردد", "پس از هفت روز یا در صورت تأخیر پس از یک ماه بازمی‌گردد", "پس از یک روز بازمی‌گردد", "پس از چهار روز یا اگر تأخیر شود پس یک هفته و اگر بازهم تأخیر کند پس دو هفته", "پس از سه روز بازمی‌گردد", "پس از چند روز بازمی‌گردد", "پس از هفت روز بازمی‌گردد", "پس از سه روز یا پس از سه هفته بازمی‌گردد"] },
        { id: 33, title: "وضعیت فراری یا هارب چیست؟", opts: ["در شهر گیج و سرگردان است", "در شهر به اختیار خود خارج شده", "با خوشی و میل در کنار دیگران است", "معذور و در غم و اندوه است", "با کسی که پیش او رفت‌وآمد داشته", "محبوس است و نمی‌تواند خارج شود", "محبوس و قادر به بازگشت نیست", "آزاد و نمی‌خواهد بازگردد", "گیج و سرگردان است", "در مکر و فریب است", "با کسی که میل دارد است", "در پشیمانی و آرزوی بازگشت ولی ناتوان", "در تنگی و حبس", "آزاد و نمی‌خواهد بازگردد", "با کسی که میل دارد است", "در اندوه و پشیمانی"] },
        { id: 34, title: "آیا فراری بازمی‌گردد یا خیر؟", opts: ["به‌سرعت پیدا می‌شود", "به‌راحتی یا بازمی‌گردد سریع", "پس از مدت طولانی پیدا می‌شود", "پس از مدت طولانی پیدا می‌شود", "به‌راحتی یا بازمی‌گردد سریع", "پس از چند روز بازمی‌گردد و بیش از هفت روز نمی‌شود", "به‌راحتی مکانش را نشان می‌دهد", "پس از چند روز بازمی‌گردد", "به‌راحتی مکانش معلوم می‌شود", "پس از چند روز پیدا می‌شود", "برنمی‌گردد؛ قرعه را دوباره تکرار کن", "پس از چند روز بازمی‌گردد", "بازنمی‌گردد", "در همان روز یا شب یا پس از سه روز بازمی‌گردد", "پس از چند روز بازمی‌گردد", "بین یک تا سه روز پیدا می‌شود"] },
        { id: 35, title: "آیا بیمار شفا می‌یابد یا خیر؟", opts: ["پس از مدت طولانی بهبود می‌یابد", "خیر؛ بیمار از دنیا می‌رود", "بیمار به‌سرعت بهبود می‌یابد", "خیر؛ بیمار درگذرد", "بیمار پس از چند روز بهبود می‌یابد", "بیمار پس از مدت طولانی بهبود می‌یابد", "بهبود پس از ماه‌ها یا یک سال", "بهبود پس از شدت بیماری", "شفا می‌یابد", "شفا نمی‌یابد", "پس از شدت بهبود می‌یابد", "پس از چند روز بهبود می‌یابد", "پس از درمان طولانی بهبود می‌یابد", "شفا نمی‌یابد", "پس از چند روز بهبود می‌یابد", "پس از درمان طولانی بهبود می‌یابد"] },
        { id: 36, title: "آیا متهم بی‌گناه است یا خیر؟", opts: ["متهم بی‌گناه است", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم بی‌گناه است", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود", "متهم به جرم محکوم می‌شود"] },
        { id: 37, title: "عاقبت مخاصمه چیست؟", opts: ["خصم از سؤال‌کننده قوی‌تر است", "خصم بر سؤال‌کننده غلبه می‌کند", "دو طرف در قوت برابرند", "سؤال‌کننده خصم را مغلوب می‌کند", "سؤال‌کننده خصم را مغلوب می‌کند", "سؤال‌کننده پیروز می‌شود", "خصم بر سؤال‌کننده غلبه می‌کند", "سؤال‌کننده بر خصم پیروز می‌شود", "سؤال‌کننده از خصم قوی‌تر است", "سؤال‌کننده از خصم قوی‌تر است", "خصم از سؤال‌کننده قوی‌تر است", "خصم از سؤال‌کننده قوی‌تر است", "دو طرف در قوت برابرند", "خصم از سؤال‌کننده قوی‌تر است", "سؤال‌کننده بر خصم غالب می‌شود", "دو طرف برابرند"] },
        { id: 38, title: "حکم قاضی درباره سؤال‌کننده چیست؟", opts: ["سؤال‌کننده مغلوب خواهد شد", "سؤال‌کننده غالب است و عاقبتش خوب است", "سؤال‌کننده غالب و پیروز می‌شود", "سؤال‌کننده مغلوب می‌شود", "سؤال‌کننده مغلوب می‌شود", "سؤال‌کننده پیروز و منتصر می‌شود", "سؤال‌کننده غالب است", "سؤال‌کننده غالب است", "سؤال‌کننده مغلوب است", "سؤال‌کننده مغلوب است", "سؤال‌کننده غالب است", "سؤال‌کننده نتیجهٔ نیک خواهد داشت", "سؤال‌کننده نتیجهٔ نیک خواهد داشت", "سؤال‌کننده پیروز و ظافر می‌شود", "عاقبت سؤال‌کننده نیکو خواهد بود", "سؤال‌کننده مغلوب می‌شود"] },
        { id: 39, title: "آیا مال مسروقه بازمی‌گردد یا خیر؟", opts: ["مسروقه بازنمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه ناقص بازمی‌گردد", "مسروقه پاره یا بریدگی‌خورده بازمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه فاسد بازمی‌گردد", "مسروقه بازنمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازمی‌گردد", "مسروقه بازنمی‌گردد"] },
        { id: 40, title: "وضعیت و صفت دزد چیست؟", opts: ["دزد از نزدیکان یا افرادی است که پناه می‌دهد", "دزد از اهل خانه یا خویشاوندان نزدیک است", "دزد از فرزندان عم یا خویشان نسبی", "دزد از برادران یا خواهران است", "دزد از فرزندان خاله یا خاله‌زاده‌ها", "دزد غریبه و دور است", "دزد از اهل خانه یا کسی که زیاد رفت‌وآمد دارد", "دزد غریبه و دور", "دزد از اهل خانه یا خویشاوند است", "دزد از اهل خانه یا خویشاوند است", "دزد خود سؤال‌کننده است", "دزد از دوستان یا همسایگان سؤال‌کننده است", "دزد غریبهٔ دور", "دزد از دوستان یا همسایگان سؤال‌کننده است", "دزد غریبه و دور", "دزد کسی است که زیاد به محل مسروقه سر می‌زند"] },
        { id: 41, title: "آیا دزد بین متهمان است یا خیر؟", opts: ["دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد بین متهمان است", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است", "دزد بین متهمان است", "دزد در میان متهمان نیست", "دزد بین متهمان است"] },
        { id: 42, title: "راهنمای بیرون کشیدن دزد از میان متهمان", opts: ["در جهت شمال", "در جهت شمال", "در جهت راست (راست بودن)", "در جهت راست", "در جهت راست", "در جهت راست", "در جهت شمال", "در جهت شمال", "در جهت راست", "در جهت شمال", "در جهت راست", "در جهت راست", "در جهت شمال", "در جهت شمال", "در جهت راست", "در جهت شمال"] },
        { id: 43, title: "آیا زندانی آزاد می‌شود یا خیر؟", opts: ["به‌زودی آزاد می‌شود", "در زندان فوت می‌کند", "پس از زمان طولانی آزاد می‌شود", "پس از زمان طولانی آزاد می‌شود", "پس از یک سال و اگر بیشتر شد پس هفت سال", "به‌سرعت آزاد می‌شود", "پس از زمان طولانی آزاد می‌شود", "به‌سرعت آزاد می‌شود", "به‌زودی آزاد می‌شود", "پس از چند روز یا اگر بیشتر شد پس یک ماه آزاد می‌شود", "پس از چند سال آزاد می‌شود", "پس از یک ماه آزاد می‌شود", "به‌زودی آزاد می‌شود", "پس از یک ماه آزاد می‌شود", "مدت حبس طولانی می‌شود", "به‌سرعت آزاد می‌شود"] },
        { id: 44, title: "آیا شخص به مقام یا سلطنت می‌رسد یا خیر؟", opts: ["به آنچه می‌خواهد و مقصودش می‌رسد", "به مقام یا چیزی کمتر از آن می‌رسد", "به حکومت و منصب می‌رسد", "نمی‌رسد و حاصل نمی‌شود", "نمی‌رسد", "خسارت و بازگشت و بی‌فایده", "نمی‌رسد", "نمی‌رسد ولی چیزی کمتر از آن می‌یابد", "نمی‌رسد", "ممکن است سلطان یا چیزی مشابه شود", "به خواسته‌ها و عنوان موردنظر می‌رسد", "نمی‌رسد", "نمی‌رسد", "نمی‌رسد", "نمی‌رسد", "به حکومت و منصب می‌رسد"] },
        { id: 45, title: "وضعیت حکم و رفتار سلطان و حاکم چیست؟", opts: ["با خود مشغول است و به حکم و رعیت نمی‌پردازد", "عزت دارد و نفوذ دارد؛ ممکن است ولیعهدی پیدا کند", "جبّار و ستمگر، فتنه و جنگ زیاد", "نشان‌دهنده فساد مملکت و ضعف اطاعت", "حکمش ظلم و جور است", "وظایف را می‌شناسد و به‌جا می‌آورد", "عادل و محبوب", "سیر و کارش ستوده و عادل است", "ضعیف و بیمار و تمایل به ظلم", "بسیاُر در سفر و حرکت است، به عدالت فرمان می‌دهد", "ملک و ثروت به دست می‌آورد و بر دشمنان چیره می‌شود", "عادل و محبوب", "ثروتمند و دارای یاران و مورد استقبال رعیّت", "ضعیف و ترسو، ممکن است شورش شود", "عادل و صالح و محبوب", "حکمش ظالمانه است و طول نمی‌کشد"] },
        { id: 46, title: "آیا جنگ رخ می‌دهد یا خیر؟", opts: ["جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "نشانهٔ خشونت هست و جنگ ممکن است", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ می‌دهد", "جنگ رخ می‌دهد", "جنگ رخ می‌دهد و نظامی وارد می‌شود", "جنگ رخ می‌دهد و بلا وارد می‌شود", "جنگ رخ می‌دهد", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ نخواهد داد", "جنگ رخ می‌دهد", "جنگ رخ می‌دهد"] }
        ]);

  const ABJAD_KABIR = {'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,'ی':10,'ک':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000};
  const HEJAI_LETTERS = {'ا':1,'ب':2,'ت':3,'ث':4,'ج':5,'ح':6,'خ':7,'د':8,'ذ':9,'ر':10,'ز':11,'س':12,'ش':13,'ص':14,'ض':15,'ط':16,'ظ':17,'ع':18,'غ':19,'ف':20,'ق':21,'ک':22,'ل':23,'م':24,'ن':25,'ه':26,'و':27,'ی':28};

  function normalizeText(t){return String(t||'').replace(/[أإآ]/g,'ا').replace(/[يئى]/g,'ی').replace(/ة/g,'ه').replace(/ك/g,'ک').replace(/[\u200c\s]+/g,'').trim();}
  function uniqueLetters(t){const n=normalizeText(t),seen=new Set(),a=[];for(const c of n){if(ABJAD_KABIR[c]&&!seen.has(c)){seen.add(c);a.push(c);}}return a;}
  function digitValue(v){let n=Math.abs(Number(v)||0),s=0;for(const c of String(n)){if(/[0-9]/.test(c))s+=Number(c);}return s;}
  function jalaliToGregorian(jy,jm,jd){jy+=1595;let days=-355668+365*jy+Math.floor(jy/33)*8+Math.floor((jy%33+3)/4)+jd;if(jm<7)days+=(jm-1)*31;else days+=(jm-7)*30+186;let gy=400*Math.floor(days/146097);days%=146097;if(days>36524){gy+=100*Math.floor(--days/36524);days%=36524;if(days>=365)days++;}gy+=4*Math.floor(days/1461);days%=1461;if(days>365){gy+=Math.floor((days-1)/365);days=(days-1)%365;}let gd=days+1,md=[0,31,(gy%4===0&&gy%100!==0||gy%400===0)?29:28,31,30,31,30,31,31,30,31,30,31],gm=1;for(;gm<=12;gm++){if(gd<=md[gm])break;gd-=md[gm];}return[gy,gm,gd];}
  function dateLetters(year,month,day,calendar){let gy,gm,gd;if(calendar==='jalali'){[gy,gm,gd]=jalaliToGregorian(year,month,day);}else{gy=year;gm=month;gd=day;}const vals=[gy,gm,gd],map={1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط',10:'ی',20:'ک',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص',100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ',1000:'غ'},out=[];for(let n of vals){for(const v of [1000,900,800,700,600,500,400,300,200,100,90,80,70,60,50,40,30,20,10,9,8,7,6,5,4,3,2,1])while(n>=v){out.push(map[v]);n-=v;}}return out;}
  function calculateHamzadJafr(name,mother,year,month,day,calendar){const all=[...uniqueLetters(name),...uniqueLetters(mother),...dateLetters(year,month,day,calendar)],u=[...new Set(all)];let total=0;for(const l of u){const v=ABJAD_KABIR[l]||0;total+=digitValue(v);}let r=total%28;return r===0?28:r;}
  function calculateDalil(name,mother,type,day){let total=0;total+=normalizeText(name).split('').reduce((a,c)=>a+(HEJAI_LETTERS[c]||0),0);total+=normalizeText(mother).split('').reduce((a,c)=>a+(HEJAI_LETTERS[c]||0),0);if(type==='child'&&day)total+=normalizeText(day).split('').reduce((a,c)=>a+(HEJAI_LETTERS[c]||0),0);let r=total%9;return r===0?9:r;}

  window.CAFE_V8_VIP_DATA={version:'22.6.1',hamzadResults:HAMZAD_RESULTS,dalilHayranResults:DALIL_HAYRAN_RESULTS,dalilRankMeta:DALIL_RANK_META,mokashefe16:MOKASHEFE_16,ramlQuestions:RAML_QUESTIONS,helpers:{normalizeText,uniqueLetters,calculateHamzadJafr,calculateDalil}};
  window.HAMZAD_RESULTS=HAMZAD_RESULTS;
  window.DALIL_HAYRAN_RESULTS=DALIL_HAYRAN_RESULTS;
  window.MOKASHEFE_16=MOKASHEFE_16;
  // seed کوتاه VIP نباید جایگزین داده کامل runtime شود
  if (!window.__MOKASHEFE_16 || !(window.__MOKASHEFE_16[0] && (window.__MOKASHEFE_16[0].persianText || window.__MOKASHEFE_16[0].conclusion))) {
    /* keep __MOKASHEFE_16 empty so getMokashefeData uses defaultMokashefeData */
  }
  window.RAML_QUESTIONS=RAML_QUESTIONS;
  try {
    if (!window.__MOKASHEFE_16 && Array.isArray(MOKASHEFE_16)) window.__MOKASHEFE_16 = MOKASHEFE_16.slice();
    if (!window.__RAML_QUESTIONS && Array.isArray(RAML_QUESTIONS)) window.__RAML_QUESTIONS = RAML_QUESTIONS.slice();
    window.__VIP_HAMZAD_SEED = HAMZAD_RESULTS;
  } catch (e) {}
})();




/* ===== 14-messaging.js ===== */
(function(){
'use strict';
var sb=function(){return window.supabaseClient||window.v12Supabase||null};
var currentConversationId=null;
function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function fmt(v){try{return v?new Date(v).toLocaleString('fa-IR'):'';}catch(e){return String(v||'');}}
async function session(){var c=sb();if(!c)return null;try{var r=await c.auth.getSession();return r.data&&r.data.session||null;}catch(e){return null;}}
async function profileFor(uid){var c=sb();if(!c||!uid)return null;try{var r=await c.from('profiles').select('name,phone').eq('id',uid).maybeSingle();return r.data||null;}catch(e){return null;}}
function setStatus(t,err){var x=document.getElementById('v18MessageStatus');if(x){x.textContent=t;x.style.color=err?'#a00020':'';}}
async function loadUserMessages(){
 var c=sb(),list=document.getElementById('v18UserConversationList');if(!list)return;
 var ses=await session();if(!ses){setStatus('برای ارسال و مشاهده پیام‌ها باید وارد حساب کاربری باشید.',true);list.innerHTML='<div class="settings-empty">ابتدا وارد حساب شوید.</div>';return;}
 setStatus('پیام‌ها و پاسخ‌ها از سرور دریافت می‌شوند.','');
 try{
  var r=await c.from('conversations').select('id,subject,status,created_at,updated_at').eq('user_id',ses.user.id).order('updated_at',{ascending:false}).limit(30);
  if(r.error)throw r.error;var rows=r.data||[];
  if(!rows.length){list.innerHTML='<div class="settings-empty">هنوز گفتگویی ندارید.</div>';return;}
  list.innerHTML=rows.map(function(x){return '<div class="v18-conversation-item '+(String(x.id)===String(currentConversationId)?'active':'')+'" onclick="v18OpenUserConversation('+kafeHtmlJsArg(String(x.id))+')"><strong>'+esc(x.subject||'بدون موضوع')+'</strong><div class="muted">'+esc(x.status||'open')+' · '+esc(fmt(x.updated_at||x.created_at))+'</div></div>';}).join('');
 }catch(e){list.innerHTML='<div class="settings-empty">خطا در دریافت پیام‌ها: '+esc(e.message||e)+'</div>';}
}
async function renderUserConversation(id){
 var c=sb(),ses=await session(),list=document.getElementById('v18UserConversationList');if(!c||!ses||!id)return;
 var r=await c.from('messages').select('id,content,sender_id,is_from_admin,created_at,body,text').eq('conversation_id',id).order('created_at',{ascending:true});
 if(r.error){setStatus('خطا در دریافت گفتگو: '+r.error.message,true);return;}
 var box=document.getElementById('v18UserConversationViewer');if(!box){box=document.createElement('div');box.id='v18UserConversationViewer';box.className='v18-admin-message-list';list.parentNode.insertBefore(box,list);}
 box.innerHTML=(r.data||[]).map(function(m){var text=m.content||m.body||m.text||'';return '<div class="v18-bubble '+(m.is_from_admin?'admin':'user')+'">'+esc(text)+'<small>'+esc(m.is_from_admin?'مدیریت':'شما')+' · '+esc(fmt(m.created_at))+'</small></div>';}).join('')||'<div class="settings-empty">پیامی ثبت نشده است.</div>';
}
window.v18OpenUserConversation=async function(id){currentConversationId=id;await loadUserMessages();await renderUserConversation(id);};
window.v18SendUserMessage=async function(){
 var c=sb(),ses=await session(),subject=(document.getElementById('v18MessageSubject')||{}).value||'',body=(document.getElementById('v18MessageBody')||{}).value||'',btn=document.getElementById('v18SendMessageBtn');
 subject=subject.trim();body=body.trim();if(!c||!ses){setStatus('برای ارسال پیام وارد حساب شوید.',true);return;}if(!body){setStatus('متن پیام را وارد کنید.',true);return;}
 if(btn)btn.disabled=true;
 try{
  var cr=await c.from('conversations').insert([{user_id:ses.user.id,subject:subject||'پیام کاربر',status:'open'}]).select('id').single();if(cr.error)throw cr.error;
  var mr=await c.from('messages').insert([{conversation_id:cr.data.id,user_id:ses.user.id,sender_id:ses.user.id,content:body,body:body,text:body,is_from_admin:false,type:'other',type_name:'پیام کاربر',subject:subject||'پیام کاربر',status:'جدید'}]).select('id').single();
  if(mr.error)throw mr.error;
  document.getElementById('v18MessageSubject').value='';document.getElementById('v18MessageBody').value='';currentConversationId=cr.data.id;setStatus('✅ پیام در سرور ثبت شد.');await loadUserMessages();await renderUserConversation(currentConversationId);
 }catch(e){console.error('V18 user message',e);setStatus('❌ ثبت پیام ناموفق بود: '+(e.message||e),true);}finally{if(btn)btn.disabled=false;}
};
async function isAdmin(){var c=sb(),ses=await session();if(!c||!ses)return false;try{var r=await c.from('profiles').select('role').eq('id',ses.user.id).maybeSingle();return !!(r.data&&r.data.role==='admin');}catch(e){return false;}}
async function loadAdminConversations(){
 var c=sb(),list=document.getElementById('v18AdminConversationList');if(!list)return;if(!(await isAdmin())){list.innerHTML='<p style="color:#a00020">دسترسی مدیریت لازم است.</p>';return;}
 try{var r=await c.from('conversations').select('id,user_id,subject,status,created_at,updated_at').order('updated_at',{ascending:false}).limit(100);if(r.error)throw r.error;var rows=r.data||[];window.__v18Conversations=rows;
  list.innerHTML=rows.length?rows.map(function(x){return '<div class="v18-conversation-item '+(String(x.id)===String(currentConversationId)?'active':'')+'" style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px"><div style="flex:1;min-width:0;cursor:pointer" onclick="v18OpenAdminConversation('+kafeHtmlJsArg(String(x.id))+')"><strong>'+esc(x.subject||'بدون موضوع')+'</strong><div class="muted">کاربر: '+esc(x.user_id)+' · '+esc(x.status)+' · '+esc(fmt(x.updated_at||x.created_at))+'</div></div><button type="button" class="danger" title="حذف گفتگو" onclick="event.stopPropagation();v18DeleteAdminConversation('+kafeHtmlJsArg(String(x.id))+')" style="flex-shrink:0;padding:6px 10px;border-radius:8px;border:0;cursor:pointer;background:#a00020;color:#fff;font-size:0.75rem">🗑️ حذف</button></div>';}).join(''):'<p style="color:#666;font-size:.8rem">پیامی ثبت نشده است.</p>';
 }catch(e){list.innerHTML='<p style="color:#a00020;font-size:.8rem">خطا: '+esc(e.message||e)+'</p>';}
}

window.v18DeleteAdminMessage=async function(msgId,convId){
  try{
    if(!(await isAdmin())){showNotification('دسترسی مدیریت لازم است','error');return;}
    if(!msgId){showNotification('شناسه پیام نامعتبر','error');return;}
    if(!confirm('این پیام حذف شود؟'))return;
    var c=sb();if(!c){showNotification('اتصال سرور نیست','error');return;}
    var r=await c.from('messages').delete().eq('id',msgId);
    if(r.error)throw r.error;
    showNotification('✅ پیام حذف شد');
    if(convId) await window.v18OpenAdminConversation(convId);
  }catch(e){console.error('v18DeleteAdminMessage',e);showNotification('حذف پیام ناموفق: '+(e.message||e),'error');}
};
window.v18DeleteAdminConversation=async function(convId){
  try{
    if(!(await isAdmin())){showNotification('دسترسی مدیریت لازم است','error');return;}
    if(!convId){showNotification('شناسه گفتگو نامعتبر','error');return;}
    if(!confirm('کل این گفتگو و همه پیام‌هایش برای همیشه حذف شود؟'))return;
    var c=sb();if(!c){showNotification('اتصال سرور نیست','error');return;}
    var dm=await c.from('messages').delete().eq('conversation_id',convId);
    if(dm.error) console.warn('messages delete',dm.error);
    var dc=await c.from('conversations').delete().eq('id',convId);
    if(dc.error)throw dc.error;
    if(String(currentConversationId)===String(convId)){
      currentConversationId=null;
      var card=document.getElementById('v18AdminConversationCard');
      if(card)card.style.display='none';
      var ml=document.getElementById('v18AdminMessageList');if(ml)ml.innerHTML='';
      var hd=document.getElementById('v18AdminConversationHeader');if(hd)hd.innerHTML='';
    }
    showNotification('✅ گفتگو حذف شد');
    await loadAdminConversations();
  }catch(e){console.error('v18DeleteAdminConversation',e);showNotification('حذف گفتگو ناموفق: '+(e.message||e),'error');}
};

window.v18OpenAdminConversation=async function(id){currentConversationId=id;var c=sb();if(!c||!(await isAdmin()))return;var card=document.getElementById('v18AdminConversationCard');if(card)card.style.display='block';var header=document.getElementById('v18AdminConversationHeader'),list=document.getElementById('v18AdminMessageList');var row=(window.__v18Conversations||[]).find(function(x){return String(x.id)===String(id);});if(header)header.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div><h4 style="margin:0">💬 '+esc(row&&row.subject||'گفتگو')+'</h4><div style="font-size:.7rem;color:#666;margin-top:5px">کاربر: '+esc(row&&row.user_id||'')+' · وضعیت: '+esc(row&&row.status||'')+'</div></div><button type="button" class="danger" onclick="v18DeleteAdminConversation('+kafeHtmlJsArg(String(id))+')" style="padding:8px 12px;border-radius:8px;border:0;cursor:pointer;background:#a00020;color:#fff;font-size:0.78rem;white-space:nowrap">🗑️ حذف گفتگو</button></div>';
 var r=await c.from('messages').select('id,content,body,text,sender_id,is_from_admin,created_at').eq('conversation_id',id).order('created_at',{ascending:true});if(r.error){if(list)list.innerHTML='<p style="color:#a00020">'+esc(r.error.message)+'</p>';return;}if(list)list.innerHTML=(r.data||[]).map(function(m){var mid=m.id!=null?String(m.id):'';return '<div class="v18-bubble '+(m.is_from_admin?'admin':'user')+'" style="position:relative">'+esc(m.content||m.body||m.text||'')+'<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px"><small>'+esc(m.is_from_admin?'مدیریت':'کاربر')+' · '+esc(fmt(m.created_at))+'</small>'+(mid?'<button type="button" onclick="v18DeleteAdminMessage('+kafeHtmlJsArg(mid)+','+kafeHtmlJsArg(String(id))+')" style="padding:2px 8px;font-size:0.7rem;border-radius:6px;border:1px solid rgba(160,0,32,0.5);background:rgba(160,0,32,0.15);color:#c00;cursor:pointer">حذف پیام</button>':'')+'</div></div>';}).join('')||'<p style="color:#666">پیامی وجود ندارد.</p>';if(list)list.scrollTop=list.scrollHeight;};
window.v18SendAdminReply=async function(){var c=sb(),ses=await session(),input=document.getElementById('v18AdminReply'),text=(input&&input.value||'').trim();if(!c||!ses||!(await isAdmin())){showNotification('❌ دسترسی مدیریت ندارید','error');return;}if(!currentConversationId||!text){showNotification('متن پاسخ را وارد کنید','error');return;}try{var cr=await c.from('conversations').select('user_id,subject').eq('id',currentConversationId).single();if(cr.error)throw cr.error;var prof=await profileFor(cr.data.user_id);var mr=await c.from('messages').insert([{conversation_id:currentConversationId,sender_id:ses.user.id,content:text,body:text,text:text,is_from_admin:true,type:'other',type_name:'پاسخ مدیریت',subject:cr.data.subject||'پاسخ مدیریت',status:'پاسخ داده شد'}]).select('id').single();if(mr.error)throw mr.error;var ur=await c.from('conversations').update({updated_at:new Date().toISOString(),status:'open'}).eq('id',currentConversationId);if(ur.error)throw ur.error;await c.from('notifications').insert([{user_id:cr.data.user_id,user_phone:prof&&prof.phone||null,user_name:prof&&prof.name||null,message:'پاسخ جدید مدیریت برای شما ثبت شد.',type:'message',read:false,related_id:String(currentConversationId),action_url:null}]);input.value='';showNotification('✅ پاسخ در سرور ثبت شد');await window.v18OpenAdminConversation(currentConversationId);}catch(e){console.error('V18 admin reply',e);showNotification('❌ ثبت پاسخ ناموفق بود: '+(e.message||e),'error');}};
window.v18CloseConversation=async function(){var c=sb();if(!c||!(await isAdmin())||!currentConversationId)return;try{var r=await c.from('conversations').update({status:'closed',updated_at:new Date().toISOString()}).eq('id',currentConversationId);if(r.error)throw r.error;showNotification('🔒 گفتگو بسته شد');await window.v18OpenAdminConversation(currentConversationId);}catch(e){showNotification('❌ بستن گفتگو ناموفق بود: '+(e.message||e),'error');}};
window.v18LoadAdminMessages=loadAdminConversations;
/* switchAdminTab messages hook merged into final production wrapper */
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){loadUserMessages();loadAdminConversations();var c=sb();if(c&&c.channel){try{c.channel('v18-messages-live').on('postgres_changes',{event:'*',schema:'public',table:'conversations'},function(){loadUserMessages();loadAdminConversations();if(currentConversationId)renderUserConversation(currentConversationId);}).on('postgres_changes',{event:'*',schema:'public',table:'messages'},function(){if(currentConversationId){renderUserConversation(currentConversationId);if(document.getElementById('v18AdminConversationCard')&&document.getElementById('v18AdminConversationCard').style.display!=='none')window.v18OpenAdminConversation(currentConversationId);}}).subscribe();}catch(e){console.warn('V18 realtime',e);}}},1200);});
/* Realtime is intentionally initialized after app.js has created the Supabase client. */

})();


/* ===== 15-settings-user.js ===== */
(function(){
  async function v12GetSession(){
    try{ if(!window.supabaseClient) return null; var r=await window.supabaseClient.auth.getSession(); return r.data&&r.data.session||null; }catch(e){return null;}
  }
  window.__updateUserDisplayCore=async function(user){
    try{
      var session=await v12GetSession(); user=user||(session&&session.user);
      var profile=null;
      if(session&&window.supabaseClient){var p=await window.supabaseClient.from('profiles').select('name,phone,registered_at').eq('id',session.user.id).maybeSingle();profile=p.data||null;}
      var name=(profile&&profile.name)||user&&user.user_metadata&&user.user_metadata.name||user&&user.name||'';
      var phone=(profile&&profile.phone)||user&&user.user_metadata&&user.user_metadata.phone||user&&user.phone||'';
      var n=document.getElementById('userDisplayName'),ph=document.getElementById('userDisplayPhone'),un=document.getElementById('userName');
      if(n)n.value=name;if(ph)ph.value=phone;if(un)un.textContent=name||'کاربر';
      var uid=document.getElementById('userIdDisplay');if(uid)uid.textContent=(session&&session.user&&session.user.id)||'—';
      var reg=document.getElementById('userRegisteredAt');if(reg)reg.textContent=(profile&&profile.registered_at?new Date(profile.registered_at).toLocaleDateString('fa-IR'):(session&&session.user.created_at?new Date(session.user.created_at).toLocaleDateString('fa-IR'):'—'));
      var last=document.getElementById('userLastLogin');if(last)last.textContent=session&&session.user.last_sign_in_at?new Date(session.user.last_sign_in_at).toLocaleString('fa-IR'):'—';
      return {name:name,phone:phone};
    }catch(e){console.warn('v12 settings user',e);return user||null;}
  };
  window.updateUserPurchaseHistory=async function(){
    var subList=document.getElementById('subscriptionHistoryList'),prodList=document.getElementById('productPurchaseHistoryList');
    try{
      var session=await v12GetSession();
      if(!session||!window.supabaseClient){
        if(subList)subList.innerHTML='<div class="settings-empty">برای مشاهده سوابق وارد حساب شوید.</div>';
        if(prodList)prodList.innerHTML='<div class="settings-empty">برای مشاهده سوابق وارد حساب شوید.</div>';
        return;
      }
      var sb=window.supabaseClient,uid=session.user.id;
      var esc=function(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');};
      var fmt=function(v){if(!v)return '—';try{return new Date(v).toLocaleString('fa-IR');}catch(e){return String(v);}};
      var sr=await sb.from('subscriptions').select('id,plan,days,duration,status,date,created_at,expiry_date,active').eq('user_id',uid).order('created_at',{ascending:false}).limit(100);
      if(subList){
        if(sr.error) subList.innerHTML='<div class="settings-empty">خطا در دریافت تاریخچه اشتراک.</div>';
        else if(!sr.data||!sr.data.length) subList.innerHTML='<div class="settings-empty">هنوز اشتراکی ثبت نشده است.</div>';
        else subList.innerHTML=sr.data.map(function(x){return '<div class="settings-history-item"><div class="row"><strong>'+esc(x.plan||x.duration||'اشتراک')+'</strong><span>'+esc(x.status||((x.active)?'فعال':'ثبت شده'))+'</span></div><div class="muted">تاریخ تهیه: '+esc(fmt(x.created_at||x.date))+'</div><div class="muted">اعتبار تا: '+esc(fmt(x.expiry_date))+'</div></div>';}).join('');
      }
      var or=await sb.from('orders').select('id,productName,productPrice,status,payment_status,date,created_at,order_number,customer_name,total_amount').eq('user_id',uid).order('created_at',{ascending:false}).limit(100);
      if(prodList){
        if(or.error) prodList.innerHTML='<div class="settings-empty">خطا در دریافت تاریخچه خرید محصولات.</div>';
        else if(!or.data||!or.data.length) prodList.innerHTML='<div class="settings-empty">هنوز خرید محصولی ثبت نشده است.</div>';
        else prodList.innerHTML=or.data.map(function(x){var st=x.status||x.payment_status||'در انتظار بررسی';var price=x.total_amount||x.productPrice;return '<div class="settings-history-item"><div class="row"><strong>'+esc(x.productName||x.customer_name||'محصول')+'</strong><span>'+esc(st)+'</span></div><div class="muted">تاریخ خرید: '+esc(fmt(x.created_at||x.date))+'</div>'+(price!=null&&price!==''?'<div class="muted">مبلغ: '+esc(Number(price).toLocaleString('fa-IR'))+' تومان</div>':'')+(x.order_number?'<div class="muted">شماره خرید: '+esc(x.order_number)+'</div>':'')+'</div>';}).join('');
      }
    }catch(e){
      console.warn('v12 settings history',e);
      if(subList)subList.innerHTML='<div class="settings-empty">دریافت تاریخچه اشتراک ممکن نشد.</div>';
      if(prodList)prodList.innerHTML='<div class="settings-empty">دریافت تاریخچه خرید محصولات ممکن نشد.</div>';
    }
  };
  window.updateUserDisplay=function(u){if(typeof window.__updateUserDisplayCore==='function')return window.__updateUserDisplayCore(u);};
  window.logoutUser=async function(){
    if(!confirm('آیا از خروج اطمینان دارید؟'))return;
    try{
      if(window.supabaseClient && window.supabaseClient.auth){
        var out=await window.supabaseClient.auth.signOut({scope:'local'});
        if(out && out.error) throw out.error;
      }
      try{localStorage.removeItem('cafeUser');}catch(e){}
      var app=document.getElementById('app'),reg=document.getElementById('registerScreen');
      if(app)app.style.display='none';
      if(reg)reg.style.display='flex';
      if(typeof showNotification==='function')showNotification('👋 خروج از نشست انجام شد');
    }catch(e){
      console.error('logoutUser',e);
      if(typeof showNotification==='function')showNotification('❌ خروج از حساب انجام نشد: '+(e.message||e),'error');
    }
  };
  var oldToggle=window.toggleUserSettings;
  window.toggleUserSettings=async function(){
    var panel=document.getElementById('settingsPanel');if(!panel)return;
    var open=panel.style.display==='block'||panel.classList.contains('active');
    if(open){panel.style.display='none';panel.classList.remove('active');return;}
    panel.style.display='block';panel.classList.add('active');
    await window.updateUserDisplay();await window.updateUserPurchaseHistory();
  };
  window.setInterval(function(){if(document.getElementById('settingsPanel')?.classList.contains('active'))window.updateUserPurchaseHistory();},60000);
})();


/* ===== 16-purchase-controller.js ===== */
(function(){
  'use strict';
  function normalizePurchasePanel(){
    var p=document.getElementById('subOrdersPanel');
    if(!p)return;
    var title=p.querySelector('strong');
    if(title)title.textContent='⭐ خرید';
    var buyBtn=p.querySelector('button[onclick*="openSubscriptionPurchase"]');
    if(buyBtn)buyBtn.textContent='⭐ خرید اشتراک';
    var headings=p.querySelectorAll('div');
    headings.forEach(function(el){
      if((el.textContent||'').trim()==='📦 وضعیت و سفارش‌های محصولات')el.textContent='📦 خریدهای محصول من';
    });
  }
  window.refreshPurchasePanel=function(){
    if(typeof window.openSubOrdersPanel==='function')return window.openSubOrdersPanel();
  };
  normalizePurchasePanel();
  setTimeout(normalizePurchasePanel,300);
})();


/* ===== 17-contrast-controller.js ===== */
(function(){
  'use strict';
  function hexToRgb(hex){
    var h=String(hex||'').trim().replace('#','');
    if(h.length===3) h=h.split('').map(function(x){return x+x;}).join('');
    if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)};
  }
  function luminance(hex){
    var c=hexToRgb(hex); if(!c) return .5;
    return (.2126*c.r+.7152*c.g+.0722*c.b)/255;
  }
  function readable(preferred,bg,light,dark){
    var p=luminance(preferred), b=luminance(bg);
    var contrast=(Math.max(p,b)+.05)/(Math.min(p,b)+.05);
    if(contrast>=4.2) return preferred;
    return b<.5 ? (light||'#F5E6C8') : (dark||'#1A1A1A');
  }
  window.v12ApplyContrastVars=function(){
    try{
      var root=document.documentElement;
      var custom=(typeof getCustomCSS==='function')?getCustomCSS():{};
      var theme=document.body.className.match(/theme-([a-z]+)/);
      var dark=!!theme && /dark|blue|green|purple|rose/.test(theme[1]);
      var page=custom.page || '#F3FFFB';
      var modal=custom.modal || '#E8F9F0';
      var preferred=custom.text || '#1A1A1A';
      var heading=custom.heading || '#0E4A5C';
      var pageText=readable(preferred,page,'#F5E6C8','#1A1A1A');
      var modalText=readable(preferred,modal,'#F5E6C8','#1A1A1A');
      if(dark){ pageText=readable(preferred,page,'#F5E6C8','#1A1A1A'); modalText=readable(preferred,modal,'#F5E6C8','#1A1A1A'); }
      root.style.setProperty('--v12-page-text',pageText);
      root.style.setProperty('--v12-page-muted',pageText==='#1A1A1A'?'#4A4A4A':'#D8CCBA');
      root.style.setProperty('--v12-modal-text',modalText);
      root.style.setProperty('--v12-modal-muted',modalText==='#1A1A1A'?'#4A4A4A':'#D8CCBA');
      root.style.setProperty('--v12-heading',readable(heading,modal,'#FFD474','#0A3545'));
      root.style.setProperty('--v12-card-text',dark?'#F5E6C8':'#1A1A1A');
      root.style.setProperty('--v12-card-muted',dark?'#D8CCBA':'#4A4A4A');
    }catch(e){console.warn('V12 contrast controller',e);}
  };
  var oldTheme=window.changeTheme;
  if(typeof oldTheme==='function'){
    window.changeTheme=function(theme){
      var r=oldTheme.apply(this,arguments);
      setTimeout(window.v12ApplyContrastVars,0);
      return r;
    };
  }
  var oldCustom=window.applyCustomCSS;
  if(typeof oldCustom==='function'){
    window.applyCustomCSS=function(save){
      var r=oldCustom.apply(this,arguments);
      setTimeout(window.v12ApplyContrastVars,0);
      return r;
    };
  }
  window.v12ApplyContrastVars();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',window.v12ApplyContrastVars);
  else setTimeout(window.v12ApplyContrastVars,0);
})();


/* ===== 18-final-production.js ===== */
(function(){
  'use strict';
  function sb(){ return window.supabaseClient || null; }
  function esc(v){ return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }
  function fmt(v){ if(!v)return '—'; try{return new Date(v).toLocaleString('fa-IR');}catch(e){return String(v);} }
  async function session(){ var s=sb(); if(!s)return null; try{var r=await s.auth.getSession();return r.data&&r.data.session||null;}catch(e){return null;} }
  async function admin(){ var s=await session(); if(!s||!s.user||!sb())return null; try{var p=await sb().from('profiles').select('role').eq('id',s.user.id).maybeSingle(); if(p.error||!p.data||p.data.role!=='admin')return null; return s;}catch(e){return null;} }

  // Purchase page: server is the source of truth. localStorage is not used for displayed history/status.
  window.openSubOrdersPanel = async function(){
    var p=document.getElementById('subOrdersPanel'); if(!p)return;
    p.style.display='block';
    var st=document.getElementById('subOrdersStatusText'), list=document.getElementById('subOrdersList');
    if(st)st.innerHTML='در حال دریافت وضعیت واقعی از سرور...';
    if(list)list.innerHTML='<p style="padding:12px;text-align:center;">در حال دریافت خریدها...</p>';
    var s=await session();
    if(!s){
      if(st)st.innerHTML='❌ برای مشاهده وضعیت خریدها و اشتراک، ورود آنلاین لازم است.';
      if(list)list.innerHTML='<p style="padding:12px;">برای مشاهده سوابق، ابتدا وارد حساب شوید.</p>';
      return;
    }
    try{
      var subs=await sb().from('subscriptions').select('id,plan,days,duration,status,date,created_at,expiry_date,active').eq('user_id',s.user.id).order('created_at',{ascending:false}).limit(20);
      var active=(subs.data||[]).find(function(x){return x.active && x.expiry_date && new Date(x.expiry_date)>new Date();});
      if(st){
        if(active){
          var d=new Date(active.expiry_date),left=Math.max(0,Math.ceil((d-new Date())/86400000));
          st.innerHTML='✅ اشتراک <b>فعال</b><br>طرح: '+esc(active.plan||active.duration||'اشتراک')+'<br>انقضا: '+esc(d.toLocaleDateString('fa-IR'))+'<br>مانده: <b>'+left+'</b> روز';
        }else st.innerHTML='❌ اشتراک فعال نیست.<br>برای دسترسی به بخش‌های VIP، اشتراک تهیه کنید.';
      }
      var orders=await sb().from('orders').select('id,productName,productPrice,total_amount,status,payment_status,created_at,date,order_number,type').eq('user_id',s.user.id).order('created_at',{ascending:false}).limit(50);
      var arr=orders.data||[];
      if(list){
        if(orders.error) list.innerHTML='<p style="padding:12px;">خطا در دریافت خریدهای محصول.</p>';
        else if(!arr.length) list.innerHTML='<p style="padding:12px;background:#fff;border-radius:10px;">هنوز خرید محصولی ثبت نشده است.</p>';
        else list.innerHTML=arr.map(function(o){
          var price=o.total_amount!=null?o.total_amount:o.productPrice;
          return '<div class="settings-history-item" style="background:#fff;color:#1A1A1A;border-color:#e0d5e8;">'+
            '<div class="row"><strong>'+esc(o.productName||'محصول')+'</strong><span>'+esc(o.status||o.payment_status||'در انتظار بررسی')+'</span></div>'+
            '<div class="muted">تاریخ خرید: '+esc(fmt(o.created_at||o.date))+'</div>'+ (price!=null&&price!==''?'<div class="muted">مبلغ: '+esc(Number(price).toLocaleString('fa-IR'))+' تومان</div>':'')+
            (o.order_number?'<div class="muted">شماره خرید: '+esc(o.order_number)+'</div>':'')+'</div>';
        }).join('');
      }
    }catch(e){
      if(st)st.innerHTML='❌ دریافت وضعیت انجام نشد.';
      if(list)list.innerHTML='<p style="padding:12px;">دریافت سوابق خرید ممکن نشد.</p>';
      console.warn('v12 purchase panel',e);
    }
  };

  // Admin purchase management: server truth, full details, receipt, decision and deletion.
  function showAdminPurchaseDetail(kind,row){
    var old=document.getElementById('kafeAdminPurchaseDetail');if(old)old.remove();
    var d={};try{d=typeof row.details==='string'?JSON.parse(row.details||'{}'):(row.details||{});}catch(e){d={};}
    var esc2=window.__kafeEsc||function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
    var isSub=kind==='subscription';
    var fields=isSub?[
      ['شناسه درخواست',row.id],['شناسه کاربر',row.user_id],['نام',row.name],['شماره تماس',row.phone],['پلن',row.plan],['مبلغ',row.amount],['وضعیت',row.status],['کد مدیریت',row.admin_code],['یادداشت مدیریت',row.admin_note],['تاریخ ثبت',row.created_at]
    ]:[
      ['شناسه سفارش',row.id],['شماره سفارش',row.order_number],['شناسه کاربر',row.user_id],['نام',row.name],['شماره تماس',row.phone],['محصول',row.productName],['قیمت',row.productPrice],['مبلغ نهایی',row.total_amount],['نوع',row.type],['وضعیت',row.status],['وضعیت پرداخت',row.payment_status],['وضعیت ارسال',row.shipping_status],['تاریخ ثبت',row.created_at||row.date],
      ['نام مادر',d.motherName],['کد ملی',d.nationalId],['آدرس',d.address],['کدپستی',d.postalCode],['نام گیرنده',d.receiverName],['شماره گیرنده',d.receiverPhone],['آدرس گیرنده',d.receiverAddress],['یادداشت',d.note]
    ];
    var body=fields.map(function(f){return '<div style="display:grid;grid-template-columns:130px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid rgba(0,0,0,.08)"><b>'+esc2(f[0])+'</b><span style="word-break:break-word">'+esc2(f[1])+'</span></div>';}).join('');
    var receiptPath=isSub?row.receipt_path:row.receipt_path;
    var actions='';
    if(receiptPath)actions+='<button type="button" onclick="viewCloudReceipt('+kafeHtmlJsArg(String(receiptPath))+')">🧾 مشاهده فیش</button>';
    var done=row.status==='approved'||row.status==='rejected';
    if(!done) actions+=isSub?'<button type="button" onclick="decideCloudSubscription('+kafeHtmlJsArg(String(row.id))+',\'approved\');document.getElementById(\'kafeAdminPurchaseDetail\').remove()">✅ تأیید</button><button type="button" onclick="decideCloudSubscription('+kafeHtmlJsArg(String(row.id))+',\'rejected\');document.getElementById(\'kafeAdminPurchaseDetail\').remove()">❌ رد</button>':'<button type="button" onclick="decideCloudOrder('+kafeHtmlJsArg(String(row.id))+',\'approved\');document.getElementById(\'kafeAdminPurchaseDetail\').remove()">✅ تأیید</button><button type="button" onclick="decideCloudOrder('+kafeHtmlJsArg(String(row.id))+',\'rejected\');document.getElementById(\'kafeAdminPurchaseDetail\').remove()">❌ رد</button>';
    actions+='<button type="button" class="danger" onclick="'+(isSub?'deleteCloudSubscription':'deleteCloudOrder')+'('+kafeHtmlJsArg(String(row.id))+');document.getElementById(\'kafeAdminPurchaseDetail\').remove()">🗑️ حذف</button>';
    var w=document.createElement('div');w.id='kafeAdminPurchaseDetail';w.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:12px;direction:rtl;';
    w.innerHTML='<div style="width:min(760px,96vw);max-height:94vh;overflow:auto;background:#fff;color:#111;border:2px solid #c9a84c;border-radius:16px;padding:16px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h3 style="margin:0">'+(isSub?'⭐ جزئیات کامل درخواست اشتراک':'🛒 جزئیات کامل سفارش محصول')+'</h3><button type="button" onclick="this.closest(\'#kafeAdminPurchaseDetail\').remove()">✕</button></div><div style="margin-top:12px">'+body+'</div><div class="admin-item-actions" style="display:flex;flex-wrap:wrap;gap:7px;margin-top:14px">'+actions+'</div></div>';
    document.body.appendChild(w);
  }
  window.showAdminPurchaseDetail = showAdminPurchaseDetail;

  window.renderAdminOrders = async function(){
    var list=document.getElementById('adminOrdersList'); if(!list)return;
    var s=await admin(); if(!s){list.innerHTML='<p style="color:var(--text-secondary);font-size:.8rem">دسترسی مدیریت لازم است.</p>';return;}
    list.innerHTML='<p style="font-size:.8rem">در حال دریافت خریدها از سرور...</p>';
    var r=await sb().from('orders').select('*').order('created_at',{ascending:false}).limit(200);
    if(r.error){list.innerHTML='<p style="color:#b00020;font-size:.8rem">خطا در دریافت خریدها: '+esc(r.error.message)+'</p>';return;}
    var orders=r.data||[];
    if(!orders.length){list.innerHTML='<p style="color:var(--text-secondary);font-size:.8rem">خریدی ثبت نشده</p>';return;}
    window.__adminOrdersCache=orders;
    list.innerHTML=orders.map(function(o){
      var decided=o.status==='approved'||o.status==='rejected';
      return '<div class="admin-item" style="flex-direction:column;align-items:stretch;gap:7px"><div><strong>'+esc(o.productName||'محصول')+'</strong> — '+esc(Number(o.total_amount!=null?o.total_amount:(o.productPrice||0)).toLocaleString('fa-IR'))+' تومان</div><small style="color:#1A1A1A">'+(o.type==='call'?'📞 تماس':'🛒 آنلاین')+(o.name?' · '+esc(o.name):'')+(o.phone?' · '+esc(o.phone):'')+' · <b>'+esc(o.status||'در انتظار بررسی')+'</b> · '+esc(fmt(o.created_at||o.date))+(o.order_number?' · '+esc(o.order_number):'')+'</small><div class="admin-item-actions" style="justify-content:flex-start"><button type="button" onclick="showAdminPurchaseDetail(\'order\',window.__adminOrdersCache.find(function(x){return String(x.id)===String('+kafeHtmlJsArg(String(o.id))+')}))">📂 جزئیات کامل</button>'+(o.receipt_path?'<button type="button" onclick="viewCloudReceipt('+kafeHtmlJsArg(String(o.receipt_path))+')">🧾 فیش</button>':'')+(decided?'':'<button type="button" onclick="decideCloudOrder('+kafeHtmlJsArg(String(o.id))+',\'approved\')">✅ تأیید</button><button type="button" onclick="decideCloudOrder('+kafeHtmlJsArg(String(o.id))+',\'rejected\')">❌ رد</button>')+'<button type="button" class="danger" onclick="deleteCloudOrder('+kafeHtmlJsArg(String(o.id))+')">🗑️ حذف</button></div></div>';
    }).join('');
  };

  window.decideCloudOrder = async function(id,decision){
    var s=await admin(); if(!s){showNotification('❌ دسترسی مدیریت ندارید','error');return false;}
    try{var r=await sb().rpc('admin_decide_order',{p_order_id:id,p_decision:decision,p_note:null});if(r.error)throw r.error;if(!r.data||r.data.ok!==true||r.data.order_id!==id||r.data.status!==decision)throw new Error('پاسخ تأییدشدهٔ سرور برای این سفارش دریافت نشد');showNotification(decision==='approved'?'✅ خرید تأیید و نتیجه برای همان کاربر ثبت شد':'❌ خرید رد و نتیجه برای همان کاربر ثبت شد');await window.renderAdminOrders();return true;}catch(e){console.error('admin_decide_order',e);showNotification('❌ تصمیم خرید ثبت نشد: '+(e.message||e),'error');return false;}
  };
  window.updateOrderStatus = async function(id,status){var s=await admin();if(!s){showNotification('❌ دسترسی مدیریت ندارید','error');return;}var q=await sb().from('orders').select('id').eq('local_id',id).maybeSingle();if(q.error||!q.data)return showNotification('❌ خرید سروری با این شناسه پیدا نشد','error');return window.decideCloudOrder(q.data.id,/تایید|approved/i.test(status)?'approved':'rejected');};
  window.viewCloudReceipt = async function(path,bucket){var s=await admin();if(!s)return showNotification('❌ دسترسی مدیریت ندارید','error');try{bucket=bucket||'receipts';var r=await sb().storage.from(bucket).createSignedUrl(path,300);if(r.error||!r.data||!r.data.signedUrl)throw(r.error||new Error('receipt unavailable'));var url=r.data.signedUrl,ext=String(path||'').split('.').pop().toLowerCase(),old=document.getElementById('kafeReceiptViewer');if(old)old.remove();var w=document.createElement('div');w.id='kafeReceiptViewer';w.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:18px;direction:rtl;';var media=ext==='pdf'?'<iframe src="'+esc(url)+'" title="فیش خرید" style="display:block;width:90vw;height:86vh;border:0;border-radius:8px;background:#fff;margin-top:28px"></iframe>':'<img src="'+esc(url)+'" alt="فیش خرید" style="display:block;max-width:90vw;max-height:86vh;object-fit:contain;border-radius:8px;margin-top:28px">';w.innerHTML='<div style="position:relative;max-width:95vw;max-height:95vh;background:#111;border:1px solid #c9a84c;border-radius:14px;padding:12px;text-align:center"><button type="button" style="position:absolute;top:6px;left:6px;border:0;border-radius:8px;padding:6px 10px;background:#c9a84c;color:#111;font-weight:700" onclick="document.getElementById(\'kafeReceiptViewer\').remove()">✕</button>'+media+'</div>';document.body.appendChild(w);}catch(e){showNotification('❌ خواندن فیش ناموفق بود: '+(e.message||e),'error');}};
  window.deleteCloudOrder = async function(id){var s=await admin();if(!s){showNotification('❌ دسترسی مدیریت ندارید','error');return false;}if(!confirm('این سفارش از سرور حذف شود؟'))return false;try{var r=await sb().from('orders').delete().eq('id',id);if(r.error)throw r.error;showNotification('🗑️ سفارش از سرور حذف شد');await window.renderAdminOrders();return true;}catch(e){showNotification('❌ حذف سفارش انجام نشد: '+(e.message||e),'error');return false;}};

  window.renderAdminSubscriptions = async function(){
    var reqList=document.getElementById('adminSubscriptionRequestsList');var codeList=document.getElementById('adminSubscriptionsList');var s=await admin();if(!s){if(reqList)reqList.innerHTML='<p style="color:#b00020">دسترسی مدیریت لازم است.</p>';return;}if(reqList)reqList.innerHTML='<p style="font-size:.8rem">در حال دریافت درخواست‌ها...</p>';
    try{var r=await sb().from('subscription_requests').select('*').order('created_at',{ascending:false}).limit(100);if(r.error)throw r.error;var rows=r.data||[];window.__adminSubscriptionRequestsCache=rows;if(reqList)reqList.innerHTML=rows.length?rows.map(function(x){var done=x.status==='approved'||x.status==='rejected';return '<div class="admin-item" style="flex-direction:column;align-items:stretch;gap:7px"><div><strong>⭐ '+esc(x.plan||'اشتراک')+'</strong> — '+esc(x.plan_days||'—')+' روز</div><small style="color:#1A1A1A">'+esc(x.name||'')+' · '+esc(x.phone||'')+' · '+esc(x.status||'در انتظار بررسی')+' · '+esc(fmt(x.created_at))+'</small><div class="admin-item-actions" style="justify-content:flex-start"><button type="button" onclick="showAdminPurchaseDetail(\'subscription\',window.__adminSubscriptionRequestsCache.find(function(y){return String(y.id)===String('+kafeHtmlJsArg(String(x.id))+')}))">📂 جزئیات کامل</button>'+(x.receipt_path?'<button type="button" onclick="viewCloudReceipt('+kafeHtmlJsArg(String(x.receipt_path))+')">🧾 فیش</button>':'')+(done?'':'<button type="button" onclick="decideCloudSubscription('+kafeHtmlJsArg(String(x.id))+',\'approved\')">✅ تأیید و فعال‌سازی</button><button type="button" onclick="decideCloudSubscription('+kafeHtmlJsArg(String(x.id))+',\'rejected\')">❌ رد</button>')+'<button type="button" class="danger" onclick="deleteCloudSubscription('+kafeHtmlJsArg(String(x.id))+')">🗑️ حذف</button></div></div>';}).join(''):'<p style="font-size:.8rem;color:#555">درخواستی ثبت نشده است.</p>';}catch(e){if(reqList)reqList.innerHTML='<p style="color:#b00020;font-size:.8rem">خطا: '+esc(e.message||e)+'</p>';}
    try{var old=JSON.parse(localStorage.getItem('adminSubscriptions')||'[]');if(codeList)codeList.innerHTML=old.length?old.slice(0,50).map(function(x){return '<div class="admin-item"><span>🔑 '+esc(x.code)+' - '+esc(x.days)+' روز</span><button class="danger" onclick="deleteSubscription('+kafeHtmlJsArg(String(x.code))+')">🗑️</button></div>';}).join(''):'<p style="font-size:.8rem;color:#555">کد دستی وجود ندارد.</p>';}catch(e){if(codeList)codeList.innerHTML='<p style="font-size:.8rem;color:#555">کد دستی وجود ندارد.</p>';}
  };
  window.decideCloudSubscription = async function(id,decision){var s=await admin();if(!s){showNotification('❌ دسترسی مدیریت ندارید','error');return false;}try{var r=await sb().rpc('admin_decide_subscription',{p_request_id:id,p_decision:decision,p_note:null});if(r.error)throw r.error;if(!r.data||r.data.ok!==true||r.data.request_id!==id||r.data.status!==decision)throw new Error('پاسخ تأییدشدهٔ سرور برای این درخواست اشتراک دریافت نشد');showNotification(decision==='approved'?'✅ اشتراک تأیید، فعال و نتیجه برای همان کاربر ثبت شد':'❌ درخواست اشتراک رد شد و نتیجه برای کاربر ثبت شد');await window.renderAdminSubscriptions();return true;}catch(e){console.error('admin_decide_subscription',e);showNotification('❌ تصمیم اشتراک ثبت نشد: '+(e.message||e),'error');return false;}};
  window.deleteCloudSubscription = async function(id){var s=await admin();if(!s){showNotification('❌ دسترسی مدیریت ندارید','error');return false;}if(!confirm('این درخواست اشتراک از سرور حذف شود؟'))return false;try{var r=await sb().from('subscription_requests').delete().eq('id',id);if(r.error)throw r.error;showNotification('🗑️ درخواست اشتراک از سرور حذف شد');await window.renderAdminSubscriptions();return true;}catch(e){showNotification('❌ حذف درخواست اشتراک انجام نشد: '+(e.message||e),'error');return false;}};

  (function(){
    var prev = window.switchAdminTab;
    if (typeof prev !== 'function') return;
    window.switchAdminTab = function(tab) {
      var r = prev.apply(this, arguments);
      if (tab === 'messages') setTimeout(function(){ if (typeof loadAdminConversations === 'function') loadAdminConversations(); }, 0);
      if (tab === 'products') setTimeout(function(){ if (typeof window.renderAdminOrders === 'function') window.renderAdminOrders(); }, 0);
      if (tab === 'subscriptions') setTimeout(function(){ if (typeof window.renderAdminSubscriptions === 'function') window.renderAdminSubscriptions(); }, 0);
      return r;
    };
  })();

  // Keep settings user-facing structure limited to the approved three blocks.
  document.addEventListener('DOMContentLoaded',function(){
    var settings=document.getElementById('settingsPanel');
    if(settings){
      settings.querySelectorAll('button,input[type="color"],select').forEach(function(el){
        var t=(el.textContent||'')+' '+(el.getAttribute('aria-label')||'');
        if(/تغییر رنگ|تغییر تم|فونت|اندازه/.test(t))el.remove();
      });
    }
  });
})();


/* THEME_LOCK_OWNS_COLORS — فقط تم تیره/روشن؛ بدون CSS سفارشی ادمین */
(function(){
  function clearCustomThemeNoise(){
    try { localStorage.removeItem('cafeCustomCSS'); } catch(e){}
    var el = document.getElementById('kafeCustomCSS');
    if (el) el.remove();
    var el2 = document.getElementById('customThemeStyle');
    if (el2) el2.remove();
  }
  window.applyCustomCSS = function(){ clearCustomThemeNoise(); return false; };
  // changeTheme قدیمی را به تم روشن/تیره وصل کن
  window.changeTheme = function(theme){
    clearCustomThemeNoise();
    if (theme === 'light' || theme === 'white' || theme === 'day') {
      if (typeof setAppThemeMode === 'function') setAppThemeMode('light');
    } else {
      if (typeof setAppThemeMode === 'function') setAppThemeMode('dark');
    }
    return false;
  };
  document.addEventListener('DOMContentLoaded', clearCustomThemeNoise);
  setTimeout(clearCustomThemeNoise, 400);
})();


/* APP_THEME_MODE — تیره طلایی (پیش‌فرض) / روشن */
(function(){
  function applyMode(mode){
    mode = (mode === 'light') ? 'light' : 'dark';
    try { localStorage.setItem('kafeThemeMode', mode); } catch(e){}
    document.body.classList.toggle('theme-light', mode === 'light');
    document.documentElement.setAttribute('data-theme', mode);
    try {
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', mode === 'light' ? '#F7F3E9' : '#070B14');
    } catch(e){}
    // highlight buttons in settings
    try {
      var d = document.getElementById('themeBtnDark');
      var l = document.getElementById('themeBtnLight');
      if (d) d.style.outline = mode === 'dark' ? '2px solid #F0D878' : 'none';
      if (l) l.style.outline = mode === 'light' ? '2px solid #8B6914' : 'none';
    } catch(e){}
  }
  window.setAppThemeMode = function(mode){
    applyMode(mode);
    if (typeof showNotification === 'function') {
      showNotification(mode === 'light' ? '☀️ تم روشن فعال شد' : '🌙 تم تیره طلایی فعال شد');
    }
  };
  window.getAppThemeMode = function(){
    try { return localStorage.getItem('kafeThemeMode') || 'dark'; } catch(e){ return 'dark'; }
  };
  function boot(){
    var m = 'dark';
    try { m = localStorage.getItem('kafeThemeMode') || 'dark'; } catch(e){}
    applyMode(m);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  setTimeout(boot, 400);
})();
