import { motion } from 'framer-motion';
import type { SystemData } from '../types';

export function SystemInfo({ data }: { data: SystemData }) {
  const runtimeEntries = Object.entries(data.runtimes) as [string, { available: boolean; version: string | null }][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 mb-6"
    >
      <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wider mb-4">
        System
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="font-mono text-sm text-muted">OS</p>
          <p className="text-lg">{data.os.displayName}</p>
        </div>
        <div>
          <p className="font-mono text-sm text-muted">Runtimes</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {runtimeEntries.map(([name, info]) => (
              <span
                key={name}
                className={`font-mono text-xs px-2 py-1 rounded ${
                  info.available
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'bg-card text-subtle'
                }`}
              >
                {name} {info.available ? `v${info.version}` : '✗'}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
