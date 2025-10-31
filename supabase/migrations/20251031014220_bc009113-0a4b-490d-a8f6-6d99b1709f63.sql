-- Phase 1: Clean up duplicate 'applicant' roles from UAT accounts
-- Only remove 'applicant' role if user has other active roles
DELETE FROM public.user_roles
WHERE role = 'applicant'
  AND user_id IN (
    SELECT ur1.user_id
    FROM public.user_roles ur1
    WHERE ur1.role = 'applicant'
      AND EXISTS (
        SELECT 1 
        FROM public.user_roles ur2 
        WHERE ur2.user_id = ur1.user_id 
          AND ur2.role != 'applicant'
          AND ur2.is_active = true
      )
  );

-- Phase 2: Update handle_new_user() trigger to remove auto-assignment of 'applicant' role
-- This prevents all new users from automatically getting 'applicant' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  
  -- Note: Role assignment is now handled explicitly by admin users or seeding functions
  -- No default role is assigned to prevent unintended access escalation
  
  RETURN new;
END;
$$;