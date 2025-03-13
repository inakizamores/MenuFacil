// Guide for setting up GitHub repo secrets for MenúFácil
const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');

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

// Function to print colored text
function printColored(text, color) {
  const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  };
  
  console.log(`${colors[color] || ''}${text}${colors.reset}`);
}

async function setupGitHubSecrets() {
  printColored('MenúFácil - GitHub Secrets Setup Guide', 'cyan');
  printColored('=====================================', 'cyan');
  console.log('\nThis guide will help you set up the necessary GitHub secrets for your MenúFácil repository.');
  
  // Step 1: GitHub repository information
  printColored('\nSTEP 1: GitHub Repository Information', 'yellow');
  console.log('We need to know your GitHub repository details.');
  const repoOwner = await ask('Enter your GitHub username or organization name: ');
  const repoName = await ask('Enter your repository name (default: MenuFacil): ') || 'MenuFacil';
  
  // Step 2: Supabase credentials
  printColored('\nSTEP 2: Supabase Credentials', 'yellow');
  console.log('You need to add your Supabase service role key to GitHub secrets.');
  console.log('You can find this in your Supabase dashboard under Project Settings > API.');
  const shouldInputSupabaseKey = await ask('Do you have your Supabase service role key ready? (yes/no): ');
  
  if (shouldInputSupabaseKey.toLowerCase() === 'yes') {
    console.log('\nHere\'s how to add it to GitHub secrets:');
    console.log('1. Go to your GitHub repository at https://github.com/' + repoOwner + '/' + repoName);
    console.log('2. Click on "Settings" > "Secrets and variables" > "Actions"');
    console.log('3. Click "New repository secret"');
    console.log('4. Add the following secret:');
    printColored('   Name: SUPABASE_SERVICE_ROLE_KEY', 'green');
    printColored('   Value: [Your Supabase service role key]', 'green');
    
    const hasAddedSupabaseKey = await ask('\nHave you added the SUPABASE_SERVICE_ROLE_KEY secret? (yes/no): ');
    
    if (hasAddedSupabaseKey.toLowerCase() !== 'yes') {
      printColored('\n⚠️ Please add the SUPABASE_SERVICE_ROLE_KEY secret before continuing.', 'yellow');
    } else {
      printColored('\n✅ SUPABASE_SERVICE_ROLE_KEY added successfully!', 'green');
    }
  } else {
    printColored('\n⚠️ Please get your Supabase service role key before continuing.', 'yellow');
  }
  
  // Step 3: Creating a test workflow
  printColored('\nSTEP 3: Enable GitHub Workflows', 'yellow');
  console.log('Now that you have set up the secrets, you can use GitHub Actions to:');
  printColored('1. Create test users automatically', 'green');
  
  console.log('\nTo create test users, go to:');
  console.log(`https://github.com/${repoOwner}/${repoName}/actions/workflows/create-test-users.yml`);
  console.log('Click "Run workflow" and choose "standard" to create standard test users.');
  
  // Summary
  printColored('\nSETUP SUMMARY', 'cyan');
  console.log('You have completed the setup guide for MenúFácil GitHub secrets.');
  console.log('Here\'s what you can do now:');
  console.log('1. Create test users using GitHub Actions workflow');
  console.log('2. Run scripts locally using environment variables');
  
  printColored('\nHappy cooking with MenúFácil! 🍽️', 'cyan');
  
  rl.close();
}

// Run the function
setupGitHubSecrets(); 