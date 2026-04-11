import * as http from 'node:http';
import { detectOs } from '../detect/os.js';
import { detectRuntimes } from '../detect/runtimes.js';
import { detectClients } from '../detect/clients.js';
import { resolveNpmPackage, isNpmPackage, formatServerName } from '../install/npm.js';
import { resolveUvxPackage } from '../install/uvx.js';
import { isGitUrl, resolveGitRepo } from '../install/git.js';
import { resolveLocalPath } from '../install/local.js';
import { CursorWriter } from '../clients/cursor.js';
import { ClaudeDesktopWriter } from '../clients/claude-desktop.js';
import { VSCodeWriter } from '../clients/vscode.js';
import { OpenClawWriter } from '../clients/openclaw.js';
import { ClaudeCodeWriter } from '../clients/claude-code.js';
import { ChatGPTBridgeWriter } from '../clients/chatgpt-bridge.js';
import { validateMcpServer } from '../validate/handshake.js';
import { generateReport } from '../validate/health-report.js';
import { WebSocketManager } from './websocket.js';
import { ClientWriter, McpServerEntry } from '../clients/types.js';
import { log } from '../utils/logging.js';

const allWriters: ClientWriter[] = [
  new CursorWriter(),
  new ClaudeDesktopWriter(),
  new VSCodeWriter(),
  new OpenClawWriter(),
  new ClaudeCodeWriter(),
  new ChatGPTBridgeWriter(),
];

function jsonResponse(res: http.ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export async function handleApiRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  ws: WebSocketManager,
): Promise<void> {
  const url = req.url ?? '';

  try {
    if (url === '/api/system' && req.method === 'GET') {
      const osInfo = detectOs();
      const runtimes = await detectRuntimes();
      const clients = detectClients();
      jsonResponse(res, { os: osInfo, runtimes, clients });
      return;
    }

    if (url === '/api/clients' && req.method === 'GET') {
      const clients = detectClients();
      jsonResponse(res, { clients });
      return;
    }

    if (url === '/api/install' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const pkgName = body.package as string;
      const method = (body.method as string) ?? 'auto';
      const clientIds = (body.clients as string[]) ?? [];
      const envEntries = (body.env as Record<string, string>) ?? {};
      const serverArgs = (body.args as string[]) ?? [];

      ws.broadcast({ type: 'install_step', data: { step: 'Resolving package', status: 'running' } });

      let entry: McpServerEntry;
      let displayName: string;

      if (method === 'local' || pkgName.startsWith('/')) {
        const result = await resolveLocalPath(pkgName, serverArgs, envEntries);
        entry = result.entries[0].entry;
        displayName = formatServerName(result.entries[0].name);
      } else if (method === 'git' || (method === 'auto' && isGitUrl(pkgName))) {
        const result = await resolveGitRepo(pkgName, serverArgs, envEntries);
        entry = result.entry;
        displayName = formatServerName(result.name);
      } else if (method === 'uvx') {
        entry = resolveUvxPackage(pkgName, serverArgs, envEntries);
        displayName = formatServerName(pkgName);
      } else {
        if (method === 'auto' && !(await isNpmPackage(pkgName))) {
          entry = resolveUvxPackage(pkgName, serverArgs, envEntries);
        } else {
          entry = await resolveNpmPackage(pkgName, serverArgs, envEntries);
        }
        displayName = formatServerName(pkgName);
      }

      ws.broadcast({ type: 'install_step', data: { step: 'Resolving package', status: 'done' } });
      ws.broadcast({ type: 'install_step', data: { step: 'Writing config', status: 'running' } });

      const targetWriters = clientIds.length > 0
        ? allWriters.filter(w => clientIds.includes(w.id))
        : allWriters.filter(w => w.detect().installed);

      const writeResults = targetWriters.map(w => {
        const r = w.write(displayName, entry);
        ws.broadcast({
          type: 'validation_result',
          data: { client: w.name, status: r.success ? 'pass' : 'fail', error: r.error },
        });
        return r;
      });

      ws.broadcast({ type: 'install_step', data: { step: 'Writing config', status: 'done' } });
      ws.broadcast({ type: 'install_step', data: { step: 'Validating', status: 'running' } });

      const osInfo = detectOs();
      const runtimes = await detectRuntimes();

      let validation: Awaited<ReturnType<typeof validateMcpServer>> | null = null;
      if (entry.command) {
        validation = await validateMcpServer(entry.command, entry.args ?? [], entry.env);
      }

      const results = targetWriters.map(w => ({
        ...(validation ?? { client: w.name, status: 'skip' as const, latencyMs: 0 }),
        client: w.name,
      }));

      const report = generateReport(displayName, osInfo, runtimes, results);
      ws.broadcast({ type: 'install_step', data: { step: 'Validating', status: 'done' } });
      ws.broadcast({ type: 'report_complete', data: report });

      jsonResponse(res, { success: true, report, writeResults });
      return;
    }

    if (url === '/api/validate' && req.method === 'POST') {
      const body = JSON.parse(await readBody(req));
      const command = body.command as string;
      const args = (body.args as string[]) ?? [];
      const env = (body.env as Record<string, string>) ?? {};

      const result = await validateMcpServer(command, args, env, 'API Test');
      jsonResponse(res, result);
      return;
    }

    jsonResponse(res, { error: 'Not found' }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error('API error', { url, error: message });
    jsonResponse(res, { error: message }, 500);
  }
}
