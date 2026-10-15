# Kafe Miad — Safety Checkpoint (2026-10-15)

## Preservation rules
- Production `main` / GitHub Pages must remain untouched until review and smoke tests are complete.
- All fixes stay on `online-only-hardening` and PR #3; do not merge automatically.
- Do not delete profiles, Auth users, orders, subscriptions, receipts, or local user data as part of this work.
- Preserve the user's spouse account (`meisa` / previously also written `miesa`) and its related order history.
- Do not change Supabase schema, RLS policies, or Edge Functions without a specific verified cause and a rollback plan.
- Keep UI appearance, colors, motion, icons, and layout unchanged unless a separate design task is explicitly approved.

## Current known Git checkpoint
- Base branch: `main`
- Base commit at comparison time: `27fca3d71e3d7a2dddc3c92c753b9579d2dd1456`
- Working branch: `online-only-hardening`
- Branch is ahead of `main`; use the live GitHub comparison for the exact count because each checkpoint update adds a commit.
- PR: #3 — Online-only hardening: server-confirmed account, orders, products and settings.
- Last confirmed branch file identifiers before this note:
  - `main.js`: `5738aba5fc0a4a81cde5ca1976d4ca18520c204f` (file blob)
  - `index.html`: `206393bb1586819d628ea5e05a214cdd5e087f32` (file blob)
  - `registration-recovery.js`: `fb71429b8477939967a7416ce8d08a92e99f1f06` (file blob)
  - `sw.js`: `e4369ac0eed915aab9fce05332f6aee76d3b3a30` (file blob)
- Earlier change commits:
  - `registration-recovery.js`: `1c89df6be4bde09238bd3230d2e443cf3a274c1a`
  - `index.html`: `6a01d96cc31fd7e82c70f1ef99efe3a3ccb7245f`
  - `sw.js`: `af9c2980627c7fd49fecec93978f5ee856bff5cb`
- This note is a branch-only checkpoint. It does not change the live app or backend.

## Current audit observations (not yet a final diagnosis)
1. Branch HTML now loads app assets from the same branch instead of using the old remote HTML loader.
2. Service-worker navigation is network-first and falls back to cached HTML only on network failure. Static assets remain cache-first.
3. Registration code rejects server/profile errors instead of treating them as local-only success. Phone-only profile lookup is not used to grant ownership.
4. Admin OTP frontend and deployed `admin-telegram-otp` v3 use the same `request` / `verify` action contract and `challengeId` field.
5. Supabase function-edge logs contain successful HTTP 200 OTP requests and HTTP 401 verification responses on 2026-10-14. The 401 response body in the deployed function means the supplied code was incorrect or expired; logs alone do not prove whether the user mistyped the code or the browser reused an old challenge.
6. The frontend preserves a pending OTP challenge in `sessionStorage` after failed verification so the user can retry while the challenge remains valid. Browser-side expiry now uses the function's `expiresIn` and drops the challenge 15 seconds before its server TTL to avoid retrying at the expiry boundary.
7. Fixed on this branch: the receipt wrapper now awaits the original async order flow, uses the newly inserted local order ID (which only appears after the Supabase insert succeeds), prevents double submission, and attaches the local receipt only to that exact order. It no longer assumes `cafeOrders[0]` is the order just submitted.
9. `admin-entry-guard.js` also replaces local-only dashboard totals for products, subscriptions and users with server counts, after validating the live session and `profiles.role=admin`. A read-only database check at this checkpoint returned 6 products, 72 profiles, and 0 subscription requests. These counts are a snapshot, not a guarantee they remain unchanged.
10. The subscription request path now checks the returned server row's ID, owner UID, and `pending` status before telling the user it succeeded.
11. Static syntax compilation passed for all checked JavaScript files (`main.js`, `sw.js`, `registration-recovery.js`, `offline-sync.js`, `ops-center.js`, `session-recovery.js`, `pwa-register.js`, and `admin-entry-guard.js`). Cross-file checks confirmed the guard is loaded and precached, and the service-worker cache version is `kafe-miad-v700.7-online-2`.
12. No real-device browser test has been performed by the assistant. Static code inspection and log inspection must not be described as a mobile end-to-end test.

## Next work order
1. Inspect the complete local asset list and verify the full shell is consistent with the current service-worker version.
2. Re-audit server-backed user-list/dashboard paths and the subscription admin decision flow.
3. Review the order submission wrapper and remote receipt path for edge cases; this fix has static validation only.
4. Inspect final PR diff and update its verification notes.
5. The user must test the branch build on the phone for registration, user entry, admin OTP, and control-panel access. The assistant has not performed that device test.
6. Do not merge PR #3 or publish any changes until the user has tested the branch build and explicitly approved release.


