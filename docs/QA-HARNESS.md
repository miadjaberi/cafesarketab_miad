# QA Harness v4

## شاخه
`fix/qa-harness-2026-11-07`  
آخرین Commit ابزار: نسخه v4 پس از اصلاح چرخه ورود و حالت آفلاین

## فعال‌سازی
- URL: `?qa=1` (با trim)
- نشست موقت: `sessionStorage.kafeQA=1` (پس از تأیید آنلاین نقش مدیر)
- پس از رویداد ورود واقعی `SIGNED_IN`، نقش مدیر دوباره از سرور بررسی می‌شود؛ ورود OTP دست‌نخورده می‌ماند.
- پیام عدم دسترسی غیرمسدودکننده است و صفحه ورود را نمی‌پوشاند.
- **localStorage.kafeQA حذف می‌شود** تا برای کاربر عادی نماند

## مجوز
- UI gate: `profiles.role === 'admin'` از سرور
- مرز امنیتی قطعی نیست؛ ابزار **هیچ نوشتنی** روی DB ندارد

## آفلاین
- ورود مدیر فقط آنلاین (OTP تلگرام)
- بدون نشست معتبر مدیر در آفلاین: پیام «برای ورود مدیر و اجرای آزمون مدیریتی، اتصال اینترنت لازم است»
- آفلاین فقط در همان تب و همان نشستِ قبلاً تأییدشده با role=admin مجاز است؛ بدون تأیید قبلی، پنل باز نمی‌شود.

## Preview (نه main Pages)
1. https://raw.githack.com/miadjaberi/cafesarketab_miad/fix/qa-harness-2026-11-07/index.html?qa=1
2. https://cdn.jsdelivr.net/gh/miadjaberi/cafesarketab_miad@fix/qa-harness-2026-11-07/index.html?qa=1

## ناوبری در گزارش
صریحاً: `scrollToPage("pageTools")` مستقیم — **نه** کلیک واقعی دکمه.
