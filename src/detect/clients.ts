import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { log } from '../utils/logging.js';
import { readJsonFile } from '../utils/config-io.js';

export interface ClientDetection {
  name: string;
  id: string;
  installed: boolean;
  configPath: string;
  configExists: boolean;
  existingServers: string[];
  icon: string;
}

function getClaudeDesktopConfigPath(): string {
  switch (process.platform) {
    case 'darwin':
      return path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
    case 'win32':
      return path.join(process.env.APPDATA ?? '', 'Claude', 'claude_desktop_config.json');
    case 'linux':
      return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
    default:
      return path.join(os.homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

function getCursorConfigPath(): string {
  return path.join(os.homedir(), '.cursor', 'mcp.json');
}

function getVSCodeConfigPath(): string {
  return path.join('.vscode', 'mcp.json');
}

function getOpenClawConfigPath(): string {
  const override = process.env.OPENCLAW_CONFIG_PATH?.trim();
  if (override) return override;
  return path.join(os.homedir(), '.openclaw', 'openclaw.json');
}

function getClaudeCodeConfigPath(): string {
  return path.join(os.homedir(), '.claude.json');
}

function isClientInstalled(configPath: string): boolean {
  const dir = path.dirname(configPath);
  return fs.existsSync(dir);
}

function getExistingServers(configPath: string, key: string): string[] {
  try {
    const config = readJsonFile(configPath);
    if (!config) return [];
    const servers = config[key] as Record<string, unknown> | undefined;
    return servers ? Object.keys(servers) : [];
  } catch {
    return [];
  }
}

function getOpenClawServers(configPath: string): string[] {
  try {
    const config = readJsonFile(configPath);
    if (!config) return [];
    const mcp = config['mcp'] as Record<string, unknown> | undefined;
    if (!mcp) return [];
    const servers = mcp['servers'] as Record<string, unknown> | undefined;
    return servers ? Object.keys(servers) : [];
  } catch {
    return [];
  }
}

export function detectClients(): ClientDetection[] {
  const results: ClientDetection[] = [];

  const claudeDesktop = getClaudeDesktopConfigPath();
  results.push({
    name: 'Claude Desktop',
    id: 'claude-desktop',
    installed: isClientInstalled(claudeDesktop),
    configPath: claudeDesktop,
    configExists: fs.existsSync(claudeDesktop),
    existingServers: getExistingServers(claudeDesktop, 'mcpServers'),
    icon: 'claude',
  });

  const cursor = getCursorConfigPath();
  results.push({
    name: 'Cursor',
    id: 'cursor',
    installed: isClientInstalled(cursor),
    configPath: cursor,
    configExists: fs.existsSync(cursor),
    existingServers: getExistingServers(cursor, 'mcpServers'),
    icon: 'cursor',
  });

  const vscode = getVSCodeConfigPath();
  results.push({
    name: 'VS Code',
    id: 'vscode',
    installed: fs.existsSync(vscode) || fs.existsSync(path.join(os.homedir(), '.vscode')),
    configPath: vscode,
    configExists: fs.existsSync(vscode),
    existingServers: getExistingServers(vscode, 'servers'),
    icon: 'vscode',
  });

  const openclaw = getOpenClawConfigPath();
  results.push({
    name: 'OpenClaw',
    id: 'openclaw',
    installed: isClientInstalled(openclaw),
    configPath: openclaw,
    configExists: fs.existsSync(openclaw),
    existingServers: getOpenClawServers(openclaw),
    icon: 'openclaw',
  });

  const claudeCode = getClaudeCodeConfigPath();
  results.push({
    name: 'Claude Code',
    id: 'claude-code',
    installed: fs.existsSync(claudeCode) || isClaudeCodeAvailable(),
    configPath: claudeCode,
    configExists: fs.existsSync(claudeCode),
    existingServers: getClaudeCodeServers(claudeCode),
    icon: 'claude-code',
  });

  results.push({
    name: 'ChatGPT (HTTP Bridge)',
    id: 'chatgpt',
    installed: true,
    configPath: 'N/A (HTTP bridge)',
    configExists: false,
    existingServers: [],
    icon: 'chatgpt',
  });

  log.info('Detected clients', {
    detected: results.filter(c => c.installed).map(c => c.name),
  });

  return results;
}

function isClaudeCodeAvailable(): boolean {
  try {
    const { execFileSync } = require('node:child_process');
    execFileSync('claude', ['--version'], { timeout: 3000, stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function getClaudeCodeServers(configPath: string): string[] {
  try {
    const config = readJsonFile(configPath);
    if (!config) return [];
    const projects = config['projects'] as Record<string, unknown> | undefined;
    if (!projects) return [];
    const allServers: string[] = [];
    for (const proj of Object.values(projects)) {
      const p = proj as Record<string, unknown>;
      const servers = p['mcpServers'] as Record<string, unknown> | undefined;
      if (servers) allServers.push(...Object.keys(servers));
    }
    return [...new Set(allServers)];
  } catch {
    return [];
  }
}
