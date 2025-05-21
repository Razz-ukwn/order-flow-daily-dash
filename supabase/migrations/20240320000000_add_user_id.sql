-- Add user_id column to profiles table
ALTER TABLE profiles ADD COLUMN user_id VARCHAR(10) UNIQUE;

-- Create index for faster lookups
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Update existing profiles with sequential IDs
WITH numbered_profiles AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM profiles
)
UPDATE profiles
SET user_id = 'AP' || LPAD(row_num::text, 5, '0')
FROM numbered_profiles
WHERE profiles.id = numbered_profiles.id; 