## Continued audit — 2026-10-15 morning
- Rechecked deployed public-schema definitions using read-only queries only. Both admin_decide_order(p_order_id uuid, p_decision text, p_note text) and admin_decide_subscription(p_request_id uuid, p_decision text, p_note text) exist as SECURITY DEFINER functions with search_path constrained to public, pg_temp and an is_admin() check. The subscription function rejects already-decided requests and creates an active subscription plus a user notification on approval; it also records a rejection and notification when rejected.
- Reviewed current RLS policies for orders, subscription_requests, subscriptions, notifications, and profiles. Expected owner/admin access policies exist. Some tables have overlapping/duplicate policies (notably orders and subscription requests); these were not altered because there is no demonstrated cause requiring a risky live policy change.
- Strengthened sbAdd() on this branch: it now returns an insert result only when Supabase returns exactly one row with an id. This prevents callers from treating an empty/missing returned row as confirmed persistence. Static main.js syntax check passed after the change.
- Found two HTML shell assets missing from the service-worker precache list: button-feedback.css and assets/splash.jpg. Added both to precache and bumped the shell cache to kafe-miad-v700.7-online-3; the HTML guard script query now uses admin-entry-guard.js?v=20261015-online-3.
- Cross-file audit now confirms every local JS/CSS/image/manifest reference in index.html is represented in the service-worker's quoted asset paths. Static syntax checks passed for main.js, sw.js, admin-entry-guard.js, registration-recovery.js, offline-sync.js, ops-center.js, session-recovery.js, and pwa-register.js.
- Current checked file blobs: main.js 2d76d26893591503026c9f1ae842e16c5daff173; sw.js 9aca15eee2ec6c52c1ff214921cb7f1c91fbadf4; index.html 1f3da211bda96a784aa3a422f5d2c7ef8e2a3cd0.
- These are static/source/database-definition checks only. No real-device end-to-end test was performed, and no user/order/subscription/receipt data or RLS/schema definitions were changed. Keep PR #3 unmerged until the branch is tested on the user's phone.


## Registration/login root-cause finding — 2026-10-15
- The current registration-recovery handler does not authenticate users by phone. If no Supabase session exists, it creates an anonymous Supabase Auth session, then creates a profiles row bound to that new auth UID.
- Read-only database inspection confirms public.profiles has a unique partial index on phone for non-empty values (profiles_phone_unique). A fresh browser/device creates a different anonymous UID; attempting to register the same phone then collides with that uniqueness rule, while the current flow has no verified recovery mechanism to prove ownership of the existing account. This is a concrete architectural reason a returning user can fail to enter after browser/session loss or when switching devices. The current database also reports 70 anonymous auth users out of 73 total; counts are a snapshot only.
- Do not “fix” this by looking up a profile by phone and granting access based only on name/phone, disabling the unique index, or changing RLS. Those would risk account takeover or data corruption. A durable cross-device fix requires a verified identity/recovery step (for example, a properly configured phone OTP or another already-supported verified credential) and a server-side flow that links the verified identity to the existing profile without changing its UID or related order history. Provider/configuration availability has not yet been verified.
- This is a diagnosis, not a completed login fix. No account, profile, order, subscription, or database policy was changed. Keep the production branch untouched until a safe verified recovery route is confirmed and tested.

## Continued security review — 2026-10-15 (follow-up)
- Latest branch comparison: `online-only-hardening` is 41 commits ahead of `main`, 0 behind. Latest checked `main.js` blob: `a3135e55131edd15026687d0619b9256d0b2c403`. The admin decision handlers now require the RPC JSON response to explicitly match `ok=true`, the exact requested row ID, and the requested decision before showing success; JavaScript syntax compilation passed.
- Read-only database privilege audit: `admin_decide_order` and `admin_decide_subscription` are executable by `authenticated`, not `anon`; both are SECURITY DEFINER, use constrained `search_path=public, pg_temp`, and explicitly call `is_admin()`. No privilege changes were made because the functions' explicit authorization checks and existing frontend flow need a full end-to-end test before any grant change.
- Supabase security advisor findings reviewed: RLS-enabled/no-policy tables include `products_backup` and `telegram_otp`; mutable search path warnings include `set_updated_at` and `bootstrap_admin_disabled`; advisor also flags authenticated execution of the two admin RPCs and `is_admin()`. These are findings to assess, not proof of exploitable access. No database changes were made.
- Deployed `admin-telegram-otp` v3 source review: endpoint intentionally has `verify_jwt=false` for pre-session OTP, rate-limits requests to one per 45 seconds, expires codes after five minutes, and limits attempts. The implementation currently generates six-digit OTPs with `Math.random()`, has a fallback Telegram chat ID when the environment variable is absent, and its failed-code attempt increment targets the newest unused OTP rather than an exact challenge. These are security hardening candidates, but no Edge Function was redeployed and no production secrets/config were changed.
- The separate deployed `telegram-otp` v6 uses a different action contract (`request_otp` / `verify_otp`) than `admin-telegram-otp` v3 (`request` / `verify`). They must not be swapped without confirming which frontend calls which function.
- Regular user registration currently creates an anonymous Supabase Auth session when none exists; it does not verify control of the phone number. A safe phone-based account-recovery flow cannot be implemented merely by changing the UI. It requires selecting/configuring a genuine verification mechanism and a migration/identity-linking plan that preserves existing user IDs, spouse account, orders, subscriptions and receipts.
- Production backend, RLS, Auth users, and data remain unchanged. These observations are code/database-definition review only; no live device test has been performed.



