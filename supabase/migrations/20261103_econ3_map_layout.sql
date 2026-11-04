-- 2026-11-03 (package ECON3, ECON2-10; owner 20:34 "ECON2-10 OK"). APPLIED 2026-11-04 (owner 22:34 "Apply it to ECON3 yourself"; run via the Supabase connector, verified: m11 11-9 (52,12), m7 7-2 (38,24), me 20-A-2 (40,24), mpd 18-A-7 (40,52)).
-- Four fights that sit in a published map layout (a __cfg:map-layout row wins over the game's fixedPos) move: two apart from a
-- neighbour (no two tap targets on a map closer than 7% of the canvas), two out from under the full title panel a map shows on its
-- first look (tests/e2e/econ3_2026_11_03.py). The moves and their reasons: supabase/proposed/20261103_econ3_map_layout.json. Each
-- update only fires while the row still holds the old position (an admin who has moved the fight since keeps their spot).
--   The Sundered Peak (m11): 20-3, stored under its old key 11-9, (40, 15) -> (52, 12)
--   The Pale Desert (mpd): 18-A-7 (44.8, 45) -> (40, 52)
--   Coral Current (m7): 10-2, stored under its old key 7-2, (35, 15) -> (38, 24)
--   Eye of the Volcano (me): 20-A-2 (40, 15) -> (40, 24)
begin;
update card_overrides
   set data = jsonb_set(data, '{positions,7-2}', (data #> '{positions,7-2}') || '{"x": 38, "y": 24}'::jsonb), updated_at = now()
 where id = '__cfg:map-layout:m7'
   and (data #>> '{positions,7-2,x}')::numeric = 35 and (data #>> '{positions,7-2,y}')::numeric = 15;
update card_overrides
   set data = jsonb_set(data, '{positions,20-A-2}', (data #> '{positions,20-A-2}') || '{"x": 40, "y": 24}'::jsonb), updated_at = now()
 where id = '__cfg:map-layout:me'
   and (data #>> '{positions,20-A-2,x}')::numeric = 40 and (data #>> '{positions,20-A-2,y}')::numeric = 15;
update card_overrides
   set data = jsonb_set(data, '{positions,11-9}', (data #> '{positions,11-9}') || '{"x": 52, "y": 12}'::jsonb), updated_at = now()
 where id = '__cfg:map-layout:m11'
   and (data #>> '{positions,11-9,x}')::numeric = 40 and (data #>> '{positions,11-9,y}')::numeric = 15;
update card_overrides
   set data = jsonb_set(data, '{positions,18-A-7}', (data #> '{positions,18-A-7}') || '{"x": 40, "y": 52}'::jsonb), updated_at = now()
 where id = '__cfg:map-layout:mpd'
   and (data #>> '{positions,18-A-7,x}')::numeric = 44.8 and (data #>> '{positions,18-A-7,y}')::numeric = 45;
commit;
-- Check (read-only):
-- select id, data #> '{positions,11-9}' as m11_20_3, null as mpd from card_overrides where id = '__cfg:map-layout:m11'
-- union all select id, null, data #> '{positions,18-A-7}' from card_overrides where id = '__cfg:map-layout:mpd';
