import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ClientWriter, McpServerEntry, WriteResult } from './types.js';
import { readJsonFile, backupFile, writeJsonFile, mergeServerIntoConfig } from '../utils/config-io.js';
import { log } from '../utils/logging.js';

export class ClaudeDesktopWriter implements ClientWriter {
  readonly name = 'Claude Desktop';
  readonly id = 'claude-desktop';

  private getConfigPath(): string {
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

  getConfigKey(): string {
    return 'mcpServers';
  }

  detect() {
    const configPath = this.getConfigPath();
    const installed = fs.existsSync(path.dirname(configPath));
    let existing: Record<string, unknown> | null = null;
    try { existing = readJsonFile(configPath); } catch { /* may not exist */ }
    return { installed, configPath, existing };
  }

  write(serverName: string, config: McpServerEntry): WriteResult {
    const configPath = this.getConfigPath();
    try {
      const backupPath = backupFile(configPath);
      let existing = readJsonFile(configPath) ?? { mcpServers: {} };

      let command = config.command ?? 'npx';
      let args = config.args ?? [];

      if (process.platform === 'win32' && (command === 'npx' || command === 'npm')) {
        args = ['/c', command, ...args];
        command = 'cmd';
      }

      const entry: Record<string, unknown> = { command, args };
      if (config.env && Object.keys(config.env).length > 0) {
        entry.env = config.env;
      }

      existing = mergeServerIntoConfig(existing, 'mcpServers', serverName, entry);
      writeJsonFile(configPath, existing);

      log.info(`Wrote Claude Desktop config for ${serverName}`, { path: configPath });
      return { success: true, configPath, backupPath, serverName };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, configPath, backupPath: null, serverName, error: message };
    }
  }
}
