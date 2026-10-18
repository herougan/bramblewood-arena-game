-- APPLIED 2026-10-18 15:05 (owner: "19) okay"). Drafted by R3-WP3 network feedback.
-- Why: createGuild (arena_app.js) inserts the guild row, then the founder's owner row in guild_members. If the second
-- insert fails, the client now tries to delete the guild it just made, so no ownerless guild keeps the name. The live
-- policies (read 2026-10-18) allow SELECT and INSERT on public.guilds but have NO delete policy, so that delete removes
-- nothing today and the founder is told to re-join the guild from the list instead (joinGuild joins a founder as owner).
-- This lets a guild's creator delete it while it has no members, which is exactly that clean-up case and nothing more.
create policy "guilds delete own empty" on public.guilds
  for delete to authenticated
  using (
    auth.uid() = created_by
    and not exists (select 1 from public.guild_members m where m.guild_id = guilds.id)
  );
