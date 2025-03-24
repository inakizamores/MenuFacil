const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixTestUser() {
  console.log('Fixing test user...');
  
  try {
    // First try to delete the existing test user if it exists
    const { data: userData } = await supabase.auth.admin.listUsers();
    
    if (userData && userData.users) {
      const testUser = userData.users.find(user => user.email === 'test@menufacil.app');
      
      if (testUser) {
        console.log(`Found existing test user with ID: ${testUser.id}, attempting to delete...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(testUser.id);
        
        if (deleteError) {
          console.error('Error deleting user:', deleteError.message);
        } else {
          console.log('User deleted successfully');
        }
      }
    }
    
    // Create new test user
    console.log('Creating fresh test user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'test@menufacil.app',
      password: 'test123456',
      email_confirm: true
    });
    
    if (createError) {
      console.error('Error creating user:', createError.message);
      return;
    }
    
    console.log('Test user created successfully with ID:', newUser.user.id);
    
    // Also create restaurant owner user
    const { data: ownerUser, error: ownerError } = await supabase.auth.admin.createUser({
      email: 'owner@testrestaurant.com',
      password: 'owner123456',
      email_confirm: true
    });
    
    if (ownerError) {
      console.error('Error creating owner user:', ownerError.message);
    } else {
      console.log('Owner user created successfully');
    }
    
    // Create limited user
    const { data: limitedUser, error: limitedError } = await supabase.auth.admin.createUser({
      email: 'limited@menufacil.app',
      password: 'limited123456',
      email_confirm: true
    });
    
    if (limitedError) {
      console.error('Error creating limited user:', limitedError.message);
    } else {
      console.log('Limited user created successfully');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

fixTestUser()
  .then(() => console.log('User fix operation completed'))
  .catch(err => console.error('Error:', err.message)); 