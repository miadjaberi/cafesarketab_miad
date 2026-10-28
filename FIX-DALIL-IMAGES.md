# راهنمای فعال‌سازی تصاویر دلیل الحیران روی Supabase

شاخه: `fix/dalil-images-v3`

## چه کاری انجام شده؟

فایل `dalil-images-fix.js` اضافه شده. این فایل توابع مربوط به تصاویر «دلیل الحیران» را
override می‌کند تا به جای ذخیره در localStorage، به باکت `public-assets` در Supabase آپلود شوند.

## چطور فعالش کنیم؟ (فقط ۱ خط)

در فایل `index.html` بعد از این خط:

```html
<script src="./main.js"></script>
```

این خط را اضافه کنید:

```html
<script src="./dalil-images-fix.js"></script>
```

یعنی ترتیب نهایی اسکریپت‌ها این شکلی بشود:

```html
<script src="./data.js"></script>
<script src="./main.js"></script>
<script src="./dalil-images-fix.js"></script>   <!-- این خط جدید -->
<script src="./tools-extra.js"></script>
<script src="./app.js"></script>
<script src="./ui-layer-fix.js"></script>
<script src="./pwa-register.js"></script>
```

### چطور روی گوشی این کار را انجام دهید؟

1. به آدرس زیر بروید:
   https://github.com/miadjaberi/cafesarketab_miad/blob/fix/dalil-images-v3/index.html
2. روی آیکون مداد (Edit) بزنید.
3. خط `<script src="./dalil-images-fix.js"></script>` را بعد از main.js اضافه کنید.
4. Commit changes را بزنید (روی همین شاخه).

## بعد از فعال‌سازی

- به پنل ادمین → تب تصاویر دلیل الحیران بروید.
- تصویر آپلود کنید.
- باید پیام «تصویر روی سرور ذخیره شد» ببینید.
- بعد از رفرش یا روی دستگاه دیگر هم باید تصویر نمایش داده شود.

## نکات مهم

- `main.js` هیچ تغییری نکرده.
- شاخه `main` دست‌نخورده است.
- اگر آپلود موفق نبود، بررسی کنید باکت `public-assets` public باشد و RLS اجازه upload به ادمین بدهد.

---
آماده تست.