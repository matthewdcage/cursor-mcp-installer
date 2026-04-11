import { ValidationResult } from '../clients/types.js';
import { OsInfo } from '../detect/os.js';
import { RuntimesReport } from '../detect/runtimes.js';

export interface HealthReport {
  serverName: string;
  timestamp: string;
  os: OsInfo;
  runtimes: RuntimesReport;
  results: ValidationResult[];
  hints: string[];
}

export function generateReport(
  serverName: string,
  osInfo: OsInfo,
  runtimes: RuntimesReport,
  results: ValidationResult[],
): HealthReport {
  const hints: string[] = [];

  for (const r of results) {
    if (r.status === 'pass') {
      switch (r.client) {
        case 'Cursor':
          hints.push('Restart Cursor to pick up new MCP config.');
          break;
        case 'Claude Desktop':
          hints.push('Restart Claude Desktop to pick up new MCP config (fully quit, not just close window).');
          break;
        case 'OpenClaw':
          hints.push("Run 'openclaw mcp list' to verify OpenClaw config.");
          break;
        case 'VS Code':
          hints.push('VS Code should auto-detect config changes, or run "MCP: List Servers" from Command Palette.');
          break;
      }
    }
    if (r.hint) hints.push(r.hint);
  }

  return {
    serverName,
    timestamp: new Date().toISOString(),
    os: osInfo,
    runtimes,
    results,
    hints: [...new Set(hints)],
  };
}

export function formatReportText(report: HealthReport): string {
  const lines: string[] = [];
  lines.push('Universal MCP Installer - Installation Report');
  lines.push('='.repeat(46));
  lines.push(`Server: ${report.serverName}`);
  lines.push(`OS: ${report.os.displayName}`);

  const rtParts: string[] = [];
  if (report.runtimes.node.available) rtParts.push(`Node: v${report.runtimes.node.version}`);
  if (report.runtimes.npm.available) rtParts.push(`npm: ${report.runtimes.npm.version}`);
  if (report.runtimes.uvx.available) rtParts.push(`uvx: ${report.runtimes.uvx.version}`);
  if (report.runtimes.python.available) rtParts.push(`Python: ${report.runtimes.python.version}`);
  lines.push(rtParts.join(' | '));
  lines.push('');
  lines.push('Client Results:');

  for (const r of report.results) {
    const status = r.status.toUpperCase();
    const pad = '.'.repeat(Math.max(1, 24 - r.client.length));
    let detail = '';
    if (r.status === 'pass') {
      detail = `config written, handshake OK${r.toolCount !== undefined ? `, ${r.toolCount} tools found` : ''}`;
      if (r.latencyMs) detail += ` (${r.latencyMs}ms)`;
    } else if (r.status === 'fail') {
      detail = r.error ?? 'unknown error';
    } else {
      detail = r.error ?? 'not detected';
    }
    lines.push(`  ${r.client} ${pad} ${status} (${detail})`);
  }

  if (report.hints.length > 0) {
    lines.push('');
    lines.push('Hints:');
    for (const hint of report.hints) {
      lines.push(`  - ${hint}`);
    }
  }

  return lines.join('\n');
}
