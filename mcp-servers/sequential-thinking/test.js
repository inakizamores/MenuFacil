// Test file for the Sequential Thinking MCP server
const { spawn } = require('child_process');
const path = require('path');
const fetch = require('node-fetch');

// Helper function to encode a JSON-RPC request
function encodeRequest(method, params = {}) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id: 'test-client',
    method,
    params
  }) + '\n';
}

// Helper function to decode a JSON-RPC response
function decodeResponse(line) {
  try {
    return JSON.parse(line);
  } catch (e) {
    console.error('Failed to parse response:', line);
    return null;
  }
}

async function runTest() {
  // Start the server process
  const server = spawn('node', [path.join(__dirname, 'index.js')]);
  
  // Set up data handling
  const responses = [];
  
  server.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      if (line) {
        const response = decodeResponse(line);
        if (response) {
          responses.push(response);
          console.log('Received response:', JSON.stringify(response, null, 2));
          
          // Process all responses
          if (responses.length === 3) {
            // All requests have been processed, terminate the server
            server.kill();
          }
        }
      }
    }
  });
  
  server.stderr.on('data', (data) => {
    console.error('Server error:', data.toString());
  });
  
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
  
  // Send a ping request
  server.stdin.write(encodeRequest('ping'));
  
  // Wait a moment for the server to process the ping
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // List resources
  server.stdin.write(encodeRequest('resources/list'));
  
  // Wait a moment for the server to process the request
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // List tools
  server.stdin.write(encodeRequest('tools/list'));
}

// Run the test
console.log('Starting Sequential Thinking MCP server test...');
runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
}); 