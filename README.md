# Cursor MCP Installer

<div align="center">

<pre style="text-align: center;">
   ___         __  __    ___  __            ___   ___ 
  / __\/\ /\  /__\/ _\  /___\/__\  /\/\    / __\ / _ \
 / /  / / \ \/ \//\ \  //  // \// /    \  / /   / /_)/
/ /___\ \_/ / _  \_\ \/ \_// _  \/ /\/\ \/ /___/ ___/ 
\____/ \___/\/ \_/\__/\___/\/ \_/\/    \/\____/\/     
                                                      
  _____    __  __  _____  _      __    __    __  __   
  \_   \/\ \ \/ _\/__   \/_\    / /   / /   /__\/__\  
   / /\/  \/ /\ \   / /\//_\\  / /   / /   /_\ / \//  
/\/ /_/ /\  / _\ \ / / /  _  \/ /___/ /___//__/ _  \  
\____/\_\ \/  \__/ \/  \_/ \_/\____/\____/\__/\/ \_/  

+---------------------------------------------+
| 🚀 CURSOR MCP INSTALLER 🚀                 |
| ✨ Magically install MCP servers with ease ✨ |
+---------------------------------------------+
</pre>

  <p>A Model Context Protocol (MCP) server for installing and configuring other MCP servers within Cursor IDE.</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![npm version](https://img.shields.io/npm/v/cursor-mcp-installer-free.svg)](https://www.npmjs.com/package/cursor-mcp-installer-free)
  [![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-brightgreen.svg)](https://github.com/anthropic-labs/model-context-protocol)
  [![Cursor IDE](https://img.shields.io/badge/Cursor-IDE-blue.svg)](https://cursor.sh)
  [![npm downloads](https://img.shields.io/npm/dt/cursor-mcp-installer-free.svg)](https://www.npmjs.com/package/cursor-mcp-installer-free)
  
  <a href="https://www.linkedin.com/in/digitalmarketingstrategyexpert/">
    <img src="https://img.shields.io/badge/LinkedIn-Matthew_Cage-blue?style=flat&logo=linkedin" alt="LinkedIn"/>
  </a>
</div>

> **📢 NOW AVAILABLE ON NPM!** Install with a simple `npm install -g cursor-mcp-installer-free` command or use directly with `npx cursor-mcp-installer-free` or `uvx cursor-mcp-installer-free`!

> **🔄 Latest Updates (v0.1.3):** Improved path handling for all MCP server installations, better OpenAPI schema detection, and more robust server discovery in local directories. Thanks to [@ItzAmirreza](https://github.com/ItzAmirreza) for submitting the initial installation path handling issue. See [CHANGELOG.md](CHANGELOG.md) for details.

## Quick Start Guide

### Step 1: Add to Cursor Configuration

Choose one of these methods to add the MCP Installer to your Cursor configuration:

#### Using npx (Easiest - No Installation Required)

Add this to your `~/.cursor/mcp.json` file (create it if it doesn't exist):

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "npx",
      "type": "stdio",
      "args": [
        "cursor-mcp-installer-free@0.1.3",
        "index.mjs"
      ]
    }
  }
}
```

#### Using npm (Global Installation)

```bash
npm install -g cursor-mcp-installer-free@0.1.3
```

Then add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "cursor-mcp-installer-free",
      "type": "stdio",
      "args": [
        "index.mjs"
      ]
    }
  }
}
```

### Step 2: Restart Cursor

Close and reopen Cursor to apply the configuration changes.

### Step 3: Use Claude to Install Servers

Ask Claude to install any MCP server for you:

```
Install the web search MCP server
```

or

```
Install the MCP server for OpenAPI schema exploration with my-schema.yaml
```

### Step 4: What You'll See When Installed

Once properly installed and Cursor is restarted, you'll see the MCP Installer available in the sidebar when using Claude:

![MCP Installer Interface](https://raw.githubusercontent.com/matthewdcage/cursor-mcp-installer/main/docs/mcp-installer-interface.png)

The MCP Installer provides three main tools:
- `install_repo_mcp_server`: Install MCP servers from npm packages or repositories
- `install_local_mcp_server`: Install MCP servers from local directories
- `add_to_cursor_config`: Add custom MCP server configurations

## Features

- Install MCP servers from npm packages
- Install MCP servers from local directories
- Configure MCP servers for Cursor
- Add custom MCP server configurations

## Prerequisites

Before using this tool, you need to have installed:

- [Node.js](https://nodejs.org/) (for npm packages)
- [Cursor IDE](https://cursor.sh/)

## Installation

There are several ways to install and use the Cursor MCP Installer:

### 1. Using npm (Recommended)

```bash
npm install -g cursor-mcp-installer-free@0.1.3
```

After installation, add it to your Cursor MCP configuration file:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "cursor-mcp-installer-free",
      "type": "stdio",
      "args": [
        "index.mjs"
      ]
    }
  }
}
```

### 2. Using npx (No Installation Required)

You can use npx to run the package without installing it globally:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "npx",
      "type": "stdio",
      "args": [
        "cursor-mcp-installer-free@0.1.3",
        "index.mjs"
      ]
    }
  }
}
```

### 3. Direct from GitHub

Clone the repository and build it locally:

```bash
# Clone the repository
git clone https://github.com/matthewdcage/cursor-mcp-installer.git
cd cursor-mcp-installer

# Install dependencies and build
npm install
npm run build
```

Then configure Cursor to use your local installation:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "node",
      "type": "stdio",
      "args": [
        "/path/to/cursor-mcp-installer/lib/index.mjs"
      ]
    }
  }
}
```

Replace `/path/to/cursor-mcp-installer` with the actual path where you've cloned the repository.

### Where is the Cursor MCP Configuration File?

The Cursor MCP configuration file is located at:

- **macOS/Linux**: `~/.cursor/mcp.json`
- **Windows**: `%USERPROFILE%\.cursor\mcp.json`

If the file doesn't exist, you can create it with the content from any of the installation methods above.

## Path Handling Improvements in v0.1.3

Version 0.1.3 introduces significant improvements to path handling for MCP server installations:

### Enhanced Path Resolution
- Properly normalizes both relative and absolute paths
- Handles paths with spaces and special characters
- Ensures consistent path formatting across different operating systems

### Better Schema Detection
- Now scans all arguments for schema files, not just the first one
- Supports more schema file extensions (.yaml, .yml, .json, .openapi)
- Properly normalizes schema file paths before passing to servers

### Improved Server Discovery
- Added detection of common server entry points in local directories
- Enhanced support for Python-based MCP servers
- Better error reporting for path-related issues

These improvements make the MCP Installer more robust for all types of server installations, especially when dealing with custom file paths, OpenAPI schemas, and local directory installations.

## Usage

Once installed, you can use Claude or Cursor to interact with the MCP Installer. Here are some example prompts:

### Install an npm package as an MCP server

```
Install the MCP server named mcp-server-fetch
```

### Install with arguments

```
Install the @modelcontextprotocol/server-filesystem package as an MCP server. Use ['/home/user/documents'] for the arguments
```

### Install a local MCP server

```
Install the MCP server at /home/user/projects/my-mcp-server
```

### Install with environment variables

```
Install the server @modelcontextprotocol/server-github. Set the environment variable GITHUB_PERSONAL_ACCESS_TOKEN to 'your-token-here'
```

### Add a custom MCP server configuration

```
Add a custom MCP server called 'My Python Server' that runs with python3 /path/to/server.py
```

## Supported MCP Servers

Here are some popular MCP servers you can install:

- [@modelcontextprotocol/server-fetch](https://www.npmjs.com/package/@modelcontextprotocol/server-fetch) - Web access
- [@modelcontextprotocol/server-filesystem](https://www.npmjs.com/package/@modelcontextprotocol/server-filesystem) - File system access
- [@modelcontextprotocol/server-github](https://www.npmjs.com/package/@modelcontextprotocol/server-github) - GitHub access
- [mcp-openapi-schema](https://github.com/hannesj/mcp-openapi-schema) - OpenAPI Schema Explorer

### Special MCP Server Handling

The installer has enhanced handling for certain types of MCP servers:

#### OpenAPI Schema Servers

For the `mcp-openapi-schema` server or repositories that provide OpenAPI schema tools, the installer will:

1. Detect schema files passed as arguments (.yaml, .json, .yml)
2. Configure Cursor to run the server correctly with the schema file 

Example:

```
Install the mcp-openapi-schema MCP server and use my-api-spec.yaml as the schema file
```

#### Python MCP Servers

For Python-based MCP servers like X-MCP, the installer will:

1. Detect Python-based repositories and packages
2. Configure them to run as Python modules using `python3 -m module_name.server`
3. Set up the proper environment variables for configuration

Example:

```
Install the MCP server from https://github.com/vidhupv/x-mcp.git
```

The X-MCP Twitter server will require proper Twitter API credentials to be added to the configuration after installation.

#### Git Repositories

For MCP servers hosted in Git repositories:

1. The installer will clone the repository
2. Install dependencies 
3. Configure it to run with the appropriate entry point
4. Pass any provided schema files or arguments correctly

Example:

```
Install the MCP server from https://github.com/hannesj/mcp-openapi-schema.git and use my-petstore.yaml as the schema file
```

## Troubleshooting

### Common Issues

#### Node.js is not installed

```
Error: Node.js is not installed, please install it!
```

Solution: Install Node.js from [nodejs.org](https://nodejs.org/)

#### Python uv is not installed

```
Error: Python uv is not installed, please install it!
```

Solution: Install uv following the instructions at [docs.astral.sh/uv](https://docs.astral.sh/uv/)

#### Path does not exist

```
Error: Path /path/to/server does not exist locally!
```

Solution: Check that the path to your local MCP server is correct

#### Package not found in npm registry

```
Error: Package not found in npm registry
```

Solution: Check that the package name is correct and exists in the npm registry. You can also try installing directly from a Git repository using `https://github.com/username/repo.git` as the package name.

#### Permission issues when writing to mcp.json

```
Error: EACCES: permission denied, open '~/.cursor/mcp.json'
```

Solution: Make sure you have write permissions to the Cursor configuration directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Building the Package

```bash
npm run build
```

### Publishing to npm

Make sure you have the appropriate npm credentials and are logged in:

```bash
npm login
```

Then publish the package:

```bash
npm publish --access public
```

> **Note:** When publishing updates to npm, ensure the package.json, package-lock.json, and all examples in the documentation reference the same version number and correct repository URLs.

## Version History

### v0.1.3 (Current)
- Enhanced path handling for all MCP server installations
- Better schema file detection for OpenAPI schema servers
- Improved directory scanning for server entry points
- Added new helper functions for path normalization
- Added support for detecting Python server files
- Fixed issues with paths containing spaces
- Created CHANGELOG.md for tracking version history
- Thanks to [@ItzAmirreza](https://github.com/ItzAmirreza) for submitting the path handling issue

### v0.1.2
- Fixed installation instructions to include required `index.mjs` argument in command args
- Updated repository URLs
- Improved error handling for installation failures
- Added support for more MCP server types
- Cleaned up repository structure

### v0.1.1
- Interim release with package name changes

### v0.1.0
- Initial public release
- Support for installing MCP servers from npm packages
- Support for installing MCP servers from local directories
- Support for configuring MCP servers for Cursor

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on the MCP Installer by [Anais Betts](https://github.com/anaisbetts)
- Built with the [Model Context Protocol](https://github.com/anthropic-labs/model-context-protocol) SDK 