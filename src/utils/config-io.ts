import * as fs from 'node:fs';
import * as path from 'node:path';
import { log } from './logging.js';
import { createError } from './errors.js';

export function readJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as Record<string, unknown>;
  } catch (err) {
    const message = err instanceof SyntaxError ? err.message : String(err);
    log.error('Failed to parse config file', { path: filePath, error: message });
    throw createError('CONFIG_PARSE_ERROR', `${filePath}: ${message}`);
  }
}

export function backupFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;

  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(dir, `${base}.${timestamp}${ext}.bak`);

  fs.copyFileSync(filePath, backupPath);
  log.info('Created backup', { original: filePath, backup: backupPath });
  return backupPath;
}

export function writeJsonFile(filePath: string, data: Record<string, unknown>): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log.info('Created directory', { path: dir });
  }

  const tempPath = filePath + '.tmp';
  const content = JSON.stringify(data, null, 2) + '\n';

  try {
    fs.writeFileSync(tempPath, content, 'utf-8');
    fs.renameSync(tempPath, filePath);
    log.info('Wrote config file', { path: filePath });
  } catch (err) {
    try { fs.unlinkSync(tempPath); } catch { /* ignore cleanup failure */ }
    throw err;
  }
}

export function mergeServerIntoConfig(
  config: Record<string, unknown>,
  key: string,
  serverName: string,
  serverConfig: Record<string, unknown>,
): Record<string, unknown> {
  const servers = (config[key] as Record<string, unknown>) ?? {};
  return {
    ...config,
    [key]: {
      ...servers,
      [serverName]: serverConfig,
    },
  };
}

export function mergeNestedServerIntoConfig(
  config: Record<string, unknown>,
  parentKey: string,
  childKey: string,
  serverName: string,
  serverConfig: Record<string, unknown>,
): Record<string, unknown> {
  const parent = (config[parentKey] as Record<string, unknown>) ?? {};
  const servers = (parent[childKey] as Record<string, unknown>) ?? {};
  return {
    ...config,
    [parentKey]: {
      ...parent,
      [childKey]: {
        ...servers,
        [serverName]: serverConfig,
      },
    },
  };
}
