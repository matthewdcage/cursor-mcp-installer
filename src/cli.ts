#!/usr/bin/env node
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
import { cliPrint } from './utils/logging.js';

const allWriters: ClientWriter[] = [
  new CursorWriter(),
  new ClaudeDesktopWriter(),
  new VSCodeWriter(),
  new OpenClawWriter(),
  new ClaudeCodeWriter(),
  new ChatGPTBridgeWriter(),
];

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    return;
  }

  if (command === '--ui' || command === 'ui') {
    await launchDashboard(args);
    return;
  }

  if (command === 'detect') {
    await runDetect();
    return;
  }

  if (command === 'install') {
    await runInstall(args.slice(1));
    return;
  }

  if (command === 'validate') {
    await runValidate(args.slice(1));
    return;
  }

  cliPrint(`Unknown command: ${command}. Run with --help for usage.`);
  process.exit(1);
}

function printHelp() {
  cliPrint(`
Universal MCP Installer v1.0.0

Usage:
  universal-mcp-installer detect                    Detect system, runtimes, and AI clients
  universal-mcp-installer install <package> [opts]   Install an MCP server to detected clients
  universal-mcp-installer validate <command> [args]  Validate an MCP server via handshake
  universal-mcp-installer --ui                       Launch the web dashboard

Install Options:
  --clients <ids>       Comma-separated client IDs (cursor,claude-desktop,vscode,openclaw,claude-code,chatgpt)
  --method <method>     Install method: auto, npm, uvx, git, local
  --env KEY=value       Environment variable (can be repeated)
  --no-validate         Skip MCP handshake validation
  --args <arg>          Server argument (can be repeated)

Examples:
  universal-mcp-installer install @modelcontextprotocol/server-memory
  universal-mcp-installer install my-server --clients cursor,claude-desktop
  universal-mcp-installer install ./my-local-server --method local
  universal-mcp-installer validate npx -y @modelcontextprotocol/server-memory
`);
}

async function runDetect() {
  const osInfo = detectOs();
  const runtimes = await detectRuntimes();
  const clients = detectClients();

  cliPrint(`\nSystem: ${osInfo.displayName}`);
  cliPrint('\nRuntimes:');
  for (const [name, info] of Object.entries(runtimes)) {
    const status = info.available ? `v${info.version}` : 'not found';
    cliPrint(`  ${name}: ${status}`);
  }

  cliPrint('\nAI Clients:');
  for (const client of clients) {
    const status = client.installed ? 'detected' : 'not found';
    const servers = client.existingServers.length > 0
      ? ` (${client.existingServers.length} servers configured)`
      : '';
    cliPrint(`  ${client.name}: ${status}${servers}`);
    if (client.installed) cliPrint(`    Config: ${client.configPath}`);
  }
}

async function runInstall(args: string[]) {
  if (args.length === 0) {
    cliPrint('Error: package name required. Run with --help for usage.');
    process.exit(1);
  }

  const pkgName = args[0];
  const clientFilter = parseFlag(args, '--clients')?.split(',') ?? [];
  const method = parseFlag(args, '--method') ?? 'auto';
  const shouldValidate = !args.includes('--no-validate');
  const envPairs = parseMultiFlag(args, '--env');
  const serverArgs = parseMultiFlag(args, '--args');

  const env = envPairs.reduce<Record<string, string>>((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx > 0) acc[pair.slice(0, idx)] = pair.slice(idx + 1);
    return acc;
  }, {});

  cliPrint(`\nInstalling: ${pkgName}`);
  cliPrint(`Method: ${method}`);

  let entry: McpServerEntry;
  let displayName: string;

  try {
    if (method === 'local' || pkgName.startsWith('/') || pkgName.startsWith('./')) {
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
        cliPrint('Not found in npm, trying uvx...');
        entry = resolveUvxPackage(pkgName, serverArgs, env);
      } else {
        entry = await resolveNpmPackage(pkgName, serverArgs, env);
      }
      displayName = formatServerName(pkgName);
    }
  } catch (err) {
    cliPrint(`\nError: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
    return;
  }

  cliPrint(`Server name: ${displayName}`);
  cliPrint(`Command: ${entry.command} ${(entry.args ?? []).join(' ')}`);

  const targetWriters = clientFilter.length > 0
    ? allWriters.filter(w => clientFilter.includes(w.id))
    : allWriters.filter(w => {
        const d = w.detect();
        return d.installed;
      });

  cliPrint(`\nWriting config to: ${targetWriters.map(w => w.name).join(', ')}`);

  for (const writer of targetWriters) {
    const result = writer.write(displayName, entry);
    if (result.success) {
      cliPrint(`  ${writer.name}: OK (${result.configPath})`);
    } else {
      cliPrint(`  ${writer.name}: FAILED - ${result.error}`);
    }
  }

  if (shouldValidate && entry.command) {
    cliPrint('\nValidating MCP handshake...');
    const validation = await validateMcpServer(entry.command, entry.args ?? [], entry.env);
    const osInfo = detectOs();
    const runtimes = await detectRuntimes();
    const results = targetWriters.map(w => ({ ...validation, client: w.name }));
    const report = generateReport(displayName, osInfo, runtimes, results);
    cliPrint('\n' + formatReportText(report));
  } else {
    cliPrint('\nSkipped validation. Restart your AI clients to apply changes.');
  }
}

async function runValidate(args: string[]) {
  if (args.length === 0) {
    cliPrint('Error: command required. Example: validate npx -y @modelcontextprotocol/server-memory');
    process.exit(1);
  }

  const [command, ...cmdArgs] = args;
  cliPrint(`\nValidating: ${command} ${cmdArgs.join(' ')}`);
  const result = await validateMcpServer(command, cmdArgs, undefined, 'Manual Test');
  cliPrint(JSON.stringify(result, null, 2));
}

async function launchDashboard(args: string[]) {
  const port = parseInt(parseFlag(args, '--port') ?? '3939', 10);
  cliPrint(`\nStarting dashboard on http://localhost:${port}`);
  cliPrint('Dashboard UI is under construction. Use CLI commands for now.');

  const { startApiServer } = await import('./api/server.js');
  await startApiServer(port);
}

function parseFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx >= 0 && idx + 1 < args.length) return args[idx + 1];
  return undefined;
}

function parseMultiFlag(args: string[], flag: string): string[] {
  const results: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && i + 1 < args.length) {
      results.push(args[i + 1]);
      i++;
    }
  }
  return results;
}

main().catch((err) => {
  cliPrint(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
