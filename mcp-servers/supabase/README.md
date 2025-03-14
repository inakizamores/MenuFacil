# Supabase MCP Server

This is a Model Context Protocol (MCP) server for interacting with Supabase databases. It provides resources for accessing database schema information and tools for executing SQL queries and manipulating data.

## Setup

1. Ensure you have Node.js installed
2. Install dependencies:
   ```
   npm install @modelcontextprotocol/sdk @supabase/supabase-js dotenv zod
   ```
3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   # or
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```

## Running the Server

```
node supabase/index.js
```

## Available Resources

The server exposes the following resources:

- `supabase://tables` - Lists all tables in the public schema
- `supabase://tables/{tableName}/schema` - Shows the schema for a specific table
- `supabase://tables/{tableName}` - Queries data from a specific table (limited to 100 rows)

## Available Tools

The server provides the following tools:

- `execute-sql` - Executes a SQL query using the Supabase RPC function
- `insert-data` - Inserts data into a specified table
- `update-data` - Updates data in a specified table based on filter criteria

## Testing

A minimal test script is provided to verify the server's functionality:

```
node minimal_supabase_test.js
```

## MCP Protocol Methods

The server implements the following MCP protocol methods:

- `ping` - Checks if the server is responsive
- `resources/list` - Lists available resources
- `resources/read` - Reads the content of a resource
- `tools/list` - Lists available tools
- `tools/call` - Calls a tool with specified arguments

## Example Usage

### Listing Resources

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/list",
  "params": {}
}
```

### Reading a Resource

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

### Listing Tools

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/list",
  "params": {}
}
```

### Calling a Tool

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

## Notes

- The `execute-sql` tool requires a Supabase RPC function named `execute_sql` to be created in your database. If it doesn't exist, the tool will provide instructions on how to create it.
- All tools require the Supabase key to be set in the environment variables.
- The server uses the MCP SDK's `StdioServerTransport` for communication, making it compatible with standard MCP clients. 