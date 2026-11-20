-- ============================================================
-- کافه سرکتاب میعاد — Security Hardening SQL
-- تاریخ: ۲۰ نوامبر ۲۰۲۶
-- بکاپ: branch backup/before-security-hardening-2026-11-20
--
-- این اسکریپت را در Supabase Dashboard → SQL Editor اجرا کنید.
-- قبل از اجرا، از داشبورد بکاپ بگیرید (Database → Backups).
-- ============================================================

-- ۱. تابع is_admin (نقش را از جدول profiles سمت سرور می‌خواند)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- دسترسی اجرا فقط برای authenticated
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ۲. فعال‌سازی RLS روی همه جداول حساس
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.modal_data ENABLE ROW LEVEL SECURITY;

-- ۳. حذف policyهای قدیمی loosely-defined (در صورت وجود) — احتیاط: اگر policy سفارشی دارید ابتدا بررسی کنید
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles','orders','messages','conversations','products',
        'app_settings','receipts','subscriptions','subscription_requests',
        'notifications','modal_data'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ۴. profiles
-- کاربر فقط ردیف خودش را ببیند و ویرایش کند (نمی‌تواند role یا id را عوض کند)
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())  -- جلوگیری از تغییر role توسط خود کاربر
  );

CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۵. orders
CREATE POLICY "orders_select_own_or_admin"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_update_own_or_admin"
  ON public.orders FOR UPDATE
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "orders_admin_delete"
  ON public.orders FOR DELETE
  USING (public.is_admin());

-- ۶. messages & conversations
CREATE POLICY "messages_select_own_or_admin"
  ON public.messages FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "messages_admin_all"
  ON public.messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "conversations_select_own_or_admin"
  ON public.conversations FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "conversations_insert_own"
  ON public.conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "conversations_admin_all"
  ON public.conversations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۷. products (خواندن عمومی، نوشتن فقط ادمین)
CREATE POLICY "products_select_all"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "products_admin_write"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۸. app_settings (فقط ادمین)
CREATE POLICY "app_settings_admin_only"
  ON public.app_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۹. receipts (فیش‌ها)
CREATE POLICY "receipts_select_own_or_admin"
  ON public.receipts FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "receipts_insert_own"
  ON public.receipts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "receipts_admin_all"
  ON public.receipts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۱۰. subscriptions & subscription_requests
CREATE POLICY "subscriptions_select_own_or_admin"
  ON public.subscriptions FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "subscriptions_admin_write"
  ON public.subscriptions FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "subscription_requests_select_own_or_admin"
  ON public.subscription_requests FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "subscription_requests_insert_own"
  ON public.subscription_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "subscription_requests_admin_all"
  ON public.subscription_requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۱۱. notifications
CREATE POLICY "notifications_select_own_or_admin"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "notifications_admin_write"
  ON public.notifications FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۱۲. modal_data (اگر داده حساس دارد فقط ادمین، وگرنه عمومی)
CREATE POLICY "modal_data_select_all"
  ON public.modal_data FOR SELECT
  USING (true);

CREATE POLICY "modal_data_admin_write"
  ON public.modal_data FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ۱۳. Storage: باکت receipts خصوصی
-- (این بخش را در Storage → Policies هم چک کنید)
-- فرض: باکت 'receipts' وجود دارد و public نیست.

-- Policy برای storage.objects (باکت receipts)
DROP POLICY IF EXISTS "receipts_select_own_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "receipts_insert_own" ON storage.objects;
DROP POLICY IF EXISTS "receipts_admin_all" ON storage.objects;

CREATE POLICY "receipts_select_own_or_admin"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'receipts'
    AND (
      public.is_admin()
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "receipts_insert_own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "receipts_admin_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'receipts' AND public.is_admin())
  WITH CHECK (bucket_id = 'receipts' AND public.is_admin());

-- ۱۴. باکت public-assets فقط خواندنی عمومی (لوگو و تصاویر عمومی)
-- اگر باکت دیگری دارید مشابه اضافه کنید.

-- ۱۵. اطمینان از اینکه کاربر نمی‌تواند role را تغییر دهد (trigger اضافی)
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Changing role is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- پایان. بعد از اجرا:
-- - خروجی pg_policies را چک کنید: SELECT * FROM pg_policies WHERE schemaname = 'public';
-- - تست ۱۰ دقیقه‌ای را انجام دهید (با کلید anon و بدون لاگین).
-- - توکن ربات تلگرام فقط در Secrets باشد.
-- - Edge Function admin-telegram-otp را از نظر hash کد، ۵ دقیقه اعتبار، یک‌بارمصرف و قفل بعد از ۵ تلاش اشتباه بررسی کنید.
