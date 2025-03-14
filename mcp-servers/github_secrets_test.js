const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

console.log('Starting GitHub Secrets MCP test...');

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to the server
const serverPath = path.join(__dirname, 'github', 'index.js');

// Spawn the server process
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

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

// Handle server errors
server.stderr.on('data', (data) => {
  console.error(`Server stderr: ${data}`);
});

// Main test function
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
    
    console.log(`\nTesting add-env-vars-as-secrets tool for ${owner}/${repo}...`);
    
    const addSecretsRequest = {
      id: "1",
      jsonrpc: "2.0",
      method: "mcp.callTool",
      params: {
        name: "add-env-vars-as-secrets",
        parameters: {
          owner,
          repo
        }
      }
    };
    
    console.log('Sending request:', JSON.stringify(addSecretsRequest, null, 2));
    const addSecretsResponse = await sendRequest(addSecretsRequest);
    console.log('Add secrets response:', addSecretsResponse);
    
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    rl.close();
    console.log('Closing server...');
    server.kill();
  }
}

// Run the test
runTest(); 