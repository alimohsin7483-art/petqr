-- ─────────────────────────────────────────────────────────────
-- PetLink: RLS for the physical tag store (Module 10)
-- Run AFTER `prisma migrate deploy` has created these tables.
-- ─────────────────────────────────────────────────────────────

alter table orders enable row level security;
alter table physical_tags enable row level security;
alter table products enable row level security;

-- Orders: owners can see their own order history only.
-- Writes happen exclusively via server-side webhook/service-role code paths,
-- so no insert/update policy is granted to end users here.
create policy "orders_select_owner"
on orders for select
using (user_id = current_app_user_id());

-- Products: publicly readable (it's a shop catalog) but only active ones.
create policy "products_select_active"
on products for select
using (is_active = true);

-- Physical tags: visible to the owner of the pet they're linked to.
-- Unclaimed tags (no pet yet) are only ever read via service-role code
-- during the claim flow, since there's no authenticated owner yet.
create policy "physical_tags_select_owner"
on physical_tags for select
using (pet_id in (select id from pets where owner_id = current_app_user_id()));

-- Audit the same three payment-relevant tables we already audit.
create trigger orders_audit
after insert or update or delete on orders
for each row execute function write_audit_log();

create trigger physical_tags_audit
after insert or update or delete on physical_tags
for each row execute function write_audit_log();
