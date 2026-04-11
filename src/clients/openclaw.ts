import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { ClientWriter, McpServerEntry, WriteResult } from './types.js';
import { readJsonFile, backupFile, writeJsonFile, mergeNestedServerIntoConfig } from '../utils/config-io.js';
import { log } from '../utils/logging.js';

export class OpenClawWriter implements ClientWriter {
  readonly name = 'OpenClaw';
  readonly id = 'openclaw';

  private getConfigPath(): string {
    const override = process.env.OPENCLAW_CONFIG_PATH?.trim();
    if (override) return override;
    return path.join(os.homedir(), '.openclaw', 'openclaw.json');
  }

  getConfigKey(): string {
    return 'mcp.servers';
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
      let existing = readJsonFile(configPath) ?? {};

      const entry: Record<string, unknown> = {};
      if (config.command) entry.command = config.command;
      if (config.args && config.args.length > 0) entry.args = config.args;
      if (config.env && Object.keys(config.env).length > 0) entry.env = config.env;
      if (config.cwd) entry.cwd = config.cwd;
      if (config.url) entry.url = config.url;

      existing = mergeNestedServerIntoConfig(existing, 'mcp', 'servers', serverName, entry);
      writeJsonFile(configPath, existing);

      log.info(`Wrote OpenClaw config for ${serverName}`, { path: configPath });
      return { success: true, configPath, backupPath, serverName };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, configPath, backupPath: null, serverName, error: message };
    }
  }
}
