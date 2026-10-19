-- PROPOSED, NOT APPLIED (2026-10-19, package RC, owner 09:53: "Raids almost never give raid cards. only maybe pack cards or faction
-- cards (maybe), raid cards must be crafted in the Forge. Under a special tab.").
--
-- Each raid now pays its own crafting material, trophy shards (one kind per raid), which the Forge's Raid tab spends with Magic Dust
-- and Maple Leaves on that raid's cards. The client keeps them in myCurrencies.raidShards ({"goliath": 12, ...}) and, once this
-- column exists, sends them with the rest of the currency row (cloudPushCurrencies) and reads them back (cloudPullState). Until it is
-- applied the server answers "column raid_shards does not exist" once, and the client sends the row without it from then on that
-- session (shards stay in this browser only, like Kibble and Beer).
--
-- Review before applying: the guard_currency_write / gain-budget triggers (20261017_currency_insert_cap_and_gain_budgets.sql) do not
-- look at this column, so a client could write any shard count. A per-write cap is added here (no raid may grow by more than
-- 200 shards in one write, about 15 falls' worth for a Leading participant); tighten or move the grant server-side later.

alter table public.player_currencies
  add column if not exists raid_shards jsonb not null default '{}'::jsonb;

alter table public.player_currencies
  drop constraint if exists player_currencies_raid_shards_object;
alter table public.player_currencies
  add constraint player_currencies_raid_shards_object check (jsonb_typeof(raid_shards) = 'object');

create or replace function public.guard_raid_shards() returns trigger
language plpgsql as $$
declare k text; v_new numeric; v_old numeric;
begin
  for k in select jsonb_object_keys(coalesce(new.raid_shards, '{}'::jsonb)) loop
    if jsonb_typeof(new.raid_shards -> k) <> 'number' then raise exception 'raid_shards.% must be a number', k; end if;
    v_new := (new.raid_shards ->> k)::numeric;
    if v_new < 0 or v_new <> floor(v_new) then raise exception 'raid_shards.% must be a whole number >= 0', k; end if;
    v_old := coalesce((case when tg_op = 'UPDATE' then (old.raid_shards ->> k)::numeric end), 0);
    if v_new - v_old > 200 then raise exception 'raid_shards.% grew by more than 200 in one write', k; end if;
  end loop;
  return new;
end $$;

drop trigger if exists guard_raid_shards on public.player_currencies;
create trigger guard_raid_shards before insert or update of raid_shards on public.player_currencies
  for each row execute function public.guard_raid_shards();
