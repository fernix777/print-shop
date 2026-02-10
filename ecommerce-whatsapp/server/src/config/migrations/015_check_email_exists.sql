-- Function to check if an email already exists
-- Returns true if email exists, false otherwise
-- SECURITY DEFINER allows unauthenticated users to call this (public execution)
-- but inside it runs with privileges to check the table.

DROP FUNCTION IF EXISTS check_email_exists(text);

CREATE OR REPLACE FUNCTION check_email_exists(email_input text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_input
  ) INTO user_exists;
  
  RETURN user_exists;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to public (anon key)
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO service_role;
