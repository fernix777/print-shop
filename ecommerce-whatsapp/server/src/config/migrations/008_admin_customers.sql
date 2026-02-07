-- Ensure profiles table exists (it should, but just in case of fresh setup)
-- We assume it has id, email, full_name, etc.
-- If it exists, we just ensure policies.

-- Policy for Admins to read all profiles
-- Drop existing policy if name conflicts (optional, but safer to just create if not exists or use different name)
-- We can't easily check if policy exists in pure SQL without PL/pgSQL, so we'll just try to create it.
-- Or better, just enable RLS and add the policy.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles"
        ON profiles
        FOR SELECT
        USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'profiles'
        AND policyname = 'Admins can update all profiles'
    ) THEN
        CREATE POLICY "Admins can update all profiles"
        ON profiles
        FOR UPDATE
        USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
    END IF;
END
$$;
