require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Helper function to test an MCP server
async function testServer(serverName) {
  return new Promise((resolve) => {
    console.log(`\n[${serverName}] Testing MCP server...`);
    
    const serverPath = path.join(__dirname, serverName, 'index.js');
    
    // Check if server file exists
    if (!fs.existsSync(serverPath)) {
      console.error(`[${serverName}] Server file not found at ${serverPath}`);
      resolve(false);
      return;
    }
    
    // Spawn the server process
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let success = false;
    let error = null;
    
    // Handle server output
    server.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${serverName}] stdout: ${output}`);
      if (output.includes('connected to transport')) {
        success = true;
      }
    });
    
    server.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(`[${serverName}] stderr: ${output}`);
      if (output.includes('Error') && !output.includes('Warning')) {
        error = output;
      }
    });
    
    // Wait a bit for server to initialize
    setTimeout(() => {
      if (error) {
        console.error(`[${serverName}] Server initialization error: ${error}`);
        resolve(false);
      } else {
        console.log(`[${serverName}] Server initialized successfully`);
        resolve(true);
      }
      
      // Kill the server process
      server.kill();
    }, 2000);
    
    // Handle server exit
    server.on('exit', (code) => {
      console.log(`[${serverName}] Server process exited with code ${code}`);
    });
  });
}

// Test environment variables
console.log('Checking environment variables:');
console.log('GITHUB_TOKEN: ' + (process.env.GITHUB_TOKEN ? 'Present' : 'Missing'));
console.log('VERCEL_TOKEN: ' + (process.env.VERCEL_TOKEN ? 'Present' : 'Missing'));
console.log('SUPABASE_URL: ' + (process.env.SUPABASE_URL ? 'Present' : 'Missing'));
console.log('SUPABASE_ANON_KEY: ' + (process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing'));
console.log('SUPABASE_SERVICE_KEY: ' + (process.env.SUPABASE_SERVICE_KEY ? 'Present' : 'Missing'));
console.log('SMITHERY_API_KEY: ' + (process.env.SMITHERY_API_KEY ? 'Present' : 'Missing'));

// Run tests
async function runTests() {
  const results = {
    github: await testServer('github'),
    vercel: await testServer('vercel'),
    supabase: await testServer('supabase')
  };
  
  console.log('\n--- TEST RESULTS ---');
  Object.entries(results).forEach(([server, success]) => {
    console.log(`${server}: ${success ? 'PASSED' : 'FAILED'}`);
  });
}

runTests(); 