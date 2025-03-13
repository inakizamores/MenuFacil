// Script to sign up test users for MenúFácil
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_ANON_KEY } = require('./config');

async function signUpTestUsers() {
  console.log('MenúFácil - Test User Signup Script');
  console.log('----------------------------------');
  
  // Use credentials from config file
  const supabaseUrl = SUPABASE_URL;
  const supabaseAnonKey = SUPABASE_ANON_KEY;
  
  console.log(`Using Supabase project: ${supabaseUrl}`);
  
  // Create Supabase client with anonymous key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('\nConnecting to Supabase...');
  
  try {
    // Sign up regular test user
    console.log('\nSigning up regular test user...');
    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (userError) {
      console.log(`Error signing up test user: ${userError.message}`);
    } else if (userData) {
      console.log('Signed up test user: test@example.com');
    }
    
    // Sign up restaurant owner user
    console.log('\nSigning up restaurant owner user...');
    const { data: restaurantUserData, error: restaurantUserError } = await supabase.auth.signUp({
      email: 'restaurant@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Restaurant Owner'
        }
      }
    });
    
    if (restaurantUserError) {
      console.log(`Error signing up restaurant owner user: ${restaurantUserError.message}`);
    } else if (restaurantUserData) {
      console.log('Signed up restaurant owner user: restaurant@example.com');
    }
    
    console.log('\n✅ Test user signup completed!');
    console.log('\nYou can now log in with:');
    console.log('1. Restaurant Owner: restaurant@example.com / password123');
    console.log('2. Test User: test@example.com / password123');
    
  } catch (err) {
    console.error('\n❌ Error during user signup:', err.message);
  }
}

// Run the function
signUpTestUsers(); 