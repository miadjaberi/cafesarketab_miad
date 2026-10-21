import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://miadjaberi.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function emailFor(phone: string) {
  return phone + "@phone.cafemiyad.invalid";
}

async function rateKey(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function consumeLimit(admin: ReturnType<typeof createClient>, key: string, limit: number) {
  return admin.rpc("consume_phone_pin_rate_limit", {
    p_rate_key: key,
    p_limit: limit,
    p_window_seconds: 900
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply(405, { error: "روش درخواست پشتیبانی نمی‌شود." });

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !anonKey) return reply(500, { error: "تنظیمات امن سرور کامل نیست." });

  let body: { action?: string; name?: string; phone?: string; pin?: string };
  try { body = await req.json(); } catch { return reply(400, { error: "درخواست نامعتبر است." }); }
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").replace(/\s/g, "");
  const pin = String(body.pin || "");
  if (body.action !== "register_or_login" || !/^09[0-9]{9}$/.test(phone) || !/^\d{8,12}$/.test(pin)) {
    return reply(400, { error: "شماره تماس یا رمز ورود معتبر نیست؛ رمز باید ۸ تا ۱۲ رقم باشد." });
  }
  if (!name || name.length > 100) return reply(400, { error: "نام معتبر نیست." });

  // Service-role credentials remain server-side. Limit by phone and gateway IP.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const ip = forwarded.split(",")[0].trim().slice(0, 100) || "unknown";
    const [phoneKey, ipKey] = await Promise.all([
      rateKey("phone:" + phone),
      rateKey("ip:" + ip)
    ]);
    const [phoneLimit, ipLimit] = await Promise.all([
      consumeLimit(admin, phoneKey, 8),
      consumeLimit(admin, ipKey, 30)
    ]);
    if (phoneLimit.error || ipLimit.error) {
      return reply(503, { error: "کنترل امنیتی سرور آماده نیست؛ بعداً دوباره تلاش کنید." });
    }
    if (phoneLimit.data !== true || ipLimit.data !== true) {
      return reply(429, { error: "تعداد تلاش‌ها زیاد است؛ ۱۵ دقیقه دیگر دوباره تلاش کنید." });
    }

    const { data: existingProfile, error: lookupError } = await admin
      .from("profiles").select("id,name,phone,role,registered_at").eq("phone", phone).maybeSingle();
    if (lookupError) return reply(500, { error: "بررسی حساب در سرور ناموفق بود." });

    const email = emailFor(phone);

    if (existingProfile) {
      // Never claim anonymous/legacy accounts using name and phone alone.
      const { data: signed, error: signError } = await auth.auth.signInWithPassword({ email, password: pin });
      if (signError || !signed.session || !signed.user || signed.user.id !== existingProfile.id) {
        return reply(401, { error: "این شماره قبلاً ثبت شده است؛ رمز حساب معتبر نیست. بازیابی امن حساب لازم است." });
      }
      const { data: profile, error: profileError } = await admin.from("profiles")
        .select("id,name,phone,role,registered_at").eq("id", signed.user.id).maybeSingle();
      if (profileError || !profile) return reply(500, { error: "پروفایل از سرور تأیید نشد." });
      return reply(200, { created: false, user: { id: signed.user.id }, session: signed.session, profile });
    }

    const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
      email, password: pin, email_confirm: true, user_metadata: { phone_login: true }
    });
    if (createError || !createdUser.user) {
      return reply(400, { error: "ساخت حساب در سرویس احراز هویت ناموفق بود." });
    }

    const { data: profile, error: insertError } = await admin.from("profiles").insert({
      id: createdUser.user.id, name, phone, role: "user", registered_at: new Date().toISOString()
    }).select("id,name,phone,role,registered_at").single();

    if (insertError || !profile) {
      await admin.auth.admin.deleteUser(createdUser.user.id);
      return reply(500, { error: "ذخیره پروفایل ناموفق بود؛ ساخت حساب لغو شد." });
    }

    const { data: signed, error: signError } = await auth.auth.signInWithPassword({ email, password: pin });
    if (signError || !signed.session || !signed.user) {
      await admin.auth.admin.deleteUser(createdUser.user.id);
      return reply(500, { error: "حساب ساخته شد اما نشست ورود تأیید نشد؛ عملیات لغو شد." });
    }
    return reply(200, { created: true, user: { id: signed.user.id }, session: signed.session, profile });
  } catch (_) {
    return reply(500, { error: "خطای داخلی سرور؛ ثبت‌نام تأیید نشد." });
  }
});
