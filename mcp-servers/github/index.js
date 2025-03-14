// Load environment variables from .env file
require('dotenv').config({ path: '../../.env' });

const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { Octokit } = require("octokit");
const sodium = require('tweetsodium');

// Create an MCP server for GitHub
const server = new McpServer({
  name: "GitHub MCP Server",
  version: "1.0.0"
});

// Get GitHub token from environment variable
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Initialize Octokit
let octokit;

// Resource for getting repository info
server.resource(
  "repo-info",
  new ResourceTemplate("github://repos/{owner}/{repo}", { list: undefined }),
  async (uri, { owner, repo }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      const { data } = await octokit.rest.repos.get({ 
        owner, 
        repo 
      });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  }
);

// Resource for listing issues
server.resource(
  "issues-list",
  new ResourceTemplate("github://repos/{owner}/{repo}/issues", { list: undefined }),
  async (uri, { owner, repo }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      const { data } = await octokit.rest.issues.listForRepo({ 
        owner, 
        repo,
        state: "open"
      });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }
);

// Resource for getting file contents
server.resource(
  "file-contents",
  new ResourceTemplate("github://repos/{owner}/{repo}/contents/{path*}", { list: undefined }),
  async (uri, { owner, repo, path }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      const { data } = await octokit.rest.repos.getContent({ 
        owner, 
        repo,
        path
      });
      
      // If it's a directory, list contents
      if (Array.isArray(data)) {
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(data.map(item => ({
              name: item.name,
              path: item.path,
              type: item.type,
              size: item.size,
              url: item.html_url
            })), null, 2)
          }]
        };
      }
      
      // If it's a file, get content
      let content = Buffer.from(data.content, 'base64').toString('utf8');
      
      return {
        contents: [{
          uri: uri.href,
          text: content
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch file: ${error.message}`);
    }
  }
);

// Resource for listing secrets
server.resource(
  "secrets-list",
  new ResourceTemplate("github://repos/{owner}/{repo}/secrets", { list: undefined }),
  async (uri, { owner, repo }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      const { data } = await octokit.rest.actions.listRepoSecrets({ 
        owner, 
        repo 
      });
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch repository secrets: ${error.message}`);
    }
  }
);

// Tool for creating an issue
server.tool(
  "create-issue",
  {
    owner: String,
    repo: String,
    title: String,
    body: String
  },
  async ({ owner, repo, title, body }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      const { data } = await octokit.rest.issues.create({
        owner,
        repo,
        title,
        body
      });
      
      return {
        content: [{ 
          type: "text", 
          text: `Issue created: ${data.html_url}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to create issue: ${error.message}` 
        }]
      };
    }
  }
);

// Tool for creating a pull request
server.tool(
  "create-pull-request",
  {
    owner: String,
    repo: String,
    title: String,
    body: String,
    head: String,
    base: String
  },
  async ({ owner, repo, title, body, head, base }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      const { data } = await octokit.rest.pulls.create({
        owner,
        repo,
        title,
        body,
        head,
        base
      });
      
      return {
        content: [{ 
          type: "text", 
          text: `Pull request created: ${data.html_url}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to create pull request: ${error.message}` 
        }]
      };
    }
  }
);

// Tool for creating or updating a repository secret
server.tool(
  "create-or-update-secret",
  {
    owner: String,
    repo: String,
    secret_name: String,
    secret_value: String
  },
  async ({ owner, repo, secret_name, secret_value }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      // Get public key for the repo to encrypt the secret
      const { data: publicKeyData } = await octokit.rest.actions.getRepoPublicKey({
        owner,
        repo
      });

      // Convert the secret value to a Buffer
      const messageBytes = Buffer.from(secret_value);

      // Convert the public key to a Buffer
      const keyBytes = Buffer.from(publicKeyData.key, 'base64');

      // Encrypt using sodium (tweetsodium)
      const encryptedBytes = sodium.seal(messageBytes, keyBytes);

      // Convert encrypted value to base64
      const encrypted = Buffer.from(encryptedBytes).toString('base64');

      // Create or update the secret
      await octokit.rest.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name,
        encrypted_value: encrypted,
        key_id: publicKeyData.key_id
      });
      
      return {
        content: [{ 
          type: "text", 
          text: `Secret ${secret_name} successfully created or updated in ${owner}/${repo}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to create or update secret: ${error.message}` 
        }]
      };
    }
  }
);

// Tool for adding all environment variables as secrets
server.tool(
  "add-env-vars-as-secrets",
  {
    owner: String,
    repo: String
  },
  async ({ owner, repo }) => {
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    if (!octokit) {
      octokit = new Octokit({ auth: GITHUB_TOKEN });
    }

    try {
      // Get public key for the repo to encrypt the secrets
      const { data: publicKeyData } = await octokit.rest.actions.getRepoPublicKey({
        owner,
        repo
      });

      // Environment variables to store as secrets with proper naming
      const envVars = {
        // Use GH_PAT instead of GITHUB_TOKEN to avoid GitHub naming restrictions
        "GH_PAT": process.env.GITHUB_TOKEN,
        "VERCEL_TOKEN": process.env.VERCEL_TOKEN,
        "SUPABASE_URL": process.env.SUPABASE_URL,
        "SUPABASE_ANON_KEY": process.env.SUPABASE_ANON_KEY,
        "SUPABASE_SERVICE_KEY": process.env.SUPABASE_SERVICE_KEY
      };

      // Process each environment variable
      const results = [];
      for (const [key, value] of Object.entries(envVars)) {
        if (!value) {
          results.push(`Skipped ${key}: Environment variable not set`);
          continue;
        }

        try {
          // Convert the secret value to a Buffer
          const messageBytes = Buffer.from(value);

          // Convert the public key to a Buffer
          const keyBytes = Buffer.from(publicKeyData.key, 'base64');

          // Encrypt using sodium (tweetsodium)
          const encryptedBytes = sodium.seal(messageBytes, keyBytes);

          // Convert encrypted value to base64
          const encrypted = Buffer.from(encryptedBytes).toString('base64');

          // Create or update the secret
          await octokit.rest.actions.createOrUpdateRepoSecret({
            owner,
            repo,
            secret_name: key,
            encrypted_value: encrypted,
            key_id: publicKeyData.key_id
          });

          results.push(`Secret ${key} successfully created or updated`);
        } catch (error) {
          results.push(`Failed to create or update secret ${key}: ${error.message}`);
        }
      }
      
      return {
        content: [{ 
          type: "text", 
          text: results.join('\n') 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to process environment variables as secrets: ${error.message}` 
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