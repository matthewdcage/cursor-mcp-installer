import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ClientWriter, McpServerEntry, WriteResult } from './types.js';
import { readJsonFile, backupFile, writeJsonFile, mergeServerIntoConfig } from '../utils/config-io.js';
import { log } from '../utils/logging.js';

export class ClaudeCodeWriter implements ClientWriter {
  readonly name = 'Claude Code';
  readonly id = 'claude-code';

  private getConfigPath(): string {
    return path.join(process.cwd(), '.mcp.json');
  }

  getConfigKey(): string {
    return 'mcpServers';
  }

  detect() {
    const configPath = this.getConfigPath();
    const installed = fs.existsSync(path.join(os.homedir(), '.claude.json'));
    let existing: Record<string, unknown> | null = null;
    try { existing = readJsonFile(configPath); } catch { /* may not exist */ }
    return { installed, configPath, existing };
  }

  write(serverName: string, config: McpServerEntry): WriteResult {
    const configPath = this.getConfigPath();
    try {
      const backupPath = backupFile(configPath);
      let existing = readJsonFile(configPath) ?? { mcpServers: {} };

      const entry: Record<string, unknown> = {
        command: config.command ?? 'npx',
        args: config.args ?? [],
      };
      if (config.env && Object.keys(config.env).length > 0) {
        entry.env = config.env;
      }

      existing = mergeServerIntoConfig(existing, 'mcpServers', serverName, entry);
      writeJsonFile(configPath, existing);

      log.info(`Wrote Claude Code config for ${serverName}`, { path: configPath });
      return { success: true, configPath, backupPath, serverName };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, configPath, backupPath: null, serverName, error: message };
    }
  }
}
