import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ClientWriter, McpServerEntry, WriteResult } from './types.js';
import { readJsonFile, backupFile, writeJsonFile, mergeServerIntoConfig } from '../utils/config-io.js';
import { log } from '../utils/logging.js';

export class CursorWriter implements ClientWriter {
  readonly name = 'Cursor';
  readonly id = 'cursor';

  private getConfigPath(): string {
    return path.join(os.homedir(), '.cursor', 'mcp.json');
  }

  getConfigKey(): string {
    return 'mcpServers';
  }

  detect(): { installed: boolean; configPath: string; existing: Record<string, unknown> | null } {
    const configPath = this.getConfigPath();
    const installed = fs.existsSync(path.dirname(configPath));
    let existing: Record<string, unknown> | null = null;
    try {
      existing = readJsonFile(configPath);
    } catch {
      // config may not exist yet
    }
    return { installed, configPath, existing };
  }

  write(serverName: string, config: McpServerEntry): WriteResult {
    const configPath = this.getConfigPath();
    try {
      const backupPath = backupFile(configPath);
      let existing = readJsonFile(configPath) ?? { mcpServers: {} };

      const entry: Record<string, unknown> = {
        command: config.command,
        type: config.type ?? 'stdio',
        args: config.args ?? [],
      };
      if (config.env && Object.keys(config.env).length > 0) {
        entry.env = config.env;
      }
      if (config.cwd) entry.cwd = config.cwd;

      existing = mergeServerIntoConfig(existing, 'mcpServers', serverName, entry);
      writeJsonFile(configPath, existing);

      log.info(`Wrote Cursor config for ${serverName}`, { path: configPath });
      return { success: true, configPath, backupPath, serverName };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, configPath, backupPath: null, serverName, error: message };
    }
  }
}
