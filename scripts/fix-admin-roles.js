/**
 * Script to fix admin user roles in Supabase
 * 
 * This script:
 * 1. Updates the profiles table to set the role to system_admin
 * 2. Directly updates the user_metadata in auth.users
 * 3. Ensures consistency between profiles and auth.users
 * 
 * Run with:
 * node scripts/fix-admin-roles.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const adminEmails = [
  'test@menufacil.app',
  // Add any other admin emails here
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAdminRoles() {
  console.log('Starting admin role fix script...');
  
  for (const email of adminEmails) {
    console.log(`\nProcessing admin user: ${email}`);
    
    try {
      // 1. Get user by email
      const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
      
      if (getUserError) {
        console.error(`Error fetching users:`, getUserError);
        continue;
      }
      
      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.error(`User with email ${email} not found`);
        continue;
      }
      
      console.log(`Found user: ${user.id} (${user.email})`);
      
      // 2. Update user_metadata in auth.users
      const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
        user.id,
        { 
          user_metadata: { 
            ...user.user_metadata,
            role: 'system_admin' 
          } 
        }
      );
      
      if (updateAuthError) {
        console.error(`Error updating auth user metadata:`, updateAuthError);
      } else {
        console.log(`✓ Updated auth.users metadata with role = system_admin`);
      }
      
      // 3. Update the profiles table
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ role: 'system_admin' })
        .eq('id', user.id);
      
      if (updateProfileError) {
        console.error(`Error updating profile:`, updateProfileError);
      } else {
        console.log(`✓ Updated profiles table with role = system_admin`);
      }
      
      // 4. Verify the changes
      const { data: profile, error: getProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (getProfileError) {
        console.error(`Error fetching updated profile:`, getProfileError);
      } else if (profile) {
        console.log(`✓ Verified profile role is now: ${profile.role}`);
      }
      
      // 5. Check the user again to verify metadata update
      const { data: { user: updatedUser }, error: getUpdatedUserError } = await supabase.auth.admin.getUserById(user.id);
      
      if (getUpdatedUserError) {
        console.error(`Error fetching updated user:`, getUpdatedUserError);
      } else if (updatedUser) {
        console.log(`✓ Verified user_metadata.role is now: ${updatedUser.user_metadata.role}`);
      }
      
      console.log(`✅ Successfully updated admin role for ${email}`);
      
    } catch (error) {
      console.error(`Unexpected error processing ${email}:`, error);
    }
  }
  
  console.log('\nAdmin role fix script completed');
}

fixAdminRoles().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 