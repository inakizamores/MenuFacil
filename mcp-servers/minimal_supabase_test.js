// Minimal test script for the Supabase MCP server
require('dotenv').config({ path: '../.env' });
const { spawn } = require('child_process');

// Main test function
async function testMinimalSupabaseMcp() {
  console.log('Starting Minimal Supabase MCP Server test...');
  
  // Start the MCP server process
  console.log('\nStarting Supabase MCP server...');
  const serverProcess = spawn('node', ['supabase/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Handle server output
  serverProcess.stdout.on('data', (data) => {
    console.log(`Server stdout: ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data.toString().trim()}`);
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Helper function to send a request and get response
  function sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = Math.floor(Math.random() * 10000);
      const request = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params
      };
      
      console.log(`\nSending request: ${JSON.stringify(request, null, 2)}`);
      
      // Send the request
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
      
      // Wait for response
      setTimeout(() => {
        console.log('\nTest completed. Check the server output above for the response.');
        resolve();
      }, 2000);
    });
  }
  
  try {
    // Test ping
    console.log('\nTesting ping method...');
    await sendRequest('ping');
    
    // Test listing resources
    console.log('\nListing resources...');
    await sendRequest('resources/list');
    
    // Test reading a resource
    console.log('\nReading resource...');
    await sendRequest('resources/read', { uri: 'supabase://tables' });
    
    // Test listing tools
    console.log('\nListing tools...');
    await sendRequest('tools/list');
    
    // Test calling a tool
    console.log('\nCalling execute-sql tool...');
    await sendRequest('tools/call', { 
      name: 'execute-sql', 
      arguments: { query: 'SELECT NOW()' }
    });
    
    console.log('\nMinimal Supabase MCP server test completed.');
    return true;
  } finally {
    // Clean up after a delay to ensure we see all output
    setTimeout(() => {
      serverProcess.kill();
      console.log('Server process terminated.');
    }, 1000);
  }
}

// Run the test
testMinimalSupabaseMcp()
  .then(() => {
    setTimeout(() => process.exit(0), 2000);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    setTimeout(() => process.exit(1), 2000);
  }); 