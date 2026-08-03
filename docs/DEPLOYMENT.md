# Deployment Guide

## 1. Local setup

```bash
npm install
cp .env.example .env
```

Create a Supabase project (supabase.com → New Project), then fill in `DATABASE_URL`,
`DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API / Database. Set
`NEXT_PUBLIC_APP_URL=http://localhost:3000`.

```bash
npm run prisma:migrate     # creates tables, prompts for a migration name
```

Open the Supabase SQL Editor and run the full contents of
`supabase/migrations/0001_rls_and_triggers.sql`.

```bash
npm run prisma:seed        # optional: pricing tiers + a demo user/pet
npm run dev
```

Visit `http://localhost:3000`.

## 2. Production on Vercel

1. Push the repo to GitHub.
2. Import the repo in Vercel → it auto-detects Next.js.
3. Add every variable from `docs/ENVIRONMENT_VARIABLES.md` you intend to use in Vercel's
   Environment Variables settings (use a **separate Supabase project** for production — never
   point production at your dev database).
4. Set `NEXT_PUBLIC_APP_URL` to your real domain.
5. Deploy.

### After first deploy

- **Run migrations against production**: either connect your local machine to the prod
  `DATABASE_URL` temporarily and run `npm run prisma:deploy`, or wire this into a deploy step.
  Then apply the RLS SQL file to the production Supabase project's SQL Editor too — this step is
  manual and easy to forget; do it before real users sign up.
- **Webhooks**: point Stripe's and Razorpay's webhook URLs at
  `https://yourdomain.com/api/webhooks/stripe` and `/api/webhooks/razorpay`. Point WhatsApp's
  webhook at `/api/webhooks/whatsapp` and complete the verify-token handshake in Meta's dashboard.
- **Cron jobs**: `vercel.json` already declares the two cron schedules
  (`process-notifications` every 5 minutes, `vaccination-reminders` daily at 9am UTC). Vercel
  picks these up automatically on deploy — no dashboard config needed for the schedule itself,
  but you do need to set `CRON_SECRET` and ensure your cron routes check for it (already done).
- **GitHub Actions deploy hook**: add `VERCEL_DEPLOY_HOOK_URL` as a GitHub repo secret (Vercel
  project → Settings → Git → Deploy Hooks) so the CI pipeline's final `deploy` job works.

### Plan → payment provider setup

Before checkout works: create matching products/prices in the Stripe dashboard and a Plan in
the Razorpay dashboard, then go to `/admin/plans` in your deployed app (as an ADMIN user — see
below) and paste in the Stripe Price ID / Razorpay Plan ID for each tier.

### Creating your first admin user

There's no bootstrap script — sign up normally, then in the Supabase Table Editor (or a direct
SQL query) run:
```sql
update users set role = 'ADMIN' where email = 'you@example.com';
```
From then on, use `/admin` in the app to promote/demote other admins.

## 3. Rollback

Vercel keeps every deployment; use "Promote to Production" on a previous deployment in the
Vercel dashboard if a release causes problems. Database migrations are additive by convention in
this project (soft deletes, no destructive column drops without a deliberate follow-up
migration) — but always back up before running a migration against production regardless.
