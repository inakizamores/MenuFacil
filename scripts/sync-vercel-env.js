// Script to sync environment variables between GitHub and Vercel
const { execSync } = require('child_process');
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

async function syncEnvironmentVariables() {
  console.log('MenúFácil - Environment Variable Synchronization Tool');
  console.log('--------------------------------------------------');
  
  try {
    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version');
      console.log('✅ Vercel CLI is installed');
    } catch (error) {
      console.log('⚠️ Vercel CLI is not installed. Installing...');
      execSync('npm install -g vercel');
      console.log('✅ Vercel CLI has been installed');
    }
    
    // Login to Vercel if needed
    console.log('\nChecking Vercel authentication...');
    try {
      const whoamiOutput = execSync('vercel whoami').toString();
      console.log(`✅ Logged in as: ${whoamiOutput.trim()}`);
    } catch (error) {
      console.log('⚠️ Not logged in to Vercel. Please login:');
      execSync('vercel login', { stdio: 'inherit' });
    }
    
    // Sync environment variables
    console.log('\n📝 Synchronizing environment variables:');
    
    // Get Supabase service key from user or environment
    let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseServiceKey) {
      console.log('\n🔑 Supabase service key not found in environment variables.');
      supabaseServiceKey = await ask('Enter your Supabase Service Role Key: ');
    } else {
      console.log('✅ Found Supabase service key in environment variables');
    }
    
    // Push environment variables to Vercel
    console.log('\nSetting up Vercel environment variables...');
    
    // Public variables
    console.log('\nSetting public environment variables:');
    execSync('vercel env add NEXT_PUBLIC_SUPABASE_URL production', { stdio: 'inherit' });
    execSync('vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production', { stdio: 'inherit' });
    execSync('vercel env add NEXT_PUBLIC_APP_URL production', { stdio: 'inherit' });
    
    // Secret variables
    console.log('\nSetting secret environment variables:');
    
    // Create temporary file for secret
    const fs = require('fs');
    const tempFilePath = './temp-secret.txt';
    fs.writeFileSync(tempFilePath, supabaseServiceKey);
    
    try {
      console.log('Setting SUPABASE_SERVICE_ROLE_KEY...');
      execSync(`vercel env add SUPABASE_SERVICE_ROLE_KEY production < ${tempFilePath}`, { stdio: 'inherit' });
      console.log('✅ Environment variables set in Vercel');
    } finally {
      // Clean up temp file
      fs.unlinkSync(tempFilePath);
    }
    
    // Deploy with the updated environment
    const shouldDeploy = await ask('\nDo you want to deploy to Vercel now? (yes/no): ');
    if (shouldDeploy.toLowerCase() === 'yes') {
      console.log('\nDeploying to Vercel...');
      execSync('vercel --prod', { stdio: 'inherit' });
      console.log('✅ Deployment completed');
    }
    
    console.log('\n✅ Environment synchronization completed!');
    
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
  } finally {
    rl.close();
  }
}

// Run the function
syncEnvironmentVariables(); 