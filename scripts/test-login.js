// Script to test login with test users for MenúFácil
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('./config');

async function testLogin() {
  console.log('MenúFácil - Test Login Script');
  console.log('----------------------------');
  
  // Use credentials from config file
  const supabaseUrl = SUPABASE_URL;
  const supabaseAnonKey = SUPABASE_ANON_KEY;
  
  console.log(`Using Supabase project: ${supabaseUrl}`);
  
  // Create Supabase client with anonymous key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('\nConnecting to Supabase...');
  
  try {
    // Test login with test user
    console.log('\nTesting login with test user...');
    const { data: testUserData, error: testUserError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });
    
    if (testUserError) {
      console.log(`⚠️ Error logging in as test user: ${testUserError.message}`);
    } else if (testUserData && testUserData.user) {
      console.log('✅ Successfully logged in as test user');
      console.log(`User details: ${JSON.stringify({
        id: testUserData.user.id,
        email: testUserData.user.email,
        role: testUserData.user.role
      }, null, 2)}`);
    }
    
    // Test login with restaurant owner user
    console.log('\nTesting login with restaurant owner user...');
    const { data: restaurantUserData, error: restaurantUserError } = await supabase.auth.signInWithPassword({
      email: 'restaurant@example.com',
      password: 'password123'
    });
    
    if (restaurantUserError) {
      console.log(`⚠️ Error logging in as restaurant owner user: ${restaurantUserError.message}`);
    } else if (restaurantUserData && restaurantUserData.user) {
      console.log('✅ Successfully logged in as restaurant owner user');
      console.log(`User details: ${JSON.stringify({
        id: restaurantUserData.user.id,
        email: restaurantUserData.user.email,
        role: restaurantUserData.user.role
      }, null, 2)}`);
    }
    
    // Check if test users exist in the database
    if (!testUserError || !restaurantUserError) {
      console.log('\nTest users are available and working!');
      console.log('\nYou can now log in to the application with:');
      console.log('1. Restaurant Owner: restaurant@example.com / password123');
      console.log('2. Test User: test@example.com / password123');
    } else {
      console.log('\n⚠️ Some test users are not available. You may need to create them in the Supabase dashboard.');
    }
    
  } catch (err) {
    console.error('\n❌ Error during login test:', err.message);
  }
}

// Run the function
testLogin(); 