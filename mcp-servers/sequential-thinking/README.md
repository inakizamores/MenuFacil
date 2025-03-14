# Sequential Thinking MCP Server

This MCP server provides access to the Smithery.ai Sequential Thinking service, allowing LLMs to perform structured, sequential thinking processes.

## Overview

Sequential Thinking is a methodology that breaks down complex thinking into a series of discrete steps. This MCP server connects to the Smithery.ai Sequential Thinking API, enabling LLMs to:

1. List available thinking processes
2. Execute thinking processes with specific inputs
3. Create new thinking processes with custom steps

## Installation

```bash
cd mcp-servers/sequential-thinking
npm install
```

## Configuration

Create a `.env` file in the root directory (or add to your existing one) with your Smithery.ai API key:

```
SMITHERY_API_KEY=your_smithery_api_key
```

You can obtain an API key by signing up at [smithery.ai](https://smithery.ai).

## Usage

Start the server:

```bash
node index.js
```

Or use the npm script:

```bash
npm start
```

## Resources

The server exposes the following resources:

- `sequential-thinking://processes` - Lists all available thinking processes
- `sequential-thinking://processes/{processId}` - Shows details of a specific thinking process including all steps

## Tools

The server provides the following tools:

- `execute-sequential-thinking` - Executes a sequential thinking process
  ```json
  {
    "processId": "process_id",
    "input": "The input to start the thinking process",
    "maxSteps": 10
  }
  ```

- `create-thinking-process` - Creates a new sequential thinking process
  ```json
  {
    "name": "Problem Solving Process",
    "description": "A structured approach to solving problems",
    "steps": [
      {
        "name": "Define Problem",
        "description": "Clearly articulate the problem",
        "prompt": "What is the exact problem we're trying to solve? Be specific and clear."
      },
      {
        "name": "Analyze Causes",
        "description": "Identify potential causes",
        "prompt": "What are the possible causes of this problem? Consider {{input}} and analyze deeply."
      }
    ]
  }
  ```

## Example Requests

List thinking processes:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "resources/read",
  "params": {
    "uri": "sequential-thinking://processes"
  }
}
```

Execute a thinking process:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "execute-sequential-thinking",
    "arguments": {
      "processId": "problem-solving",
      "input": "How do I design a more efficient inventory system?",
      "maxSteps": 5
    }
  }
}
```

## Testing

The package includes a test script to verify connectivity with the Smithery.ai service:

```bash
npm test
```

## Integration with Other MCP Servers

This server can be used alongside other MCP servers in your application, such as:

- GitHub MCP Server for code operations
- Supabase MCP Server for database operations
- Vercel MCP Server for deployment management

## Related Links

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io)
- [Smithery.ai Documentation](https://smithery.ai/docs)
- [Sequential Thinking Methodology](https://smithery.ai/server/@smithery-ai/server-sequential-thinking) 