/**
 * Vercel environment setup script
 * 
 * This script helps set up environment variables in Vercel using the Vercel CLI.
 * It does NOT store any secrets in the code or logs.
 * 
 * Prerequisites:
 * 1. Vercel CLI installed: npm i -g vercel
 * 2. Logged in to Vercel CLI: vercel login
 * 
 * Usage:
 * node setup-vercel-env.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main setup function
async function setupVercelEnv() {
  try {
    console.log('MenúFácil - Vercel Environment Setup');
    console.log('===================================');
    console.log('This script will help you set up environment variables in Vercel.');
    console.log('Make sure you have the Vercel CLI installed and are logged in.');
    console.log('');
    
    // Get project info
    const projectName = await prompt('Enter your Vercel project name: ');
    console.log('');
    
    // PUBLIC variables (not sensitive)
    console.log('Setting up public environment variables...');
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_URL production`, { stdio: 'inherit' });
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production`, { stdio: 'inherit' });
    execSync(`vercel env add NEXT_PUBLIC_APP_URL production`, { stdio: 'inherit' });
    
    // PRIVATE variables (sensitive)
    console.log('');
    console.log('Setting up private environment variables...');
    console.log('For SUPABASE_SERVICE_ROLE_KEY, paste your key when prompted, it will not be displayed or stored in this script.');
    execSync(`vercel env add SUPABASE_SERVICE_ROLE_KEY production`, { stdio: 'inherit' });
    
    // Deployment check
    console.log('');
    console.log('✅ Environment variables set up successfully!');
    console.log('');
    console.log('To verify your deployment environment is set up correctly:');
    console.log('1. Run a development build: vercel dev');
    console.log('2. Deploy to preview: vercel');
    console.log('3. Deploy to production: vercel --prod');
    
  } catch (error) {
    console.error('❌ Error setting up Vercel environment:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupVercelEnv(); 