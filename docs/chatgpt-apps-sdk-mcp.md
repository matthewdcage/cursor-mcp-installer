# ChatGPT Desktop / Apps SDK MCP Reference

> Source: https://developers.openai.com/apps-sdk/build/mcp-server

## How ChatGPT MCP Differs

ChatGPT Desktop does NOT support local stdio MCP config files like Claude/Cursor.
Instead, it uses HTTP-based MCP servers registered through the OpenAI Apps SDK.

## Architecture

```
ChatGPT Desktop App
  └── Connects to HTTP MCP server endpoint
        └── Your MCP server (Streamable HTTP transport)
```

## Requirements

1. An MCP server accessible over HTTP (not stdio)
2. Registration through OpenAI developer portal / Apps SDK
3. The server must support Streamable HTTP transport

## Building an MCP Server for ChatGPT

Use the standard MCP TypeScript SDK with Streamable HTTP transport:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const server = new McpServer({
  name: "my-chatgpt-server",
  version: "1.0.0",
});

// Add tools, resources, prompts...

// Serve over HTTP (not stdio)
```

## Bridge Pattern for stdio Servers

To expose an existing stdio MCP server to ChatGPT:

1. Spawn the stdio server as a child process
2. Wrap it in an HTTP server using Streamable HTTP transport
3. Forward JSON-RPC messages between HTTP and stdio
4. Expose the HTTP endpoint for ChatGPT to connect

This is what the universal-mcp-installer's ChatGPT HTTP Bridge implements.

## Key Points

- No local config file to write (unlike Claude/Cursor/VS Code)
- Server must be HTTP-accessible
- Registration flow is through OpenAI, not a local JSON file
- For local development, a bridge/proxy is needed
- The Apps SDK may also include UI components (`@modelcontextprotocol/ext-apps`)
