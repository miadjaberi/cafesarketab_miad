/* کافه سرکتاب میعاد — PWA حرفه‌ای
   ثبت Service Worker + دکمه نصب زیبا + مدیریت آپدیت */
(function () {
  'use strict';

  /* ---------- Manifest ---------- */
  if (!document.querySelector('link[rel="manifest"]')) {
    var link = document.createElement('link');
    link.rel = 'manifest';
    link.href = './manifest.webmanifest';
    document.head.appendChild(link);
  }

  /* ---------- بارگذاری بازخورد لمس دکمه‌ها ---------- */
  if (!document.querySelector('link[href*="button-feedback"]')) {
    var fb = document.createElement('link');
    fb.rel = 'stylesheet';
    fb.href = './button-feedback.css';
    document.head.appendChild(fb);
  }

  /* ---------- استایل دکمه نصب (هماهنگ با تم طلایی) ---------- */
  var style = document.createElement('style');
  style.textContent = `
    #kafe-install-banner {
      position: fixed;
      bottom: calc(76px + env(safe-area-inset-bottom, 0px));
      left: 12px;
      right: 12px;
      z-index: 9990;
      display: none;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: linear-gradient(145deg, rgba(13,15,26,0.97), rgba(20,18,32,0.98));
      border: 1px solid rgba(201,168,76,0.35);
      border-radius: 18px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.08);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      animation: kafeInstallIn 0.45s cubic-bezier(0.22,1,0.36,1);
      direction: rtl;
    }
    @keyframes kafeInstallIn {
      from { opacity: 0; transform: translateY(24px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    #kafe-install-banner .kafe-install-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      object-fit: contain;
      flex-shrink: 0;
      border: 1px solid rgba(201,168,76,0.4);
      box-shadow: 0 0 16px rgba(201,168,76,0.25);
      background: #0a0a12;
    }
    #kafe-install-banner .kafe-install-text {
      flex: 1;
      min-width: 0;
    }
    #kafe-install-banner .kafe-install-title {
      font-size: 0.92rem;
      font-weight: 700;
      color: #F0D878;
      margin-bottom: 2px;
      letter-spacing: 0.2px;
    }
    #kafe-install-banner .kafe-install-sub {
      font-size: 0.72rem;
      color: #C8C0B0;
      line-height: 1.4;
    }
    #kafe-install-banner .kafe-install-btn {
      flex-shrink: 0;
      padding: 10px 16px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #a8872a, #c9a84c, #e8d5a3);
      color: #0a1628;
      font-family: inherit;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(201,168,76,0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    #kafe-install-banner .kafe-install-btn:active {
      transform: scale(0.96);
    }
    #kafe-install-banner .kafe-install-close {
      position: absolute;
      top: 6px;
      left: 8px;
      width: 26px;
      height: 26px;
      border: none;
      background: transparent;
      color: rgba(200,192,176,0.55);
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }
    #kafe-install-banner .kafe-install-close:hover {
      color: #F0D878;
    }
    @media (min-width: 480px) {
      #kafe-install-banner {
        max-width: 420px;
        left: 50%;
        right: auto;
        transform: translateX(-50%);
      }
      @keyframes kafeInstallIn {
        from { opacity: 0; transform: translateX(-50%) translateY(24px) scale(0.96); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
      }
    }
  `;
  document.head.appendChild(style);

  /* ---------- ایجاد بنر نصب ---------- */
  function createInstallBanner() {
    if (document.getElementById('kafe-install-banner')) return;
    var banner = document.createElement('div');
    banner.id = 'kafe-install-banner';
    banner.innerHTML = `
      <button class="kafe-install-close" aria-label="بستن">×</button>
      <img class="kafe-install-icon" src="./icon192.png" alt="کافه میعاد" />
      <div class="kafe-install-text">
        <div class="kafe-install-title">نصب کافه سرکتاب میعاد</div>
        <div class="kafe-install-sub">روی صفحه اصلی گوشی نصب کنید تا سریع‌تر و کامل‌تر استفاده کنید</div>
      </div>
      <button class="kafe-install-btn">نصب اپ</button>
    `;
    document.body.appendChild(banner);

    // App identity icon is independent from the header logo.
    function syncInstallBannerIcon() {
      var icon = banner.querySelector('.kafe-install-icon');
      if (!icon) return;
      var src = '';
      try {
        var settings = JSON.parse(localStorage.getItem('cafeSettings') || '{}');
        src = settings.appIcon || localStorage.getItem('cafeAppIcon') || '';
      } catch (e) {}
      if (!src) src = './icon-miad.svg?v=20261014-rc19';
      if (icon.getAttribute('src') !== src) icon.src = src;
    }
    window.syncKafeInstallIcon = syncInstallBannerIcon;
    syncInstallBannerIcon();
    // Cloud settings can arrive after the banner is created; re-check briefly.
    var iconSyncCount = 0;
    var iconSyncTimer = setInterval(function () {
      syncInstallBannerIcon();
      if (++iconSyncCount >= 20) clearInterval(iconSyncTimer);
    }, 1500);

    banner.querySelector('.kafe-install-close').addEventListener('click', function () {
      banner.style.display = 'none';
      try { localStorage.setItem('kafe_install_dismissed', Date.now().toString()); } catch (e) {}
    });

    banner.querySelector('.kafe-install-btn').addEventListener('click', function () {
      if (window.__kafeDeferredPrompt) {
        window.__kafeDeferredPrompt.prompt();
        window.__kafeDeferredPrompt.userChoice.then(function (choice) {
          if (choice.outcome === 'accepted') {
            banner.style.display = 'none';
          }
          window.__kafeDeferredPrompt = null;
        });
      } else {
        showIOSInstallHint();
      }
    });
  }

  function showIOSInstallHint() {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIOS) {
      alert('برای نصب: از منوی مرورگر گزینه «Add to Home Screen» یا «نصب برنامه» را انتخاب کنید.');
      return;
    }
    alert('در آیفون:\n۱. روی دکمه Share (مربع با فلش) بزنید\n۲. گزینه «Add to Home Screen» را انتخاب کنید\n۳. روی Add بزنید');
  }

  function shouldShowBanner() {
    if (window.matchMedia('(display-mode: standalone)').matches) return false;
    if (window.navigator.standalone === true) return false;

    try {
      var dismissed = localStorage.getItem('kafe_install_dismissed');
      if (dismissed && (Date.now() - parseInt(dismissed, 10)) < 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
    } catch (e) {}
    return true;
  }

  function showBanner() {
    if (!shouldShowBanner()) return;
    createInstallBanner();
    var banner = document.getElementById('kafe-install-banner');
    if (banner) banner.style.display = 'flex';
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__kafeDeferredPrompt = e;
    setTimeout(showBanner, 2800);
  });

  setTimeout(function () {
    if (!window.__kafeDeferredPrompt && shouldShowBanner()) {
      showBanner();
    }
  }, 4500);

  /* ---------- Service Worker ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('./sw.js', { scope: './' })
        .then(function (reg) {
          if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log('✅ Service Worker ثبت شد', reg.scope);
          }
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
          reg.addEventListener('updatefound', function () {
            var nw = reg.installing;
            if (!nw) return;
            nw.addEventListener('statechange', function () {
              if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('ℹ️ نسخه جدید PWA آماده است');
              }
            });
          });
        })
        .catch(function (err) {
          console.warn('Service Worker ثبت نشد:', err);
        });
    });
  }
})();
