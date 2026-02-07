-- Grant Admin Access to the specific user
-- IMPORTANT: The email address MUST be enclosed in single quotes ('')
-- Replace 'administracion@magnolia.com' with your actual email if different
UPDATE auth.users
SET raw_user_meta_data = 
  COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'administracion@magnolia.com';

-- Verify the change
SELECT email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'administracion@magnolia.com';
