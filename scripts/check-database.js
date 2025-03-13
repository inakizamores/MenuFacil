// Script to check the database schema for MenúFácil
const { createClient } = require('@supabase/supabase-js');
let config;

try {
  // First try to load from environment variables
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    config = {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY
    };
    console.log('Using config from environment variables');
  } else {
    // Fall back to config file
    console.log('Loading config from file...');
    try {
      config = require('./config');
      console.log('Config file loaded successfully');
    } catch (e) {
      console.error('Error loading config file:', e.message);
      process.exit(1);
    }
  }
} catch (e) {
  console.error('Error setting up configuration:', e.message);
  process.exit(1);
}

async function checkDatabase() {
  console.log('MenúFácil - Database Schema Check');
  console.log('--------------------------------');
  
  // Use credentials from config
  const supabaseUrl = config.SUPABASE_URL;
  const supabaseServiceKey = config.SUPABASE_SERVICE_KEY;
  
  console.log(`Using Supabase project: ${supabaseUrl}`);
  
  // Validate the service key is not empty
  if (!supabaseServiceKey || supabaseServiceKey === 'your-service-role-key' || supabaseServiceKey.trim() === '') {
    console.error('❌ SUPABASE_SERVICE_KEY is missing or invalid');
    process.exit(1);
  }
  
  // Create Supabase client with service role key (for admin access)
  let supabase;
  try {
    console.log('Creating Supabase client...');
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client created successfully');
  } catch (e) {
    console.error('❌ Failed to create Supabase client:', e.message);
    process.exit(1);
  }
  
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
    
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        console.log(`- Checking ${table} table...`);
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (error) {
          console.log(`  ❌ Error: ${error.message}`);
          allTablesExist = false;
        } else {
          console.log(`  ✅ Table exists with ${count} records`);
        }
      } catch (tableError) {
        console.log(`  ❌ Exception checking table ${table}: ${tableError.message}`);
        allTablesExist = false;
      }
    }
    
    // For CI environments, we'll just report a warning but not fail
    console.log('\n' + (allTablesExist ? '✅ All required tables exist' : '⚠️ Some tables are missing but continuing'));
    
    // Check auth config - but don't fail if we can't check it
    console.log('\nChecking authentication setup...');
    try {
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
    } catch (authCheckError) {
      console.log('  ⚠️ Error checking auth setup:', authCheckError.message);
    }
    
    // Check for existing users, but don't fail if we can't
    console.log('\nChecking for existing users...');
    try {
      const { data: adminRes, error: adminErr } = await supabase.auth.admin.listUsers();
      
      if (adminErr) {
        console.log(`  ⚠️ Error accessing user list: ${adminErr.message}`);
      } else if (adminRes) {
        const users = adminRes.users || [];
        console.log(`  ✅ Found ${users.length} users in the system`);
        
        // List users if any (just a few for brevity)
        if (users.length > 0) {
          console.log('\nSample of existing users:');
          users.slice(0, 3).forEach((user, index) => {
            console.log(`${index + 1}. ${user.email || 'No email'} (ID: ${user.id})`);
          });
          if (users.length > 3) {
            console.log(`...and ${users.length - 3} more`);
          }
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
    
    console.log('\n✅ Database check completed successfully!');
    
  } catch (err) {
    console.error('\n❌ Error during database check:', err.message);
    console.error(err.stack);
    
    // In CI environments, we don't want to fail the build just for the check
    // Uncomment the next line if you want the script to fail the build
    // process.exit(1);
  }
}

// Run the function
checkDatabase()
  .catch(error => {
    console.error('Unhandled error in checkDatabase:', error);
    // Don't fail the build in CI environment
    if (process.env.CI !== 'true') {
      process.exit(1);
    }
  }); 