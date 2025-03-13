// Script to create a custom user for MenúFácil with specified details
// This version uses environment variables for sensitive data
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

async function createCustomUser() {
  console.log('MenúFácil - Custom User Creation Script (Env Version)');
  console.log('--------------------------------------------------');
  
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
    
    // Get user details
    console.log('\n📝 Please enter the details for the new user:');
    const email = await ask('Email: ');
    const password = await ask('Password: ');
    const fullName = await ask('Full Name: ');
    const userType = await ask('User Type (customer or restaurant): ');
    
    // Create the user
    console.log('\nCreating user...');
    const userResult = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name: fullName,
        user_type: userType
      }
    });
    
    if (userResult.error) {
      if (userResult.error.message.includes('already exists')) {
        console.log(`\n⚠️ User with email ${email} already exists.`);
        
        // Ask if they want to update the existing user
        const updateUser = await ask('Do you want to update this user? (yes/no): ');
        
        if (updateUser.toLowerCase() === 'yes') {
          // Get the user ID
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
          
          if (userError) {
            throw new Error(`Could not list users: ${userError.message}`);
          }
          
          const user = userData.users.find(u => u.email === email);
          
          if (user) {
            // Update the user
            const updateResult = await supabase.auth.admin.updateUserById(
              user.id,
              {
                password,
                user_metadata: { 
                  full_name: fullName,
                  user_type: userType
                }
              }
            );
            
            if (updateResult.error) {
              throw new Error(`Failed to update user: ${updateResult.error.message}`);
            }
            
            console.log(`\n✅ Successfully updated user: ${email}`);
          } else {
            console.log(`\n❌ Could not find user with email: ${email}`);
          }
        }
      } else {
        throw new Error(`Error creating user: ${userResult.error.message}`);
      }
    } else {
      console.log(`\n✅ Successfully created user: ${email}`);
      
      // Create profile record if needed
      const userId = userResult.data.user.id;
      
      // Check if a profile already exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);
        
      if (profileError) {
        console.log(`\n⚠️ Warning: Could not check for existing profile: ${profileError.message}`);
      } else if (!profileData || profileData.length === 0) {
        // Create the profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: fullName,
              user_type: userType
            }
          ]);
          
        if (insertError) {
          console.log(`\n⚠️ Warning: Could not create profile record: ${insertError.message}`);
        } else {
          console.log(`\n✅ Created profile record for user: ${email}`);
        }
      }
    }
    
    console.log('\n🔐 Login credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
  } finally {
    rl.close();
  }
}

// Run the function
createCustomUser(); 