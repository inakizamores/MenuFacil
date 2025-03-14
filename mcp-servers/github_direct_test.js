// Load environment variables from .env file
require('dotenv').config({ path: '../.env' });

const { Octokit } = require("octokit");
const sodium = require('tweetsodium');
const readline = require('readline');

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Get GitHub token from environment variable
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Debug: Check if token is available (show first few characters only for security)
if (GITHUB_TOKEN) {
  console.log(`GitHub token is set: ${GITHUB_TOKEN.substring(0, 5)}...`);
} else {
  console.log('GitHub token is not set!');
}

// Initialize Octokit
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Main function to add environment variables as secrets
async function addEnvVarsAsSecrets(owner, repo) {
  try {
    console.log(`Adding environment variables as secrets to ${owner}/${repo}...`);
    
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    // Get public key for the repo to encrypt the secrets
    console.log("Fetching repository public key...");
    try {
      const { data: publicKeyData } = await octokit.rest.actions.getRepoPublicKey({
        owner,
        repo
      });
      
      console.log("Public key fetched successfully");

      // Environment variables to store as secrets with proper naming
      const envVars = {
        // Use GH_PAT instead of GITHUB_TOKEN to avoid GitHub naming restrictions
        "GH_PAT": process.env.GITHUB_TOKEN,
        "VERCEL_TOKEN": process.env.VERCEL_TOKEN,
        "SUPABASE_URL": process.env.SUPABASE_URL,
        "SUPABASE_ANON_KEY": process.env.SUPABASE_ANON_KEY,
        "SUPABASE_SERVICE_KEY": process.env.SUPABASE_SERVICE_KEY
      };

      // Process each environment variable
      const results = [];
      for (const [key, value] of Object.entries(envVars)) {
        if (!value) {
          results.push(`Skipped ${key}: Environment variable not set`);
          continue;
        }

        try {
          console.log(`Processing ${key}...`);
          
          // Convert the secret value to a Buffer
          const messageBytes = Buffer.from(value);

          // Convert the public key to a Buffer
          const keyBytes = Buffer.from(publicKeyData.key, 'base64');

          // Encrypt using sodium (tweetsodium)
          const encryptedBytes = sodium.seal(messageBytes, keyBytes);

          // Convert encrypted value to base64
          const encrypted = Buffer.from(encryptedBytes).toString('base64');

          // Create or update the secret
          await octokit.rest.actions.createOrUpdateRepoSecret({
            owner,
            repo,
            secret_name: key,
            encrypted_value: encrypted,
            key_id: publicKeyData.key_id
          });

          results.push(`Secret ${key} successfully created or updated`);
        } catch (error) {
          console.error(`Error processing ${key}:`, error);
          results.push(`Failed to create or update secret ${key}: ${error.message}`);
        }
      }
      
      return results.join('\n');
    } catch (error) {
      console.error("Error fetching public key:", error);
      throw error;
    }
  } catch (error) {
    return `Failed to process environment variables as secrets: ${error.message}`;
  }
}

// Run the test
async function runTest() {
  try {
    // Get user input for GitHub owner and repo
    const owner = await new Promise((resolve) => {
      rl.question('Enter your GitHub username: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    const repo = await new Promise((resolve) => {
      rl.question('Enter your repository name: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!owner || !repo) {
      console.error('GitHub username and repository name are required');
      return;
    }
    
    const result = await addEnvVarsAsSecrets(owner, repo);
    console.log('\nResult:');
    console.log(result);
    
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    rl.close();
  }
}

runTest(); 