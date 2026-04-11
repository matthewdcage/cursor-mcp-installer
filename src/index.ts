#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { detectOs } from './detect/os.js';
import { detectRuntimes } from './detect/runtimes.js';
import { detectClients } from './detect/clients.js';
import { resolveNpmPackage, isNpmPackage, formatServerName } from './install/npm.js';
import { resolveUvxPackage } from './install/uvx.js';
import { isGitUrl, resolveGitRepo } from './install/git.js';
import { resolveLocalPath } from './install/local.js';
import { CursorWriter } from './clients/cursor.js';
import { ClaudeDesktopWriter } from './clients/claude-desktop.js';
import { VSCodeWriter } from './clients/vscode.js';
import { OpenClawWriter } from './clients/openclaw.js';
import { ClaudeCodeWriter } from './clients/claude-code.js';
import { ChatGPTBridgeWriter } from './clients/chatgpt-bridge.js';
import { validateMcpServer } from './validate/handshake.js';
import { generateReport, formatReportText } from './validate/health-report.js';
import { ClientWriter, McpServerEntry } from './clients/types.js';
import { log } from './utils/logging.js';

const allWriters: ClientWriter[] = [
  new CursorWriter(),
  new ClaudeDesktopWriter(),
  new VSCodeWriter(),
  new OpenClawWriter(),
  new ClaudeCodeWriter(),
  new ChatGPTBridgeWriter(),
];

const server = new Server(
  { name: 'universal-mcp-installer', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'detect_system',
      description: 'Detect the operating system, available runtimes (node, npm, uvx, python, git), and installed AI clients (Cursor, Claude Desktop, VS Code, OpenClaw, Claude Code)',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'install_mcp_server',
      description: 'Install an MCP server by package name (npm/uvx), git URL, or local path. Writes config to selected AI clients and validates via MCP handshake.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Package name, git URL, or local path' },
          args: { type: 'array', items: { type: 'string' }, description: 'Arguments to pass to the server' },
          env: { type: 'array', items: { type: 'string' }, description: 'Environment variables (KEY=value format)' },
          clients: { type: 'array', items: { type: 'string' }, description: 'Client IDs to install to (default: all detected). Options: cursor, claude-desktop, vscode, openclaw, claude-code, chatgpt' },
          method: { type: 'string', enum: ['auto', 'npm', 'uvx', 'git', 'local'], description: 'Install method (default: auto-detect)' },
          validate: { type: 'boolean', description: 'Run MCP handshake validation after install (default: true)' },
        },
        required: ['name'],
      },
    },
    {
      name: 'validate_mcp_server',
      description: 'Validate an MCP server by running the MCP handshake (initialize/initialized/tools-list). Returns health report.',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command to run the server' },
          args: { type: 'array', items: { type: 'string' }, description: 'Arguments' },
          env: { type: 'array', items: { type: 'string' }, description: 'Environment variables (KEY=value)' },
        },
        required: ['command'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name: toolName } = request.params;
    const args = request.params.arguments as Record<string, unknown>;

    switch (toolName) {
      case 'detect_system': {
        const osInfo = detectOs();
        const runtimes = await detectRuntimes();
        const clients = detectClients();
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ os: osInfo, runtimes, clients }, null, 2),
          }],
        };
      }

      case 'install_mcp_server': {
        const pkgName = args.name as string;
        const serverArgs = (args.args as string[]) ?? [];
        const envPairs = (args.env as string[]) ?? [];
        const clientIds = (args.clients as string[]) ?? [];
        const method = (args.method as string) ?? 'auto';
        const shouldValidate = (args.validate as boolean) ?? true;

        const env = envPairs.reduce<Record<string, string>>((acc, pair) => {
          const idx = pair.indexOf('=');
          if (idx > 0) acc[pair.slice(0, idx)] = pair.slice(idx + 1);
          return acc;
        }, {});

        let entry: McpServerEntry;
        let displayName: string;

        if (method === 'local' || (!isGitUrl(pkgName) && method !== 'npm' && method !== 'uvx' && method !== 'git' && pkgName.startsWith('/'))) {
          const result = await resolveLocalPath(pkgName, serverArgs, env);
          entry = result.entries[0].entry;
          displayName = formatServerName(result.entries[0].name);
        } else if (method === 'git' || (method === 'auto' && isGitUrl(pkgName))) {
          const result = await resolveGitRepo(pkgName, serverArgs, env);
          entry = result.entry;
          displayName = formatServerName(result.name);
        } else if (method === 'uvx') {
          entry = resolveUvxPackage(pkgName, serverArgs, env);
          displayName = formatServerName(pkgName);
        } else {
          if (method === 'auto' && !(await isNpmPackage(pkgName))) {
            entry = resolveUvxPackage(pkgName, serverArgs, env);
          } else {
            entry = await resolveNpmPackage(pkgName, serverArgs, env);
          }
          displayName = formatServerName(pkgName);
        }

        const targetWriters = clientIds.length > 0
          ? allWriters.filter(w => clientIds.includes(w.id))
          : allWriters.filter(w => w.detect().installed);

        const writeResults = targetWriters.map(w => w.write(displayName, entry));
        const osInfo = detectOs();
        const runtimes = await detectRuntimes();

        let report;
        if (shouldValidate && entry.command) {
          const validation = await validateMcpServer(entry.command, entry.args ?? [], entry.env);
          const validationResults = targetWriters.map(w => ({
            ...validation,
            client: w.name,
          }));
          report = generateReport(displayName, osInfo, runtimes, validationResults);
        }

        const summary = writeResults.map(r =>
          r.success ? `${r.serverName} -> ${r.configPath}: OK` : `${r.serverName} -> ${r.configPath}: FAILED (${r.error})`
        ).join('\n');

        return {
          content: [{
            type: 'text',
            text: report
              ? formatReportText(report)
              : `Installation complete:\n${summary}\n\nRestart your AI clients to apply changes.`,
          }],
        };
      }

      case 'validate_mcp_server': {
        const command = args.command as string;
        const cmdArgs = (args.args as string[]) ?? [];
        const envPairs = (args.env as string[]) ?? [];
        const env = envPairs.reduce<Record<string, string>>((acc, pair) => {
          const idx = pair.indexOf('=');
          if (idx > 0) acc[pair.slice(0, idx)] = pair.slice(idx + 1);
          return acc;
        }, {});

        const result = await validateMcpServer(command, cmdArgs, env, 'Manual Test');
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result, null, 2),
          }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('Tool execution failed', { error: message });
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  log.info('Universal MCP Installer server started');
}

main().catch((err) => {
  log.error('Server failed to start', { error: String(err) });
  process.exit(1);
});
