import { McpServerEntry } from '../clients/types.js';
import { log } from '../utils/logging.js';

export function resolveUvxPackage(name: string, args?: string[], env?: Record<string, string>): McpServerEntry {
  log.info(`Resolved uvx package: ${name}`);
  return {
    command: 'uvx',
    args: [name, ...(args ?? [])],
    env,
    type: 'stdio',
  };
}
