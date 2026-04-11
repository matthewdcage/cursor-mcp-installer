import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { CursorWriter } from '../src/clients/cursor.js';
import { resolveNpmPackage } from '../src/install/npm.js';
import { validateMcpServer } from '../src/validate/handshake.js';
import { detectOs } from '../src/detect/os.js';
import { detectRuntimes } from '../src/detect/runtimes.js';
import { generateReport, formatReportText } from '../src/validate/health-report.js';
import { writeJsonFile, readJsonFile } from '../src/utils/config-io.js';
import { createError, getHint } from '../src/utils/errors.js';

describe('End-to-End: Install and Validate server-memory', () => {
  let tmpDir: string;
  let originalHome: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-e2e-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('resolves, writes config, and validates server-memory', async () => {
    const entry = await resolveNpmPackage('@modelcontextprotocol/server-memory');
    expect(entry.command).toBe('npx');
    expect(entry.type).toBe('stdio');

    const configPath = path.join(tmpDir, 'mcp.json');
    writeJsonFile(configPath, { mcpServers: {} });

    const existing = readJsonFile(configPath)!;
    const serverConfig = {
      command: entry.command,
      type: entry.type ?? 'stdio',
      args: entry.args,
    };
    const updated = {
      ...existing,
      mcpServers: { ...(existing.mcpServers as Record<string, unknown>), 'server-memory': serverConfig },
    };
    writeJsonFile(configPath, updated);

    const written = readJsonFile(configPath)!;
    const servers = written.mcpServers as Record<string, unknown>;
    expect(servers['server-memory']).toBeTruthy();

    const validation = await validateMcpServer(
      entry.command!,
      entry.args ?? [],
      entry.env,
      'E2E Test',
    );

    expect(validation.status).toBe('pass');
    expect(validation.toolCount).toBeGreaterThan(0);
    expect(validation.latencyMs).toBeLessThan(15000);

    const osInfo = detectOs();
    const runtimes = await detectRuntimes();
    const report = generateReport('server-memory', osInfo, runtimes, [validation]);
    const text = formatReportText(report);

    expect(text).toContain('PASS');
    expect(text).toContain('server-memory');
  }, 30000);
});

describe('Error Recovery Database', () => {
  it('returns recovery hints for known error codes', () => {
    const hint = getHint('NODE_NOT_FOUND');
    expect(hint.message).toContain('Node.js');
    expect(hint.url).toContain('nodejs.org');
  });

  it('returns recovery hints for config errors', () => {
    const hint = getHint('CONFIG_PARSE_ERROR', '/path/to/config.json: unexpected token');
    expect(hint.message).toContain('invalid JSON');
    expect(hint.autoFixAvailable).toBe(true);
  });

  it('creates InstallerError with code and hint', () => {
    const err = createError('HANDSHAKE_TIMEOUT');
    expect(err.code).toBe('HANDSHAKE_TIMEOUT');
    expect(err.hint.message).toContain('10 seconds');
    expect(err.name).toBe('InstallerError');
  });

  it('handles unknown error codes gracefully', () => {
    const hint = getHint('TOTALLY_UNKNOWN_CODE');
    expect(hint.message).toContain('Unknown');
  });
});
