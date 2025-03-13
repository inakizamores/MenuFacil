// Script to create a custom user for MenúFácil with specified details
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('./config');

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

async function createCustomUser() {
  console.log('MenúFácil - Custom User Creation Script');
  console.log('--------------------------------------');
  
  // Check for valid service key
  if (!SUPABASE_SERVICE_KEY || SUPABASE_SERVICE_KEY === 'your_new_service_role_key_here') {
    console.error('⚠️ ERROR: You need to update the SUPABASE_SERVICE_KEY in config.js first!');
    console.error('Please get your service role key from the Supabase dashboard (API section)');
    rl.close();
    return;
  }
  
  try {
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log(`\nConnecting to Supabase project: ${SUPABASE_URL}...`);
    
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