# راهنمای تصاویر دلیل الحیران روی Supabase

شاخه: `fix/dalil-images-v3`

## چه کاری انجام شده؟

- فایل `dalil-images-fix.js` اضافه شده. این فایل توابع تصاویر «دلیل الحیران» را override می‌کند تا به جای ذخیرهٔ فقط در localStorage، تصویر را به باکت `public-assets` در Supabase آپلود کند و آدرس عمومی را در تنظیمات ادمین همگام کند.
- `index.html` نسخهٔ کامل سایت است (نه فایل موقت). فقط این خط بعد از `main.js` اضافه شده:

```html
<script src="./dalil-images-fix.js"></script>
```

ترتیب اسکریپت‌ها:

```html
<script src="./data.js"></script>
<script src="./main.js"></script>
<script src="./dalil-images-fix.js"></script>
<script src="./tools-extra.js"></script>
<script src="./app.js"></script>
<script src="./ui-layer-fix.js"></script>
<script src="./pwa-register.js"></script>
```

- `main.js` هیچ تغییری نکرده.
- شاخه `main` دست نخورده است. سایت زنده (GitHub Pages) هنوز از `main` منتشر می‌شود. برای دیدن این اصلاح روی https://miadjaberi.github.io/cafesarketab_miad/ باید این شاخه به `main` مرج شود.

## تست بعد از مرج

- پنل ادمین → تب تصاویر دلیل الحیران.
- یک تصویر آپلود کنید.
- باید پیام «تصویر روی سرور ذخیره شد» بیاید.
- بعد از رفرش، یا روی دستگاه دیگر، همان تصویر باید دیده شود.

اگر آپلود ناموفق بود: باکت `public-assets` باید public باشد و سیاست آپلود برای ادمین باز باشد.
