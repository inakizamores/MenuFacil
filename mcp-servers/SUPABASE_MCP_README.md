# Improved Supabase MCP Server

This document provides information about the improved Supabase Model Context Protocol (MCP) server implementation.

## Current Status

The Supabase MCP server has been significantly improved to:

1. Load environment variables from the `.env` file using `dotenv`
2. Connect to the Supabase API using credentials from environment variables
3. Respond to the standard MCP `ping` method
4. Provide structured access to Supabase resources and tools
5. Offer metadata resources for discovering available capabilities

## Available Methods

The server supports the following standard MCP methods:

### Utility Methods
- `ping`: Standard MCP utility method to check if the server is alive

### Resource Access
- `resource`: Access resources using URIs

### Tool Execution
- `tool`: Execute tools by name with parameters

## Resources

The server provides the following resources:

### Metadata Resources
- `mcp://resources`: Lists all available resources
- `mcp://tools`: Lists all available tools
- `mcp://methods`: Lists all available methods

### Supabase Resources
- `supabase://tables/{tableName}/schema`: Get schema information for a Supabase table
- `supabase://tables/{tableName}`: Query data from a Supabase table

## Tools

The server provides the following tools:

- `execute-sql`: Execute SQL queries against the Supabase database
  - Parameters: `query` (string)
- `insert-data`: Insert data into a Supabase table
  - Parameters: `tableName` (string), `data` (object)
- `update-data`: Update data in a Supabase table
  - Parameters: `tableName` (string), `filter` (object), `data` (object)
- `call-tool`: A proxy tool that can invoke other tools
  - Parameters: `name` (string), `params` (object)

## Usage

To use the Supabase MCP server:

1. Ensure your `.env` file contains the necessary Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. Start the server:
   ```
   cd mcp-servers
   node supabase/index.js
   ```

3. Connect to the server using an MCP client.

## Accessing Resources

Resources can be accessed using the `resource` method with the appropriate URI:

```javascript
// Request
{
  "jsonrpc": "2.0",
  "id": 123,
  "method": "resource",
  "params": {
    "uri": "supabase://tables/users"
  }
}
```

## Executing Tools

Tools can be executed using the `tool` method with the tool name and parameters:

```javascript
// Request
{
  "jsonrpc": "2.0",
  "id": 456,
  "method": "tool",
  "params": {
    "name": "execute-sql",
    "params": {
      "query": "SELECT * FROM users LIMIT 10"
    }
  }
}
```

## Testing

You can test the server using the provided test scripts:

- `supabase_api_test.js`: Tests direct connection to the Supabase API
- `test_improved_supabase.js`: Tests the improved MCP server with standard methods

Run a test script with:
```
cd mcp-servers
node test_improved_supabase.js
```

## Implementation Details

The improved server now properly exposes resources and tools through the standard MCP methods. The implementation includes:

1. Resources for listing available resources and tools (`mcp://resources`, `mcp://tools`)
2. A resource for listing available methods (`mcp://methods`)
3. A proxy tool for tool invocation (`call-tool`)
4. Better organized code for maintainability

This implementation follows the ResourceTemplate pattern from the MCP SDK and uses the standardized method names for resource access and tool execution. 