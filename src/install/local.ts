import * as fs from 'node:fs';
import * as path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { McpServerEntry } from '../clients/types.js';
import { createError } from '../utils/errors.js';
import { log } from '../utils/logging.js';

const execFileAsync = promisify(execFile);

export async function resolveLocalPath(
  dirPath: string,
  args?: string[],
  env?: Record<string, string>,
): Promise<{ entries: Array<{ name: string; entry: McpServerEntry }> }> {
  if (!fs.existsSync(dirPath)) {
    throw createError('PATH_NOT_FOUND', dirPath);
  }

  const results: Array<{ name: string; entry: McpServerEntry }> = [];

  const pkgPath = path.join(dirPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    log.info('Found package.json, installing dependencies');
    await execFileAsync('npm', ['install', '--production'], { cwd: dirPath, timeout: 120000 });

    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    if (pkg.bin && typeof pkg.bin === 'object') {
      for (const [name, binPath] of Object.entries(pkg.bin)) {
        results.push({
          name,
          entry: {
            command: 'node',
            args: [path.resolve(dirPath, binPath as string), ...(args ?? [])],
            env,
            type: 'stdio',
          },
        });
      }
    } else if (pkg.main) {
      results.push({
        name: pkg.name ?? path.basename(dirPath),
        entry: {
          command: 'node',
          args: [path.resolve(dirPath, pkg.main), ...(args ?? [])],
          env,
          type: 'stdio',
        },
      });
    }
  }

  const pyFiles = ['server.py', 'main.py', '__main__.py', 'src/server.py'];
  if (results.length === 0) {
    const pyEntry = pyFiles.find(f => fs.existsSync(path.join(dirPath, f)));
    if (pyEntry) {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      results.push({
        name: path.basename(dirPath),
        entry: {
          command: pythonCmd,
          args: [path.resolve(dirPath, pyEntry), ...(args ?? [])],
          env,
          type: 'stdio',
          cwd: dirPath,
        },
      });
    }
  }

  if (results.length === 0) {
    throw createError('PATH_NOT_FOUND', `No installable MCP server found at ${dirPath}`);
  }

  return { entries: results };
}
