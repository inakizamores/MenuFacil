# MenuFacil MCP Servers

[![smithery badge](https://smithery.ai/badge/@inakizamores/menufacil)](https://smithery.ai/server/@inakizamores/menufacil)

This repository contains Model Context Protocol (MCP) servers for integration with GitHub, Vercel, and Supabase.

## Model Context Protocol (MCP)

Model Context Protocol allows AI models like Claude to interact with external services in a standardized way. The MCP servers in this repository enable Claude to access and manipulate data from GitHub, Vercel, and Supabase.

## Configuration

### Environment Variables

To use these MCP servers, you need to set the following environment variables:

- For GitHub MCP server:
  - `GITHUB_TOKEN`: Your GitHub personal access token

- For Vercel MCP server:
  - `VERCEL_TOKEN`: Your Vercel API token

- For Supabase MCP server:
  - `SUPABASE_URL`: Your Supabase project URL (defaults to https://iawspochdngompqmxyhf.supabase.co)
  - `SUPABASE_KEY`: Your Supabase API key

### Claude Desktop Configuration

Add the following configuration to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "github": {
      "command": "node",
      "args": ["mcp-servers/github/index.js"],
      "env": {
        "GITHUB_TOKEN": "your_github_token"
      }
    },
    "vercel": {
      "command": "node",
      "args": ["mcp-servers/vercel/index.js"],
      "env": {
        "VERCEL_TOKEN": "your_vercel_token"
      }
    },
    "supabase": {
      "command": "node",
      "args": ["mcp-servers/supabase/index.js"],
      "env": {
        "SUPABASE_URL": "https://iawspochdngompqmxyhf.supabase.co",
        "SUPABASE_KEY": "your_supabase_key"
      }
    }
  }
}
```

## Available MCP Servers

### GitHub MCP Server

The GitHub MCP server allows Claude to interact with GitHub repositories, issues, and pull requests.

**Resources:**
- `github://repos/{owner}/{repo}`: Get repository information
- `github://repos/{owner}/{repo}/issues`: List repository issues
- `github://repos/{owner}/{repo}/contents/{path*}`: Get file/directory contents

**Tools:**
- `create-issue`: Create a new issue in a repository
- `create-pull-request`: Create a new pull request

### Vercel MCP Server

The Vercel MCP server allows Claude to interact with Vercel projects and deployments.

**Resources:**
- `vercel://projects/{projectId}`: Get project information
- `vercel://projects/{projectId}/deployments`: List project deployments

**Tools:**
- `create-deployment`: Create a new deployment

### Supabase MCP Server

The Supabase MCP server allows Claude to interact with Supabase database tables.

**Resources:**
- `supabase://tables/{tableName}/schema`: Get table schema
- `supabase://tables/{tableName}`: Query table data

**Tools:**
- `execute-sql`: Execute SQL queries
- `insert-data`: Insert data into a table
- `update-data`: Update data in a table

## Usage

To use these MCP servers with Claude, simply install them in your Claude Desktop configuration and then ask Claude to interact with GitHub, Vercel, or Supabase. For example:

- "Can you check the issues in my GitHub repository?"
- "Please deploy my project to Vercel."
- "Show me the data in my Supabase table."

Claude will use the appropriate MCP server to fulfill these requests. 