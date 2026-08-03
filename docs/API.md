# API Surface

PetLink is built almost entirely on Next.js Server Actions rather than a traditional REST API —
actions live in `src/actions/` and are called directly from Server/Client Components. The
tables below list what exists and how to call it; `route.ts` files are used only where a real
HTTP endpoint is required (webhooks, redirects, file responses, cron).

## Server Actions

| Action | File | Auth | Purpose |
|---|---|---|---|
| `signUpAction` | `actions/auth.ts` | public | Create account, queue welcome email, fire signup conversion event |
| `signInAction` | `actions/auth.ts` | public | Sign in, redirects to `/dashboard` |
| `signOutAction` | `actions/auth.ts` | session | Sign out |
| `requestPasswordResetAction` / `resetPasswordAction` | `actions/auth.ts` | public / recovery session | Password reset flow |
| `createPetAction` / `updatePetAction` / `deletePetAction` | `actions/pets.ts` | owner | Pet CRUD, enforces plan pet limit |
| `toggleLostModeAction` | `actions/pets.ts` | owner | Lost mode on/off, queues notifications |
| `submitFoundReportAction` | `actions/found-reports.ts` | public, rate-limited | Anonymous finder submission |
| `startStripeCheckoutAction` / `startRazorpayCheckoutAction` | `actions/billing.ts` | owner | Redirects to hosted checkout |
| `openStripePortalAction` | `actions/billing.ts` | owner | Redirects to Stripe's billing portal |
| `startStripeTagCheckoutAction` / `createRazorpayTagOrderAction` / `verifyRazorpayTagPaymentAction` | `actions/shop.ts` | signed-in (redirects to sign-in if not) | One-time physical tag checkout |
| `claimPhysicalTagAction` / `createPetAndClaimTagAction` | `actions/shop.ts` | owner | Links a physical tag to an existing or brand-new pet |
| `generateTagBatchAction` | `actions/shop-admin.ts` | ADMIN | Pre-generates unclaimed tags |
| `markOrderShippedAction` | `actions/shop-admin.ts` | ADMIN | Fulfillment status update |
| `createProductAction` / `updateProductStripeIdAction` / `toggleProductActiveAction` | `actions/shop-admin.ts` | ADMIN | Shop catalog management |
| `suspendUserAction` / `reinstateUserAction` / `setUserRoleAction` | `actions/admin.ts` | ADMIN | User management |
| `updateTicketStatusAction` | `actions/admin.ts` | ADMIN | Support ticket triage |
| `updatePlanProviderIdsAction` | `actions/admin.ts` | ADMIN | Connects a Plan to Stripe/Razorpay IDs |
| `upsertSystemSettingAction` | `actions/admin.ts` | ADMIN | Generic key/value settings |

## HTTP routes

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/p/[slug]` | public | Rendered scan page (not a JSON API — an RSC page) |
| GET | `/api/og/[slug]` | public | Dynamic OG image |
| GET | `/api/qr/[petId]` | owner | Downloads the pet's QR PNG |
| GET | `/api/contact/[slug]?type=call\|whatsapp` | public, rate-limited | Resolves the owner's real number server-side and redirects — the number never appears in page HTML |
| GET/POST | `/callback` | — | Supabase email verification / magic link exchange |
| POST | `/api/webhooks/stripe` | signature-verified | Stripe subscription/invoice events |
| POST | `/api/webhooks/razorpay` | HMAC-verified | Razorpay subscription/payment events |
| GET/POST | `/api/webhooks/whatsapp` | verify-token / HMAC-verified | Meta handshake + inbound messages/delivery status |
| GET | `/api/cron/process-notifications` | `Bearer $CRON_SECRET` | Drains the notification queue |
| GET | `/api/cron/vaccination-reminders` | `Bearer $CRON_SECRET` | Queues upcoming vaccination reminders |
| GET | `/api/admin/export/users` | ADMIN, rate-limited | CSV export |
| GET | `/api/admin/tags/export` | ADMIN | CSV export of unassigned physical tags, for sending to a printer |

## Response conventions

Server Actions return one of:
```ts
{ error: string }
{ success: true }               // sometimes with extra fields, e.g. { success: true; eventId: string }
```
or call `redirect()` directly for the common "success means navigate" case (sign-in, checkout,
pet creation). Route handlers return standard `NextResponse.json(...)` with conventional HTTP
status codes; webhook routes always return `200` to the provider once signature verification
passes, even if internal processing errors (logged instead), to avoid provider-side retry storms
overwhelming the endpoint on a transient app bug.
