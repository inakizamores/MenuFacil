// Load environment variables from .env file
require('dotenv').config({ path: '../../.env' });

const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require('zod');
const fetch = require('node-fetch');

// Create an MCP server for Sequential Thinking
const server = new McpServer({
  name: "Sequential Thinking MCP Server",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {},
    tools: {}
  }
});

// Environment variables for API access
const SMITHERY_API_KEY = process.env.SMITHERY_API_KEY;
const SMITHERY_API_URL = process.env.SMITHERY_API_URL || 'https://smithery.ai/api/server/@smithery-ai/server-sequential-thinking';

// Common headers for API requests
const getHeaders = () => {
  if (!SMITHERY_API_KEY) {
    throw new Error("SMITHERY_API_KEY is not set. Please set it in your .env file");
  }
  
  return {
    'Authorization': `Bearer ${SMITHERY_API_KEY}`,
    'Content-Type': 'application/json'
  };
};

// Resource for getting sequential thinking process
server.resource(
  "thinking-process",
  "sequential-thinking://processes",
  async (uri) => {
    try {
      const response = await fetch(`${SMITHERY_API_URL}/resources/list`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "mcp-client",
          method: "resources/list",
          params: {}
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Error retrieving processes");
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data.result, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error retrieving processes: ${error.message}`
        }]
      };
    }
  }
);

// Resource for getting thinking steps in a specific process
server.resource(
  "thinking-steps",
  new ResourceTemplate("sequential-thinking://processes/{processId}", {}),
  async (uri, { processId }) => {
    try {
      const response = await fetch(`${SMITHERY_API_URL}/resources/read`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "mcp-client",
          method: "resources/read",
          params: {
            uri: `sequential-thinking://processes/${processId}`
          }
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Error retrieving process steps");
      }
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data.result, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error retrieving steps for process ${processId}: ${error.message}`
        }]
      };
    }
  }
);

// Tool for executing sequential thinking
server.tool(
  "execute-sequential-thinking",
  {
    processId: z.string().describe("ID of the sequential thinking process to execute"),
    input: z.string().describe("The initial input for the thinking process"),
    maxSteps: z.number().optional().describe("Maximum number of steps to execute")
  },
  async ({ processId, input, maxSteps }) => {
    try {
      const response = await fetch(`${SMITHERY_API_URL}/tools/call`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "mcp-client",
          method: "tools/call",
          params: {
            name: "execute-sequential-thinking",
            arguments: {
              processId,
              input,
              maxSteps: maxSteps || 10
            }
          }
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Error executing sequential thinking");
      }
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data.result, null, 2) 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to execute sequential thinking: ${error.message}` 
        }]
      };
    }
  }
);

// Tool for creating a new sequential thinking process
server.tool(
  "create-thinking-process",
  {
    name: z.string().describe("Name of the sequential thinking process"),
    description: z.string().describe("Description of the process"),
    steps: z.array(z.object({
      name: z.string().describe("Name of the step"),
      description: z.string().describe("Description of the step"),
      prompt: z.string().describe("Prompt template for the step")
    })).describe("Array of steps in the process")
  },
  async ({ name, description, steps }) => {
    try {
      const response = await fetch(`${SMITHERY_API_URL}/tools/call`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "mcp-client",
          method: "tools/call",
          params: {
            name: "create-thinking-process",
            arguments: {
              name,
              description,
              steps
            }
          }
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Error creating thinking process");
      }
      
      return {
        content: [{ 
          type: "text", 
          text: `New sequential thinking process created: ${JSON.stringify(data.result, null, 2)}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to create thinking process: ${error.message}` 
        }]
      };
    }
  }
);

// Start the MCP server with stdio transport
const transport = new StdioServerTransport();
server.listen(transport); 