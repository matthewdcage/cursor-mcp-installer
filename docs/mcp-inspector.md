# MCP Inspector Reference

> Source: https://modelcontextprotocol.io/docs/tools/debugging

## Overview

The MCP Inspector is an interactive, transport-agnostic testing UI for MCP servers.
It should be your first debugging tool when developing or validating MCP servers.

## Usage

```bash
npx @modelcontextprotocol/inspector
```

Or connect to a specific server:

```bash
# stdio server
npx @modelcontextprotocol/inspector npx -y my-mcp-server

# HTTP server
npx @modelcontextprotocol/inspector --url http://localhost:3000/mcp
```

## Capabilities

- Connect to stdio or Streamable HTTP servers
- Invoke tools, prompts, and resources
- Watch the notification stream
- Inspect JSON-RPC message exchange
- Test capability negotiation

## Debugging Best Practices

### Logging Strategy
- stdio servers: log to stderr only (stdout = JSON-RPC stream)
- HTTP servers: use log message notifications or server-side aggregation
- Use structured logging with timestamps and request IDs

### Common Issues

1. **Working directory**: May be undefined (e.g., `/` on macOS). Always use absolute paths.
2. **Environment variables**: Servers inherit limited env vars. Specify needed ones in config.
3. **Path issues**: Use absolute paths for `command` field.
4. **Invalid JSON**: Config files with syntax errors fail silently in some clients.

### Log Locations (Claude Desktop)
- macOS: `~/Library/Logs/Claude/mcp*.log`
- Windows: `%APPDATA%\Claude\logs\mcp*.log`

## Programmatic Validation

For automated testing, you can validate an MCP server by:

1. Spawning it as a child process (stdio)
2. Sending `initialize` request
3. Verifying `initialize` response has `protocolVersion`, `capabilities`, `serverInfo`
4. Sending `notifications/initialized`
5. Calling `tools/list` to enumerate tools
6. Sending `ping` for liveness
7. Cleanly shutting down (close stdin, SIGTERM, SIGKILL)
