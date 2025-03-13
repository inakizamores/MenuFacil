// Seed database with test users and data
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('./config');

async function seedDatabase() {
  console.log('MenúFácil - Database Seeding Script');
  console.log('-----------------------------------');
  
  // Use credentials from config file
  const supabaseUrl = SUPABASE_URL;
  const supabaseServiceKey = SUPABASE_SERVICE_KEY;
  
  console.log(`Using Supabase project: ${supabaseUrl}`);
  
  // Create Supabase client with service role key (needed for auth operations)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('\nConnecting to Supabase...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    
    console.log('Connection successful!');
    
    // Read the seed SQL file
    console.log('\nReading seed SQL file...');
    const seedFilePath = path.join(__dirname, '../backend/supabase/seed.sql');
    const seedSQL = fs.readFileSync(seedFilePath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = seedSQL
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .filter(stmt => stmt.trim() !== '');
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    // Execute each statement
    console.log('\nExecuting seed data statements...');
    
    // First create test users
    console.log('\nCreating test users...');
    
    // The password is 'password123' - already hashed in the SQL
    const userResult = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Test User' }
    });
    
    if (userResult.error) {
      console.log(`Error creating test user: ${userResult.error.message}`);
    } else {
      console.log('Created test user: test@example.com');
    }
    
    const restaurantUserResult = await supabase.auth.admin.createUser({
      email: 'restaurant@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Restaurant Owner' }
    });
    
    if (restaurantUserResult.error) {
      console.log(`Error creating restaurant user: ${restaurantUserResult.error.message}`);
    } else {
      console.log('Created restaurant user: restaurant@example.com');
    }
    
    // Get user IDs
    let testUserId = '2ae89af0-4f41-4a13-a684-f1c3e2d349df';
    let restaurantUserId = 'a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2';
    
    try {
      const { data: testUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'test@example.com')
        .single();
        
      if (testUser && testUser.id) {
        testUserId = testUser.id;
      }
    } catch (e) {
      console.log('Could not retrieve test user ID, using predefined UUID');
    }
    
    try {
      const { data: restaurantUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'restaurant@example.com')
        .single();
        
      if (restaurantUser && restaurantUser.id) {
        restaurantUserId = restaurantUser.id;
      }
    } catch (e) {
      console.log('Could not retrieve restaurant user ID, using predefined UUID');
    }
    
    // Create restaurants
    console.log('\nCreating test restaurants...');
    const { error: restError } = await supabase.from('restaurants').insert([
      {
        id: 'b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6',
        owner_id: restaurantUserId,
        name: 'Test Restaurant',
        description: 'A test restaurant for development',
        address: '123 Test Street, Test City',
        phone: '+123456789',
        website: 'https://testrestaurant.com',
        is_active: true
      },
      {
        id: 'c7c8c9c0-d7d8-e7e8-f7f8-g7g8h7h8i7i8',
        owner_id: restaurantUserId,
        name: 'Another Restaurant',
        description: 'Another test restaurant',
        address: '456 Development Ave, Test City',
        phone: '+987654321',
        website: 'https://anotherrestaurant.com',
        is_active: true
      }
    ]);
    
    if (restError) {
      console.log(`Error creating restaurants: ${restError.message}`);
    } else {
      console.log('Created test restaurants');
    }
    
    // Create menus
    console.log('\nCreating test menus...');
    const { error: menuError } = await supabase.from('menus').insert([
      {
        id: 'd9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0',
        restaurant_id: 'b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6',
        name: 'Main Menu',
        description: 'Our main food menu',
        is_active: true,
        is_default: true
      },
      {
        id: 'e1e2e3e4-f1f2-g1g2-h1h2-i1i2j1j2k1k2',
        restaurant_id: 'b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6',
        name: 'Drinks Menu',
        description: 'Beverages and cocktails',
        is_active: true,
        is_default: false
      },
      {
        id: 'f3f4f5f6-g3g4-h3h4-i3i4-j3j4k3k4l3l4',
        restaurant_id: 'c7c8c9c0-d7d8-e7e8-f7f8-g7g8h7h8i7i8',
        name: 'Full Menu',
        description: 'Complete food and drink selection',
        is_active: true,
        is_default: true
      }
    ]);
    
    if (menuError) {
      console.log(`Error creating menus: ${menuError.message}`);
    } else {
      console.log('Created test menus');
    }
    
    // Create categories
    console.log('\nCreating menu categories...');
    const { error: catError } = await supabase.from('categories').insert([
      {
        id: 'g5g6g7g8-h5h6-i5i6-j5j6-k5k6l5l6m5m6',
        menu_id: 'd9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0',
        name: 'Appetizers',
        description: 'Starters and small plates',
        display_order: 1,
        is_active: true
      },
      {
        id: 'h7h8h9h0-i7i8-j7j8-k7k8-l7l8m7m8n7n8',
        menu_id: 'd9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0',
        name: 'Main Courses',
        description: 'Entrees and main dishes',
        display_order: 2,
        is_active: true
      },
      {
        id: 'i9i0i1i2-j9j0-k9k0-l9l0-m9m0n9n0o9o0',
        menu_id: 'd9d0d1d2-e9e0-f9f0-g9g0-h9h0i9i0j9j0',
        name: 'Desserts',
        description: 'Sweet treats',
        display_order: 3,
        is_active: true
      },
      {
        id: 'j1j2j3j4-k1k2-l1l2-m1m2-n1n2o1o2p1p2',
        menu_id: 'e1e2e3e4-f1f2-g1g2-h1h2-i1i2j1j2k1k2',
        name: 'Soft Drinks',
        description: 'Non-alcoholic beverages',
        display_order: 1,
        is_active: true
      },
      {
        id: 'k3k4k5k6-l3l4-m3m4-n3n4-o3o4p3p4q3q4',
        menu_id: 'e1e2e3e4-f1f2-g1g2-h1h2-i1i2j1j2k1k2',
        name: 'Cocktails',
        description: 'Alcoholic mixed drinks',
        display_order: 2,
        is_active: true
      },
      {
        id: 'l5l6l7l8-m5m6-n5n6-o5o6-p5p6q5q6r5r6',
        menu_id: 'f3f4f5f6-g3g4-h3h4-i3i4-j3j4k3k4l3l4',
        name: 'Popular Items',
        description: 'Most ordered dishes',
        display_order: 1,
        is_active: true
      }
    ]);
    
    if (catError) {
      console.log(`Error creating categories: ${catError.message}`);
    } else {
      console.log('Created menu categories');
    }
    
    // Create items
    console.log('\nCreating menu items...');
    const { error: itemError } = await supabase.from('items').insert([
      {
        id: 'm7m8m9m0-n7n8-o7o8-p7p8-q7q8r7r8s7s8',
        category_id: 'g5g6g7g8-h5h6-i5i6-j5j6-k5k6l5l6m5m6',
        name: 'Garlic Bread',
        description: 'Toasted bread with garlic butter',
        price: 5.99,
        is_available: true,
        display_order: 1
      },
      {
        id: 'n9n0n1n2-o9o0-p9p0-q9q0-r9r0s9s0t9t0',
        category_id: 'g5g6g7g8-h5h6-i5i6-j5j6-k5k6l5l6m5m6',
        name: 'Nachos',
        description: 'Tortilla chips with cheese and toppings',
        price: 8.99,
        is_available: true,
        display_order: 2
      },
      {
        id: 'o1o2o3o4-p1p2-q1q2-r1r2-s1s2t1t2u1u2',
        category_id: 'h7h8h9h0-i7i8-j7j8-k7k8-l7l8m7m8n7n8',
        name: 'Burger',
        description: 'Classic beef burger with fries',
        price: 12.99,
        is_available: true,
        display_order: 1
      },
      {
        id: 'p3p4p5p6-q3q4-r3r4-s3s4-t3t4u3u4v3v4',
        category_id: 'h7h8h9h0-i7i8-j7j8-k7k8-l7l8m7m8n7n8',
        name: 'Pasta',
        description: 'Spaghetti with tomato sauce',
        price: 10.99,
        is_available: true,
        display_order: 2
      },
      {
        id: 'q5q6q7q8-r5r6-s5s6-t5t6-u5u6v5v6w5w6',
        category_id: 'i9i0i1i2-j9j0-k9k0-l9l0-m9m0n9n0o9o0',
        name: 'Chocolate Cake',
        description: 'Rich chocolate layer cake',
        price: 6.99,
        is_available: true,
        display_order: 1
      },
      {
        id: 'r7r8r9r0-s7s8-t7t8-u7u8-v7v8w7w8x7x8',
        category_id: 'j1j2j3j4-k1k2-l1l2-m1m2-n1n2o1o2p1p2',
        name: 'Cola',
        description: 'Classic cola drink',
        price: 2.99,
        is_available: true,
        display_order: 1
      },
      {
        id: 's9s0s1s2-t9t0-u9u0-v9v0-w9w0x9x0y9y0',
        category_id: 'k3k4k5k6-l3l4-m3m4-n3n4-o3o4p3p4q3q4',
        name: 'Margarita',
        description: 'Tequila cocktail with lime',
        price: 9.99,
        is_available: true,
        display_order: 1
      },
      {
        id: 't1t2t3t4-u1u2-v1v2-w1w2-x1x2y1y2z1z2',
        category_id: 'l5l6l7l8-m5m6-n5n6-o5o6-p5p6q5q6r5r6',
        name: 'House Special',
        description: 'Chef\'s signature dish',
        price: 15.99,
        is_available: true,
        display_order: 1
      }
    ]);
    
    if (itemError) {
      console.log(`Error creating menu items: ${itemError.message}`);
    } else {
      console.log('Created menu items');
    }
    
    // Create item options
    console.log('\nCreating item options...');
    const { error: optError } = await supabase.from('item_options').insert([
      {
        id: 'u3u4u5u6-v3v4-w3w4-x3x4-y3y4z3z4a3a4',
        item_id: 'o1o2o3o4-p1p2-q1q2-r1r2-s1s2t1t2u1u2',
        name: 'Add Cheese',
        price_adjustment: 1.50,
        is_active: true,
        display_order: 1
      },
      {
        id: 'v5v6v7v8-w5w6-x5x6-y5y6-z5z6a5a6b5b6',
        item_id: 'o1o2o3o4-p1p2-q1q2-r1r2-s1s2t1t2u1u2',
        name: 'Add Bacon',
        price_adjustment: 2.00,
        is_active: true,
        display_order: 2
      },
      {
        id: 'w7w8w9w0-x7x8-y7y8-z7z8-a7a8b7b8c7c8',
        item_id: 'p3p4p5p6-q3q4-r3r4-s3s4-t3t4u3u4v3v4',
        name: 'Add Meatballs',
        price_adjustment: 3.00,
        is_active: true,
        display_order: 1
      }
    ]);
    
    if (optError) {
      console.log(`Error creating item options: ${optError.message}`);
    } else {
      console.log('Created item options');
    }
    
    // Add subscription
    console.log('\nCreating test subscription...');
    const { error: subError } = await supabase.from('subscriptions').insert([
      {
        id: 'x9x0x1x2-y9y0-z9z0-a9a0-b9b0c9c0d9d0',
        profile_id: restaurantUserId,
        restaurant_id: 'b5b6b7b8-c5c6-d5d6-e5e6-f5f6g5g6h5h6',
        stripe_subscription_id: 'sub_test123456',
        status: 'active',
        current_period_start: new Date(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]);
    
    if (subError) {
      console.log(`Error creating subscription: ${subError.message}`);
    } else {
      console.log('Created test subscription');
    }
    
    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest users created:');
    console.log('1. Restaurant Owner: restaurant@example.com / password123');
    console.log('2. Test User: test@example.com / password123');
    
  } catch (err) {
    console.error('\n❌ Error during seeding:', err.message);
  }
}

// Run the function
seedDatabase(); 