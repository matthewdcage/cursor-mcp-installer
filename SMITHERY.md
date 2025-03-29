# Cursor MCP Installer for Smithery

This is a version of the Cursor MCP Installer adapted for use with Smithery.

## What This Tool Does

The Cursor MCP Installer helps users install and configure Model Context Protocol (MCP) servers for use with the Cursor IDE. It provides tools to:

1. Install MCP servers from npm packages
2. Install MCP servers from local directories
3. Configure MCP servers in the Cursor configuration file

## Using in Smithery

In the Smithery environment, the MCP installer works differently than on a local machine, since it doesn't have direct access to modify the local Cursor configuration or install packages.

### Tools Available

- `install_repo_mcp_server`: Get information about MCP servers available via npm or uvx
- `install_local_mcp_server`: Get information about MCP servers in local directories
- `add_to_cursor_config`: Generate the configuration needed to add an MCP server to Cursor

### Example Usage with Smithery

```
How would I set up a web search MCP server in Cursor?
```

The tool will provide you with the configuration needed to add the web search MCP server to your Cursor configuration.

## Implementation Notes

In the Smithery environment, the tool provides information on how to install and configure MCP servers, but cannot directly modify your local configuration. You'll need to manually add the configuration to your Cursor `mcp.json` file.

## Local Development

If you're developing or modifying this tool, please refer to the main [README.md](README.md) for full documentation on how to build, test, and contribute to this project. 