# Claude Desktop MCP Configuration Reference

> Source: https://support.anthropic.com/en/articles/10949351

## Config File Locations

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Access via: Settings > Developer > Edit Config

## Schema Structure

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "API_KEY": "your-key"
      }
    }
  }
}
```

## Examples

### npm package
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username/data"]
    }
  }
}
```

### Python (uvx)
```json
{
  "mcpServers": {
    "my-python-server": {
      "command": "uvx",
      "args": ["my-mcp-server"]
    }
  }
}
```

### With environment variables
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```

## Validation

- Check status: Click + icon in chat > Connectors > see connected servers
- View logs (macOS): `~/Library/Logs/Claude/mcp*.log`
- View logs (Windows): `%APPDATA%\Claude\logs\mcp*.log`
- DevTools: Create `developer_settings.json` with `{"allowDevTools": true}`

## Important Notes

- Uses `mcpServers` key (same as Cursor)
- Must restart Claude Desktop after config changes (fully quit, not just close window)
- Use absolute paths, not relative
- Invalid JSON fails silently - validate externally
- On Windows, `npx` may need `cmd /c npx` wrapper
- Servers inherit limited environment variables; specify needed ones in `env`

## Log Locations

- macOS: `~/Library/Logs/Claude/`
- Windows: `%APPDATA%\Claude\logs\`
