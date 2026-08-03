# Security Policy

## Reporting a vulnerability

Please email **security@petlink.app** (replace with a real monitored address before launch)
with a description and reproduction steps. Don't open a public GitHub issue for suspected
vulnerabilities. We aim to acknowledge reports within 48 hours.

## What's implemented today

This is a snapshot of the security-relevant decisions actually built into the codebase, so
reviewers know what to check and what's still a gap.

### Authentication & access control
- Supabase Auth (JWT-based sessions), session cookie refreshed via middleware on every request
- Row Level Security enabled on every tenant-scoped table (`supabase/migrations/0001_rls_and_triggers.sql`) — enforced at the database layer, not just in application code
- Prisma queries run through `withRLS()`, which sets the Postgres session's JWT claim per-transaction so RLS policies apply the same way they would to a direct Supabase client call
- RBAC via `requireRole()` gates every admin action and page
- Passwords: minimum 10 characters, requires an uppercase letter and a number (enforced via Zod, `src/validations/auth.ts`)

### Rate limiting
Applied to every public/abuse-prone endpoint: sign-up, sign-in, password reset, found-report
submission, the contact-redirect route, and admin CSV export (defense in depth — this one's
already auth-gated). Backed by Upstash Redis; **fails open** if Redis isn't configured, with a
console warning in production so this is never silently disabled.

### Secrets & contact data
- The owner's real phone number is never sent to the browser. The public scan page renders a
  masked version server-side; "Call"/"WhatsApp" buttons hit a server route
  (`/api/contact/[slug]`) that resolves the real number and issues a redirect — the number
  never appears in the page's HTML source.
- Service-role/webhook code paths are isolated in clearly-commented sections of `src/lib/db.ts`
  and `src/lib/supabase.ts` — never imported into client components.

### Webhook security
- Stripe: verified via `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET`
- Razorpay: HMAC-SHA256 verified against `RAZORPAY_WEBHOOK_SECRET` using constant-time comparison
- WhatsApp Cloud API: HMAC-SHA256 verified against `WHATSAPP_APP_SECRET`, plus the Meta verify-token handshake

### Application-layer protections
- Zod validation on every Server Action input — nothing reaches Prisma unvalidated
- Prisma parameterizes all queries (no raw SQL string concatenation) — no SQL injection surface
- Security headers on every route (`next.config.ts`): `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, a real `Content-Security-Policy`, `Referrer-Policy`, `Permissions-Policy`
- CSRF: Next.js Server Actions include built-in origin verification (same-origin POSTs only); no separate CSRF token scheme was layered on top since Server Actions aren't traditional form-post endpoints
- Honeypot field on the public found-report form; found-report submissions are also rate-limited per IP
- Audit logging is trigger-based at the database level (`write_audit_log()`), not app-code-based — so it can't be bypassed by a bug or a compromised code path that forgets to log

### Known gaps (tracked, not hidden)
- WhatsApp webhook delivery-status events are logged but not yet correlated back to a specific
  `notification_jobs` row (needs a persisted provider-message-id lookup) — worth adding once
  WhatsApp volume justifies it.
- No CAPTCHA on public forms yet (found-report, sign-up) — currently relying on rate limiting +
  honeypot. Add one (e.g. Cloudflare Turnstile) before opening this up at scale.
- Dependency audit (`npm audit`) runs in CI as informational only (`continue-on-error: true`).
  Flip to blocking once the current dependency tree has been reviewed.
- No automated penetration testing or third-party security review has been performed. Do this
  before handling real user data at scale.
