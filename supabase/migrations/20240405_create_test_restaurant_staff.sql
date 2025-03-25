-- Create a test restaurant and ensure staff association for testing
-- This migration ensures the test restaurant for limited user exists

-- Get the IDs of our test users
DO $$
DECLARE
    owner_id UUID;
    limited_user_id UUID;
    test_restaurant_id UUID;
BEGIN
    -- Get the owner ID
    SELECT id INTO owner_id FROM auth.users WHERE email = 'owner@testrestaurant.com';
    
    -- Get the limited user ID
    SELECT id INTO limited_user_id FROM auth.users WHERE email = 'limited@menufacil.app';
    
    -- Only proceed if both users exist
    IF owner_id IS NOT NULL AND limited_user_id IS NOT NULL THEN
        -- Check if test restaurant exists for the owner
        SELECT id INTO test_restaurant_id 
        FROM restaurants 
        WHERE owner_id = owner_id AND name = 'Test Restaurant';
        
        -- Create the test restaurant if it doesn't exist
        IF test_restaurant_id IS NULL THEN
            INSERT INTO restaurants (
                name, 
                description, 
                owner_id,
                address,
                city,
                state,
                postal_code,
                country,
                phone,
                email,
                created_at,
                updated_at
            ) VALUES (
                'Test Restaurant',
                'This is a test restaurant for demonstration purposes',
                owner_id,
                '123 Test Street',
                'Test City',
                'Test State',
                '12345',
                'Test Country',
                '+1234567890',
                'contact@testrestaurant.com',
                NOW(),
                NOW()
            )
            RETURNING id INTO test_restaurant_id;
            
            -- Log restaurant creation
            RAISE NOTICE 'Created test restaurant with ID %', test_restaurant_id;
        ELSE
            RAISE NOTICE 'Test restaurant already exists with ID %', test_restaurant_id;
        END IF;
        
        -- Update the limited user's profile to point to the test restaurant
        UPDATE profiles
        SET 
            linked_restaurant_id = test_restaurant_id,
            parent_user_id = owner_id
        WHERE id = limited_user_id;
        
        -- Ensure restaurant_staff record exists
        IF NOT EXISTS (
            SELECT 1 FROM restaurant_members 
            WHERE user_id = limited_user_id AND restaurant_id = test_restaurant_id
        ) THEN
            -- Create restaurant member record for limited user
            INSERT INTO restaurant_members (
                restaurant_id,
                user_id,
                role,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                test_restaurant_id,
                limited_user_id,
                'editor', -- Staff gets editor role by default
                TRUE,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Created restaurant member record for limited user';
        ELSE
            RAISE NOTICE 'Restaurant member record already exists for limited user';
        END IF;
    ELSE
        RAISE NOTICE 'One or both test users do not exist. Owner ID: %, Limited User ID: %', owner_id, limited_user_id;
    END IF;
END
$$; 