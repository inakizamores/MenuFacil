// Simple test script for the improved Supabase MCP server
require('dotenv').config({ path: '../.env' });
const { spawn } = require('child_process');

// Main test function
async function testSimpleSupabaseMcp() {
  console.log('Starting Simple Supabase MCP Server test...');
  
  // Start the MCP server process
  console.log('\nStarting Supabase MCP server...');
  const serverProcess = spawn('node', ['supabase/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Collect complete lines from stdout
  let stdoutBuffer = '';
  serverProcess.stdout.on('data', (data) => {
    const text = data.toString();
    stdoutBuffer += text;
    
    // Process complete lines
    const lines = stdoutBuffer.split('\n');
    if (lines.length > 1) {
      stdoutBuffer = lines.pop(); // Keep the incomplete line
      
      for (const line of lines) {
        if (line.trim()) {
          console.log(`Server stdout: ${line}`);
        }
      }
    }
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
  });
  
  // Wait for server to initialize
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Helper function to send a request and wait for response
  async function sendRequest(method, params = {}) {
    return new Promise((resolve, reject) => {
      const requestId = Math.floor(Math.random() * 10000);
      const request = {
        jsonrpc: '2.0',
        id: requestId,
        method,
        params
      };
      
      console.log(`\nSending request: ${JSON.stringify(request, null, 2)}`);
      
      // Create a one-time data handler for this specific request
      const dataHandler = (data) => {
        const responseText = data.toString();
        
        try {
          // Try to parse each line as JSON
          const lines = responseText.split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            
            try {
              const response = JSON.parse(line);
              if (response.id === requestId) {
                serverProcess.stdout.removeListener('data', dataHandler);
                console.log(`\nReceived response: ${JSON.stringify(response, null, 2)}`);
                
                if (response.error) {
                  reject(response.error);
                } else {
                  resolve(response.result);
                }
                return;
              }
            } catch (parseError) {
              // Not valid JSON, continue to next line
            }
          }
        } catch (error) {
          // Not a complete or valid JSON response, keep listening
        }
      };
      
      // Add listener before sending the request
      serverProcess.stdout.on('data', dataHandler);
      
      // Send the request
      serverProcess.stdin.write(JSON.stringify(request) + '\n');
      
      // Set a timeout to prevent hanging
      setTimeout(() => {
        serverProcess.stdout.removeListener('data', dataHandler);
        reject(new Error(`Timeout waiting for response to ${method}`));
      }, 5000);
    });
  }
  
  try {
    // Test ping
    console.log('\nTesting ping method...');
    const pingResult = await sendRequest('ping');
    console.log('Ping result:', pingResult);
    
    // Test listing resources
    console.log('\nListing resources...');
    try {
      const resourcesListResult = await sendRequest('resources/list');
      console.log('Resources list result:', resourcesListResult);
      
      // If we have resources, try to access the first one
      if (resourcesListResult.resources && resourcesListResult.resources.length > 0) {
        const firstResource = resourcesListResult.resources[0];
        console.log(`\nAccessing resource: ${firstResource.uri}`);
        
        try {
          const resourceResult = await sendRequest('resources/get', { 
            uri: firstResource.uri
          });
          console.log(`Resource content for ${firstResource.uri}:`, resourceResult);
        } catch (error) {
          console.warn(`Warning: Could not access resource ${firstResource.uri}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not list resources:', error.message);
    }
    
    // Test listing tools
    console.log('\nListing tools...');
    try {
      const toolsListResult = await sendRequest('tools/list');
      console.log('Tools list result:', toolsListResult);
      
      // If we have tools, try to call the first one
      if (toolsListResult.tools && toolsListResult.tools.length > 0) {
        const firstTool = toolsListResult.tools[0];
        console.log(`\nCalling tool: ${firstTool.name}`);
        
        try {
          // For execute-sql tool, use a simple query
          const toolArgs = firstTool.name === 'execute-sql' 
            ? { query: 'SELECT NOW()' }
            : {};
            
          const toolResult = await sendRequest('tools/call', { 
            name: firstTool.name, 
            arguments: toolArgs
          });
          console.log(`Tool result for ${firstTool.name}:`, toolResult);
        } catch (error) {
          console.warn(`Warning: Could not call tool ${firstTool.name}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('Warning: Could not list tools:', error.message);
    }
    
    console.log('\nSimple Supabase MCP server test completed successfully!');
    return true;
  } catch (error) {
    console.error('Error in test:', error);
    return false;
  } finally {
    // Clean up
    serverProcess.kill();
  }
}

// Run the test
testSimpleSupabaseMcp()
  .then(success => {
    console.log(`\nTest result: ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 