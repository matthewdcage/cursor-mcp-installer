import * as path from 'node:path';
import * as fs from 'node:fs';
import { ClientWriter, McpServerEntry, WriteResult } from './types.js';
import { readJsonFile, backupFile, writeJsonFile, mergeServerIntoConfig } from '../utils/config-io.js';
import { log } from '../utils/logging.js';

export class VSCodeWriter implements ClientWriter {
  readonly name = 'VS Code';
  readonly id = 'vscode';

  private getConfigPath(): string {
    return path.join('.vscode', 'mcp.json');
  }

  getConfigKey(): string {
    return 'servers';
  }

  detect() {
    const configPath = this.getConfigPath();
    const installed = fs.existsSync('.vscode') || fs.existsSync(path.join(process.cwd(), '.vscode'));
    let existing: Record<string, unknown> | null = null;
    try { existing = readJsonFile(configPath); } catch { /* may not exist */ }
    return { installed, configPath, existing };
  }

  write(serverName: string, config: McpServerEntry): WriteResult {
    const configPath = this.getConfigPath();
    try {
      const backupPath = backupFile(configPath);
      let existing = readJsonFile(configPath) ?? { servers: {} };

      const entry: Record<string, unknown> = {
        type: 'stdio',
        command: config.command ?? 'npx',
        args: config.args ?? [],
      };
      if (config.env && Object.keys(config.env).length > 0) {
        entry.env = config.env;
      }

      const camelName = serverName
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
        .replace(/^[A-Z]/, c => c.toLowerCase());

      existing = mergeServerIntoConfig(existing, 'servers', camelName, entry);
      writeJsonFile(configPath, existing);

      log.info(`Wrote VS Code config for ${serverName}`, { path: configPath });
      return { success: true, configPath, backupPath, serverName };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, configPath, backupPath: null, serverName, error: message };
    }
  }
}
