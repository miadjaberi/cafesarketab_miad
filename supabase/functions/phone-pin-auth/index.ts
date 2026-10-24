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
  // This lookup is only used to detect whether registration is already taken.
  // Legacy duplicate rows must not turn a normal lookup into a 500.
  return admin.from("profiles").select("id,name,phone,role,registered_at").eq("phone", phone).limit(1).maybeSingle();
}
async function findProfileById(admin: ReturnType<typeof createClient>, id: string) {
  return admin.from("profiles").select("id,name,phone,role,registered_at").eq("id", id).maybeSingle();
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
  const action = String(body.action || "");
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").replace(/\s/g, "");
  const pin = String(body.pin || "");
  if (!["register", "login"].includes(action) || !/^09[0-9]{9}$/.test(phone) || !/^\d{8,12}$/.test(pin)) {
    return reply(400, { error: "شماره تماس یا PIN معتبر نیست؛ PIN باید ۸ تا ۱۲ رقم باشد." });
  }
  if (action === "register" && (!name || name.length > 100)) return reply(400, { error: "نام معتبر نیست." });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const auth = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const forwarded = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const ip = forwarded.split(",")[0].trim().slice(0, 100) || "unknown";
    const [phoneKey, ipKey] = await Promise.all([rateKey("phone:" + phone), rateKey("ip:" + ip)]);
    const [phoneLimit, ipLimit] = await Promise.all([consumeLimit(admin, phoneKey, 8), consumeLimit(admin, ipKey, 30)]);
    if (phoneLimit.error || ipLimit.error) return reply(503, { error: "کنترل امنیتی سرور آماده نیست؛ بعداً دوباره تلاش کنید." });
    if (phoneLimit.data !== true || ipLimit.data !== true) return reply(429, { error: "تعداد تلاش‌ها زیاد است؛ ۱۵ دقیقه دیگر دوباره تلاش کنید." });

    if (action === "login") {
      // Authenticate against Supabase Auth first. Looking up by phone can be ambiguous
      // because legacy test data contains duplicate profiles for the same phone.
      const { data: signed, error: signInError } = await auth.auth.signInWithPassword({
        email: emailFor(phone),
        password: pin
      });
      if (signInError || !signed.session || !signed.user) {
        return reply(401, { error: "PIN اشتباه است یا برای این شماره حسابی پیدا نشد." });
      }

      // Bind the authenticated identity to its own profile; never pick an arbitrary
      // duplicate row by phone, and never allow a non-user role through this flow.
      const { data: profile, error: profileError } = await findProfileById(admin, signed.user.id);
      if (profileError) return reply(500, { error: "بررسی پروفایل حساب ناموفق بود." });
      if (!profile || profile.phone !== phone || profile.role !== "user") {
        return reply(401, { error: "ورود به این حساب مجاز نیست؛ اطلاعات حساب با شماره تطبیق ندارد." });
      }
      return reply(200, { created: false, user: { id: signed.user.id }, session: signed.session, profile });
    }

    const { data: existingProfile, error: lookupError } = await findProfile(admin, phone);
    if (lookupError) return reply(500, { error: "بررسی حساب در سرور ناموفق بود." });
    if (existingProfile) {
      // مهاجرت فقط با نشست معتبر همان حساب ناشناس انجام می‌شود؛ نام/شماره به‌تنهایی اثبات مالکیت نیست.
      const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\\s+/i, "").trim();
      if (bearer) {
        const { data: oldAuth, error: oldAuthError } = await auth.auth.getUser(bearer);
        const oldUser = oldAuth && oldAuth.user;
        if (!oldAuthError && oldUser && oldUser.is_anonymous === true && oldUser.id === existingProfile.id &&
            existingProfile.phone === phone && ["user", "admin"].includes(String(existingProfile.role || ""))) {
          const email = emailFor(phone);
          const { data: migratedUser, error: migrateError } = await admin.auth.admin.updateUserById(oldUser.id, {
            email,
            password: pin,
            email_confirm: true,
            user_metadata: { ...(oldUser.user_metadata || {}), phone_login: true, name: name || existingProfile.name || "", phone }
          });
          if (migrateError || !migratedUser.user) {
            return reply(409, { error: "مهاجرت حساب قدیمی انجام نشد؛ حساب قبلی حفظ شده است. ممکن است شماره/ایمیل ورود از قبل رزرو شده باشد." });
          }
          const profilePatch: Record<string, unknown> = { phone };
          if (name) profilePatch.name = name;
          const { data: migratedProfile, error: profileUpdateError } = await admin.from("profiles")
            .update(profilePatch).eq("id", oldUser.id)
            .select("id,name,phone,role,registered_at").single();
          if (profileUpdateError || !migratedProfile) {
            return reply(500, { error: "ورود به حساب به‌روزرسانی شد اما پروفایل تأیید نشد؛ حساب حذف نشده است." });
          }
          const { data: migratedSignIn, error: migratedSignInError } = await auth.auth.signInWithPassword({ email, password: pin });
          if (migratedSignInError || !migratedSignIn.session || !migratedSignIn.user || migratedSignIn.user.id !== oldUser.id) {
            return reply(500, { error: "حساب قدیمی حفظ شد اما ساخت نشست پس از مهاجرت ناموفق بود." });
          }
          return reply(200, { created: false, migrated: true, user: { id: oldUser.id }, session: migratedSignIn.session, profile: migratedProfile });
        }
      }
      return reply(409, { error: "این شماره قبلاً ثبت شده است. برای مهاجرت امن، نشست حساب قدیمی باید روی همین دستگاه موجود باشد؛ نام و شماره به‌تنهایی کافی نیست." });
    }

    const email = emailFor(phone);
    const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password: pin,
      email_confirm: true,
      user_metadata: { phone_login: true, name, phone }
    });
    if (createError || !createdUser.user) {
      const { data: racedProfile, error: racedLookupError } = await findProfile(admin, phone);
      if (racedLookupError) return reply(500, { error: "بررسی حساب پس از درخواست هم‌زمان ناموفق بود." });
      if (racedProfile) return reply(409, { error: "این شماره قبلاً ثبت شده است؛ با شماره و PIN وارد شوید." });
      return reply(409, { error: "حساب احراز هویت از قبل وجود دارد اما پروفایل متناظر پیدا نشد؛ حساب تکراری ساخته نشد." });
    }

    // A database trigger may have created the profile already. Reuse/update that same row;
    // never delete users or profiles as a cleanup side effect.
    const { data: profileById, error: profileByIdError } = await findProfileById(admin, createdUser.user.id);
    if (profileByIdError) return reply(500, { error: "بررسی پروفایل تازه‌ساخته‌شده ناموفق بود." });

    let profile: Record<string, any> | null = null;
    if (profileById) {
      const { data: updated, error: updateError } = await admin.from("profiles")
        .update({ name, phone, role: "user", registered_at: profileById.registered_at || new Date().toISOString() })
        .eq("id", createdUser.user.id)
        .select("id,name,phone,role,registered_at")
        .single();
      if (updateError || !updated) return reply(500, { error: "حساب ساخته شد اما تکمیل پروفایل ناموفق بود؛ برای جلوگیری از حذف داده‌ها، حساب حفظ شد." });
      profile = updated;
    } else {
      const { data: inserted, error: insertError } = await admin.from("profiles").insert({
        id: createdUser.user.id, name, phone, role: "user", registered_at: new Date().toISOString()
      }).select("id,name,phone,role,registered_at").single();
      if (insertError || !inserted) return reply(500, { error: "حساب احراز هویت ساخته شد اما ذخیره پروفایل ناموفق بود؛ هیچ داده‌ای حذف نشد." });
      profile = inserted;
    }

    const { data: signed, error: signError } = await auth.auth.signInWithPassword({ email, password: pin });
    if (signError || !signed.session || !signed.user || signed.user.id !== profile.id) {
      return reply(500, { error: "حساب ثبت شد اما ایجاد نشست ورود ناموفق بود؛ دوباره تلاش کنید." });
    }
    return reply(200, { created: true, user: { id: signed.user.id }, session: signed.session, profile });
  } catch (error) {
    console.error("phone-pin-auth failed:", error instanceof Error ? error.message : "unknown");
    return reply(500, { error: "خطای داخلی سرور؛ درخواست تأیید نشد." });
  }
});
