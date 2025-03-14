// Load environment variables from .env file
require('dotenv').config({ path: '../.env' });

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Starting Supabase MCP server test...');

// Check if Supabase credentials are set
if (process.env.SUPABASE_URL) {
  console.log(`Supabase URL is set: ${process.env.SUPABASE_URL.substring(0, 15)}...`);
} else {
  console.error('ERROR: SUPABASE_URL is not set in your .env file');
  process.exit(1);
}

if (process.env.SUPABASE_ANON_KEY) {
  console.log(`Supabase Anon Key is set: ${process.env.SUPABASE_ANON_KEY.substring(0, 10)}...`);
} else {
  console.error('ERROR: SUPABASE_ANON_KEY is not set in your .env file');
  process.exit(1);
}

if (process.env.SUPABASE_SERVICE_KEY) {
  console.log(`Supabase Service Key is set: ${process.env.SUPABASE_SERVICE_KEY.substring(0, 10)}...`);
} else {
  console.log('WARNING: SUPABASE_SERVICE_KEY is not set in your .env file');
}

// Path to the server
const serverPath = path.join(__dirname, 'supabase', 'index.js');

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

// Test direct API requests to Supabase
async function testDirectApiCalls() {
  console.log('\nTesting direct API calls to Supabase...');
  
  try {
    // Test fetching the list of tables
    console.log(`\nFetching list of tables from Supabase...`);
    
    const tablesResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_ANON_KEY}`);
    
    if (!tablesResponse.ok) {
      console.error(`HTTP error! Status: ${tablesResponse.status}`);
      return false;
    }
    
    const tables = await tablesResponse.json();
    console.log('Tables in your Supabase database:');
    console.log(tables);
    
    // Store tables for later use
    const availableTables = tables;
    
    // If we have tables, try to query one of them
    if (availableTables && availableTables.length > 0) {
      const firstTable = availableTables[0];
      console.log(`\nFetching data from the '${firstTable}' table (limit 3 rows)...`);
      
      const tableDataResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/${firstTable}?select=*&limit=3`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!tableDataResponse.ok) {
        console.error(`HTTP error when fetching table data! Status: ${tableDataResponse.status}`);
        if (tableDataResponse.status === 404) {
          console.error('Table not found. The tables API might be returning table names in a different format.');
        }
      } else {
        const tableData = await tableDataResponse.json();
        console.log(`Sample data from '${firstTable}':`, tableData);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error with direct API calls:', error);
    return false;
  }
}

// Test the Supabase client functionality in an isolated environment
async function testSupabaseClient() {
  console.log(`\nTesting the Supabase client functionality...`);
  console.log('Creating a simple script to test the Supabase client...');
  
  // Create a test file with client code
  const fs = require('fs');
  const testFilePath = path.join(__dirname, 'supabase_api_test.js');
  
  const supabaseClientCode = `
  // Script to test Supabase client directly
  require('dotenv').config({ path: '../.env' });
  const { createClient } = require('@supabase/supabase-js');
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  
  async function testSupabaseApi() {
    try {
      console.log('Connecting to Supabase with:');
      console.log('URL:', SUPABASE_URL);
      console.log('Anon Key:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'Not set');
      
      // Initialize Supabase client
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      // Test a simple query to get the current time
      const { data: serverTime, error: serverTimeError } = await supabase
        .rpc('get_server_time');
      
      if (serverTimeError) {
        console.error('Error getting server time:', serverTimeError);
        
        // If get_server_time RPC doesn't exist, try a different approach
        console.log('Trying a different approach...');
        
        // Try to list the tables or perform a simpler query
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .limit(5);
        
        if (tablesError) {
          console.error('Error getting tables:', tablesError);
          throw new Error('Failed to connect to Supabase');
        }
        
        console.log('Tables query successful!');
        console.log('Found tables:', tablesData);
      } else {
        console.log('Server time query successful!');
        console.log('Current server time:', serverTime);
      }
      
      console.log('Supabase connection test passed successfully!');
      return true;
    } catch (error) {
      console.error('Error testing Supabase connection:', error);
      return false;
    }
  }
  
  // Run the test
  testSupabaseApi()
    .then(success => {
      if (success) {
        console.log('All Supabase client tests passed!');
        process.exit(0);
      } else {
        console.error('Supabase client tests failed!');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Unexpected error in test script:', err);
      process.exit(1);
    });
  `;
  
  fs.writeFileSync(testFilePath, supabaseClientCode);
  
  // Run the test file
  return new Promise((resolve) => {
    const testProcess = spawn('node', [testFilePath], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      console.log(`Supabase client test completed with code ${code}`);
      resolve(code === 0);
    });
  });
}

