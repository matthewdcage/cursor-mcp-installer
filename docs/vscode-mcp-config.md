# VS Code MCP Configuration Reference

> Source: https://code.visualstudio.com/docs/copilot/reference/mcp-configuration (Apr 8 2026)

## Config File Locations

- **Workspace**: `.vscode/mcp.json`
- **User**: Open via Command Palette > "MCP: Open User Configuration"

## Schema Structure

**Important**: VS Code uses `servers` (NOT `mcpServers` like Claude/Cursor).

```json
{
  "inputs": [],
  "servers": {}
}
```

## stdio Servers

```json
{
  "servers": {
    "memory": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "env": { "API_KEY": "${input:api-key}" },
      "envFile": "${workspaceFolder}/.env",
      "sandboxEnabled": true,
      "sandbox": {
        "filesystem": {
          "allowWrite": ["${workspaceFolder}"],
          "denyRead": ["${userHome}/.ssh"]
        },
        "network": {
          "allowedDomains": ["api.example.com"]
        }
      }
    }
  }
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | `"stdio"` |
| `command` | Yes | Command to start server |
| `args` | No | Arguments array |
| `env` | No | Environment variables |
| `envFile` | No | Path to .env file |
| `sandboxEnabled` | No | macOS/Linux only |
| `sandbox` | No | FS and network access rules |

## HTTP/SSE Servers

```json
{
  "servers": {
    "remote": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "headers": { "Authorization": "Bearer ${input:token}" }
    }
  }
}
```

## Input Variables (Secrets)

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "api-key",
      "description": "API Key",
      "password": true
    }
  ],
  "servers": {
    "myserver": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "my-server"],
      "env": { "API_KEY": "${input:api-key}" }
    }
  }
}
```

## Key Commands

| Command | Description |
|---------|-------------|
| MCP: Add Server | Add new MCP server |
| MCP: List Servers | List/manage servers |
| MCP: Open User Configuration | Open user mcp.json |
| MCP: Open Workspace Folder MCP Configuration | Open .vscode/mcp.json |

## Key Differences from Claude/Cursor

- Uses `servers` not `mcpServers`
- Supports `inputs` for prompted secrets
- Supports `envFile` for .env loading
- Supports `sandbox` for sandboxed execution
- Supports `dev` key for development mode (watch, debug)
- Server names should use camelCase
