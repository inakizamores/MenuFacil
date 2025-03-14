const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envFilePath = path.join(__dirname, '..', '.env');

// Function to update the GitHub token in the .env file
async function updateGitHubToken() {
  try {
    // Check if .env file exists
    if (!fs.existsSync(envFilePath)) {
      console.error('.env file not found at:', envFilePath);
      return;
    }

    // Read the current .env file
    const envContent = fs.readFileSync(envFilePath, 'utf8');
    
    // Get the new token from user input
    const newToken = await new Promise((resolve) => {
      rl.question('Enter your new GitHub token: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!newToken) {
      console.error('No token provided. Exiting without changes.');
      return;
    }
    
    // Update the GitHub token in the .env content
    const updatedContent = envContent.replace(
      /GITHUB_TOKEN=.*/,
      `GITHUB_TOKEN=${newToken}`
    );
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, updatedContent, 'utf8');
    
    console.log('GitHub token updated successfully in .env file!');
    console.log('You can now run the github_direct_test.js script to test adding secrets to your repository.');
  } catch (error) {
    console.error('Error updating GitHub token:', error);
  } finally {
    rl.close();
  }
}

// Run the update function
updateGitHubToken(); 