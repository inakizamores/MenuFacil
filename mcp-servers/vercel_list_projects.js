// Load environment variables
require('dotenv').config({ path: '../.env' });
const fetch = require('node-fetch');

// Check if VERCEL_TOKEN is set
if (!process.env.VERCEL_TOKEN) {
  console.error('ERROR: VERCEL_TOKEN is not set in your .env file');
  process.exit(1);
}

console.log(`Vercel token is set: ${process.env.VERCEL_TOKEN.substring(0, 5)}...`);

async function listProjects() {
  try {
    console.log('Fetching your Vercel projects...');
    
    // Define the Vercel API endpoint
    const endpoint = 'https://api.vercel.com/v9/projects';
    
    // Make the request to Vercel API
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !data.projects || data.projects.length === 0) {
      console.log('No projects found for this Vercel account.');
      return;
    }
    
    console.log('\n===== YOUR VERCEL PROJECTS =====');
    console.log('ID | NAME | FRAMEWORK');
    console.log('---------------------------');
    
    // Display projects in a table format
    data.projects.forEach(project => {
      console.log(`${project.id} | ${project.name} | ${project.framework || 'Not specified'}`);
    });
    
    console.log('\nUse one of these project IDs when testing the Vercel MCP server.');
    console.log('Command to test: node vercel_test.js');
    
  } catch (error) {
    console.error('Error fetching Vercel projects:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the script
listProjects(); 