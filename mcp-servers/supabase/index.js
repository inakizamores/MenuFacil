// Load environment variables from .env file
require('dotenv').config({ path: '../../.env' });

const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod'); // Add zod for schema validation

// Create an MCP server for Supabase with explicit capabilities
const server = new McpServer({
  name: "Supabase MCP Server",
  version: "1.0.0"
}, {
  capabilities: {
    resources: {},
    tools: {}
  }
});

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iawspochdngompqmxyhf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

// Initialize Supabase client on demand
let supabase;
function getSupabaseClient() {
  if (!supabase) {
    if (!SUPABASE_KEY) {
      throw new Error("SUPABASE_KEY is not set");
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
}

// Resource for listing Supabase tables
server.resource(
  "tables-list",
  "supabase://tables",
  async (uri) => {
    const client = getSupabaseClient();
    
    try {
      // Query the list of tables
      const { data, error } = await client
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(100);
      
      if (error) throw error;
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error listing tables: ${error.message}\n\nYou can still query specific tables if you know their names.`
        }]
      };
    }
  }
);

// Resource for getting table schema
server.resource(
  "table-schema",
  new ResourceTemplate("supabase://tables/{tableName}/schema", {}),
  async (uri, { tableName }) => {
    const client = getSupabaseClient();
    
    try {
      // Query columns from information_schema
      const { data, error } = await client
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', tableName)
        .eq('table_schema', 'public');
      
      if (error) throw error;
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error fetching schema for table ${tableName}: ${error.message}`
        }]
      };
    }
  }
);

// Resource for querying a table
server.resource(
  "table-query",
  new ResourceTemplate("supabase://tables/{tableName}", {}),
  async (uri, { tableName }) => {
    const client = getSupabaseClient();
    
    try {
      const { data, error } = await client
        .from(tableName)
        .select('*')
        .limit(100);
      
      if (error) throw error;
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error querying table ${tableName}: ${error.message}`
        }]
      };
    }
  }
);

// Tool for executing SQL
server.tool(
  "execute-sql",
  {
    query: z.string().describe("SQL query to execute")
  },
  async ({ query }) => {
    const client = getSupabaseClient();
    
    try {
      // Try to use the execute_sql RPC function if it exists
      try {
        const { data, error } = await client.rpc('execute_sql', {
          sql_query: query
        });
        
        if (error) throw error;
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(data, null, 2) 
          }]
        };
      } catch (rpcError) {
        // If the RPC function doesn't exist, return a helpful message
        return {
          content: [{ 
            type: "text", 
            text: `The execute_sql RPC function does not exist in your Supabase database. 
            
To create it, you can run the following SQL in the Supabase SQL editor:

CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;` 
          }]
        };
      }
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to execute SQL: ${error.message}` 
        }]
      };
    }
  }
);

// Tool for inserting data
server.tool(
  "insert-data",
  {
    tableName: z.string().describe("Name of the table to insert data into"),
    data: z.record(z.any()).describe("Data to insert")
  },
  async ({ tableName, data }) => {
    const client = getSupabaseClient();
    
    try {
      const { data: result, error } = await client
        .from(tableName)
        .insert(data)
        .select();
      
      if (error) throw error;
      
      return {
        content: [{ 
          type: "text", 
          text: `Data inserted successfully: ${JSON.stringify(result, null, 2)}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to insert data: ${error.message}` 
        }]
      };
    }
  }
);

// Tool for updating data
server.tool(
  "update-data",
  {
    tableName: z.string().describe("Name of the table to update"),
    filter: z.record(z.any()).describe("Filter criteria"),
    data: z.record(z.any()).describe("Data to update")
  },
  async ({ tableName, filter, data }) => {
    const client = getSupabaseClient();
    
    try {
      let query = client.from(tableName).update(data);
      
      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { data: result, error } = await query.select();
      
      if (error) throw error;
      
      return {
        content: [{ 
          type: "text", 
          text: `Data updated successfully: ${JSON.stringify(result, null, 2)}` 
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Failed to update data: ${error.message}` 
        }]
      };
    }
  }
);

// Connect the server using stdio transport
const transport = new StdioServerTransport();
server.connect(transport).catch(err => {
  console.error("Failed to connect MCP server:", err);
  process.exit(1);
}); 