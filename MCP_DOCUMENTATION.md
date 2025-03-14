# Model Context Protocol (MCP) Implementation Documentation

## Table of Contents
- [Overview](#overview)
- [MCP Architecture](#mcp-architecture)
- [Available MCP Servers](#available-mcp-servers)
  - [Supabase MCP Server](#supabase-mcp-server)
  - [GitHub MCP Server](#github-mcp-server)
  - [Vercel MCP Server](#vercel-mcp-server)
- [Standard Protocol Methods](#standard-protocol-methods)
- [Testing the MCP Servers](#testing-the-mcp-servers)
- [Environment Configuration](#environment-configuration)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Overview

The Model Context Protocol (MCP) is a standardized protocol that allows applications to provide context for Large Language Models (LLMs) in a consistent way. It separates the concerns of providing context from the actual LLM interaction, enabling a more modular and flexible approach to building AI-powered applications.

This project implements several MCP servers that expose different data sources and functionalities:

- **Supabase MCP Server**: For interacting with Supabase databases
- **GitHub MCP Server**: For accessing GitHub repositories and performing GitHub operations
- **Vercel MCP Server**: For managing Vercel deployments and projects

All these servers follow the MCP specification, allowing them to be used with any MCP client.

## MCP Architecture

MCP servers expose three primary types of functionalities:

1. **Resources**: Data that can be read by LLMs (similar to GET endpoints in REST APIs)
2. **Tools**: Executable functions that can perform actions (similar to POST endpoints)
3. **Prompts**: Reusable templates for LLM interactions

Communication between clients and servers uses the JSON-RPC 2.0 protocol over standard I/O (stdio) or other transport mechanisms.

### JSON-RPC Message Format

MCP uses JSON-RPC 2.0 for communication. The message format is as follows:

```json
{
  "jsonrpc": "2.0",
  "id": "unique_id",
  "method": "method_name",
  "params": { /* method parameters */ }
}
```

Response format:

```json
{
  "jsonrpc": "2.0",
  "id": "unique_id",
  "result": { /* method result */ }
}
```

Or for errors:

```json
{
  "jsonrpc": "2.0",
  "id": "unique_id",
  "error": {
    "code": -32601,
    "message": "Method not found"
  }
}
```

## Available MCP Servers

### Supabase MCP Server

The Supabase MCP server provides access to Supabase databases, allowing LLMs to query data and execute SQL operations.

#### Implementation Details

The server is implemented using:
- The MCP TypeScript SDK
- The Supabase JavaScript client
- Zod for schema validation

#### Configuration

Create a `.env` file with your Supabase credentials:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# or
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

#### Resources

The server exposes the following resources:

- `supabase://tables` - Lists all tables in the public schema
- `supabase://tables/{tableName}/schema` - Shows the schema for a specific table
- `supabase://tables/{tableName}` - Queries data from a specific table (limited to 100 rows)

#### Tools

The server provides the following tools:

- `execute-sql` - Executes a SQL query using the Supabase RPC function
  ```json
  {
    "query": "SELECT * FROM users LIMIT 10"
  }
  ```

- `insert-data` - Inserts data into a specified table
  ```json
  {
    "tableName": "users",
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

- `update-data` - Updates data in a specified table based on filter criteria
  ```json
  {
    "tableName": "users",
    "filter": {
      "id": 1
    },
    "data": {
      "name": "Jane Doe"
    }
  }
  ```

#### Example Requests

Listing resources:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list",
  "params": {}
}
```

Reading a resource:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "resources/read",
  "params": {
    "uri": "supabase://tables"
  }
}
```

Calling a tool:
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "execute-sql",
    "arguments": {
      "query": "SELECT NOW()"
    }
  }
}
```

### GitHub MCP Server

The GitHub MCP server enables interaction with GitHub repositories, including accessing files, commits, issues, and performing various GitHub operations.

#### Implementation Details

The server is implemented using:
- The MCP TypeScript SDK
- The Octokit GitHub REST API client
- Tweetsodium for encryption (used in secrets management)

#### Configuration

Create a `.env` file with your GitHub credentials:
```
GITHUB_TOKEN=your_github_personal_access_token
```

The token should have the following permissions:
- `repo` (Full control of private repositories)
- `workflow` (if you plan to use workflow-related operations)

#### Resources

- `github://repos/{owner}/{repo}` - Gets information about a specific repository
- `github://repos/{owner}/{repo}/issues` - Lists issues in a repository
- `github://repos/{owner}/{repo}/pulls` - Lists pull requests in a repository
- `github://repos/{owner}/{repo}/contents/{path}` - Gets contents of a file or directory
- `github://repos/{owner}/{repo}/commits` - Lists commits in a repository

#### Tools

- `create-issue` - Creates a new issue in a repository
  ```json
  {
    "owner": "username",
    "repo": "repository-name",
    "title": "Issue title",
    "body": "Issue description"
  }
  ```

- `create-comment` - Adds a comment to an issue or pull request
  ```json
  {
    "owner": "username",
    "repo": "repository-name",
    "issue_number": 123,
    "body": "Comment text"
  }
  ```

- `create-secret` - Creates a repository secret (encrypted)
  ```json
  {
    "owner": "username",
    "repo": "repository-name",
    "secret_name": "API_KEY",
    "secret_value": "your-secret-value"
  }
  ```

- `list-workflows` - Lists workflows in a repository
  ```json
  {
    "owner": "username",
    "repo": "repository-name"
  }
  ```

### Vercel MCP Server

The Vercel MCP server provides access to Vercel deployment information and enables deployment management.

#### Implementation Details

The server is implemented using:
- The MCP TypeScript SDK
- The Vercel client
- Node-fetch for API requests

#### Configuration

Create a `.env` file with your Vercel credentials:
```
VERCEL_TOKEN=your_vercel_token
```

You can create a token in your Vercel account settings.

#### Resources

- `vercel://projects/{projectId}` - Gets detailed information about a specific project
- `vercel://projects/{projectId}/deployments` - Lists deployments for a project
- `vercel://deployments/{deploymentId}` - Gets information about a specific deployment

#### Tools

- `create-deployment` - Triggers a new deployment
  ```json
  {
    "projectId": "your-project-id",
    "branch": "main",
    "message": "Deployment triggered via MCP"
  }
  ```

- `list-projects` - Lists all available projects
  ```json
  {}
  ```

## Standard Protocol Methods

All MCP servers implement the following standard methods:

- `ping` - Checks if the server is responsive
  ```json
  {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "ping",
    "params": {}
  }
  ```

- `resources/list` - Lists available resources
  ```json
  {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "resources/list",
    "params": {}
  }
  ```

- `resources/read` - Reads the content of a resource
  ```json
  {
    "jsonrpc": "2.0",
    "id": 3,
    "method": "resources/read",
    "params": {
      "uri": "resource_uri"
    }
  }
  ```

- `tools/list` - Lists available tools
  ```json
  {
    "jsonrpc": "2.0",
    "id": 4,
    "method": "tools/list",
    "params": {}
  }
  ```

- `tools/call` - Calls a tool with specified arguments
  ```json
  {
    "jsonrpc": "2.0",
    "id": 5,
    "method": "tools/call",
    "params": {
      "name": "tool_name",
      "arguments": { /* tool arguments */ }
    }
  }
  ```

## Testing the MCP Servers

### Supabase MCP Server Tests

Several test scripts are available for testing the Supabase MCP server:

1. **Minimal Test**: A simple script that tests basic functionality
   ```
   node mcp-servers/minimal_supabase_test.js
   ```

2. **Simple Test**: A more comprehensive test that verifies resource access and tool execution
   ```
   node mcp-servers/simple_supabase_test.js
   ```

3. **Improved Test**: Tests the improved server with additional functionality
   ```
   node mcp-servers/test_improved_supabase.js
   ```

4. **Direct API Test**: Tests direct connection to the Supabase API
   ```
   node mcp-servers/supabase_api_test.js
   ```

### GitHub MCP Server Tests

1. **Basic Test**: Tests basic functionality of the GitHub MCP server
   ```
   node mcp-servers/github_test.js
   ```

2. **Direct API Test**: Tests direct connection to the GitHub API
   ```
   node mcp-servers/github_direct_test.js
   ```

3. **Secrets Test**: Tests GitHub secrets management
   ```
   node mcp-servers/github_secrets_test.js
   ```

### Vercel MCP Server Tests

1. **Basic Test**: Tests basic functionality of the Vercel MCP server
   ```
   node mcp-servers/vercel_test.js
   ```

2. **Projects List**: Lists available Vercel projects
   ```
   node mcp-servers/vercel_list_projects.js
   ```

3. **Direct API Test**: Tests direct connection to the Vercel API
   ```
   node mcp-servers/vercel_api_test.js
   ```

## Environment Configuration

All MCP servers require environment variables to be set for authentication with their respective services. Create a `.env` file in the root directory with the necessary credentials:

```
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# GitHub Configuration
GITHUB_TOKEN=your_github_personal_access_token

# Vercel Configuration
VERCEL_TOKEN=your_vercel_token
```

## Security Considerations

### Token Security

- Never commit your tokens to the repository. Use the `.env` file which should be added to `.gitignore`.
- Consider using token rotation for production environments.
- Use the minimum required permissions for your tokens.

### Supabase Security

- The `execute-sql` tool allows arbitrary SQL execution, which could be a security risk. Consider:
  - Limiting what SQL can be executed
  - Using RLS (Row Level Security) in Supabase
  - Ensuring the Supabase key has restricted permissions

### GitHub Security

- When using `create-secret` tool, the secret value is encrypted before transmission.
- Be cautious with repository contents access and modification.

### Vercel Security

- Deployment creation should be carefully controlled.
- Consider using preview deployments for testing changes.

## Troubleshooting

### Common Issues

1. **Method not found**: Ensure you're using the correct method names as per the MCP specification. The most common methods are:
   - `ping`
   - `resources/list`
   - `resources/read`
   - `tools/list`
   - `tools/call`

2. **Authentication errors**: Check that your environment variables are correctly set and that your tokens have the necessary permissions.

3. **Schema validation errors**: When using tools, ensure that you're providing all required parameters with the correct types.

4. **Resource not found**: Verify that the resource URI is correctly formatted and that you have permission to access the resource.

### Debugging Tips

1. Use the test scripts to verify that the servers are functioning correctly.
2. Check the server output for error messages.
3. Ensure that the necessary dependencies are installed:
   ```
   npm install @modelcontextprotocol/sdk dotenv zod
   ```
   For specific servers:
   ```
   npm install @supabase/supabase-js tweetsodium
   npm install @vercel/client node-fetch@2
   ```

## Next Steps

### Enhancing the Servers

1. **Add more resources and tools**: Extend the functionality of each server with more specialized resources and tools.
2. **Implement prompts**: None of the current servers implement prompts - consider adding this MCP feature.
3. **Improve error handling**: Enhance error reporting and recovery mechanisms.

### Integration with LLMs

1. **Connect with Claude Desktop**: Test the servers with the Claude Desktop app.
2. **Build custom MCP clients**: Create custom clients that use these servers.
3. **Create multi-server workflows**: Design workflows that combine multiple MCP servers.

### Additional Server Ideas

1. **MongoDB MCP Server**: For NoSQL database access
2. **Slack MCP Server**: For Slack messaging and channel management
3. **AWS MCP Server**: For AWS resource management
4. **Local Filesystem MCP Server**: For accessing and manipulating local files

## Further Resources

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io)
- [MCP TypeScript SDK Documentation](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK Documentation](https://github.com/modelcontextprotocol/python-sdk)
- [Model Context Protocol Blog Post](https://www.anthropic.com/news/model-context-protocol) 