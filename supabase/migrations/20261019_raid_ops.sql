-- APPLIED 2026-10-19 08:12 (owner "apply it"), via the Supabase SQL editor.
-- PROPOSED 2026-10-19 (package RO, raid ops). Apply only on the owner's "apply it". Idempotent: safe to run twice.
-- Owner 21:48: "When the raid dies ... respawn within 24h. I have admin access to restart the raid."
-- Owner 00:22: "When there are too many players, each raid can have multiple instances."
-- See docs/raid-ops-2026-10-19.md.
--
-- What it adds (nothing existing is changed or loosened):
--   raid_restarts         admin restarts of a raid (a fresh life at full Health). Public read; no client writes.
--   admin_restart_raid    SECURITY DEFINER, admins only (is_app_admin): writes a restart row for this week's cycle.
--   raid_instance_members who is in which instance of a raid this cycle. Public read (counts only matter; guild_members is already
--                         public); no client writes.
--   join_raid_instance    SECURITY DEFINER, signed-in players: returns your instance for this week's cycle, placing you on the first
--                         call (a guild-mate's instance with room, else the lowest instance with room, else a new one). Serialised
--                         per raid and cycle with an advisory lock, so two players can't both take the last seat.
--   check_raid_attempt_instance  BEFORE INSERT trigger on raid_week_attempts: an attempt for instance N ("raid:part@N"; "raid:part"
--                         is instance 1) must be your instance. Not in one yet: only instance 1. Admin rows are exempt. Rows without a
--                         part (the old weekly bosses) are untouched.
--
-- What it doesn't do: the respawn itself needs no table. A life of the raid is fenced by time: it falls at the attempt that drains
-- it, returns respawnHours (24) later or at a restart, and every client works that out from raid_week_attempts + raid_restarts
-- (bramblewood-raid.js raidGenerations). Raid tickets stay client-side, as Raid Points always were (player_currencies.raid_points has
-- no server rule): a forged client could fight without tickets, as it can today; each row's damage is still capped at 10,000.
--
-- Live schema this matches (read-only queries, 2026-10-19): raid_week_attempts(id, boss_id text <= 120, cycle int, owner_id ->
-- auth.users, display_name, avatar, deck jsonb, damage 0..10000, won, fought_at); policies: read (all), insert own (this/last week);
-- trigger credit_guild_seeds is proposed (20261019_guild_skills.sql), not live. guild_members(profile_id pk, guild_id, role, joined_at).
-- card_overrides(id text pk, data jsonb, deleted ...): the published raid lives at id '__cfg:raid:<raid id>', data->'def'.
-- The cycle is floor(epoch seconds / 604800), the same as the client's RaidM.cycleOf and the attempts' policy.

-- ============================================================
-- 1. Restarts
-- ============================================================
create table if not exists public.raid_restarts (
  id           bigserial primary key,
  raid_id      text not null check (char_length(raid_id) between 1 and 80 and raid_id !~ '[:@]'),
  cycle        integer not null,
  instance     integer check (instance is null or instance between 1 and 10000),   -- null: every instance
  restarted_at timestamptz not null default now(),
  restarted_by uuid references auth.users(id) on delete set null
);
create index if not exists raid_restarts_raid_cycle on public.raid_restarts (raid_id, cycle);
alter table public.raid_restarts enable row level security;
drop policy if exists "raid restarts readable by everyone" on public.raid_restarts;
create policy "raid restarts readable by everyone" on public.raid_restarts for select to anon, authenticated using (true);
revoke insert, update, delete, truncate on public.raid_restarts from anon, authenticated;

create or replace function public.admin_restart_raid(p_raid_id text, p_instance integer default null)
returns timestamptz
language plpgsql security definer set search_path = ''
as $$
declare
  me     uuid := auth.uid();
  v_week integer := floor(extract(epoch from now()) / 604800)::int;
  v_at   timestamptz;
begin
  if me is null or not public.is_app_admin() then
    raise exception 'admins only';
  end if;
  if p_raid_id is null or char_length(p_raid_id) not between 1 and 80 or p_raid_id ~ '[:@]' then
    raise exception 'bad raid id';
  end if;
  if p_instance is not null and (p_instance < 1 or p_instance > 10000) then
    raise exception 'bad instance';
  end if;
  -- a double click: one restart a minute per raid and instance
  select max(r.restarted_at) into v_at from public.raid_restarts r
    where r.raid_id = p_raid_id and r.cycle = v_week and r.instance is not distinct from p_instance and r.restarted_at > now() - interval '1 minute';
  if v_at is not null then return v_at; end if;
  insert into public.raid_restarts (raid_id, cycle, instance, restarted_by) values (p_raid_id, v_week, p_instance, me)
    returning restarted_at into v_at;
  return v_at;
end;
$$;
revoke all on function public.admin_restart_raid(text, integer) from public, anon;
grant execute on function public.admin_restart_raid(text, integer) to authenticated;

-- ============================================================
-- 2. Instances
-- ============================================================
create table if not exists public.raid_instance_members (
  raid_id   text not null check (char_length(raid_id) between 1 and 80 and raid_id !~ '[:@]'),
  cycle     integer not null,
  owner_id  uuid not null references auth.users(id) on delete cascade,
  instance  integer not null check (instance between 1 and 10000),
  guild_id  uuid,                                  -- the guild when they joined (null: none); keeps guild-mates together
  joined_at timestamptz not null default now(),
  primary key (raid_id, cycle, owner_id)
);
create index if not exists raid_instance_members_inst on public.raid_instance_members (raid_id, cycle, instance);
alter table public.raid_instance_members enable row level security;
drop policy if exists "raid instances readable by everyone" on public.raid_instance_members;
create policy "raid instances readable by everyone" on public.raid_instance_members for select to anon, authenticated using (true);
revoke insert, update, delete, truncate on public.raid_instance_members from anon, authenticated;

create or replace function public.join_raid_instance(p_raid_id text, p_cycle integer)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  me      uuid := auth.uid();
  v_week  integer := floor(extract(epoch from now()) / 604800)::int;
  v_cap   integer := 100;
  v_txt   text;
  v_guild uuid;
  v_inst  integer;
begin
  if me is null then
    raise exception 'sign in first';
  end if;
  if p_raid_id is null or char_length(p_raid_id) not between 1 and 80 or p_raid_id ~ '[:@]' then
    raise exception 'bad raid id';
  end if;
  if p_cycle is distinct from v_week then
    raise exception 'only this week';
  end if;
  select m.instance into v_inst from public.raid_instance_members m where m.raid_id = p_raid_id and m.cycle = p_cycle and m.owner_id = me;
  if v_inst is not null then return v_inst; end if;
  -- one placement at a time per raid and cycle
  perform pg_advisory_xact_lock(hashtextextended('raid_instance:' || p_raid_id || ':' || p_cycle::text, 0));
  select m.instance into v_inst from public.raid_instance_members m where m.raid_id = p_raid_id and m.cycle = p_cycle and m.owner_id = me;
  if v_inst is not null then return v_inst; end if;
  -- the published raid's instanceCap (the raid editor), else 100; kept to 10..1000
  select o.data->'def'->>'instanceCap' into v_txt from public.card_overrides o where o.id = '__cfg:raid:' || p_raid_id and not o.deleted;
  if v_txt ~ '^[0-9]{1,5}$' then v_cap := greatest(10, least(1000, v_txt::int)); end if;
  select g.guild_id into v_guild from public.guild_members g where g.profile_id = me;
  if v_guild is not null then
    select m.instance into v_inst from public.raid_instance_members m
      where m.raid_id = p_raid_id and m.cycle = p_cycle and m.guild_id = v_guild
        and (select count(*) from public.raid_instance_members x where x.raid_id = p_raid_id and x.cycle = p_cycle and x.instance = m.instance) < v_cap
      order by m.instance limit 1;
  end if;
  if v_inst is null then
    select s.i into v_inst
      from generate_series(1, coalesce((select max(x.instance) from public.raid_instance_members x where x.raid_id = p_raid_id and x.cycle = p_cycle), 0) + 1) as s(i)
      left join (select x.instance, count(*) as n from public.raid_instance_members x where x.raid_id = p_raid_id and x.cycle = p_cycle group by x.instance) c
        on c.instance = s.i
      where coalesce(c.n, 0) < v_cap
      order by s.i limit 1;
  end if;
  insert into public.raid_instance_members (raid_id, cycle, owner_id, instance, guild_id)
    values (p_raid_id, p_cycle, me, v_inst, v_guild)
    on conflict (raid_id, cycle, owner_id) do nothing;
  select m.instance into v_inst from public.raid_instance_members m where m.raid_id = p_raid_id and m.cycle = p_cycle and m.owner_id = me;
  return v_inst;
end;
$$;
revoke all on function public.join_raid_instance(text, integer) from public, anon;
grant execute on function public.join_raid_instance(text, integer) to authenticated;

-- An attempt goes to your own instance only.
create or replace function public.check_raid_attempt_instance() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_raid text;
  v_rest text;
  v_num  text;
  v_inst integer := 1;
  v_mine integer;
begin
  if position(':' in new.boss_id) = 0 then return new; end if;        -- the old weekly bosses: no parts, no instances
  if public.is_app_admin() then return new; end if;                   -- admin_raid_damage and admins' own tests
  v_raid := split_part(new.boss_id, ':', 1);
  v_rest := substr(new.boss_id, char_length(v_raid) + 2);
  v_num  := substring(v_rest from '@([0-9]{1,5})$');
  if v_num is not null then v_inst := v_num::int; end if;
  select m.instance into v_mine from public.raid_instance_members m
    where m.raid_id = v_raid and m.cycle = new.cycle and m.owner_id = new.owner_id;
  if coalesce(v_mine, 1) <> v_inst then
    raise exception 'not your raid instance' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function public.check_raid_attempt_instance() from public, anon, authenticated;
drop trigger if exists check_raid_attempt_instance on public.raid_week_attempts;
create trigger check_raid_attempt_instance before insert on public.raid_week_attempts
  for each row execute function public.check_raid_attempt_instance();
