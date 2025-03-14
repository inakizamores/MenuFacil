const { spawn } = require('child_process');
const path = require('path');

console.log('Starting GitHub MCP server test...');

// Path to the server
const serverPath = path.join(__dirname, 'github', 'index.js');

// Spawn the server process
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server output
server.stdout.on('data', (data) => {
  console.log(`Server stdout: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`Server stderr: ${data}`);
});

// Send a test request to the server
setTimeout(() => {
  console.log('Sending test request to GitHub MCP server...');
  
  // Structure of an MCP request with a valid method
  const request = {
    id: "1",
    jsonrpc: "2.0",
    method: "mcp.getResources",
    params: {}
  };
  
  server.stdin.write(JSON.stringify(request) + '\n');
  
  // Wait for response and then exit
  setTimeout(() => {
    console.log('Test complete. Closing server.');
    server.kill();
    process.exit(0);
  }, 1000);
}, 1000); 