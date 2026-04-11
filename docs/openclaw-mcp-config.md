# OpenClaw / NemoClaw MCP Configuration Reference

> Source: OpenClaw source code (agent-openclaw/openclaw/src/)

## Config File Location

- **Default**: `~/.openclaw/openclaw.json`
- **Override**: `OPENCLAW_CONFIG_PATH` environment variable
- **NemoClaw sandbox**: `/sandbox/.openclaw/openclaw.json`

## Schema Structure

OpenClaw nests MCP config under `mcp.servers` (different from Claude/Cursor):

```json
{
  "mcp": {
    "servers": {
      "server-name": {
        "command": "npx",
        "args": ["-y", "package-name"],
        "env": { "KEY": "value" },
        "cwd": "/path/to/dir",
        "url": "https://remote.example.com/mcp"
      }
    }
  }
}
```

## McpServerConfig Type

```typescript
type McpServerConfig = {
  command?: string;
  args?: string[];
  env?: Record<string, string | number | boolean>;
  cwd?: string;
  workingDirectory?: string;
  url?: string;
};
```

## CLI Commands

```bash
openclaw mcp list          # List configured MCP servers
openclaw mcp show <name>   # Show specific server config
openclaw mcp set <name>    # Set/update server config
openclaw mcp unset <name>  # Remove server config
```

## Key Differences

- Config key path: `mcp.servers` (nested under `mcp` object)
- Part of larger `openclaw.json` that contains gateway, model, and agent config
- NemoClaw sandbox uses same format at different path
- Supports `cwd` and `workingDirectory` fields
- `env` values can be string, number, or boolean
- No separate `type` field - determined by presence of `command` vs `url`

## Important Notes

- Gateway may rewrite `openclaw.json` on startup (lastTouchedVersion / migrations)
- `openclaw doctor --fix` can repair invalid config
- The config file supports JSON5 (comments, trailing commas)
- From NemoClaw sandbox, use `host.openshell.internal` for host services
