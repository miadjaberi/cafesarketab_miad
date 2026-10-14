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
