import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function emailFor(phone: string) { return phone + "@phone.cafemiyad.invalid"; }
async function rateKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function consumeLimit(admin: ReturnType<typeof createClient>, key: string, limit: number) {
  return admin.rpc("consume_phone_pin_rate_limit", { p_rate_key: key, p_limit: limit, p_window_seconds: 900 });
}
async function findProfile(admin: ReturnType<typeof createClient>, phone: string) {
  return admin.from("profiles").select("id,name,phone,role,registered_at").eq("phone", phone).maybeSingle();
}
async function loginExisting(auth: ReturnType<typeof createClient>, profile: Record<string, any>, phone: string, password: string) {
  const { data: signed, error } = await auth.auth.signInWithPassword({ email: emailFor(phone), password: password });
  if (error || !signed.session || !signed.user || signed.user.id !== profile.id) return null;
  return { user: { id: signed.user.id }, session: signed.session, profile };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "روش درخواست پشتیبانی نمی‌شود." });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !anonKey) return reply(500, { error: "تنظیمات امن سرور کامل نیست." });

  let body: { action?: string; name?: string; phone?: string; password?: string };
  try { body = await req.json(); } catch { return reply(400, { error: "درخواست نامعتبر است." }); }
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").replace(/\s/g, "");
  const password = String(body.password || "");
  if (body.action !== "register_or_login" || !/^09[0-9]{9}$/.test(phone) || password.length < 8 || password.length > 72) {
    return reply(400, { error: "شماره تماس یا رمز اختصاصی معتبر نیست؛ رمز باید بین ۸ تا ۷۲ نویسه باشد." });
  }
  if (!name || name.length > 100) return reply(400, { error: "نام معتبر نیست." });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const ip = forwarded.split(",")[0].trim().slice(0, 100) || "unknown";
    const [phoneKey, ipKey] = await Promise.all([rateKey("phone:" + phone), rateKey("ip:" + ip)]);
    const [phoneLimit, ipLimit] = await Promise.all([consumeLimit(admin, phoneKey, 8), consumeLimit(admin, ipKey, 30)]);
    if (phoneLimit.error || ipLimit.error) return reply(503, { error: "کنترل امنیتی سرور آماده نیست؛ بعداً دوباره تلاش کنید." });
    if (phoneLimit.data !== true || ipLimit.data !== true) return reply(429, { error: "تعداد تلاش‌ها زیاد است؛ ۱۵ دقیقه دیگر دوباره تلاش کنید." });

    const { data: existingProfile, error: lookupError } = await findProfile(admin, phone);
    if (lookupError) return reply(500, { error: "بررسی حساب در سرور ناموفق بود." });
    if (existingProfile) {
      if (existingProfile.role !== "user") return reply(403, { error: "این حساب از مسیر ورود کاربران عادی قابل استفاده نیست." });
      const result = await loginExisting(auth, existingProfile, phone, password);
      if (!result) return reply(401, { error: "این شماره قبلاً ثبت شده است؛ رمز حساب معتبر نیست یا نیاز به بازیابی امن دارد." });
      return reply(200, { created: false, ...result });
    }

    const email = emailFor(phone);
    const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
      email, password: password, email_confirm: true, user_metadata: { phone_login: true }
    });
    if (createError || !createdUser.user) {
      // A concurrent request may have inserted the profile after the initial lookup.
      const { data: racedProfile, error: racedLookupError } = await findProfile(admin, phone);
      if (racedLookupError) return reply(500, { error: "بررسی حساب پس از درخواست هم‌زمان ناموفق بود." });
      if (racedProfile) {
        if (racedProfile.role !== "user") return reply(403, { error: "این حساب از مسیر ورود کاربران عادی قابل استفاده نیست." });
        const result = await loginExisting(auth, racedProfile, phone, password);
        if (result) return reply(200, { created: false, ...result });
        return reply(401, { error: "این شماره هم‌زمان ثبت شده است؛ برای ورود، رمز حساب قبلی را وارد کنید." });
      }
      return reply(409, { error: "حساب احراز هویت از قبل وجود دارد اما پروفایل متناظر پیدا نشد؛ حساب تکراری ساخته نشد." });
    }

    const { data: profile, error: insertError } = await admin.from("profiles").insert({
      id: createdUser.user.id, name, phone, role: "user", registered_at: new Date().toISOString()
    }).select("id,name,phone,role,registered_at").single();

    if (insertError || !profile) {
      await admin.auth.admin.deleteUser(createdUser.user.id);
      if (insertError?.code === "23505" || /profiles_phone_unique|duplicate key/i.test(insertError?.message || "")) {
        const { data: racedProfile, error: racedLookupError } = await findProfile(admin, phone);
        if (racedLookupError) return reply(500, { error: "شماره تکراری تشخیص داده شد اما حساب موجود دوباره قابل خواندن نبود." });
        if (racedProfile) {
          if (racedProfile.role !== "user") return reply(403, { error: "این حساب از مسیر ورود کاربران عادی قابل استفاده نیست." });
          const result = await loginExisting(auth, racedProfile, phone, password);
          if (result) return reply(200, { created: false, ...result });
          return reply(409, { error: "این شماره قبلاً ثبت شده است؛ برای حفظ امنیت، حساب جدید ساخته نشد. با رمز حساب قبلی وارد شوید." });
        }
      }
      return reply(500, { error: "ذخیره پروفایل ناموفق بود؛ حساب موقت حذف شد." });
    }

    const { data: signed, error: signError } = await auth.auth.signInWithPassword({ email, password: password });
    if (signError || !signed.session || !signed.user || signed.user.id !== profile.id) {
      await admin.from("profiles").delete().eq("id", profile.id);
      await admin.auth.admin.deleteUser(createdUser.user.id);
      return reply(500, { error: "نشست ورود تأیید نشد؛ حساب موقت و پروفایل آن حذف شدند." });
    }
    return reply(200, { created: true, user: { id: signed.user.id }, session: signed.session, profile });
  } catch (error) {
    console.error("phone-pin-auth failed:", error instanceof Error ? error.message : "unknown");
    return reply(500, { error: "خطای داخلی سرور؛ ثبت‌نام تأیید نشد." });
  }
});
