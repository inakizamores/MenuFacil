// Script to create standard test users for MenúFácil using environment variables
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question function
function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function getConfigFromEnvOrPrompt() {
  // Try to get values from environment variables first
  let supabaseUrl = process.env.SUPABASE_URL || 'https://aejxheybvxbwvjuyfhfh.supabase.co';
  let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // If service key is not in environment variables, prompt for it
  if (!supabaseServiceKey) {
    console.log('\n🔑 Supabase service key not found in environment variables.');
    console.log('You can paste it here or set it as an environment variable named SUPABASE_SERVICE_ROLE_KEY.');
    supabaseServiceKey = await ask('Supabase Service Role Key: ');
    
    if (!supabaseServiceKey) {
      throw new Error('Supabase Service Role Key is required');
    }
  } else {
    console.log('\n✅ Found Supabase service key in environment variables.');
  }
  
  return {
    supabaseUrl,
    supabaseServiceKey
  };
}

async function createTestUsers() {
  console.log('MenúFácil - Standard Test User Creation');
  console.log('---------------------------------------');
  
  try {
    // Get configuration
    const config = await getConfigFromEnvOrPrompt();
    
    // Create Supabase client with service role key
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceKey);
    console.log(`\nConnecting to Supabase project: ${config.supabaseUrl}...`);
    
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    
    console.log('✅ Connection successful!');
    
    // Create test users
    console.log('\nCreating standard test users...');
    
    // Standard test users to create
    const testUsers = [
      {
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
        user_type: 'customer'
      },
      {
        email: 'restaurant@example.com',
        password: 'password123',
        full_name: 'Restaurant Owner',
        user_type: 'restaurant'
      },
      {
        email: 'admin@example.com',
        password: 'password123',
        full_name: 'Admin User',
        user_type: 'admin'
      }
    ];
    
    // Create each test user
    for (const user of testUsers) {
      console.log(`\nCreating user: ${user.email}...`);
      
      // Create the auth user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { 
          full_name: user.full_name,
          user_type: user.user_type
        }
      });
      
      if (userError) {
        if (userError.message.includes('already exists')) {
          console.log(`  ⚠️ User already exists: ${user.email}`);
        } else {
          console.log(`  ❌ Error creating user: ${userError.message}`);
        }
      } else {
        console.log(`  ✅ Created user: ${user.email}`);
        
        // Create profile record
        const userId = userData.user.id;
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: user.full_name,
              user_type: user.user_type
            }
          ]);
          
        if (profileError) {
          console.log(`  ⚠️ Could not create profile: ${profileError.message}`);
        } else {
          console.log(`  ✅ Created profile for: ${user.email}`);
        }
      }
    }
    
    console.log('\n✅ Test user creation completed!');
    console.log('\nYou can now log in with:');
    console.log('1. Customer:         test@example.com / password123');
    console.log('2. Restaurant Owner: restaurant@example.com / password123');
    console.log('3. Admin:            admin@example.com / password123');
    
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
  } finally {
    rl.close();
  }
}

// Run the function
createTestUsers(); 