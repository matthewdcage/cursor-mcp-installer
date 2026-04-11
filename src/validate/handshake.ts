import { spawn } from 'node:child_process';
import { log } from '../utils/logging.js';
import { ValidationResult } from '../clients/types.js';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string; data?: unknown };
}

const HANDSHAKE_TIMEOUT = 10000;

export async function validateMcpServer(
  command: string,
  args: string[],
  env?: Record<string, string>,
  clientName?: string,
): Promise<ValidationResult> {
  const startTime = Date.now();
  const client = clientName ?? 'unknown';

  return new Promise<ValidationResult>((resolve) => {
    const proc = spawn(command, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
      timeout: HANDSHAKE_TIMEOUT + 2000,
    });

    let stdout = '';
    let stderr = '';
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.kill('SIGTERM');
        setTimeout(() => proc.kill('SIGKILL'), 2000);
        resolve({
          client,
          status: 'fail',
          latencyMs: Date.now() - startTime,
          error: 'Handshake timeout (10s)',
          hint: 'Server did not respond to initialize. Test with: npx @modelcontextprotocol/inspector',
        });
      }
    }, HANDSHAKE_TIMEOUT);

    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
      tryParseResponses();
    });

    proc.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({
          client,
          status: 'fail',
          latencyMs: Date.now() - startTime,
          error: `Failed to spawn: ${err.message}`,
          hint: `Check that "${command}" exists and is executable.`,
        });
      }
    });

    proc.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({
          client,
          status: 'fail',
          latencyMs: Date.now() - startTime,
          error: `Server exited with code ${code} before handshake completed`,
          hint: stderr ? `Server stderr: ${stderr.slice(0, 200)}` : 'No stderr output from server.',
        });
      }
    });

    const initRequest: JsonRpcRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {
          roots: { listChanged: true },
        },
        clientInfo: {
          name: 'universal-mcp-installer',
          version: '1.0.0',
        },
      },
    };

    proc.stdin.write(JSON.stringify(initRequest) + '\n');

    let initDone = false;
    let toolCount = 0;

    function tryParseResponses() {
      const lines = stdout.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const msg = JSON.parse(trimmed) as JsonRpcResponse;
          handleMessage(msg);
        } catch {
          // partial JSON, wait for more data
        }
      }
    }

    function handleMessage(msg: JsonRpcResponse) {
      if (msg.id === 1 && !initDone) {
        initDone = true;
        if (msg.error) {
          resolved = true;
          clearTimeout(timer);
          proc.kill('SIGTERM');
          resolve({
            client,
            status: 'fail',
            latencyMs: Date.now() - startTime,
            error: `Initialize error: ${msg.error.message}`,
            hint: 'Server rejected initialization. Check protocol version compatibility.',
          });
          return;
        }

        log.debug('Initialize response received', { result: msg.result });

        const notification = JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n';
        proc.stdin.write(notification);

        const listToolsReq: JsonRpcRequest = {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {},
        };
        proc.stdin.write(JSON.stringify(listToolsReq) + '\n');
      }

      if (msg.id === 2 && initDone) {
        resolved = true;
        clearTimeout(timer);

        if (msg.result) {
          const tools = msg.result.tools as Array<unknown> | undefined;
          toolCount = tools?.length ?? 0;
        }

        proc.stdin.end();
        proc.kill('SIGTERM');

        resolve({
          client,
          status: 'pass',
          toolCount,
          latencyMs: Date.now() - startTime,
        });
      }
    }
  });
}
