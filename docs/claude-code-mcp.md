# Claude Code MCP Configuration Reference

> Source: https://code.claude.com/docs/en/mcp

## Config Scopes

| Scope | Location | Description |
|-------|----------|-------------|
| **Project** | `.mcp.json` at repo root | Team-shareable |
| **User** | `~/.claude.json` | Cross-project personal |
| **Enterprise** | System paths (see below) | Managed by admins |

### Enterprise paths
- macOS: `/Library/Application Support/ClaudeCode/managed-mcp.json`
- Linux/WSL: `/etc/claude-code/managed-mcp.json`
- Windows: `C:\Program Files\ClaudeCode\managed-mcp.json`

## Schema Structure

### Project `.mcp.json`
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "KEY": "${KEY}"
      }
    }
  }
}
```

### User `~/.claude.json`
```json
{
  "projects": {
    "/path/to/project": {
      "mcpServers": {
        "server-name": {
          "command": "node",
          "args": ["server.js"]
        }
      }
    }
  }
}
```

## CLI Commands

```bash
claude mcp add <name> -- <command> [args...]   # Add server
claude mcp add --transport http <name> <url>    # Add HTTP server
claude mcp list                                  # List servers
claude mcp get <name>                           # Get server details
claude mcp remove <name>                        # Remove server
claude mcp add-from-claude-desktop              # Import from Claude Desktop (macOS/WSL)
```

### Scope flags
```bash
claude mcp add --scope user <name> -- npx -y <package>     # User scope
claude mcp add --scope project <name> -- npx -y <package>  # Project scope
```

## Supported Transports

- `stdio` (default)
- `http` (Streamable HTTP)
- `sse` (legacy)

## In-Session Commands

```
/mcp           # Show MCP status and connected servers
```

## Key Differences

- Uses `mcpServers` key (same as Claude Desktop, Cursor)
- Supports `${VAR}` env var expansion in config
- Has CLI for managing servers (`claude mcp add/remove/list`)
- Can import from Claude Desktop config
- Enterprise managed configs for organizations
- Project-level `.mcp.json` at repo root (different from Cursor's `.cursor/mcp.json`)

## Important Notes

- Env vars use `${VAR}` syntax for expansion
- On Windows with stdio: may need `cmd /c npx` wrapper
- `claude mcp add-from-claude-desktop` only works on macOS and WSL
