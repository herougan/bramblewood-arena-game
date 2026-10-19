-- APPLIED 2026-10-19 08:12 (owner "apply it"), via the Supabase SQL editor.
-- PROPOSED, NOT APPLIED (2026-10-19, package G: guild skills). Apply only on the owner's "apply it".
-- Owner (2026-10-18 20:45): "Guild skills. Starting with +raid HP to your bramble."
--
-- What it adds (nothing existing is changed, dropped or loosened):
--   guild_skill_defs     the skill catalogue: id, top level, the Seeds each level costs. Readable by everyone; no write policy.
--   guild_skill_levels   a guild's level in each skill. Readable by that guild's members; no write policy (only the RPC writes).
--   guild_seeds          a guild's 🌱 Guild Seeds. Readable by that guild's members; no write policy (only the trigger and RPC write).
--   guild_seed_earnings  Seeds each player earned per week (the weekly cap). Readable by that player; no write policy.
--   credit_guild_seeds   AFTER INSERT trigger on raid_week_attempts: 1 Seed per 500 raid damage to the fighter's guild, at most 250
--                        a player a week (whichever guild they are in). It never blocks the raid attempt itself.
--   upgrade_guild_skill  SECURITY DEFINER RPC: the guild's owner buys the next level of a skill; checks the role, the level the
--                        client saw (so a double click can't buy twice), the top level and the Seeds, and spends them in the same
--                        transaction that raises the level.
--
-- Live schema this matches (read-only queries, 2026-10-19):
--   guilds(id uuid pk, name, tag, icon, created_by uuid -> profiles, created_at)        policies: read (all), create (own), delete own empty
--   guild_members(profile_id uuid pk, guild_id uuid -> guilds on delete cascade, role text check in ('owner','member'), joined_at)
--                                                                                       policies: read (all), join (own row), leave (own row)
--   raid_week_attempts(id, boss_id, cycle, owner_id -> auth.users, display_name, avatar, deck jsonb, damage int 0..10000, won, fought_at)
--                                                                                       policies: read (all), insert own (this/last week)
--   No triggers on these three tables today.
--
-- Who may spend: there are no officers (the role check allows only 'owner' and 'member'), so only the owner. "Owner" means the
-- caller's guild_members row says 'owner' AND the caller is guilds.created_by, the same rule as rename_guild
-- (20261018_guild_rename.sql): the live join policy lets any signed-in player insert their own row with role 'owner' in any guild,
-- so the role alone can't be trusted; created_by can't be forged. If officers are wanted later, widen guild_members_role_check
-- and the v_owner test below together (and close the join-as-owner hole first: block B of 20261018_guild_rename.sql).
--
-- The trust trade-off (the Seeds): raid_week_attempts rows are written by the client (damage 0..10000, one row per fight), so a
-- player who forges rows can farm Seeds. The weekly cap (250 a player a week, about 30 honest fights) bounds that: a forger can add
-- at most 250 Seeds a week to one guild, and the whole of Rooted Walls costs 560. Rows with an empty deck (the admin's
-- admin_raid_damage rows) earn nothing. When raid rewards move server-side (20261017_c_server_rewards.sql), credit Seeds there instead.
--
-- Until this is applied the client reads guild_skill_levels, gets PGRST205 / 42P01 ("relation does not exist"), shows the skill
-- list as a preview with a note, can't buy, and adds no guild bonus to raid fights. Idempotent: safe to run twice.

-- ============================================================
-- 1. The catalogue
-- ============================================================
create table if not exists public.guild_skill_defs (
  skill      text primary key check (char_length(skill) between 1 and 40),
  max_level  smallint not null check (max_level between 1 and 20),
  costs      integer[] not null,                 -- costs[n] = Seeds for level n (1-based), one per level
  per_level  numeric not null default 0,         -- what one level gives (Rooted Walls: % bramble Health in raid fights)
  check (array_length(costs, 1) = max_level)
);
alter table public.guild_skill_defs enable row level security;
drop policy if exists "guild skill defs read" on public.guild_skill_defs;
create policy "guild skill defs read" on public.guild_skill_defs for select to anon, authenticated using (true);
revoke insert, update, delete, truncate on public.guild_skill_defs from anon, authenticated;
-- Rooted Walls: +4% bramble Health a level, 5 levels (+20%), 560 Seeds in all. Keep in step with bramblewood-guild.js (the test checks).
insert into public.guild_skill_defs (skill, max_level, costs, per_level)
  values ('rooted_walls', 5, array[30, 60, 100, 150, 220], 4)
  on conflict (skill) do update set max_level = excluded.max_level, costs = excluded.costs, per_level = excluded.per_level;

-- ============================================================
-- 2. A guild's levels and Seeds (read by members; written only by the functions below)
-- ============================================================
create table if not exists public.guild_skill_levels (
  guild_id   uuid not null references public.guilds(id) on delete cascade,
  skill      text not null references public.guild_skill_defs(skill),
  level      smallint not null default 0 check (level between 0 and 20),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null,
  primary key (guild_id, skill)
);
alter table public.guild_skill_levels enable row level security;
drop policy if exists "guild skill levels read by members" on public.guild_skill_levels;
create policy "guild skill levels read by members" on public.guild_skill_levels for select to authenticated
  using (exists (select 1 from public.guild_members m where m.guild_id = guild_skill_levels.guild_id and m.profile_id = (select auth.uid())));
revoke insert, update, delete, truncate on public.guild_skill_levels from anon, authenticated;

create table if not exists public.guild_seeds (
  guild_id     uuid primary key references public.guilds(id) on delete cascade,
  seeds        integer not null default 0 check (seeds >= 0),
  earned_total bigint not null default 0,
  updated_at   timestamptz not null default now()
);
alter table public.guild_seeds enable row level security;
drop policy if exists "guild seeds read by members" on public.guild_seeds;
create policy "guild seeds read by members" on public.guild_seeds for select to authenticated
  using (exists (select 1 from public.guild_members m where m.guild_id = guild_seeds.guild_id and m.profile_id = (select auth.uid())));
revoke insert, update, delete, truncate on public.guild_seeds from anon, authenticated;

-- the weekly cap's ledger: one row per player per server week (floor(epoch / 604800), the raid's cycle)
create table if not exists public.guild_seed_earnings (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  cycle      integer not null,
  seeds      integer not null default 0 check (seeds between 0 and 250),
  primary key (profile_id, cycle)
);
alter table public.guild_seed_earnings enable row level security;
drop policy if exists "own seed earnings read" on public.guild_seed_earnings;
create policy "own seed earnings read" on public.guild_seed_earnings for select to authenticated using (profile_id = (select auth.uid()));
revoke insert, update, delete, truncate on public.guild_seed_earnings from anon, authenticated;

