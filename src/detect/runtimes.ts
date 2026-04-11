import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { log } from '../utils/logging.js';

const execFileAsync = promisify(execFile);

export interface RuntimeInfo {
  name: string;
  available: boolean;
  version: string | null;
  path: string | null;
}

export interface RuntimesReport {
  node: RuntimeInfo;
  npm: RuntimeInfo;
  npx: RuntimeInfo;
  uvx: RuntimeInfo;
  python: RuntimeInfo;
  git: RuntimeInfo;
}

async function probeRuntime(name: string, args: string[] = ['--version']): Promise<RuntimeInfo> {
  try {
    const { stdout } = await execFileAsync(name, args, { timeout: 5000 });
    const version = stdout.trim().replace(/^v/, '');
    log.debug(`Detected ${name}`, { version });
    return { name, available: true, version, path: name };
  } catch {
    log.debug(`${name} not found`);
    return { name, available: false, version: null, path: null };
  }
}

async function probePython(): Promise<RuntimeInfo> {
  const candidates = process.platform === 'win32'
    ? ['python', 'python3', 'py']
    : ['python3', 'python'];

  for (const cmd of candidates) {
    const result = await probeRuntime(cmd);
    if (result.available) {
      return { ...result, name: 'python' };
    }
  }
  return { name: 'python', available: false, version: null, path: null };
}

export async function detectRuntimes(): Promise<RuntimesReport> {
  const [node, npm, npx, uvx, python, git] = await Promise.all([
    probeRuntime('node'),
    probeRuntime('npm'),
    probeRuntime('npx'),
    probeRuntime('uvx'),
    probePython(),
    probeRuntime('git'),
  ]);

  return { node, npm, npx, uvx, python, git };
}
