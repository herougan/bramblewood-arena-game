-- UIPOLISH1 (2026-11-28, item 10): private multiplayer-dungeon room codes of 4 to 6 characters. PROPOSED, not applied (owner says "apply it").
-- The game pads a short code to 6 with "0" before it reaches coop_rooms (its check wants 6), so nothing here is needed for the feature to work.
-- This only lets a finished room give its code back, so "That code is already taken" does not stay true for a room that is over.
create or replace function public.free_coop_code(p_code text)
returns void
language sql security definer set search_path = ''
as $$
  -- only the caller's own finished (done / closed) room, and only when it has been idle for a minute
  delete from public.coop_rooms
   where code = p_code and host_id = (select auth.uid())
     and status in ('done', 'closed') and updated_at < now() - interval '1 minute';
$$;
revoke all on function public.free_coop_code(text) from public, anon;
grant execute on function public.free_coop_code(text) to authenticated;
