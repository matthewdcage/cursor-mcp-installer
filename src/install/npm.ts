import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { McpServerEntry } from '../clients/types.js';
import { createError } from '../utils/errors.js';
import { log } from '../utils/logging.js';

const execFileAsync = promisify(execFile);

export async function isNpmPackage(name: string): Promise<boolean> {
  try {
    await execFileAsync('npm', ['view', name, 'version'], { timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

export async function resolveNpmPackage(name: string, args?: string[], env?: Record<string, string>): Promise<McpServerEntry> {
  const exists = await isNpmPackage(name);
  if (!exists) {
    throw createError('PACKAGE_NOT_FOUND', name);
  }

  log.info(`Resolved npm package: ${name}`);
  return {
    command: 'npx',
    args: ['-y', name, ...(args ?? [])],
    env,
    type: 'stdio',
  };
}

export function formatServerName(packageName: string): string {
  const base = packageName.includes('/') ? packageName.split('/').pop()! : packageName;
  return base
    .replace(/^(mcp-|server-|@[^/]+\/)*/g, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim() || base;
}
