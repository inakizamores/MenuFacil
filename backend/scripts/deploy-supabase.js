#!/usr/bin/env node

/**
 * This script helps deploy the MenúFácil backend to Supabase.
 * It guides you through the process of:
 * 1. Applying database migrations
 * 2. Creating storage buckets
 * 3. Setting up bucket policies
 * 4. Deploying Edge Functions
 */

const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const SUPABASE_DIR = path.join(__dirname, '..', 'supabase');
const MIGRATIONS_DIR = path.join(SUPABASE_DIR, 'migrations');
const FUNCTIONS_DIR = path.join(SUPABASE_DIR, 'functions');

// Helper function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Helper function to execute commands
function executeCommand(command, options = {}) {
  try {
    console.log(`\n$ ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('Supabase CLI is not installed or not in PATH.');
    console.log('Please install it by following the instructions at:');
    console.log('https://supabase.com/docs/guides/cli/getting-started');
    return false;
  }
}

// Apply migrations
async function applyMigrations() {
  console.log('\n🔄 Applying database migrations...');
  
  const useSupabaseCLI = await askQuestion('Do you want to use Supabase CLI to apply migrations? (y/n): ');
  
  if (useSupabaseCLI.toLowerCase() === 'y') {
    // Check if we have a project reference
    const hasProjectRef = await askQuestion('Have you linked this project to your Supabase project? (y/n): ');
    
    if (hasProjectRef.toLowerCase() === 'n') {
      const projectRef = await askQuestion('Enter your Supabase project reference: ');
      executeCommand(`supabase link --project-ref ${projectRef}`);
    }
    
    // Apply migrations using Supabase CLI
    executeCommand('supabase db push');
  } else {
    console.log('\nTo apply migrations manually:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of each migration file in order');
    console.log('4. Execute the SQL queries');
    
    // List migration files
    console.log('\nMigration files to apply:');
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    migrationFiles.forEach(file => {
      console.log(`- ${file}`);
    });
    
    await askQuestion('\nPress Enter when you have applied all migrations...');
  }
}

// Create storage buckets
async function createStorageBuckets() {
  console.log('\n🪣 Creating storage buckets...');
  
  const buckets = [
    { name: 'avatars', public: true },
    { name: 'restaurant-images', public: true },
    { name: 'menu-images', public: true }
  ];
  
  const useSupabaseCLI = await askQuestion('Do you want to use Supabase CLI to create buckets? (y/n): ');
  
  if (useSupabaseCLI.toLowerCase() === 'y') {
    for (const bucket of buckets) {
      const publicFlag = bucket.public ? '--public' : '';
      executeCommand(`supabase storage create ${bucket.name} ${publicFlag}`);
    }
  } else {
    console.log('\nTo create buckets manually:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to Storage');
    console.log('3. Create the following buckets:');
    
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    await askQuestion('\nPress Enter when you have created all buckets...');
  }
}

// Set up bucket policies
async function setupBucketPolicies() {
  console.log('\n🔒 Setting up bucket policies...');
  
  console.log('\nTo set up bucket policies:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Storage > Policies');
  console.log('3. For each bucket, create the following policies:');
  
  console.log('\nFor avatars bucket:');
  console.log('- SELECT: Allow public access to avatars');
  console.log('  SQL: true');
  console.log('- INSERT: Allow authenticated users to upload their own avatar');
  console.log('  SQL: (auth.uid() = owner) AND (bucket_id = \'avatars\')');
  console.log('- UPDATE: Allow users to update their own avatar');
  console.log('  SQL: (auth.uid() = owner) AND (bucket_id = \'avatars\')');
  console.log('- DELETE: Allow users to delete their own avatar');
  console.log('  SQL: (auth.uid() = owner) AND (bucket_id = \'avatars\')');
  
  console.log('\nFor restaurant-images bucket:');
  console.log('- SELECT: Allow public access to restaurant images');
  console.log('  SQL: true');
  console.log('- INSERT: Allow authenticated users to upload restaurant images');
  console.log('  SQL: auth.role() = \'authenticated\'');
  console.log('- UPDATE: Allow authenticated users to update restaurant images');
  console.log('  SQL: auth.role() = \'authenticated\'');
  console.log('- DELETE: Allow authenticated users to delete restaurant images');
  console.log('  SQL: auth.role() = \'authenticated\'');
  
  console.log('\nFor menu-images bucket:');
  console.log('- SELECT: Allow public access to menu images');
  console.log('  SQL: true');
  console.log('- INSERT: Allow authenticated users to upload menu images');
  console.log('  SQL: auth.role() = \'authenticated\'');
  console.log('- UPDATE: Allow authenticated users to update menu images');
  console.log('  SQL: auth.role() = \'authenticated\'');
  console.log('- DELETE: Allow authenticated users to delete menu images');
  console.log('  SQL: auth.role() = \'authenticated\'');
  
  await askQuestion('\nPress Enter when you have set up all bucket policies...');
}

// Deploy Edge Functions
async function deployEdgeFunctions() {
  console.log('\n🚀 Deploying Edge Functions...');
  
  // Check if there are any functions to deploy
  const functionDirs = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (functionDirs.length === 0) {
    console.log('No Edge Functions found to deploy.');
    return;
  }
  
  console.log('Found the following Edge Functions:');
  functionDirs.forEach(dir => {
    console.log(`- ${dir}`);
  });
  
  const useSupabaseCLI = await askQuestion('Do you want to use Supabase CLI to deploy functions? (y/n): ');
  
  if (useSupabaseCLI.toLowerCase() === 'y') {
    for (const funcName of functionDirs) {
      executeCommand(`supabase functions deploy ${funcName}`);
    }
  } else {
    console.log('\nTo deploy Edge Functions manually:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to Edge Functions');
    console.log('3. Create a new function for each function directory');
    console.log('4. Copy and paste the code from the index.ts file');
    
    await askQuestion('\nPress Enter when you have deployed all functions...');
  }
}

// Configure authentication
async function configureAuthentication() {
  console.log('\n🔐 Configuring authentication...');
  
  console.log('\nTo configure authentication:');
  console.log('1. Go to your Supabase project dashboard');
  console.log('2. Navigate to Authentication > URL Configuration');
  console.log('3. Set the Site URL to your production URL (e.g., https://your-app.vercel.app)');
  console.log('4. Add the following redirect URLs:');
  console.log('   - http://localhost:3000/auth/callback (for local development)');
  console.log('   - https://your-app.vercel.app/auth/callback (for production)');
  
  await askQuestion('\nPress Enter when you have configured authentication...');
}

// Main function
async function main() {
  console.log('🚀 MenúFácil Supabase Deployment Helper');
  console.log('======================================');
  
  // Check if Supabase CLI is installed
  const hasSupabaseCLI = checkSupabaseCLI();
  
  if (!hasSupabaseCLI) {
    const continueWithoutCLI = await askQuestion('Do you want to continue without Supabase CLI? (y/n): ');
    if (continueWithoutCLI.toLowerCase() !== 'y') {
      console.log('Exiting. Please install Supabase CLI and try again.');
      rl.close();
      return;
    }
  }
  
  // Get Supabase project details
  console.log('\n📋 Supabase Project Details');
  console.log('---------------------------');
  const projectUrl = await askQuestion('Enter your Supabase project URL: ');
  const anonKey = await askQuestion('Enter your Supabase anon key: ');
  const serviceRoleKey = await askQuestion('Enter your Supabase service role key: ');
  
  console.log('\n✅ Project details saved. You can use these in your .env.local file.');
  
  // Apply migrations
  await applyMigrations();
  
  // Create storage buckets
  await createStorageBuckets();
  
  // Set up bucket policies
  await setupBucketPolicies();
  
  // Deploy Edge Functions
  await deployEdgeFunctions();
  
  // Configure authentication
  await configureAuthentication();
  
  console.log('\n🎉 Supabase deployment completed!');
  console.log('\nNext steps:');
  console.log('1. Update your frontend .env.local file with the Supabase credentials');
  console.log('2. Deploy your frontend to Vercel');
  console.log('3. Update the Site URL in Supabase Authentication settings with your production URL');
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
}); 