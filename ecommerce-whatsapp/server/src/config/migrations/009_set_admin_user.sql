-- 1. Grant Admin Access to the specific user
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'administracion@magnolia.com';

-- 2. Revoke Admin Access from everyone else (Set to 'customer')
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "customer"}'::jsonb
WHERE email != 'administracion@magnolia.com';

-- Optional: Verify the change
-- SELECT email, raw_user_meta_data->>'role' as role FROM auth.users;