## OTP retry safety correction — 2026-10-15 (continued review)
- Inspected the admin OTP caller and confirmed that its shared invoke helper automatically retries errors twice. That is unsafe for a one-time verification call: the first request may have reached the server and consumed the code or incremented an attempt counter even if the client saw a transport error.
- Changed only the main.js admin OTP verification call on online-only-hardening to pass attempts=1, preventing automatic replay of the same one-time code. Code-request retry behavior was left unchanged. JavaScript syntax compilation passed.
- Commit: 96b7f816d30e066ed651d1d87cc56318d1c046fd; new main.js blob: 690387576d8227a681a063abd64b8b08c8c02775.
- This is a targeted safety correction, not a complete diagnosis or proof that intermittent admin login is fixed. OTP provider/backend behavior and real phone/browser flow still need end-to-end verification. No live deployment, database, secrets, account, or user data changed.


## Continued OTP/session recovery review — 2026-10-16
- Latest branch comparison before this checkpoint update: 46 commits ahead of `main`, 0 behind. No merge/deployment was performed.
- Read the deployed `admin-telegram-otp` v3 source and recent function-edge request logs. Several POST requests returned HTTP 200 and took roughly 0.9–3.0 seconds, but request logs alone do not prove that the browser successfully established the admin session. No OTP values or secret values were read or exposed.
- Narrow frontend fix in `main.js`: after the OTP server confirms verification, if the response lacks tokens or `auth.setSession()` fails, the browser now clears the consumed challenge from `sessionStorage`. This avoids repeatedly presenting a one-time challenge that the server has already consumed. The user is told to request a fresh code. Also added a safe in-memory fallback if `sessionStorage` refuses to persist a newly received challenge.
- A separate narrow fix was already committed immediately before this: both OTP request and OTP verification are invoked once (no automatic replay of state-changing operations), to avoid accidental duplicate request/rate-limit behavior or reusing a consumed code.
- Latest checked `main.js` blob: `fda9f6182530b263b77a234ce186cd1e9e1cf028`; latest relevant commit: `d67f97cbd16ccbfd3f670ba581b6a70e514c6235`. JavaScript syntax compilation passed after these changes.
- Verified all five PWA PNG icon assets and `assets/splash.jpg` exist on the branch via base64 file fetch. `sw.js` precache paths include the expected local JS/CSS/image/manifest files; however, the PWA still contains older cache-busting labels (`rc21`, `rc25`) in icon/worker URLs while the shell cache is `online-3`. This is not proven to be the cause of login failures and has not been changed to avoid unnecessary icon/install behavior changes.
- Remaining known architectural issue: phone-only registration is not verified ownership. New anonymous auth UIDs cannot safely recover an existing profile by phone alone. No schema, RLS, Edge Function, user, order, subscription, receipt, or production setting was changed.
- Verification limits remain: static syntax and source checks only. No live-device end-to-end login was performed; do not report registration/admin login as fixed until a real browser/device test confirms it.


## OTP response-timeout hardening — 2026-10-16
- Added a 15-second client-side bound to both Telegram admin OTP request and verification calls on `online-only-hardening`. A slow/hung edge-function response can no longer keep the admin flow waiting indefinitely.
- When verification ends in an ambiguous transport/timeout/server failure, the browser now discards the pending challenge rather than risking a retry of a code that the server may already have consumed. Explicit server rejection (such as an incorrect/expired code returned as HTTP 401) still keeps the challenge while its local TTL remains valid.
- Updated the client comment to identify the deployed `admin-telegram-otp` v3 contract. No Edge Function, database schema, secrets, Auth users, RLS, or production deployment was changed.
- Commit: `dade6fe6328783299e2d5f759403978568d961aa`; latest `main.js` blob: `d9a4c1c0c8569d207ea7d4cbe2c9db5ce888b448`.
- Static JavaScript parse checks passed for all eight branch files: `main.js`, `sw.js`, `registration-recovery.js`, `offline-sync.js`, `ops-center.js`, `session-recovery.js`, `pwa-register.js`, and `admin-entry-guard.js`.
- Read-only Supabase Auth logs from the last 24 hours showed 51 successful `/user` requests, two successful `refresh_token` requests, one successful `/signup`, and two HTTP 401 calls to `admin-telegram-otp`. The logs do not identify the specific user or prove whether the 401s were mistyped, expired, or reused codes; no sensitive values were retrieved.
- This narrows a possible indefinite-wait/stale-challenge failure mode but is not proof that admin login or registration is fixed. Real-device end-to-end tests remain required. Keep PR #3 unmerged and production untouched.
