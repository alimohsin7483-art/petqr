# Database

Postgres, hosted on Supabase. Schema managed by Prisma (`prisma/schema.prisma`); Row Level
Security and triggers managed separately as raw SQL (`supabase/migrations/`), since Prisma
doesn't model RLS policies natively.

## Core tables

| Table | Purpose |
|---|---|
| `users` | Mirrors Supabase `auth.users`; carries role, org membership, billing customer IDs |
| `organizations` | Multi-tenant parent for future vet/shelter/insurer/municipal accounts |
| `pets` | Core entity; `public_slug` is the only thing ever exposed publicly |
| `qr_codes` | Versioned QR history per pet (a pet can have its tag reissued) |
| `pet_photos`, `vaccinations`, `medical_records` | Pet-scoped records |
| `lost_reports`, `found_reports` | Lost-mode history and anonymous finder submissions |
| `plans`, `subscriptions`, `invoices`, `payments`, `coupons` | Billing |
| `products`, `orders`, `physical_tags` | Physical tag store — one-time purchases, shipping, pre-generated unclaimed tag inventory |
| `notification_preferences`, `notification_jobs` | Opt-in/out + the outbound notification queue |
| `support_tickets`, `system_settings` | Admin-facing operational tables |
| `audit_logs` | Trigger-populated, read-only from the application's perspective |

Every tenant-scoped table has `created_at`, `updated_at`, `deleted_at` (soft delete — nothing is
ever hard-deleted from the application layer) and appropriate indexes on foreign keys and
frequently-filtered columns.

## Row Level Security

Enabled on every tenant-scoped table. The pattern:

```sql
create policy "pets_all_owner"
on pets for all
using (owner_id = current_app_user_id())
with check (owner_id = current_app_user_id());
```

`current_app_user_id()` resolves the caller's internal `users.id` from the Supabase JWT's `sub`
claim, set into the Postgres session by `withRLS()` (see `src/lib/db.ts`) for the duration of a
transaction. Public reads (the scan page) go through a locked-down view,
`public_pet_profiles`, which exposes only non-sensitive columns — never the base `pets` table.

Full policy set: `supabase/migrations/0001_rls_and_triggers.sql`.

## Making a schema change

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate + apply a migration
npm run prisma:migrate
# 3. If the new table needs RLS, add a new file:
#    supabase/migrations/000N_description.sql
# 4. Apply it via the Supabase SQL Editor (or `supabase db push` if using the CLI)
```

CI (`migration-check` job) applies all committed migrations to a fresh Postgres instance and
fails the build if `schema.prisma` has drifted from what's actually migrated — so "I changed the
schema but forgot to run `prisma migrate dev`" gets caught before merge.

## Seeding

`prisma/seed.ts` creates the three pricing tiers (free/plus/pro) and one demo user + pet. Run
via `npm run prisma:seed`. Safe to re-run — uses `upsert` throughout.
