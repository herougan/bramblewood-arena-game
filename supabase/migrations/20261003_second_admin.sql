-- 2026-10-03: second admin account (requested by the owner).
insert into public.app_admins(user_id) select id from auth.users where lower(email) = 'jayzhang.here@gmail.com' on conflict do nothing;
