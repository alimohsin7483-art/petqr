# Folder Structure

```
petlink/
├── prisma/
│   ├── schema.prisma          # single source of truth for the DB shape
│   └── seed.ts
├── supabase/
│   └── migrations/            # RLS policies + triggers (raw SQL, separate from Prisma migrations)
├── src/
│   ├── app/
│   │   ├── (marketing)/        # public homepage
│   │   ├── (auth)/              # sign-up, sign-in, verify, reset-password, callback
│   │   ├── dashboard/            # authenticated owner surface: pets, billing, orders
│   │   ├── admin/                 # ADMIN-only: users, pets, payments, orders, tags, products, reports, plans, settings, audit-logs
│   │   ├── shop/                    # public physical-tag storefront
│   │   ├── p/[slug]/                 # public scan page — no auth; also resolves claimed/unclaimed physical tags
│   │   ├── api/
│   │   │   ├── webhooks/{stripe,razorpay,whatsapp}/
│   │   │   ├── cron/{process-notifications,vaccination-reminders}/
│   │   │   ├── contact/[slug]/      # phone/WhatsApp redirect, keeps real number off the client
│   │   │   ├── qr/[petId]/            # QR PNG download, owner-only
│   │   │   ├── og/[slug]/              # dynamic OG image
│   │   │   ├── admin/export/users/
│   │   │   └── admin/tags/export/
│   │   ├── sitemap.ts, robots.ts, manifest.ts
│   │   ├── layout.tsx (root — fonts, analytics scripts)
│   │   └── globals.css
│   ├── actions/                 # Server Actions — thin, validate + delegate to services
│   ├── services/                 # business logic, framework-agnostic, unit-testable
│   │   ├── pets/, qr/, billing/, notifications/{email,whatsapp}/, admin/, analytics/, shop/
│   ├── lib/                       # cross-cutting: db.ts (RLS wrapper), supabase.ts, auth.ts (RBAC),
│   │                                 rate-limit.ts, resend.ts, stripe.ts, razorpay.ts, mask.ts, utils.ts
│   ├── validations/                # Zod schemas, one file per domain area
│   ├── components/
│   │   ├── ui/                      # Button, Field, Select — generic primitives
│   │   ├── auth/, pet/, admin/, analytics/, seo/   # domain-specific components
│   ├── config/                       # plan lookups and similar shared config
│   └── middleware.ts                   # Supabase session refresh
├── tests/
│   ├── unit/                            # validation schemas, utilities, pure logic
│   ├── integration/                       # services with mocked Prisma, RBAC, schema sanity, security headers
│   └── a11y/                               # jest-axe against shared UI components
├── docs/                                    # this file and its siblings
├── .github/workflows/ci.yml                  # lint → test → migration-check → build → deploy
└── vercel.json                                # cron schedules
```

## Why Server Actions live separately from services

`src/actions/` is intentionally thin and framework-coupled (uses `redirect()`, `revalidatePath()`,
reads cookies via `getCurrentUser()`). `src/services/` has none of that — it's plain
TypeScript + Prisma, which is what makes services mockable in `tests/integration/` without
spinning up a Next.js request context. If you find yourself wanting to unit test something and
it's stuck inside an action file, that's usually a sign the logic should move into a service.

## Why RLS SQL lives outside `prisma/migrations/`

Prisma migrations are auto-generated from schema diffs and get regenerated/reordered in ways
that don't play well with hand-written policy SQL. Keeping `supabase/migrations/` separate means
policies are reviewed and applied deliberately, not accidentally clobbered by a future
`prisma migrate dev`.