-- ============================================================
-- 3. Earning: a member's raid fight adds Seeds to their guild
-- ============================================================
create or replace function public.credit_guild_seeds() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_guild uuid;
  v_week  integer := floor(extract(epoch from now()) / 604800)::int;   -- the server's week, not the row's cycle
  v_want  integer := floor(greatest(0, least(coalesce(new.damage, 0), 10000)) / 500)::int;
  v_had   integer;
  v_got   integer;
begin
  if v_want <= 0 or new.deck is null or new.deck = '{}'::jsonb then return new; end if;  -- admin_raid_damage rows have no deck
  begin
    select m.guild_id into v_guild from public.guild_members m where m.profile_id = new.owner_id;
    if v_guild is null then return new; end if;
    insert into public.guild_seed_earnings as e (profile_id, cycle, seeds) values (new.owner_id, v_week, 0)
      on conflict (profile_id, cycle) do nothing;
    select e.seeds into v_had from public.guild_seed_earnings e where e.profile_id = new.owner_id and e.cycle = v_week for update;
    v_got := least(v_want, 250 - coalesce(v_had, 0));
    if v_got <= 0 then return new; end if;
    update public.guild_seed_earnings set seeds = seeds + v_got where profile_id = new.owner_id and cycle = v_week;
    insert into public.guild_seeds as s (guild_id, seeds, earned_total, updated_at) values (v_guild, v_got, v_got, now())
      on conflict (guild_id) do update set seeds = s.seeds + excluded.seeds, earned_total = s.earned_total + excluded.earned_total, updated_at = now();
  exception when others then
    -- never let a Seeds problem lose the raid attempt itself
    return new;
  end;
  return new;
