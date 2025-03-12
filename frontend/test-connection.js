// Test Supabase Connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Check auth API connection (doesn't require any tables to exist)
    const { data: session, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Auth API error:', authError.message);
      console.error('Error details:', authError);
      return;
    }
    
    console.log('Auth API connection successful!');
    console.log('Session exists:', !!session);
    
    // Try to check if the profiles table exists by counting rows
    console.log('\nChecking database tables:');
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
      
    if (profilesError) {
      console.error('- profiles table: Not found or no access');
      console.error('  Error:', profilesError.message);
    } else {
      console.log('- profiles table: ✅ Exists');
    }
    
    const { data: restaurantsData, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('*', { count: 'exact', head: true });
      
    if (restaurantsError) {
      console.error('- restaurants table: Not found or no access');
      console.error('  Error:', restaurantsError.message);
    } else {
      console.log('- restaurants table: ✅ Exists');
    }
    
    // Test storage access
    console.log('\nChecking storage buckets:');
    try {
      console.log('Attempting to list storage buckets...');
      
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .listBuckets();
        
      if (bucketError) {
        console.error('Error accessing storage:', bucketError.message);
        console.error('Full error:', bucketError);
        
        // Try a different approach - checking for specific buckets
        console.log('\nTrying to access specific buckets directly:');
        
        const bucketNames = ['avatars', 'restaurant-images', 'menu-images'];
        
        for (const bucketName of bucketNames) {
          try {
            console.log(`Checking bucket "${bucketName}"...`);
            const { data, error } = await supabase
              .storage
              .from(bucketName)
              .list('', { limit: 1 });
              
            if (error) {
              console.error(`- ${bucketName}: ❌ Error accessing`);
              console.error(`  Error: ${error.message}`);
            } else {
              console.log(`- ${bucketName}: ✅ Exists and accessible`);
            }
          } catch (e) {
            console.error(`- ${bucketName}: ❌ Exception: ${e.message}`);
          }
        }
      } else {
        if (bucketData && bucketData.length > 0) {
          console.log('Available storage buckets:');
          bucketData.forEach(bucket => console.log(`- ${bucket.name}: ✅ Exists`));
        } else {
          console.log('No buckets found. The storage policies may not have been applied yet.');
          
          // Try a different approach - checking for specific buckets
          console.log('\nTrying to access specific buckets directly:');
          
          const bucketNames = ['avatars', 'restaurant-images', 'menu-images'];
          
          for (const bucketName of bucketNames) {
            try {
              console.log(`Checking bucket "${bucketName}"...`);
              const { data, error } = await supabase
                .storage
                .from(bucketName)
                .list('', { limit: 1 });
                
              if (error) {
                console.error(`- ${bucketName}: ❌ Error accessing`);
                console.error(`  Error: ${error.message}`);
              } else {
                console.log(`- ${bucketName}: ✅ Exists and accessible`);
              }
            } catch (e) {
              console.error(`- ${bucketName}: ❌ Exception: ${e.message}`);
            }
          }
        }
      }
    } catch (storageError) {
      console.error('Storage API error:', storageError.message);
      console.error('Error stack:', storageError.stack);
    }
    
    console.log('\nConnection test completed.');
    console.log('To complete setup, make sure to:');
    console.log('1. Apply database migrations using the SQL Editor in the Supabase Dashboard');
    console.log('2. Create the required storage buckets');
    
  } catch (error) {
    console.error('Connection error:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testConnection(); 