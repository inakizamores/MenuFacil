-- Create a test user if it doesn't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, raw_app_meta_data, raw_user_meta_data)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'test@menufacil.app', 
   crypt('test123456', gen_salt('bf')), 
   now(), 'authenticated', 
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Test User"}'
  )
ON CONFLICT (id) DO NOTHING;

-- Create a profile for the test user
INSERT INTO public.profiles (id, user_id, first_name, last_name, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Test', 'User', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- Create a sample restaurant for testing
INSERT INTO public.restaurants (id, name, owner_id, address, phone, email, logo_url, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Test Restaurant', '00000000-0000-0000-0000-000000000001', 
   '123 Test Street', '+1234567890', 'contact@testrestaurant.com', 
   null, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Get the restaurant ID we just created
DO $$
DECLARE
  restaurant_id uuid;
BEGIN
  SELECT id INTO restaurant_id FROM public.restaurants 
  WHERE owner_id = '00000000-0000-0000-0000-000000000001'
  LIMIT 1;
  
  -- Create a sample menu
  INSERT INTO public.menus (id, restaurant_id, name, description, is_published, created_at, updated_at, slug)
  VALUES 
    (gen_random_uuid(), restaurant_id, 'Sample Menu', 'A test menu', false, now(), now(), 'sample-menu')
  ON CONFLICT (id) DO NOTHING;
END $$;
