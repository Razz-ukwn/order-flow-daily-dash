/*
  # Fix recursive profiles policies

  1. Changes
    - Drop existing problematic policies that cause recursion
    - Create new non-recursive policies for profiles table
    
  2. Security
    - Maintain same level of access control but without recursion
    - Admin users can still manage all profiles
    - Users can view their own profiles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profiles" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Enable read access for users to their own profile"
ON profiles FOR SELECT
TO public
USING (auth.uid() = id);

CREATE POLICY "Enable update access for users to their own profile"
ON profiles FOR UPDATE
TO public
USING (auth.uid() = id);

CREATE POLICY "Enable admin read access to all profiles"
ON profiles FOR SELECT
TO public
USING (
  auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Enable admin update access to all profiles"
ON profiles FOR UPDATE
TO public
USING (
  auth.jwt() ->> 'role' = 'admin'
);