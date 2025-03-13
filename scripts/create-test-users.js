// Script to create test users for MenúFácil
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('./config');

async function createTestUsers() {
  console.log('MenúFácil - Test User Creation Script');
  console.log('------------------------------------');
  
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
    
    // First create test users
    console.log('\nCreating test users...');
    
    // Create regular test user
    console.log('Creating regular test user...');
    const userResult = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Test User' }
    });
    
    if (userResult.error) {
      if (userResult.error.message.includes('already exists')) {
        console.log('Test user already exists: test@example.com');
      } else {
        console.log(`Error creating test user: ${userResult.error.message}`);
      }
    } else {
      console.log('Created test user: test@example.com');
    }
    
    // Create restaurant owner user
    console.log('Creating restaurant owner user...');
    const restaurantUserResult = await supabase.auth.admin.createUser({
      email: 'restaurant@example.com',
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'Restaurant Owner' }
    });
    
    if (restaurantUserResult.error) {
      if (restaurantUserResult.error.message.includes('already exists')) {
        console.log('Restaurant owner user already exists: restaurant@example.com');
      } else {
        console.log(`Error creating restaurant owner user: ${restaurantUserResult.error.message}`);
      }
    } else {
      console.log('Created restaurant owner user: restaurant@example.com');
    }
    
    console.log('\n✅ Test user creation completed!');
    console.log('\nYou can now log in with:');
    console.log('1. Restaurant Owner: restaurant@example.com / password123');
    console.log('2. Test User: test@example.com / password123');
    
  } catch (err) {
    console.error('\n❌ Error during user creation:', err.message);
  }
}

// Run the function
createTestUsers(); 