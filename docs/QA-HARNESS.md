# QA Harness v3

## شاخه
`fix/qa-harness-2026-11-07`  
آخرین Commit ابزار: `cf2ce519b8aee299d5132f5ee51fab94d53a55cd`

## فعال‌سازی
- URL: `?qa=1` (با trim)
- نشست موقت: `sessionStorage.kafeQA=1` (بعد از تأیید مدیر)
- **localStorage.kafeQA حذف می‌شود** تا برای کاربر عادی نماند

## مجوز
- UI gate: `profiles.role === 'admin'` از سرور
- مرز امنیتی قطعی نیست؛ ابزار **هیچ نوشتنی** روی DB ندارد

## آفلاین
- ورود مدیر فقط آنلاین (OTP تلگرام)
- بدون نشست معتبر مدیر در آفلاین: پیام «برای ورود مدیر و اجرای آزمون مدیریتی، اتصال اینترنت لازم است»
- اگر نشست از قبل باشد و role تأیید شود: تست‌های فقط‌خواندنی ممکن است

## Preview (نه main Pages)
1. https://raw.githack.com/miadjaberi/cafesarketab_miad/fix/qa-harness-2026-11-07/index.html?qa=1
2. https://cdn.jsdelivr.net/gh/miadjaberi/cafesarketab_miad@fix/qa-harness-2026-11-07/index.html?qa=1

## ناوبری در گزارش
صریحاً: `scrollToPage("pageTools")` مستقیم — **نه** کلیک واقعی دکمه.
