-- Add system-wide user roles to distinguish between platform admins and regular users
CREATE TYPE system_role AS ENUM ('system_admin', 'restaurant_owner', 'restaurant_staff');

-- Alter profiles table to add role column
ALTER TABLE profiles 
ADD COLUMN role system_role NOT NULL DEFAULT 'restaurant_owner';

-- Add a parent_user_id column to profiles to track the relationship between restaurant owners and staff
ALTER TABLE profiles 
ADD COLUMN parent_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add a restaurant_id column to staff profiles to link them to specific restaurants
ALTER TABLE profiles 
ADD COLUMN linked_restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL;

-- Create an index for faster lookups
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_parent_user_id ON profiles(parent_user_id);
CREATE INDEX idx_profiles_linked_restaurant_id ON profiles(linked_restaurant_id);

-- Update existing admin test user to have system_admin role
UPDATE profiles 
SET role = 'system_admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'test@menufacil.app'
);

-- Update existing restaurant owner to have restaurant_owner role (already default, but explicit)
UPDATE profiles 
SET role = 'restaurant_owner' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'owner@testrestaurant.com'
);

-- Update existing limited user to have restaurant_staff role
UPDATE profiles 
SET role = 'restaurant_staff' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'limited@menufacil.app'
);

-- Create a function to automatically add user role to user_metadata
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auth.users metadata with role information
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', NEW.role)
      ELSE
        raw_user_meta_data || jsonb_build_object('role', NEW.role)
    END
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to sync profile role to user metadata when profile is created or updated
CREATE TRIGGER trigger_sync_user_role
AFTER INSERT OR UPDATE OF role ON profiles
FOR EACH ROW
EXECUTE FUNCTION sync_user_role(); 