import { describe, it, expect } from 'vitest';
import { validateMcpServer } from '../src/validate/handshake.js';
import { generateReport, formatReportText } from '../src/validate/health-report.js';
import { detectOs } from '../src/detect/os.js';
import { detectRuntimes } from '../src/detect/runtimes.js';

describe('MCP Handshake Validation', () => {
  it('validates a real MCP server (server-memory)', async () => {
    const result = await validateMcpServer('npx', ['-y', '@modelcontextprotocol/server-memory'], undefined, 'Test');

    expect(result.client).toBe('Test');
    expect(result.status).toBe('pass');
    expect(result.toolCount).toBeGreaterThan(0);
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.error).toBeUndefined();
  }, 30000);

  it('fails for nonexistent command', async () => {
    const result = await validateMcpServer('nonexistent-command-xyz', [], undefined, 'Test');

    expect(result.status).toBe('fail');
    expect(result.error).toBeTruthy();
  });

  it('fails for command that exits immediately', async () => {
    const result = await validateMcpServer('node', ['-e', 'process.exit(1)'], undefined, 'Test');

    expect(result.status).toBe('fail');
    expect(result.error).toContain('exited');
  });
});

describe('Health Report', () => {
  it('generates a structured report', async () => {
    const osInfo = detectOs();
    const runtimes = await detectRuntimes();
    const results = [
      { client: 'Cursor', status: 'pass' as const, toolCount: 5, latencyMs: 123 },
      { client: 'VS Code', status: 'skip' as const },
      { client: 'Claude Desktop', status: 'fail' as const, error: 'timeout', hint: 'Check logs' },
    ];

    const report = generateReport('test-server', osInfo, runtimes, results);
    expect(report.serverName).toBe('test-server');
    expect(report.results.length).toBe(3);
    expect(report.hints.length).toBeGreaterThan(0);
    expect(report.timestamp).toBeTruthy();
  });

  it('formats report as text', async () => {
    const osInfo = detectOs();
    const runtimes = await detectRuntimes();
    const results = [
      { client: 'Cursor', status: 'pass' as const, toolCount: 5, latencyMs: 123 },
    ];

    const report = generateReport('test-server', osInfo, runtimes, results);
    const text = formatReportText(report);

    expect(text).toContain('Universal MCP Installer');
    expect(text).toContain('test-server');
    expect(text).toContain('PASS');
    expect(text).toContain('Cursor');
  });
});
