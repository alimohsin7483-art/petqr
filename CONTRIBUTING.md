# Contributing to PetLink

## Before you start

1. Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/FOLDER_STRUCTURE.md`](docs/FOLDER_STRUCTURE.md) — consistency matters more than cleverness here.
2. For anything non-trivial, open an issue describing the change before writing code.

## Workflow

1. Branch from `main`: `git checkout -b feat/short-description`
2. Make your change, following the conventions below.
3. Run the full local check before pushing:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```
4. Open a PR against `main`. CI runs lint, typecheck, tests, a migration-drift check, and a
   build. All must pass before merge.

## Conventions

- **Server Actions** (`src/actions/`) are thin — validate with Zod, call a service, return
  `{ error }` or `{ success: true }`. Business logic belongs in `src/services/`, not in actions
  or components.
- **Services** (`src/services/`) are framework-agnostic — no Next.js imports, so they stay unit
  testable without mocking half of Next.
- **Every authenticated Prisma query** goes through `withRLS()` from `src/lib/db.ts`, not the
  raw `prisma` export, unless you're intentionally writing admin/webhook/service-role code (and
  if so, say why in a comment — see the existing pattern in `src/services/admin/`).
- **Every new table** gets: `createdAt`, `updatedAt`, `deletedAt` (soft delete), an RLS policy in
  a new `supabase/migrations/NNNN_*.sql` file, and — if it's tenant-scoped — an index on the
  ownership column.
- **New notification types** go in `src/services/notifications/email/templates.ts` (and the
  WhatsApp equivalent if relevant) as a new case in the existing switch, not a new file per
  template.
- **Styling**: use the existing Tailwind config tokens (`ink`, `paper`, `brass`, `found`,
  `alert`, `line`, `rounded-tag`) rather than introducing new colors ad hoc.

## Commit messages

Conventional-commit style is preferred but not enforced: `feat: add vaccination reminders`,
`fix: correct plan limit off-by-one`, `docs: update deployment guide`.

## Adding a database migration

```bash
# after editing prisma/schema.prisma
npm run prisma:migrate  # prompts for a name, generates the migration
# if the change needs new RLS policies, add a new file under supabase/migrations/
# and apply it via the Supabase SQL Editor (or the Supabase CLI, if you're using it)
```

## Questions

Open an issue — there's no separate mailing list or chat for this project yet.
