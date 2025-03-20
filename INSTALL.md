# Quick Installation Guide

This guide provides the simplest ways to install and use the MCP Installer.

## Option 1: Using npx (No Installation Required)

1. Edit your Cursor configuration file:
   - **macOS/Linux**: `~/.cursor/mcp.json`
   - **Windows**: `%USERPROFILE%\.cursor\mcp.json`

2. Add the following configuration (create the file if it doesn't exist):

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "npx",
      "type": "stdio",
      "args": [
        "cursor-mcp-installer-free"
      ]
    }
  }
}
```

3. Restart Cursor
4. Ask Claude to "Install the web search MCP server"

## Option 2: Using uvx (For Python Users)

If you prefer using Python's uv package manager:

1. Make sure uv is installed:
   ```bash
   pip install uv
   ```

2. Edit your Cursor configuration file:
   - **macOS/Linux**: `~/.cursor/mcp.json`
   - **Windows**: `%USERPROFILE%\.cursor\mcp.json`

3. Add the following configuration:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "uvx",
      "type": "stdio",
      "args": [
        "cursor-mcp-installer-free"
      ]
    }
  }
}
```

4. Restart Cursor
5. Ask Claude to "Install the web search MCP server"

## Option 3: Global Installation with npm

1. Install the package globally:

```bash
npm install -g cursor-mcp-installer-free
```

2. Edit your Cursor configuration file:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "cursor-mcp-installer-free",
      "type": "stdio"
    }
  }
}
```

3. Restart Cursor
4. Ask Claude to "Install the web search MCP server"

## Troubleshooting

- If you get an error about the command not being found, make sure you have Node.js installed and that it's in your PATH.
- If Cursor doesn't recognize the MCP server, check that your configuration file is correctly formatted and in the right location.
- Try restarting your computer if changes don't take effect after restarting Cursor. 