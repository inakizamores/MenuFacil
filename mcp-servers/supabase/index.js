const { McpServer, ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { createClient } = require('@supabase/supabase-js');

// Create an MCP server for Supabase
const server = new McpServer({
  name: "Supabase MCP Server",
  version: "1.0.0"
});

// Get Supabase credentials from environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iawspochdngompqmxyhf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
let supabase;

// Resource for getting table schema
server.resource(
  "table-schema",
  new ResourceTemplate("supabase://tables/{tableName}/schema", { list: undefined }),
  async (uri, { tableName }) => {
    if (!SUPABASE_KEY) {
      throw new Error("SUPABASE_KEY is not set");
    }

    if (!supabase) {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    try {
      // Query RPC function that returns table info
      const { data, error } = await supabase.rpc('get_table_schema', {
        table_name: tableName
      });
      
      if (error) throw error;
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      throw new Error(`Failed to fetch table schema: ${error.message}`);
    }
  }
);

// Resource for querying a table
server.resource(
  "table-query",
  new ResourceTemplate("supabase://tables/{tableName}", { list: undefined }),
  async (uri, { tableName }) => {
    if (!SUPABASE_KEY) {
      throw new Error("SUPABASE_KEY is not set");
    }

    if (!supabase) {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    try {
      const { data, error } = await supabase
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
      throw new Error(`Failed to query table: ${error.message}`);
    }
  }
);

// Tool for executing SQL
server.tool(
  "execute-sql",
  {
    query: String
  },
  async ({ query }) => {
    if (!SUPABASE_KEY) {
      throw new Error("SUPABASE_KEY is not set");
    }

    if (!supabase) {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    try {
      // Use RPC to execute SQL (assuming a SQL executor function exists)
      const { data, error } = await supabase.rpc('execute_sql', {
        sql_query: query
      });
      
      if (error) throw error;
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2) 
        }]
      };
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
    tableName: String,
    data: Object
  },
  async ({ tableName, data }) => {
    if (!SUPABASE_KEY) {
      throw new Error("SUPABASE_KEY is not set");
    }

    if (!supabase) {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    try {
      const { data: result, error } = await supabase
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
    tableName: String,
    filter: Object,
    data: Object
  },
  async ({ tableName, filter, data }) => {
    if (!SUPABASE_KEY) {
      throw new Error("SUPABASE_KEY is not set");
    }

    if (!supabase) {
      supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }

    try {
      let query = supabase.from(tableName).update(data);
      
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

// Start the server
const transport = new StdioServerTransport();
server.connect(transport).catch(error => {
  console.error("Error connecting to transport:", error);
  process.exit(1);
}); 