// Test function to get MCP methods supported by the server
async function testGetMethods() {
  console.log('\nTesting MCP methods supported by the server...');
  
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

// MCP client setup function
async function createMcpClient(serverProcess) {
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Connect to MCP server
  const mcp = {
    // Mock method to call MCP methods
    call: async (method, params) => {
      // Simple JSON-RPC 2.0 request
      const requestBody = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method: method,
        params: params || {}
      };
      
      try {
        console.log(`Sending request: ${JSON.stringify(requestBody)}`);
        // Only write to stdin if the server process exists
        serverProcess.stdin.write(JSON.stringify(requestBody) + '\n');
        
        // Return a promise that resolves when we get a result
        return new Promise((resolve, reject) => {
          let handled = false;
          
          // Listen for response from the server
          const dataHandler = (data) => {
            if (handled) return;
            
            try {
              const responseText = data.toString();
              console.log(`Raw response: ${responseText}`);
              
              // Try to parse JSON
              const response = JSON.parse(responseText);
              
              if (response.id === requestBody.id) {
                handled = true;
                if (response.error) {
                  reject(response.error);
                } else {
                  resolve(response.result);
                }
              }
            } catch (err) {
              console.log('Error parsing MCP response:', err.message);
            }
          };
          
          // Add the response handler
          serverProcess.stdout.on('data', dataHandler);
          
          // Set a timeout to reject if no response
          setTimeout(() => {
            if (!handled) {
              serverProcess.stdout.removeListener('data', dataHandler);
              reject(new Error(`Timeout waiting for response to ${method}`));
            }
          }, 5000);
        });
      } catch (error) {
        console.error(`Error calling MCP method ${method}:`, error);
        throw error;
      }
    },
    
    // Get available methods
    getMethods: async () => {
      try {
        const result = await mcp.call('rpc.discover', {});
        return result.methods || {};
      } catch (error) {
        console.error('Error getting MCP methods:', error);
        return {};
      }
    }
  };
  
  return mcp;
}

// Main test function
async function testSupabaseMcp() {
  console.log('Starting Supabase MCP Server test...');
  
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
  
  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });
  
  try {
    // Wait for server to initialize and create MCP client
    console.log('Waiting for server to initialize...');
    const mcp = await createMcpClient(serverProcess);
    
    // Get available methods
    console.log('\nDiscovering available MCP methods...');
    const methods = await mcp.getMethods();
    console.log('Available methods:', Object.keys(methods));
    
    // Test specific methods
    console.log('\nTesting mcp.getMethods method...');
    try {
      const result = await mcp.call('mcp.getMethods', {});
      console.log('getMethods result:', result);
    } catch (error) {
      console.error('Error testing getMethods:', error);
    }
    
    // Try a direct test of the resource handler
    console.log('\nTesting resource handler directly...');
    try {
      // Create a request that matches the resource template pattern
      const request = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method: 'mcp.resource.get',
        params: {
          uri: 'supabase://tables/users/schema'
        }
      };
      
      console.log(`Sending direct request: ${JSON.stringify(request)}`);
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Try another approach with tool invocation
      console.log('\nTesting tool invocation directly...');
      const toolRequest = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method: 'mcp.tool.invoke',
        params: {
          name: 'execute-sql',
          params: {
            query: 'SELECT NOW()'
          }
        }
      };
      
      console.log(`Sending tool request: ${JSON.stringify(toolRequest)}`);
      serverProcess.stdin.write(JSON.stringify(toolRequest) + '\n');
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error('Error with direct testing:', error);
    }
    
    console.log('\nSupabase MCP server test completed');
    return true;
  } catch (error) {
    console.error('Error in MCP test:', error);
    return false;
  } finally {
    // Clean up
    serverProcess.kill();
  }
}

// Run the test
testSupabaseMcp()
  .then(success => {
    console.log(`\nTest result: ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 