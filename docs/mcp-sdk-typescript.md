# MCP TypeScript SDK Reference

> Source: https://www.npmjs.com/package/@modelcontextprotocol/sdk (v1.29.0, Mar 30 2026)

## Installation

```bash
npm install @modelcontextprotocol/sdk zod
```

Required peer dependency: `zod ^3.25 || ^4.0`

## Core Concepts

### Server Creation (McpServer)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "my-server",
  version: "1.0.0",
});

// Add tools
server.tool("my-tool", { param: z.string() }, async ({ param }) => ({
  content: [{ type: "text", text: `Result: ${param}` }],
}));

// Connect via stdio
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Low-Level Server (for more control)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "my-tool",
      description: "Does something",
      inputSchema: {
        type: "object",
        properties: { param: { type: "string" } },
        required: ["param"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // handle tool calls
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Transports

| Transport | Use Case | Import |
|-----------|----------|--------|
| **stdio** | Local process spawning | `@modelcontextprotocol/sdk/server/stdio.js` |
| **Streamable HTTP** | Remote servers (recommended) | `@modelcontextprotocol/sdk/server/streamableHttp.js` |
| **HTTP+SSE** | Legacy/backwards compat only | `@modelcontextprotocol/sdk/server/sse.js` |

## Capabilities

- **Tools**: Let LLMs take actions
- **Resources**: Read-only data exposure
- **Prompts**: Reusable prompt templates
- **Sampling**: Server asks client to run LLM completions
- **Elicitation**: Server requests user input via forms or URLs
- **Tasks** (experimental): Long-running tool calls

## Key Dependencies

| Package | Version |
|---------|---------|
| zod | ^3.25 or ^4.0 |
| express | ^5.2.1 |
| hono | ^4.11.4 |
| cross-spawn | ^7.0.5 |

## Important Notes

- Stdio servers MUST NOT write non-JSON to stdout
- Use stderr for logging in stdio mode
- `McpServer` is the high-level API; `Server` is the low-level API
- Import paths use `.js` extension even in TypeScript (ESM)
