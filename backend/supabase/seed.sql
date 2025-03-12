-- Seed data for local development

-- Insert test users (will be automatically linked to profiles via trigger)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('2ae89af0-4f41-4a13-a684-f1c3e2d349df', 'test@example.com', '$2a$10$XwSsZZj8NF1ZIGL0a40tNOVDJK.uSPV4ZnjnbPvMuWsj8NvqAiMki', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2', 'restaurant@example.com', '$2a$10$XwSsZZj8NF1ZIGL0a40tNOVDJK.uSPV4ZnjnbPvMuWsj8NvqAiMki', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

-- Wait for trigger to create profiles
DO $$
BEGIN
  PERFORM pg_sleep(1);
END
$$;

-- Update profiles with additional information
UPDATE profiles
SET full_name = 'Test User'
WHERE id = '2ae89af0-4f41-4a13-a684-f1c3e2d349df';

UPDATE profiles
SET full_name = 'Restaurant Owner'
WHERE id = 'a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2';

-- Insert test restaurants
INSERT INTO restaurants (id, owner_id, name, description, address, phone, website, is_active, created_at, updated_at) 
VALUES
  ('b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6', 'a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2', 'Test Restaurant', 'A test restaurant for development', '123 Test Street, Test City', '+123456789', 'https://testrestaurant.com', true, now(), now()),
  ('c7c8c9c0-d7d8-e7e8-f7f8-g7g8h7h8i7i8', 'a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2', 'Another Restaurant', 'Another test restaurant', '456 Development Ave, Test City', '+987654321', 'https://anotherrestaurant.com', true, now(), now());

-- Insert test menus
INSERT INTO menus (id, restaurant_id, name, description, is_active, is_default, created_at, updated_at)
VALUES
  ('d9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0', 'b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6', 'Main Menu', 'Our main food menu', true, true, now(), now()),
  ('e1e2e3e4-f1f2-g1g2-h1h2-i1i2j1j2k1k2', 'b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6', 'Drinks Menu', 'Beverages and cocktails', true, false, now(), now()),
  ('f3f4f5f6-g3g4-h3h4-i3i4-j3j4k3k4l3l4', 'c7c8c9c0-d7d8-e7e8-f7f8-g7g8h7h8i7i8', 'Full Menu', 'Complete food and drink selection', true, true, now(), now());

-- Insert test categories
INSERT INTO categories (id, menu_id, name, description, display_order, is_active, created_at, updated_at)
VALUES
  ('g5g6g7g8-h5h6-i5i6-j5j6-k5k6l5l6m5m6', 'd9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0', 'Appetizers', 'Starters and small plates', 1, true, now(), now()),
  ('h7h8h9h0-i7i8-j7j8-k7k8-l7l8m7m8n7n8', 'd9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0', 'Main Courses', 'Entrees and main dishes', 2, true, now(), now()),
  ('i9i0i1i2-j9j0-k9k0-l9l0-m9m0n9n0o9o0', 'd9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0', 'Desserts', 'Sweet treats', 3, true, now(), now()),
  ('j1j2j3j4-k1k2-l1l2-m1m2-n1n2o1o2p1p2', 'e1e2e3e4-f1f2-g1g2-h1h2-i1i2j1j2k1k2', 'Soft Drinks', 'Non-alcoholic beverages', 1, true, now(), now()),
  ('k3k4k5k6-l3l4-m3m4-n3n4-o3o4p3p4q3q4', 'e1e2e3e4-f1f2-g1g2-h1h2-i1i2j1j2k1k2', 'Cocktails', 'Alcoholic mixed drinks', 2, true, now(), now()),
  ('l5l6l7l8-m5m6-n5n6-o5o6-p5p6q5q6r5r6', 'f3f4f5f6-g3g4-h3h4-i3i4-j3j4k3k4l3l4', 'Popular Items', 'Most ordered dishes', 1, true, now(), now());

-- Insert test items
INSERT INTO items (id, category_id, name, description, price, is_available, display_order, created_at, updated_at)
VALUES
  ('m7m8m9m0-n7n8-o7o8-p7p8-q7q8r7r8s7s8', 'g5g6g7g8-h5h6-i5i6-j5j6-k5k6l5l6m5m6', 'Garlic Bread', 'Toasted bread with garlic butter', 5.99, true, 1, now(), now()),
  ('n9n0n1n2-o9o0-p9p0-q9q0-r9r0s9s0t9t0', 'g5g6g7g8-h5h6-i5i6-j5j6-k5k6l5l6m5m6', 'Nachos', 'Tortilla chips with cheese and toppings', 8.99, true, 2, now(), now()),
  ('o1o2o3o4-p1p2-q1q2-r1r2-s1s2t1t2u1u2', 'h7h8h9h0-i7i8-j7j8-k7k8-l7l8m7m8n7n8', 'Burger', 'Classic beef burger with fries', 12.99, true, 1, now(), now()),
  ('p3p4p5p6-q3q4-r3r4-s3s4-t3t4u3u4v3v4', 'h7h8h9h0-i7i8-j7j8-k7k8-l7l8m7m8n7n8', 'Pasta', 'Spaghetti with tomato sauce', 10.99, true, 2, now(), now()),
  ('q5q6q7q8-r5r6-s5s6-t5t6-u5u6v5v6w5w6', 'i9i0i1i2-j9j0-k9k0-l9l0-m9m0n9n0o9o0', 'Chocolate Cake', 'Rich chocolate layer cake', 6.99, true, 1, now(), now()),
  ('r7r8r9r0-s7s8-t7t8-u7u8-v7v8w7w8x7x8', 'j1j2j3j4-k1k2-l1l2-m1m2-n1n2o1o2p1p2', 'Cola', 'Classic cola drink', 2.99, true, 1, now(), now()),
  ('s9s0s1s2-t9t0-u9u0-v9v0-w9w0x9x0y9y0', 'k3k4k5k6-l3l4-m3m4-n3n4-o3o4p3p4q3q4', 'Margarita', 'Tequila cocktail with lime', 9.99, true, 1, now(), now()),
  ('t1t2t3t4-u1u2-v1v2-w1w2-x1x2y1y2z1z2', 'l5l6l7l8-m5m6-n5n6-o5o6-p5p6q5q6r5r6', 'House Special', 'Chef\'s signature dish', 15.99, true, 1, now(), now());

-- Insert test item options
INSERT INTO item_options (id, item_id, name, price_adjustment, is_active, display_order, created_at, updated_at)
VALUES
  ('u3u4u5u6-v3v4-w3w4-x3x4-y3y4z3z4a3a4', 'o1o2o3o4-p1p2-q1q2-r1r2-s1s2t1t2u1u2', 'Add Cheese', 1.50, true, 1, now(), now()),
  ('v5v6v7v8-w5w6-x5x6-y5y6-z5z6a5a6b5b6', 'o1o2o3o4-p1p2-q1q2-r1r2-s1s2t1t2u1u2', 'Add Bacon', 2.00, true, 2, now(), now()),
  ('w7w8w9w0-x7x8-y7y8-z7z8-a7a8b7b8c7c8', 'p3p4p5p6-q3q4-r3r4-s3s4-t3t4u3u4v3v4', 'Add Meatballs', 3.00, true, 1, now(), now());

-- Insert test subscription
INSERT INTO subscriptions (id, profile_id, restaurant_id, stripe_subscription_id, status, current_period_start, current_period_end, created_at, updated_at)
VALUES
  ('x9x0x1x2-y9y0-z9z0-a9a0-b9b0c9c0d9d0', 'a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2', 'b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6', 'sub_test123456', 'active', now(), now() + interval '1 month', now(), now()); 