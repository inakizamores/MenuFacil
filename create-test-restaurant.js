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

async function createTestRestaurant() {
  console.log('Getting admin user ID...');
  
  // First get the admin user ID
  const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError.message);
    process.exit(1);
  }
  
  // Find the admin user by email
  const adminUser = userData.users.find(user => user.email === 'test@menufacil.app');
  
  if (!adminUser) {
    console.error('Admin user not found!');
    process.exit(1);
  }
  
  console.log('Admin user found with ID:', adminUser.id);
  
  // Create a profile for the admin user if it doesn't exist
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      user_id: adminUser.id,
      first_name: 'Test',
      last_name: 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (profileError) {
    console.error('Error creating profile:', profileError.message);
  } else {
    console.log('Profile created or updated successfully!');
  }
  
  // Create a restaurant for the admin user
  const { data: restaurantData, error: restaurantError } = await supabase
    .from('restaurants')
    .upsert({
      name: 'Test Restaurant',
      owner_id: adminUser.id,
      address: '123 Test Street',
      phone: '+1234567890',
      email: 'contact@testrestaurant.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  
  if (restaurantError) {
    console.error('Error creating restaurant:', restaurantError.message);
  } else {
    console.log('Restaurant created or updated successfully!');
  }
  
  // Get the restaurant ID
  const { data: restaurants, error: fetchError } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', adminUser.id)
    .limit(1);
  
  if (fetchError) {
    console.error('Error fetching restaurant:', fetchError.message);
    process.exit(1);
  }
  
  if (restaurants && restaurants.length > 0) {
    const restaurantId = restaurants[0].id;
    console.log('Restaurant ID:', restaurantId);
    
    // Create a menu for the restaurant
    const { data: menuData, error: menuError } = await supabase
      .from('menus')
      .upsert({
        restaurant_id: restaurantId,
        name: 'Sample Menu',
        description: 'A test menu',
        is_published: false,
        slug: 'sample-menu',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (menuError) {
      console.error('Error creating menu:', menuError.message);
    } else {
      console.log('Menu created or updated successfully!');
    }
  }
}

createTestRestaurant()
  .then(() => console.log('Test data created successfully!'))
  .catch(error => console.error('Error:', error.message)); 