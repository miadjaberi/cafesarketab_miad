# سند نهایی: فقط‌آنلاین (Online-Only) — 2026-11-16

## هدف
- حذف رفتار آفلاین مبتنی بر Service Worker و کش مرورگر
- بستن پرونده SW برای همیشه
- داده از سرور؛ شِل قدیمی از کش نیاید

## ریشه مشکل قبلی
`sw.js` نسخه `kafe-miad-v22.x` فایل‌های HTML/JS/CSS را precache می‌کرد.
در نت ضعیف، مرورگر شِل قدیمی را از کش می‌آورد.

## اقدامات
1. `sw.js` → kill-switch دائم (پاک‌سازی کش + unregister + فقط شبکه)
2. `pwa-register.js` → فقط نابودی SW/کش
3. `vip-offline-cache.js` → خنثی
4. `online-only-root.js` → kafeIsOffline=false، حذف UI آفلاین، پاک کلیدهای آفلاین
5. `index.html` → حذف بنر/بخش آفلاین (در commit جدا اگر لازم)
6. `ui-layer-fix.js` → لود online-only-root

## محدودیت
Supabase ممکن است session لاگین را در storage نگه دارد. پاک‌کردن کامل هر storage = خروج با هر رفرش.

## تست گوشی
1. Clear site data
2. باز کردن سایت
3. Service Workers باید خالی باشد
