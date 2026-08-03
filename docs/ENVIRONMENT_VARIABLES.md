# Environment Variables

All variables live in `.env` (copy from `.env.example`). Grouped by what they're for — nothing
outside "Database" and "Supabase" is required to run the app locally; features degrade
gracefully (rate limiting fails open, emails/WhatsApp/analytics just don't send) if left blank.

## Required to run at all

| Variable | Where to get it |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | Supabase → Project Settings → Database → Connection string (pooled vs. direct) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API (keep secret — full DB access) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally, your real domain in production |

## Payments (Module 5)

| Variable | Notes |
|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | From your Stripe dashboard. Webhook secret comes from the specific webhook endpoint you register pointing at `/api/webhooks/stripe` |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | From your Razorpay dashboard |

Plan-to-provider mapping (which Stripe Price / Razorpay Plan each tier charges) is **not** an
env var — it's set via the admin panel at `/admin/plans`, stored on the `Plan` row.

## Email & WhatsApp (Module 4)

| Variable | Notes |
|---|---|
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | resend.com — free tier is enough for testing |
| `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` | Meta Business Manager — requires business verification, budget extra setup time |

## Analytics (Module 7)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 measurement ID |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager container ID |
| `NEXT_PUBLIC_META_PIXEL_ID`, `META_CONVERSIONS_API_TOKEN` | Meta Events Manager |
| `NEXT_PUBLIC_CLARITY_ID` | Microsoft Clarity project ID |

Each of these self-disables if left blank — safe to fill in one at a time.

## Background jobs

| Variable | Notes |
|---|---|
| `CRON_SECRET` | Random string you generate; configure it as a header/query param on your Vercel Cron job so `/api/cron/*` routes reject unauthenticated callers |
| `RATE_LIMIT_REDIS_URL` | Upstash Redis REST URL — without this, rate limiting fails open (allows all requests) rather than blocking real users |

## Monitoring & misc

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN` | Sentry project — not yet wired into the app; reserved for when you add `@sentry/nextjs` instrumentation |
| `BETTER_STACK_SOURCE_TOKEN` | Reserved for uptime/log drain integration |
| `QR_SLUG_SECRET` | Reserved; current slug generation uses `nanoid`'s CSPRNG directly and doesn't require this, but it's here if you later want HMAC-derived slugs |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `ONESIGNAL_APP_ID`, `ONESIGNAL_API_KEY` | Reserved for future modules (map-based lost-pet search, push notifications) — not yet used by any built code |

## Never commit `.env`

`.gitignore` already excludes it. Rotate any secret that's ever been committed, even to a
private repo.
