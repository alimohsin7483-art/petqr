-- ─────────────────────────────────────────────────────────────
-- PetLink: Row Level Security + Audit Triggers + Public View
-- Run AFTER `prisma migrate deploy` has created the base tables.
-- ─────────────────────────────────────────────────────────────

-- 1. Enable RLS on every tenant-scoped table
alter table users enable row level security;
alter table pets enable row level security;
alter table pet_photos enable row level security;
alter table qr_codes enable row level security;
alter table vaccinations enable row level security;
alter table medical_records enable row level security;
alter table lost_reports enable row level security;
alter table found_reports enable row level security;
alter table emergency_contacts enable row level security;
alter table subscriptions enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;
alter table notification_preferences enable row level security;
alter table support_tickets enable row level security;
alter table audit_logs enable row level security;

-- Helper: current app user's internal uuid, resolved from the Supabase JWT
create or replace function current_app_user_id() returns uuid
language sql stable as $$
  select id from users where auth_user_id = auth.uid()::text
$$;

create or replace function current_app_user_role() returns text
language sql stable as $$
  select role::text from users where auth_user_id = auth.uid()::text
$$;

-- 2. Users: a user can read/update their own row; admins can read all
create policy "users_select_self_or_admin"
on users for select
using (auth_user_id = auth.uid()::text or current_app_user_role() = 'ADMIN');

create policy "users_update_self"
on users for update
using (auth_user_id = auth.uid()::text)
with check (auth_user_id = auth.uid()::text);

-- 3. Pets: owners fully manage their own pets; admins read all
create policy "pets_all_owner"
on pets for all
using (owner_id = current_app_user_id())
with check (owner_id = current_app_user_id());

create policy "pets_select_admin"
on pets for select
using (current_app_user_role() = 'ADMIN');

-- 4. Child tables follow the parent pet's ownership
create policy "pet_photos_owner" on pet_photos for all
using (pet_id in (select id from pets where owner_id = current_app_user_id()))
with check (pet_id in (select id from pets where owner_id = current_app_user_id()));

create policy "qr_codes_owner" on qr_codes for all
using (pet_id in (select id from pets where owner_id = current_app_user_id()))
with check (pet_id in (select id from pets where owner_id = current_app_user_id()));

create policy "vaccinations_owner" on vaccinations for all
using (pet_id in (select id from pets where owner_id = current_app_user_id()))
with check (pet_id in (select id from pets where owner_id = current_app_user_id()));

create policy "medical_records_owner" on medical_records for all
using (pet_id in (select id from pets where owner_id = current_app_user_id()))
with check (pet_id in (select id from pets where owner_id = current_app_user_id()));

create policy "lost_reports_owner" on lost_reports for all
using (pet_id in (select id from pets where owner_id = current_app_user_id()))
with check (pet_id in (select id from pets where owner_id = current_app_user_id()));

-- Found reports: anonymous finders may INSERT (rate-limited at the app layer)
-- but only the pet's owner may read/update them.
create policy "found_reports_insert_public"
on found_reports for insert
with check (true);

create policy "found_reports_select_owner"
on found_reports for select
using (pet_id in (select id from pets where owner_id = current_app_user_id()));

-- 5. Personal records: emergency contacts, subscriptions, billing, prefs, tickets
create policy "emergency_contacts_owner" on emergency_contacts for all
using (user_id = current_app_user_id())
with check (user_id = current_app_user_id());

create policy "subscriptions_owner" on subscriptions for select
using (user_id = current_app_user_id());

create policy "invoices_owner" on invoices for select
using (subscription_id in (select id from subscriptions where user_id = current_app_user_id()));

create policy "payments_owner" on payments for select
using (invoice_id in (
  select i.id from invoices i
  join subscriptions s on s.id = i.subscription_id
  where s.user_id = current_app_user_id()
));

create policy "notification_preferences_owner" on notification_preferences for all
using (user_id = current_app_user_id())
with check (user_id = current_app_user_id());

create policy "support_tickets_owner" on support_tickets for all
using (user_id = current_app_user_id())
with check (user_id = current_app_user_id());

-- 6. Audit logs: read-only, admins only. Writes happen exclusively via trigger.
create policy "audit_logs_select_admin"
on audit_logs for select
using (current_app_user_role() = 'ADMIN');

-- ─────────────────────────────────────────────────────────────
-- 7. Public scan surface: a locked-down view, never the base table
-- ─────────────────────────────────────────────────────────────
create or replace view public_pet_profiles as
select
  p.public_slug,
  p.name,
  p.species,
  p.breed,
  p.avatar_url,
  p.is_lost,
  p.bio,
  u.full_name as owner_display_name
from pets p
join users u on u.id = p.owner_id
where p.deleted_at is null;

grant select on public_pet_profiles to anon;

-- ─────────────────────────────────────────────────────────────
-- 8. Generic audit-log trigger (fires on pets + subscriptions + payments)
-- ─────────────────────────────────────────────────────────────
create or replace function write_audit_log() returns trigger
language plpgsql security definer as $$
declare
  actor uuid;
begin
  actor := current_app_user_id();
  insert into audit_logs (id, actor_id, action, entity_type, entity_id, before, after)
  values (
    gen_random_uuid(),
    actor,
    tg_table_name || '.' || lower(tg_op),
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op = 'DELETE' or tg_op = 'UPDATE' then to_jsonb(old) else null end,
    case when tg_op = 'INSERT' or tg_op = 'UPDATE' then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger pets_audit
after insert or update or delete on pets
for each row execute function write_audit_log();

create trigger subscriptions_audit
after insert or update or delete on subscriptions
for each row execute function write_audit_log();

create trigger payments_audit
after insert or update or delete on payments
for each row execute function write_audit_log();
