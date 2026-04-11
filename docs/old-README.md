<p align="center">

```
         _   _ _   _ _____     _______ ____  ____    _    _     
        | | | | \ | |_ _\ \   / / ____|  _ \/ ___|  / \  | |    
        | | | |  \| || | \ \ / /|  _| | |_) \___ \ / _ \ | |    
        | |_| | |\  || |  \ V / | |___|  _ < ___) / ___ \| |___ 
         \___/|_| \_|___|  \_/  |_____|_| \_\____/_/   \_\_____|
                                                          
  __  __  ____ ____    ___ _   _ ____ _____  _    _     _     _____ ____  
 |  \/  |/ ___|  _ \  |_ _| \ | / ___|_   _|/ \  | |   | |   | ____|  _ \ 
 | |\/| | |   | |_) |  | ||  \| \___ \ | | / _ \ | |   | |   |  _| | |_) |
 | |  | | |___|  __/   | || |\  |___) || |/ ___ \| |___| |___| |___|  _ < 
 |_|  |_|\____|_|     |___|_| \_|____/ |_/_/   \_\_____|_____|_____|_| \_\
```

<p align="center">
  <strong>Install and configure MCP servers across all major AI clients with one command.</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/universal-mcp-installer"><img src="https://img.shields.io/npm/v/universal-mcp-installer.svg" alt="npm version"></a>
  <a href="https://github.com/anthropic-labs/model-context-protocol"><img src="https://img.shields.io/badge/MCP-Compatible-brightgreen.svg" alt="MCP Compatible"></a>
  <a href="https://www.npmjs.com/package/universal-mcp-installer"><img src="https://img.shields.io/npm/dt/universal-mcp-installer.svg" alt="npm downloads"></a>
</p>

---

> **Upgrade from cursor-mcp-installer v0.1.3:** This is a complete rewrite with MCP SDK 1.29.0, support for 6 AI clients (not just Cursor), cross-platform config writing, real MCP handshake validation, and a branded web dashboard.

## Supported Clients

| Client | Config Key | Platforms |
|--------|-----------|-----------|
| **Claude Desktop** | `mcpServers` | macOS, Windows, Linux |
| **Cursor** | `mcpServers` | macOS, Windows, Linux |
| **VS Code (Copilot)** | `servers` | All (workspace-level) |
| **OpenClaw / NemoClaw** | `mcp.servers` | macOS, Linux |
| **Claude Code** | `mcpServers` | macOS, Windows, Linux |
| **ChatGPT Desktop** | HTTP Bridge | All (via local HTTP proxy) |

## Quick Start Guide

### Option 1: CLI (Fastest)

```bash
npx universal-mcp-installer install @modelcontextprotocol/server-memory
```

That's it. The installer detects which AI clients you have installed and writes the correct config for each one.

### Option 2: As an MCP Tool (Let Your AI Install Other MCP Servers)

Add this to your AI client's MCP configuration:

#### Cursor (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "npx",
      "type": "stdio",
      "args": ["-y", "universal-mcp-installer"]
    }
  }
}
```

#### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "MCP Installer": {
      "command": "npx",
      "args": ["-y", "universal-mcp-installer"]
    }
  }
}
```

#### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "mcpInstaller": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "universal-mcp-installer"]
    }
  }
}
```

Then restart your AI client and ask it:

```
Install the filesystem MCP server
```

### Option 3: Web Dashboard

```bash
npx universal-mcp-installer --ui
```

Opens a branded web dashboard at `http://localhost:3939`:

<p align="center">
  <img src="assets/dashboard-screenshot.png" alt="Universal MCP Installer Dashboard" width="800">
</p>

#### Using the Dashboard

**1. System Panel** — The top section automatically detects your OS and all available runtimes. In the screenshot you can see it detected macOS 25.3.0 (Apple Silicon) with Node v20.19.1, npm v10.8.2, uvx 0.7.15, Python 3.12.4, and git 2.50.1.

**2. AI Clients** — Each detected client gets a card showing its name, config file path, and how many servers are already configured (e.g., Claude Desktop shows "19 servers configured"). Toggle the switch on each card to include or exclude it from the next installation. Clients that aren't installed appear dimmed.

**3. Install** — Type a package name (npm package, git URL, or local path), pick a method from the dropdown (`Auto` / `npm` / `uvx` / `git` / `local`), and hit the green **Install** button. The installer resolves the package, writes config to every toggled client, runs an MCP handshake validation, and streams progress in real time via WebSocket.

**4. Progress & Results** — After clicking Install, a timeline appears below showing each step (resolving, writing config, validating) with live status dots. Once complete, a health report grid shows pass/fail per client with tool counts, latency, and recovery hints for any failures.

### Where Are the Config Files?

| Client | macOS | Windows | Linux |
|--------|-------|---------|-------|
| **Claude Desktop** | `~/Library/Application Support/Claude/claude_desktop_config.json` | `%APPDATA%\Claude\claude_desktop_config.json` | `~/.config/Claude/claude_desktop_config.json` |
| **Cursor** | `~/.cursor/mcp.json` | `%USERPROFILE%\.cursor\mcp.json` | `~/.cursor/mcp.json` |
| **VS Code** | `.vscode/mcp.json` (workspace) | `.vscode/mcp.json` (workspace) | `.vscode/mcp.json` (workspace) |
| **OpenClaw** | `~/.openclaw/openclaw.json` | - | `~/.openclaw/openclaw.json` |
| **Claude Code** | `.mcp.json` (project root) | `.mcp.json` (project root) | `.mcp.json` (project root) |

