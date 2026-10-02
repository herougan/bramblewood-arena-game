-- Published card edits: public read, admin-only write (RLS-enforced).
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.app_admins enable row level security;
create policy "admins can see own row" on public.app_admins for select to authenticated using (user_id = (select auth.uid()));

create or replace function public.is_app_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.app_admins where user_id = (select auth.uid()));
$$;
revoke execute on function public.is_app_admin() from public, anon;
grant execute on function public.is_app_admin() to authenticated;

create table if not exists public.card_overrides (
  id text primary key,
  data jsonb,
  deleted boolean not null default false,
  deleted_snapshot jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
alter table public.card_overrides enable row level security;
create policy "anyone can read card overrides" on public.card_overrides for select to anon, authenticated using (true);
create policy "admins insert card overrides" on public.card_overrides for insert to authenticated with check ((select public.is_app_admin()));
create policy "admins update card overrides" on public.card_overrides for update to authenticated using ((select public.is_app_admin())) with check ((select public.is_app_admin()));
create policy "admins delete card overrides" on public.card_overrides for delete to authenticated using ((select public.is_app_admin()));

-- Grant publishing rights to the game owner's account.
insert into public.app_admins(user_id) select id from auth.users where email = 'zhangjiahaor@gmail.com' on conflict do nothing;
