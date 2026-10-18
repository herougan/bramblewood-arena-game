-- APPLIED 2026-10-18 (the user: "Apply it for admin raid damage SQL"). Drafted 2026-10-17, the user, 23:49: "let an admin do damage to a raid (10%, 50% damage)"). Apply only on "apply it".
-- The raid tab's Admin buttons (💥 Deal 10% / 💥 Deal 50%, arena_app.js adminRaidDamage) call this. Until it is applied the buttons
-- fall back to a local attempt in that browser only.
--
-- The weekly raid's shared health is the sum of raid_week_attempts rows (one per fight, damage 0..10000 each, insert as yourself for
-- this or last week's cycle). An admin's 10% of the Goliath is 136,000, so this writes the amount as rows of at most 10,000 under the
-- admin's own id with display_name 'Admin', for this week's or last week's cycle only. It does not touch decrement_raid_boss_hp,
-- raid_hit_log or raid_bosses (the hidden Online Raid) and changes no existing function or policy.
create or replace function public.admin_raid_damage(p_boss_id text, p_cycle integer, p_amount integer)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  me uuid := auth.uid();
  v_week integer := floor(extract(epoch from now()) / 604800)::int;
  v_left integer := greatest(0, least(coalesce(p_amount, 0), 20000000));
  v_rows integer := 0;
  v_chunk integer;
begin
  if me is null or not public.is_app_admin() then
    raise exception 'admins only';
  end if;
  if p_boss_id is null or char_length(p_boss_id) > 120 then
    raise exception 'bad raid part';
  end if;
  if p_cycle is null or p_cycle < v_week - 1 or p_cycle > v_week then
    raise exception 'only this week or last week';
  end if;
  while v_left > 0 and v_rows < 2000 loop
    v_chunk := least(10000, v_left);
    insert into public.raid_week_attempts (boss_id, cycle, owner_id, display_name, deck, damage, won)
      values (p_boss_id, p_cycle, me, 'Admin', '{}'::jsonb, v_chunk, false);
    v_left := v_left - v_chunk;
    v_rows := v_rows + 1;
  end loop;
  return v_rows;
end;
$$;
revoke all on function public.admin_raid_damage(text, integer, integer) from public, anon;
grant execute on function public.admin_raid_damage(text, integer, integer) to authenticated;
