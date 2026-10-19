-- PROPOSED 2026-10-19 (package RB, raid balance). NOT APPLIED. Apply only on the owner's "apply it". Idempotent: safe to run twice.
-- Owner 12:23: "I think cap the amount of participants to 250 players. (to give allowance for weaker players)."
--
-- What it changes: join_raid_instance's default instance size, 100 -> 250 (the players placed in one instance of a raid each cycle
-- before the next instance opens). Nothing else: the function is the one in supabase/migrations/20261019_raid_ops.sql (applied
-- 2026-10-19 08:12) with only `v_cap integer := 250` and its comment changed. The published raid's instanceCap (the raid editor's
-- "Players per instance", card_overrides '__cfg:raid:<id>' data->'def'->>'instanceCap') still wins when it is set, kept to 10..1000, so
-- publishing the Goliath with instanceCap 250 (canonical/raids.json has it now) does the same without this file; this file makes 250
-- the default for a raid published without the key. Players already placed this cycle keep their instance.
-- The client (bramblewood-raid.js INSTANCE_CAP_DEFAULT, canonical/raids.json instanceCap) is 250 already.
-- Not changed here: raid_week_attempts' damage check (0..10000). A fight now counts at most 2,000 (a win: 1,000 x the SSS rank's 2.0),
-- so the check could tighten to 0..2000 for rows with a part, but admin_raid_damage writes rows of up to 10,000 and would have to
-- change with it: an owner call.

create or replace function public.join_raid_instance(p_raid_id text, p_cycle integer)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  me      uuid := auth.uid();
  v_week  integer := floor(extract(epoch from now()) / 604800)::int;
  v_cap   integer := 250;   -- 2026-10-19 (package RB): was 100
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
  -- the published raid's instanceCap (the raid editor), else 250 (was 100); kept to 10..1000
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
