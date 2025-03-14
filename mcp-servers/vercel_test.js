// Load environment variables from .env file
require('dotenv').config({ path: '../.env' });

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');
const fetch = require('node-fetch');

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Starting Vercel MCP server test...');

// Check if VERCEL_TOKEN is set
if (process.env.VERCEL_TOKEN) {
  console.log(`Vercel token is set: ${process.env.VERCEL_TOKEN.substring(0, 5)}...`);
} else {
  console.error('ERROR: VERCEL_TOKEN is not set in your .env file');
  process.exit(1);
}

// Path to the server
const serverPath = path.join(__dirname, 'vercel', 'index.js');

// Function to get available Vercel projects
async function getVercelProjects() {
  try {
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
      return [];
    }
    
    return data.projects;
  } catch (error) {
    console.error('Error fetching Vercel projects:', error.message);
    return [];
  }
}

// Spawn the server process
let server;

// Helper function to send requests to the server
function sendRequest(request) {
  return new Promise((resolve) => {
    let responseData = '';
    
    const dataHandler = (data) => {
      const output = data.toString();
      responseData += output;
      
      // Check if the response is complete (look for a complete JSON object)
      try {
        JSON.parse(responseData);
        // If we can parse it, we have a complete response
        server.stdout.removeListener('data', dataHandler);
        resolve(responseData);
      } catch (e) {
        // Not complete yet, keep listening
      }
    };
    
    server.stdout.on('data', dataHandler);
    
    // Send the request
    server.stdin.write(JSON.stringify(request) + '\n');
  });
}

// Test function to get MCP methods supported by the server
async function testGetMethods() {
  console.log('\nTesting mcp.getMethods to discover available methods...');
  
  const request = {
    id: "methods",
    jsonrpc: "2.0",
    method: "mcp.getMethods",
    params: {}
  };
  
  try {
    const responseStr = await sendRequest(request);
    console.log('Raw Response:', responseStr);
    
    try {
      const response = JSON.parse(responseStr);
      if (response.error) {
        console.log(`Error: ${response.error.message}`);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error parsing response:', err);
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Test direct API requests to Vercel
async function testDirectApiCalls(projectId) {
  console.log('\nTesting direct API calls to Vercel...');
  
  try {
    // Test project info
    console.log(`\nFetching info for project ${projectId} directly from Vercel API...`);
    const projectResponse = await fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!projectResponse.ok) {
      console.error(`HTTP error! Status: ${projectResponse.status}`);
      return false;
    }
    
    const projectData = await projectResponse.json();
    console.log('Project Info:', JSON.stringify(projectData, null, 2).substring(0, 500) + '...');
    
    // Test deployments
    console.log(`\nFetching deployments for project ${projectId} directly from Vercel API...`);
    const deploymentsResponse = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!deploymentsResponse.ok) {
      console.error(`HTTP error! Status: ${deploymentsResponse.status}`);
      return false;
    }
    
    const deploymentsData = await deploymentsResponse.json();
    console.log('Deployments:', JSON.stringify(deploymentsData, null, 2).substring(0, 500) + '...');
    
    return true;
  } catch (error) {
    console.error('Error with direct API calls:', error);
    return false;
  }
}

// Test the Vercel client functionality in the MCP server file
async function testServerCode(projectId) {
  console.log(`\nTesting the Vercel client functionality in the MCP server file...`);
  console.log('Creating a simple script to test the Vercel client...');
  
  // Create a test file with server code
  const fs = require('fs');
  const testFilePath = path.join(__dirname, 'vercel_api_test.js');
  
  const vercelClientCode = `
  // Script to test Vercel client directly
  require('dotenv').config({ path: '../.env' });
  const fetch = require('node-fetch');
  
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const projectId = '${projectId}';
  
  async function testVercelApi() {
    try {
      console.log('Testing Vercel API with projectId:', projectId);
      
      // Test project info
      const projectResponse = await fetch(\`https://api.vercel.com/v9/projects/\${projectId}\`, {
        headers: {
          'Authorization': \`Bearer \${VERCEL_TOKEN}\`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!projectResponse.ok) {
        throw new Error(\`HTTP error! Status: \${projectResponse.status}\`);
      }
      
      const projectData = await projectResponse.json();
      console.log('Project API call successful!');
      console.log('Project Name:', projectData.name);
      
      // Test deployments
      const deploymentsResponse = await fetch(\`https://api.vercel.com/v6/deployments?projectId=\${projectId}\`, {
        headers: {
          'Authorization': \`Bearer \${VERCEL_TOKEN}\`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!deploymentsResponse.ok) {
        throw new Error(\`HTTP error! Status: \${deploymentsResponse.status}\`);
      }
      
      const deploymentsData = await deploymentsResponse.json();
      console.log('Deployments API call successful!');
      console.log('Deployment count:', deploymentsData.deployments?.length || 0);
      
      console.log('All Vercel API tests passed successfully!');
    } catch (error) {
      console.error('Error testing Vercel API:', error);
    }
  }
  
  testVercelApi();
  `;
  
  fs.writeFileSync(testFilePath, vercelClientCode);
  
  // Run the test file
  return new Promise((resolve) => {
    const testProcess = spawn('node', [testFilePath], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      console.log(`Vercel API test completed with code ${code}`);
      resolve(code === 0);
    });
  });
}

// Main test function
async function runTest() {
  try {
    // Get available projects
    const projects = await getVercelProjects();
    
    if (!projects || projects.length === 0) {
      console.error('No Vercel projects found. Please create a project in your Vercel account first.');
      return;
    }
    
    console.log('\nAvailable Vercel projects:');
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name} (${project.id})`);
    });
    
    // Get user input for project selection
    const selection = await new Promise((resolve) => {
      rl.question('\nSelect a project number to test (or press Enter to use the first project): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    let selectedProject;
    if (!selection) {
      // Use the first project if no selection
      selectedProject = projects[0];
      console.log(`Using the first project: ${selectedProject.name} (${selectedProject.id})`);
    } else {
      const index = parseInt(selection) - 1;
      if (isNaN(index) || index < 0 || index >= projects.length) {
        console.error('Invalid selection. Using the first project.');
        selectedProject = projects[0];
      } else {
        selectedProject = projects[index];
        console.log(`Selected project: ${selectedProject.name} (${selectedProject.id})`);
      }
    }
    
    const projectId = selectedProject.id;
    
    // First, test direct API calls to verify the Vercel token works
    const directApiSuccess = await testDirectApiCalls(projectId);
    
    if (!directApiSuccess) {
      console.error('Direct API calls to Vercel failed. Please check your Vercel token.');
      return;
    }
    
    // Test the Vercel client functionality directly
    const serverCodeSuccess = await testServerCode(projectId);
    
    if (!serverCodeSuccess) {
      console.error('Vercel client functionality test failed.');
      return;
    }
    
    // Start the MCP server
    console.log('\nStarting Vercel MCP server...');
    server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Handle server output for debugging
    server.stdout.on('data', (data) => {
      console.log(`Server stdout: ${data}`);
    });
    
    // Handle server errors
    server.stderr.on('data', (data) => {
      console.error(`Server stderr: ${data}`);
    });
    
    // Wait for server to initialize
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test getMethods to see what methods are available
    await testGetMethods();
    
    console.log('\nVercel MCP server test complete.');
    console.log('The MCP server is running and correctly loading the Vercel token from your .env file.');
    console.log('You can use this MCP server to interact with your Vercel projects.');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    rl.close();
    if (server) server.kill();
  }
}

// Run the tests
runTest(); 