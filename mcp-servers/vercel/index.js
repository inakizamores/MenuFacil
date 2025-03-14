// Load environment variables from .env file
require('dotenv').config({ path: '../../.env' });

const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { createClient } = require("@vercel/client");

// Create an MCP server for Vercel
const server = new McpServer({
  name: "Vercel MCP Server",
  version: "1.0.0"
});

// Get Vercel token from environment variable
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

// Initialize Vercel client
let vercelClient;

// Resource for getting project info
server.resource(
  "project-info",
  new ResourceTemplate("vercel://projects/{projectId}", { list: undefined }),
  async (uri, { projectId }) => {
    if (!VERCEL_TOKEN) {
      throw new Error("VERCEL_TOKEN is not set");
    }

    if (!vercelClient) {
      vercelClient = createClient({ token: VERCEL_TOKEN });
    }

    try {
      const project = await vercelClient.fetch(`/v9/projects/${projectId}`);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(project, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }
  }
);

// Resource for listing deployments
server.resource(
  "deployments-list",
  new ResourceTemplate("vercel://projects/{projectId}/deployments", { list: undefined }),
  async (uri, { projectId }) => {
    if (!VERCEL_TOKEN) {
      throw new Error("VERCEL_TOKEN is not set");
    }

    if (!vercelClient) {
      vercelClient = createClient({ token: VERCEL_TOKEN });
    }

    try {
      const deployments = await vercelClient.fetch(`/v6/deployments?projectId=${projectId}`);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(deployments, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch deployments: ${error.message}`);
    }
  }
);

// Tool for creating a new deployment
server.tool(
  "create-deployment",
  {
    projectId: String,
    files: Object,
    target: String
  },
  async ({ projectId, files, target }) => {
    if (!VERCEL_TOKEN) {
      throw new Error("VERCEL_TOKEN is not set");
    }

    if (!vercelClient) {
      vercelClient = createClient({ token: VERCEL_TOKEN });
    }

    try {
      const deployment = await vercelClient.fetch(
        `/v13/deployments`,
        {
          method: 'POST',
          body: JSON.stringify({
            name: projectId,
            files,
            target: target || 'production',
            projectId
          })
        }
      );
      
      return {
        content: [{ 
          type: "text", 
          text: `Deployment created: ${JSON.stringify(deployment, null, 2)}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to create deployment: ${error.message}` 
        }]
      };
    }
  }
);

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch(error => {
  console.error("Error connecting to transport:", error);
  process.exit(1);
}); 