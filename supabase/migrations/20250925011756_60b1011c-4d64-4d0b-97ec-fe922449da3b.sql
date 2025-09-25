-- Create SECURITY DEFINER function to check if any active admin exists
create or replace function public.admin_user_exists()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where role = 'admin'::app_role
      and is_active = true
  );
$$;