end;
$$;
revoke all on function public.credit_guild_seeds() from public, anon, authenticated;
drop trigger if exists credit_guild_seeds on public.raid_week_attempts;
create trigger credit_guild_seeds after insert on public.raid_week_attempts
  for each row execute function public.credit_guild_seeds();

-- ============================================================
-- 4. Spending: the owner buys the next level
-- ============================================================
-- p_from_level is the level the client is looking at: if it has changed since (another tab, a double click), nothing is bought.
-- Returns the new level and the Seeds left. Errors: not_signed_in (28000), not_owner (42501), unknown_skill / max_level /
-- level_changed / not_enough_seeds (22023). Everything happens in this one function's transaction: the Seeds row is locked
-- (for update) before the check, and the level only moves if the Seeds came off.
create or replace function public.upgrade_guild_skill(p_guild uuid, p_skill text, p_from_level integer)
returns table (level integer, seeds integer)
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid   uuid := auth.uid();
  v_max   integer;
  v_costs integer[];
  v_cur   integer;
  v_cost  integer;
  v_left  integer;
begin
  if v_uid is null then
    raise exception 'not_signed_in' using errcode = '28000';
  end if;
  if not exists (
    select 1
      from public.guild_members m
      join public.guilds g on g.id = m.guild_id
     where m.guild_id = p_guild
       and m.profile_id = v_uid
       and m.role = 'owner'
       and g.created_by = v_uid
  ) then
    raise exception 'not_owner' using errcode = '42501';
  end if;
  select d.max_level, d.costs into v_max, v_costs from public.guild_skill_defs d where d.skill = p_skill;
  if not found then
    raise exception 'unknown_skill' using errcode = '22023';
  end if;
  -- lock this guild's Seeds row (made if missing) so two upgrades can't both spend the same Seeds
  insert into public.guild_seeds (guild_id) values (p_guild) on conflict (guild_id) do nothing;
  perform 1 from public.guild_seeds s where s.guild_id = p_guild for update;
  select coalesce((select l.level from public.guild_skill_levels l where l.guild_id = p_guild and l.skill = p_skill for update), 0) into v_cur;
  if v_cur >= v_max then
    raise exception 'max_level' using errcode = '22023';
  end if;
  if p_from_level is distinct from v_cur then
    raise exception 'level_changed' using errcode = '22023';
  end if;
  v_cost := v_costs[v_cur + 1];
  update public.guild_seeds s set seeds = s.seeds - v_cost, updated_at = now()
   where s.guild_id = p_guild and s.seeds >= v_cost
   returning s.seeds into v_left;
  if not found then
    raise exception 'not_enough_seeds' using errcode = '22023';
  end if;
  insert into public.guild_skill_levels as l (guild_id, skill, level, updated_at, updated_by)
    values (p_guild, p_skill, v_cur + 1, now(), v_uid)
    on conflict (guild_id, skill) do update set level = excluded.level, updated_at = now(), updated_by = v_uid;
  return query select v_cur + 1, v_left;
end;
$$;
revoke all on function public.upgrade_guild_skill(uuid, text, integer) from public, anon;
grant execute on function public.upgrade_guild_skill(uuid, text, integer) to authenticated;

-- Not here on purpose: no way to grant Seeds by hand (an admin tests levels with the Guild tab's local preview), no refunds, no
-- officer role. Leaving a guild keeps its levels and Seeds with the guild; a deleted guild takes them with it (on delete cascade).
