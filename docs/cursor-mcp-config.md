# Cursor MCP Configuration Reference

> Source: https://docs.cursor.com/context/model-context-protocol

## Config File Locations

- **Global**: `~/.cursor/mcp.json` (macOS/Linux) or `%USERPROFILE%\.cursor\mcp.json` (Windows)
- **Project**: `.cursor/mcp.json` at repo root (team-shareable)

## Schema Structure

Uses `mcpServers` key (same as Claude Desktop):

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "type": "stdio",
      "args": ["-y", "package-name"],
      "env": {
        "API_KEY": "value"
      }
    }
  }
}
```

## Server Types

### stdio (local)
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "type": "stdio",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path"]
    }
  }
}
```

### SSE (remote)
```json
{
  "mcpServers": {
    "remote": {
      "url": "https://example.com/mcp",
      "type": "sse"
    }
  }
}
```

### Streamable HTTP
```json
{
  "mcpServers": {
    "remote": {
      "url": "https://example.com/mcp",
      "transport": "streamable-http"
    }
  }
}
```

## Server Entry Fields

| Field | Description |
|-------|-------------|
| `command` | Executable to run (node, npx, python, uvx, etc.) |
| `type` | Transport: `"stdio"` or `"sse"` |
| `args` | Array of arguments |
| `env` | Environment variables object |
| `cwd` | Working directory |
| `url` | URL for remote servers |
| `transport` | `"streamable-http"` for HTTP transport |
| `disabled` | `true` to disable without removing |

## Important Notes

- Fully quit and restart Cursor after config changes
- Config key is `mcpServers` (same as Claude Desktop, different from VS Code `servers`)
- Project-level `.cursor/mcp.json` overrides/merges with global
- Supports both stdio and remote transports