## Features

- **Auto-detection** of installed AI clients and their config paths
- **Runtime detection** for Node.js, npm, npx, uvx, Python, and git
- **Multiple install methods**: npm, uvx, git clone, local path
- **Config safety**: backs up existing configs, atomic writes, never clobbers unrelated keys
- **Real MCP handshake validation**: spawns the server, sends `initialize`/`initialized`, calls `tools/list`
- **Health reports**: structured pass/fail per client with tool count, latency, and recovery hints
- **Known-issue recovery**: 13+ error codes with actionable fix suggestions
- **Cross-platform**: Windows `cmd /c npx` wrapping, Linux XDG paths, macOS launchd support
- **Service templates**: generate launchd (macOS), systemd (Linux), or Task Scheduler (Windows) configs
- **Web dashboard**: branded React UI with real-time WebSocket progress updates

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- At least one supported AI client installed

Optional:
- [uv/uvx](https://docs.astral.sh/uv/) for Python MCP servers
- [git](https://git-scm.com/) for installing from repositories

## CLI Reference

```bash
# Detect your system, runtimes, and installed AI clients
npx universal-mcp-installer detect

# Install an MCP server to all detected clients
npx universal-mcp-installer install @modelcontextprotocol/server-memory

# Install to specific clients only
npx universal-mcp-installer install my-server --clients cursor,claude-desktop

# Install with environment variables
npx universal-mcp-installer install my-server --env API_KEY=sk-123

# Install from a git repository
npx universal-mcp-installer install https://github.com/user/mcp-server.git

# Install from a local directory
npx universal-mcp-installer install ./my-local-server --method local

# Validate an MCP server by running the handshake
npx universal-mcp-installer validate npx -y @modelcontextprotocol/server-memory

# Launch the web dashboard
npx universal-mcp-installer --ui
```

### CLI Options

| Option | Description |
|--------|-------------|
| `--clients <ids>` | Comma-separated client IDs: `cursor`, `claude-desktop`, `vscode`, `openclaw`, `claude-code`, `chatgpt` |
| `--method <method>` | Install method: `auto`, `npm`, `uvx`, `git`, `local` |
| `--env KEY=value` | Environment variable (repeatable) |
| `--args <arg>` | Server argument (repeatable) |
| `--no-validate` | Skip MCP handshake validation after install |
| `--port <number>` | Dashboard port (default: 3939) |

## MCP Server Tools

When used as an MCP server (stdio mode), the installer exposes three tools:

| Tool | Description |
|------|-------------|
| `detect_system` | Returns OS, architecture, available runtimes, and detected AI clients |
| `install_mcp_server` | Installs a server by package name, git URL, or local path to selected clients |
| `validate_mcp_server` | Validates a server via MCP handshake and returns the result |

## API Endpoints (Dashboard Mode)

When running with `--ui`, a local API is available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/system` | GET | System info, runtimes, detected clients |
| `/api/clients` | GET | Client detection details |
| `/api/install` | POST | Trigger installation |
| `/api/validate` | POST | Trigger MCP handshake validation |
| `/ws` | WebSocket | Real-time progress events |

## Development

```bash
# Clone and install
git clone https://github.com/matthewdcage/cursor-mcp-installer.git
cd cursor-mcp-installer
npm install

# Build the server
npm run build

# Build the dashboard
cd dashboard && npm install && npm run build && cd ..

# Run tests (real MCP handshake, no mocks)
npm test

# Watch mode
npm run dev
```

### Project Structure

```
src/
  index.ts               MCP server entry (stdio)
  cli.ts                 CLI entry (npx)
  detect/                OS, runtime, client detection
  clients/               Config writers per AI client
  install/               Package resolution (npm, uvx, git, local)
  validate/              MCP handshake + health reports
  api/                   HTTP/WebSocket API for dashboard
  utils/                 Config I/O, logging, errors, platform utils
dashboard/               React + Vite + Tailwind web UI
tests/                   Unit, integration, E2E tests
docs/                    Localized official MCP docs
```

## Changelog

### v1.0.0 (Universal Rewrite)

- Complete rewrite from `cursor-mcp-installer` (v0.1.3) to `universal-mcp-installer`
- Upgraded MCP SDK from `^1.0.1` to `^1.29.0` (28 minor versions)
- Added support for 6 AI clients (was Cursor-only)
- Added real MCP handshake validation (was none)
- Added cross-platform support with platform-specific config paths
- Added CLI with `detect`, `install`, `validate` commands
- Added web dashboard with React + Tailwind + WebSocket
- Added 50+ real tests (was `echo "No tests specified"`)
- Added known-issue error recovery database
- Added service template generation (launchd, systemd, Task Scheduler)
- Replaced `rimraf`/`spawn-rx` with Node built-ins
- Fixed: `require.resolve` in ESM context
- Fixed: `console.error`/`console.warn` corrupting stdio JSON-RPC stream
- Full TypeScript source (was compiled JS-only artifact)

## License

[MIT](LICENSE)
