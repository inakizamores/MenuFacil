// Script to check the database schema for MenúFácil
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('./config');

async function checkDatabase() {
  console.log('MenúFácil - Database Schema Check');
  console.log('--------------------------------');
  
  // Use credentials from config file
  const supabaseUrl = SUPABASE_URL;
  const supabaseServiceKey = SUPABASE_SERVICE_KEY;
  
  console.log(`Using Supabase project: ${supabaseUrl}`);
  
  // Create Supabase client with service role key (for admin access)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  console.log('\nConnecting to Supabase...');
  
  try {
    // Check if tables exist
    const tables = [
      'profiles',
      'restaurants',
      'menus',
      'categories',
      'items',
      'item_options',
      'subscriptions'
    ];
    
    console.log('\nChecking required tables:');
    
    for (const table of tables) {
      console.log(`- Checking ${table} table...`);
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.log(`  ❌ Error: ${error.message}`);
      } else {
        console.log(`  ✅ Table exists with ${count} records`);
      }
    }
    
    // Check auth config
    console.log('\nChecking authentication setup...');
    const { data: authSettings, error: authError } = await supabase
      .from('_pgsodium_key_management')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    if (authError) {
      // This means we don't have permission to check auth settings directly
      console.log('  ⚠️ Cannot verify authentication setup (restricted access)');
    } else {
      console.log('  ✅ Authentication system appears to be configured');
    }
    
    // Check for existing users
    console.log('\nChecking for existing users...');
    try {
      const { data: adminRes, error: adminErr } = await supabase.auth.admin.listUsers();
      
      if (adminErr) {
        console.log(`  ⚠️ Error accessing user list: ${adminErr.message}`);
      } else if (adminRes) {
        const users = adminRes.users || [];
        console.log(`  ✅ Found ${users.length} users in the system`);
        
        // List users if any
        if (users.length > 0) {
          console.log('\nExisting users:');
          users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email} (ID: ${user.id})`);
          });
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Error accessing admin API: ${e.message}`);
    }
    
    console.log('\nRecommendation:');
    console.log('If tables exist but users cannot be created or accessed, you may need to:');
    console.log('1. Check that your SQL migrations have been applied correctly');
    console.log('2. Create test users manually through the Supabase dashboard');
    console.log('3. Ensure the "auth" schema is properly configured with triggers');
    
  } catch (err) {
    console.error('\n❌ Error during database check:', err.message);
  }
}

// Run the function
checkDatabase(); 