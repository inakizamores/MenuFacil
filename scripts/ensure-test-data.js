// This script ensures that test restaurant data exists and staff members are properly linked
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use environment variables for Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function ensureTestData() {
  console.log('Ensuring test restaurant data exists...');
  
  try {
    // 1. First, check if test users exist
    console.log('Checking for test users...');
    const ownerEmail = 'owner@testrestaurant.com';
    const limitedEmail = 'limited@menufacil.app';
    
    // Check for owner
    const { data: ownerData, error: ownerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', ownerEmail)
      .maybeSingle();
      
    if (ownerError) {
      console.error('Error fetching owner:', ownerError);
      return;
    }
    
    // Check for limited user
    const { data: limitedData, error: limitedError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', limitedEmail)
      .maybeSingle();
      
    if (limitedError) {
      console.error('Error fetching limited user:', limitedError);
      return;
    }
    
    const ownerId = ownerData?.id;
    const limitedId = limitedData?.id;
    
    if (!ownerId) {
      console.log(`Owner user (${ownerEmail}) not found. Please create this user first.`);
      return;
    }
    
    if (!limitedId) {
      console.log(`Limited user (${limitedEmail}) not found. Please create this user first.`);
      return;
    }
    
    console.log(`Found owner ID: ${ownerId}`);
    console.log(`Found limited user ID: ${limitedId}`);
    
    // 2. Check if test restaurant exists
    const { data: existingRestaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('owner_id', ownerId)
      .eq('name', 'Test Restaurant')
      .maybeSingle();
      
    if (restaurantError) {
      console.error('Error checking for existing restaurant:', restaurantError);
      return;
    }
    
    let restaurantId;
    
    // Create restaurant if it doesn't exist
    if (!existingRestaurant) {
      console.log('Creating test restaurant...');
      
      const { data: newRestaurant, error: createError } = await supabase
        .from('restaurants')
        .insert({
          name: 'Test Restaurant',
          description: 'This is a test restaurant for demonstration purposes',
          owner_id: ownerId,
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          postal_code: '12345',
          country: 'Test Country',
          phone: '+1234567890',
          email: 'contact@testrestaurant.com'
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating test restaurant:', createError);
        return;
      }
      
      restaurantId = newRestaurant.id;
      console.log(`Created test restaurant with ID: ${restaurantId}`);
    } else {
      restaurantId = existingRestaurant.id;
      console.log(`Test restaurant already exists with ID: ${restaurantId}`);
    }
    
    // 3. Update limited user profile to link to restaurant
    console.log('Updating limited user profile...');
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        linked_restaurant_id: restaurantId,
        parent_user_id: ownerId,
        role: 'restaurant_staff'
      })
      .eq('id', limitedId);
      
    if (updateError) {
      console.error('Error updating limited user profile:', updateError);
      return;
    }
    
    // 4. Ensure restaurant_members record exists
    const { data: existingMember, error: memberError } = await supabase
      .from('restaurant_members')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('user_id', limitedId)
      .maybeSingle();
      
    if (memberError) {
      console.error('Error checking for existing restaurant member:', memberError);
      return;
    }
    
    if (!existingMember) {
      console.log('Creating restaurant member record...');
      
      const { error: createMemberError } = await supabase
        .from('restaurant_members')
        .insert({
          restaurant_id: restaurantId,
          user_id: limitedId,
          role: 'editor',
          is_active: true
        });
        
      if (createMemberError) {
        console.error('Error creating restaurant member record:', createMemberError);
        return;
      }
      
      console.log('Created restaurant member record for limited user');
    } else {
      console.log('Restaurant member record already exists for limited user');
    }
    
    console.log('Test data setup complete!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
ensureTestData(); 