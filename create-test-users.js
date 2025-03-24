const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestUser() {
  console.log('Creating test users...');
  
  // Create admin user
  const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
    email: 'test@menufacil.app',
    password: 'test123456',
    email_confirm: true,
    user_metadata: { full_name: 'Test User' }
  });
  
  if (adminError) {
    console.error('Error creating admin user:', adminError.message);
  } else {
    console.log('Admin user created successfully!');
  }
  
  // Create restaurant owner user
  const { data: ownerUser, error: ownerError } = await supabase.auth.admin.createUser({
    email: 'owner@testrestaurant.com',
    password: 'owner123456',
    email_confirm: true,
    user_metadata: { full_name: 'Test Owner' }
  });
  
  if (ownerError) {
    console.error('Error creating owner user:', ownerError.message);
  } else {
    console.log('Owner user created successfully!');
  }
  
  // Create limited user
  const { data: limitedUser, error: limitedError } = await supabase.auth.admin.createUser({
    email: 'limited@menufacil.app',
    password: 'limited123456',
    email_confirm: true,
    user_metadata: { full_name: 'Limited User' }
  });
  
  if (limitedError) {
    console.error('Error creating limited user:', limitedError.message);
  } else {
    console.log('Limited user created successfully!');
  }
}

createTestUser()
  .then(() => console.log('All users created successfully!'))
  .catch(error => console.error('Error:', error.message)); 