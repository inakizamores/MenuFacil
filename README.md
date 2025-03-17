# MenuFacil MCP Servers

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

# MenuFácil

Welcome to MenuFácil - the easy-to-use digital menu management system for restaurants.

## Features

- 🍽️ **Menu Management**: Create and manage digital menus for your restaurant
- 📱 **Mobile-Friendly**: Optimized for viewing on smartphones and tablets
- 🛒 **Item Organization**: Categorize and organize menu items efficiently
- 📊 **Analytics**: Track menu views and popular items
- 🔄 **Real-time Updates**: Make menu changes instantly available to customers
- 📲 **QR Code Generation**: Create customized QR codes for your menus
- 🎨 **Customization**: Personalize the appearance of your menus
- 📦 **Batch Processing**: Generate multiple QR codes at once for different tables or locations
- 📊 **QR Analytics**: Track QR code scans with detailed analytics
- 🔍 **Multi-format Export**: Export QR codes in PNG, SVG, PDF, and combined ZIP formats

## QR Code Management Features

### Single QR Code Generation
- Create customized QR codes with personalized colors and settings
- Link QR codes directly to your menu
- Track views for each QR code

### Batch QR Code Generation
- Generate up to 50 QR codes in a single operation
- Customize naming with prefixes (e.g., "Table 1", "Table 2", etc.)
- Apply consistent styling across all generated codes
- Export all generated codes as PNG, SVG, or combined PDF/ZIP

### Export Options
- **PNG Export**: High-resolution PNG images for digital use
- **SVG Export**: Scalable vector graphics for perfect scaling at any size
- **PDF Export**: Print-ready PDFs with custom designs
- **Batch Export**: Download multiple QR codes as a ZIP file

### Analytics Integration
- Track QR code performance
- View scan counts for each QR code
- Analyze most popular QR codes
- Export analytics reports

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Technologies Used

- Next.js
- React
- TypeScript
- Firebase (Authentication, Firestore, Storage)
- Tailwind CSS
- qrcode.react
- jsPDF
- JSZip

## Learn More

For more information about using MenuFácil, please refer to our documentation in the [docs](./docs) folder. 