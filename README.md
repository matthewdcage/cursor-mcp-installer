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
  [![npm version](https://img.shields.io/npm/v/cursor-mcp-installer.svg)](https://www.npmjs.com/package/cursor-mcp-installer)
  [![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-brightgreen.svg)](https://github.com/anthropic-labs/model-context-protocol)
  [![Cursor IDE](https://img.shields.io/badge/Cursor-IDE-blue.svg)](https://cursor.sh)
  
  <a href="https://www.linkedin.com/in/digitalmarketingstrategyexpert/">
    <img src="https://img.shields.io/badge/LinkedIn-Matthew_Cage-blue?style=flat&logo=linkedin" alt="LinkedIn"/>
  </a>
</div>

## Features

- Install MCP servers from npm packages
- Install MCP servers from local directories
- Configure MCP servers for Cursor
- Add custom MCP server configurations

## Prerequisites

Before using this tool, you need to have installed:

- [Node.js](https://nodejs.org/) (for npm packages)
- [Cursor IDE](https://cursor.sh/)
- [uv](https://docs.astral.sh/uv/) (optional, for Python packages)

## Installation

There are several ways to install and use the Cursor MCP Installer:

### 1. Using npm (Recommended)

```bash
npm install -g cursor-mcp-installer
```

After installation, add it to your Cursor MCP configuration file:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "cursor-mcp-installer",
      "type": "stdio"
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
        "cursor-mcp-installer"
      ]
    }
  }
}
```

### 3. Using uv/uvx (Python Package Manager)

If you prefer using Python's uv package manager:

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "uvx",
      "type": "stdio",
      "args": [
        "cursor-mcp-installer"
      ]
    }
  }
}
```

### 4. Direct from GitHub

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Based on the MCP Installer by [Anais Betts](https://github.com/anaisbetts)
- Built with the [Model Context Protocol](https://github.com/anthropic-labs/model-context-protocol) SDK 