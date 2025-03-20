# Cursor MCP Installer

<div align="center">
  <pre>
  ______                           __  __ _____ _____    _____           _        _ _           
 / _____)                         |  \/  |  __ \_   _|  |_   _|         | |      | | |          
| /       _   _  ____ ___ _   _  | \  / | |__) || |      | |  _ __  ___| |_ __ _| | | ___ _ __ 
| |      | | | |/ ___) _ \ | | | | |\/| |  ___/ | |      | | | '_ \/ __| __/ _` | | |/ _ \ '__|
| \_____ | |_| | |  | |_| | |_| | | |  | | |    _| |_    _| |_| | | \__ \ || (_| | | |  __/ |   
 \______)|____/|_|   \___/\__  | |_|  |_|_|   |_____|  |_____|_| |_|___/\__\__,_|_|_|\___|_|   
                         (____/                                                                 

 +-----------------------------------------+
 | Cursor MCP Installer                   |
 | Seamlessly install MCP servers         |
 +-----------------------------------------+
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

### Using npm

```bash
npm install -g cursor-mcp-installer
```

### Manual Setup

Add this to your Cursor MCP configuration file (located at `~/.cursor/mcp.json`):

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