# PetLink

A tag that talks back. PetLink gives every pet a secure, scannable digital ID — scan the QR
code and reach the owner instantly, no app required for the finder.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · Supabase (Postgres + Auth) ·
Stripe & Razorpay · Resend · WhatsApp Cloud API · Vercel

## Quick start

```bash
npm install
cp .env.example .env      # fill in Supabase, then anything else you're testing
npm run prisma:migrate    # creates all tables
# paste supabase/migrations/0001_rls_and_triggers.sql into the Supabase SQL Editor and run it
npm run prisma:seed       # optional demo data
npm run dev
```

Visit `http://localhost:3000`. Full step-by-step setup (including Supabase project creation) is
in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, key decisions
- [`docs/DATABASE.md`](docs/DATABASE.md) — schema, RLS, migrations
- [`docs/API.md`](docs/API.md) — Server Actions and route surface
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — local setup → production on Vercel
- [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md) — every env var, what it's for, where to get it
- [`docs/DEVELOPER_GUIDE.md`](docs/DEVELOPER_GUIDE.md) — day-to-day dev workflow
- [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) — where things live and why
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — how to propose changes
- [`SECURITY.md`](SECURITY.md) — reporting vulnerabilities, security posture

## What's built

| Area | Status |
|---|---|
| Auth (sign-up/in, verify, reset), RBAC, RLS | ✅ |
| Pet management, QR generation, public scan page | ✅ |
| Lost/found flow, email + WhatsApp notifications | ✅ |
| Billing (Stripe + Razorpay), invoices, webhooks | ✅ |
| Admin panel (users, pets, payments, reports, plans, settings, audit logs) | ✅ |
| Analytics (GA4, GTM, Meta Pixel + CAPI, Clarity), SEO | ✅ |
| Physical tag store: batch generation, checkout (Stripe + Razorpay one-time), claim flow, order fulfillment | ✅ |
| Tests (unit/integration/a11y), CI/CD, security hardening | ✅ |
| Vet/insurer/shelter/municipal portals, native mobile, GPS/NFC tags | 🔜 architected for, not built — see Architecture doc |

## License

Proprietary — all rights reserved (update this if you intend to open-source).
