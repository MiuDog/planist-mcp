# Planist-MCP (Model Context Protocol Server)

> **Planist Page-Editing & AI Collaboration MCP Server**

This repository contains the Model Context Protocol (MCP) server for [Planist](https://github.com/MiuDog/Planist). It allows external AI clients (such as Claude Desktop, Cursor, or custom AI agents) to inspect, read, and propose page edits for Planist workspaces over an out-of-process JSON-RPC protocol.

## Features

- **`planist_list_pages`**: Query accessible pages (`docs`, `edgeless`/Canva, `dashboard`) in the Planist workspace.
- **`planist_read_page`**: Fetch the structured AST, Markdown, or Block data for a specific page.
- **`planist_propose_page_edit`**: Submit a `LivePageProposal` for human review or auto-application under an active AI Capability Grant (per ADR-0034 & ADR-0031).

## Installation & Build

```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build
```

## Running Locally

```bash
# Start the MCP server over stdio
npm start
```

## Integration with Claude Desktop

Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "planist-mcp": {
      "command": "node",
      "args": ["C:/Projects/planist-mcp/dist/index.js"],
      "env": {
        "PLANIST_API_HOST": "http://127.0.0.1:8080",
        "PLANIST_GRANT_TOKEN": "<YOUR_GRANT_TOKEN>"
      }
    }
  }
}
```

## License

MIT
