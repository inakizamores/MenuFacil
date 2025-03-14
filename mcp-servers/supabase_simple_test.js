// Simple test script for Supabase MCP server
require('dotenv').config({ path: '../.env' });
const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Main test function
async function testSupabaseMcp() {
  console.log('Starting Supabase MCP Server simple test...');
  
  // Check Supabase credentials
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  
  console.log('Supabase URL:', SUPABASE_URL ? 'Set' : 'Not set');
  console.log('Supabase Key:', SUPABASE_ANON_KEY ? 'Set (first 5 chars: ' + SUPABASE_ANON_KEY.substring(0, 5) + '...)' : 'Not set');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials. Please check your .env file.');
    return false;
  }
  
  // First test direct connection to verify credentials
  console.log('\nTesting direct Supabase connection...');
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.warn('Warning: Auth check returned an error, but we can continue with the MCP test:', authError);
    } else {
      console.log('Direct Supabase connection successful!');
    }
  } catch (error) {
    console.error('Error connecting directly to Supabase:', error);
    console.warn('Continuing with MCP test despite direct connection issues...');
  }
  
  // Start the MCP server process
  console.log('\nStarting Supabase MCP server...');
  const serverProcess = spawn('node', ['supabase/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Handle server process events
  serverProcess.stdout.on('data', (data) => {
    console.log(`Server stdout: ${data}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Send a simple ping message to see if the server responds
  console.log('\nSending a simple ping message to the server...');
  const pingMessage = {
    jsonrpc: '2.0',
    id: 1,
    method: 'ping',
    params: {}
  };
  
  serverProcess.stdin.write(JSON.stringify(pingMessage) + '\n');
  
  // Wait for a response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Try another method
  console.log('\nTrying another method...');
  const anotherMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'mcp.resource.get',
    params: {
      uri: 'supabase://tables/users/schema'
    }
  };
  
  serverProcess.stdin.write(JSON.stringify(anotherMessage) + '\n');
  
  // Wait for a response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('\nSimple test completed. Check the server output above to see if it responded.');
  
  // Clean up
  serverProcess.kill();
  return true;
}

// Run the test
testSupabaseMcp()
  .then(success => {
    console.log(`\nTest result: ${success ? 'COMPLETED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 