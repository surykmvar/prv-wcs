
-- Grant 'admin' role to the user with the provided email.
-- This will insert only if a user with that email exists and will not duplicate if already admin.

insert into public.user_roles (user_id, role)
select au.id, 'admin'::public.app_role
from auth.users au
where lower(au.email) = lower('surykmvar@gmail.com')
on conflict (user_id, role) do nothing;
