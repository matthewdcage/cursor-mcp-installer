import { motion } from 'framer-motion';
import { StatusDot } from './StatusDot';
import { Button } from './Button';
import type { HealthReport as HealthReportType } from '../types';

export function HealthReport({ report }: { report: HealthReportType }) {
  const copyToClipboard = () => {
    const lines = report.results.map(r =>
      `${r.client}: ${r.status.toUpperCase()}${r.toolCount ? ` (${r.toolCount} tools)` : ''}${r.error ? ` - ${r.error}` : ''}`
    );
    navigator.clipboard.writeText(
      `MCP Install Report: ${report.serverName}\n${lines.join('\n')}\n\nHints:\n${report.hints.map(h => `- ${h}`).join('\n')}`
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wider">
          Results — {report.serverName}
        </h2>
        <Button variant="ghost" onClick={copyToClipboard}>
          Copy Report
        </Button>
      </div>

      <div className="space-y-2">
        {report.results.map((r) => (
          <div
            key={r.client}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-card/50"
          >
            <div className="flex items-center gap-3">
              <StatusDot
                status={r.status === 'pass' ? 'success' : r.status === 'fail' ? 'error' : 'idle'}
              />
              <span className="font-sans">{r.client}</span>
            </div>

            <div className="flex items-center gap-4">
              {r.toolCount !== undefined && (
                <span className="font-mono text-xs text-muted">{r.toolCount} tools</span>
              )}
              {r.latencyMs !== undefined && (
                <span className="font-mono text-xs text-subtle">{r.latencyMs}ms</span>
              )}
              <span className={`font-mono text-xs px-2 py-0.5 rounded ${
                r.status === 'pass' ? 'bg-accent-green/10 text-accent-green' :
                r.status === 'fail' ? 'bg-accent-red/10 text-accent-red' :
                'bg-card text-subtle'
              }`}>
                {r.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {report.hints.length > 0 && (
        <div className="mt-4 pt-4 border-t border-card-border">
          <p className="font-mono text-xs text-muted mb-2">Hints</p>
          {report.hints.map((hint, i) => (
            <p key={i} className="font-mono text-xs text-subtle mb-1">• {hint}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
