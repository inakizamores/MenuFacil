// Final test script for Supabase MCP server
require('dotenv').config({ path: '../.env' });
const { spawn } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Main test function
async function testSupabaseMcp() {
  console.log('Starting Supabase MCP Server final test...');
  
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
  
  // Helper function to send a request and wait for response
  async function sendRequest(method, params = {}) {
    const requestId = Math.floor(Math.random() * 10000);
    const request = {
      jsonrpc: '2.0',
      id: requestId,
      method,
      params
    };
    
    console.log(`\nSending request: ${JSON.stringify(request)}`);
    serverProcess.stdin.write(JSON.stringify(request) + '\n');
    
    // Wait for a response
    await new Promise(resolve => setTimeout(resolve, 1000));
    return requestId;
  }
  
  // Test ping method
  await sendRequest('ping');
  
  // Test table-schema resource
  await sendRequest('table-schema', { tableName: 'users' });
  
  // Test table-query resource
  await sendRequest('table-query', { tableName: 'users' });
  
  // Test execute-sql tool
  await sendRequest('execute-sql', { query: 'SELECT NOW()' });
  
  // Test insert-data tool
  await sendRequest('insert-data', { 
    tableName: 'users', 
    data: { name: 'Test User', email: 'test@example.com' } 
  });
  
  // Test update-data tool
  await sendRequest('update-data', { 
    tableName: 'users', 
    filter: { email: 'test@example.com' },
    data: { name: 'Updated Test User' } 
  });
  
  console.log('\nFinal test completed. Check the server output above to see if it responded.');
  
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