# Architecture

## System overview

```
Client (Next.js RSC + client components)
   │
   ├── Server Actions (src/actions/) ── validated (Zod) ── Services (src/services/)
   │                                                              │
   │                                                     Prisma ORM → Supabase Postgres (RLS)
   │
   ├── Public routes (/p/[slug], /api/og/[slug]) — no auth, read a restricted view
   │
   └── Webhooks (/api/webhooks/*) — signature-verified — Stripe, Razorpay, WhatsApp
                                                              │
                                                     notification_jobs table
                                                              │
                                              Cron worker (/api/cron/process-notifications)
                                                              │
                                                  Resend (email) / WhatsApp Cloud API
```

## Key decisions and why

**Prisma over Drizzle.** Chosen for migration tooling maturity and team-scale DX. The tradeoff:
Prisma doesn't natively understand Postgres RLS, so `src/lib/db.ts` implements `withRLS()`,
which sets the session's JWT claim inside a transaction before every authenticated query. This
means RLS is enforced by Postgres itself — a bug in application code can't bypass it, short of
using the raw `prisma` export (which is reserved, by convention, for webhook/admin/cron contexts
that have no user session to scope to).

**Multi-tenancy from day one.** Every table that will eventually need it (`Pet`, `User`) carries
an optional `organizationId`, even though the MVP only has individual pet owners. This means
adding vet clinics, shelters, or municipal departments later is additive — no schema rewrite.

**QR codes encode a slug, not a UUID.** `Pet.publicSlug` is a random 10-character string; the QR
image encodes `/p/{slug}`. If a tag is lost, damaged, or a privacy request requires rotating it,
a new QR can be generated without changing the pet's actual identity or breaking existing
references. The slug alphabet deliberately excludes visually ambiguous characters
(`0/O/1/I/l`) since it may be printed and re-typed by hand.

**The notification queue is a database table, not a message broker.** `notification_jobs` is
written to synchronously by whatever triggered it (signup, pet creation, lost mode, payment,
etc.), and drained by a cron-triggered route (`/api/cron/process-notifications`) with retry +
backoff. This avoids requiring a separate queue infrastructure dependency for the MVP. If volume
grows enough to need true async delivery, swap the cron-poll model for a real queue (e.g.
Upstash QStash or SQS) — the job schema doesn't need to change, only what drains it.

**Two payment providers, one UI pattern.** Stripe Checkout Sessions and Razorpay Subscriptions
have different APIs but the same shape from the caller's perspective: "get a hosted URL, redirect
the user there." Both webhook handlers converge on the same `Subscription`/`Invoice`/`Payment`
tables, so the billing dashboard and admin panel don't need to know which provider was used.

**Audit logging is trigger-based, not app-code-based.** `write_audit_log()` is a Postgres
trigger on `pets`, `subscriptions`, and `payments`. This means audit trail integrity doesn't
depend on every code path remembering to log — it's structurally impossible to mutate those
tables without an audit row being written.

**Contact info never touches the client for the public scan page.** The masked phone number is
computed server-side in a React Server Component; the actual "Call"/"WhatsApp" actions route
through a server redirect (`/api/contact/[slug]`) rather than embedding the real number in an
`href`. See `SECURITY.md` for the full reasoning.

## What's deliberately not built yet

Vet/insurer/shelter/municipal portals, native mobile apps, GPS/NFC tag ingestion, and
multi-organization white-labeling are represented in the schema (`Organization`,
`OrganizationType`, role enums) but have no UI or dedicated API surface. Building them should be
additive on top of the existing `User`/`Organization`/RBAC model — not a rearchitecture.

## The physical tag store (hybrid business model)

PetLink supports two ways a pet gets a tag: **free digital** (register a pet, download/print
your own QR) and **paid physical** (buy a pre-manufactured tag, it ships, you link it to a pet
once it arrives). The two converge on the same `/p/[slug]` public scan page and the same pet
data — a physical tag is not a second kind of pet profile, just a second way to reach one.

**Why tags are generated in batches before anything is sold**: a physical object has to have its
QR code printed on it before you know who's going to buy it. `PhysicalTag` rows are created
unclaimed (`generateTagBatch()`), assigned to an order once payment succeeds (webhook-driven,
never a user-facing action — inventory assignment must be a trusted, atomic step), and finally
"claimed" — linked to a specific pet — the first time the *customer* scans it and completes the
claim flow. Until claimed, `/p/[slug]` for that tag shows a "let's set up this tag" page instead
of a pet profile.

**Why one-time checkout is separate from subscription checkout**: `Order`/`Product` are
distinct from `Subscription`/`Plan` because they're genuinely different billing shapes — a
one-time purchase with a shipping address vs. a recurring charge with no shipping at all. Both
converge on the same `BillingProvider` enum and the same webhook routes
(`/api/webhooks/stripe`, `/api/webhooks/razorpay`), just dispatched to different handlers based
on the Stripe session's `mode` or the presence of `petlinkOrderId` in Razorpay's payment notes.
