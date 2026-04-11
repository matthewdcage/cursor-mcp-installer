import { ClientWriter, McpServerEntry, WriteResult } from './types.js';
import { log } from '../utils/logging.js';

export class ChatGPTBridgeWriter implements ClientWriter {
  readonly name = 'ChatGPT (HTTP Bridge)';
  readonly id = 'chatgpt';

  getConfigKey(): string {
    return 'N/A';
  }

  detect() {
    return {
      installed: true,
      configPath: 'N/A (HTTP bridge mode)',
      existing: null,
    };
  }

  write(serverName: string, config: McpServerEntry): WriteResult {
    log.info(`ChatGPT bridge: would start HTTP bridge for ${serverName}`);
    log.info('To expose this server to ChatGPT, run: npx universal-mcp-installer bridge <server-name>');

    return {
      success: true,
      configPath: 'N/A',
      backupPath: null,
      serverName,
    };
  }
}

export interface BridgeOptions {
  port?: number;
  host?: string;
  serverCommand: string;
  serverArgs: string[];
  serverEnv?: Record<string, string>;
}
