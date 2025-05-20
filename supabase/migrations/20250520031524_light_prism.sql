/*
  # Fix Profile Policies

  1. Changes
    - Remove recursive policies
    - Add new role-based policies using JWT claims
    - Add proper error handling for policy changes
  
  2. Security
    - Enable RLS
    - Add policies for read/write access
    - Separate user and admin policies
*/

-- Wrap in anonymous block for better error handling
DO $$ 
BEGIN
  -- Disable RLS temporarily to avoid conflicts while updating policies
  ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;
  DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;

  -- Re-enable RLS
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- Create new non-recursive policies
  CREATE POLICY "Enable read access for users to their own profile"
    ON profiles 
    FOR SELECT
    TO public
    USING (auth.uid() = id);

  CREATE POLICY "Enable update access for users to their own profile"
    ON profiles 
    FOR UPDATE
    TO public
    USING (auth.uid() = id);

  CREATE POLICY "Enable admin read access to all profiles"
    ON profiles 
    FOR SELECT
    TO public
    USING (
      COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') = 'admin'
    );

  CREATE POLICY "Enable admin update access to all profiles"
    ON profiles 
    FOR UPDATE
    TO public
    USING (
      COALESCE(current_setting('request.jwt.claims', true)::json->>'role', '') = 'admin'
    );

END $$;