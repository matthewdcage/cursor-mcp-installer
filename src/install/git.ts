import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { McpServerEntry } from '../clients/types.js';
import { createError } from '../utils/errors.js';
import { log } from '../utils/logging.js';

const execFileAsync = promisify(execFile);

export function isGitUrl(name: string): boolean {
  return name.endsWith('.git') || name.includes('github.com') || name.includes('gitlab.com') || name.includes('bitbucket.org');
}

export async function resolveGitRepo(url: string, args?: string[], env?: Record<string, string>): Promise<{ entry: McpServerEntry; name: string }> {
  const repoName = url.split('/').pop()?.replace('.git', '') ?? 'mcp-repo';
  const tempDir = path.join(os.tmpdir(), `mcp-${repoName}-${Date.now()}`);

  try {
    fs.mkdirSync(tempDir, { recursive: true });
    log.info(`Cloning ${url} to ${tempDir}`);
    await execFileAsync('git', ['clone', '--depth', '1', url, tempDir], { timeout: 60000 });
  } catch (err) {
    throw createError('GIT_CLONE_FAILED', err instanceof Error ? err.message : String(err));
  }

  if (fs.existsSync(path.join(tempDir, 'package.json'))) {
    log.info('Found package.json, running npm install');
    await execFileAsync('npm', ['install', '--production'], { cwd: tempDir, timeout: 120000 });
  }

  const entryFile = ['index.mjs', 'index.js', 'src/index.mjs', 'src/index.js', 'dist/index.js']
    .find(f => fs.existsSync(path.join(tempDir, f)));

  if (!entryFile) {
    if (fs.existsSync(path.join(tempDir, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(tempDir, 'package.json'), 'utf-8'));
      const main = pkg.main ?? pkg.bin?.[Object.keys(pkg.bin ?? {})[0]];
      if (main) {
        return {
          name: repoName,
          entry: {
            command: 'node',
            args: [path.join(tempDir, main), ...(args ?? [])],
            env,
            type: 'stdio',
          },
        };
      }
    }
    throw createError('PATH_NOT_FOUND', `No entry point found in cloned repository: ${tempDir}`);
  }

  return {
    name: repoName,
    entry: {
      command: 'node',
      args: [path.join(tempDir, entryFile), ...(args ?? [])],
      env,
      type: 'stdio',
    },
  };
}
