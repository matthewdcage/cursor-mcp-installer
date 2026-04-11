import { motion } from 'framer-motion';
import { StatusDot } from './StatusDot';
import type { InstallStep } from '../types';

export function StatusTimeline({ steps }: { steps: InstallStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="glass-card p-6 mb-6">
      <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wider mb-4">
        Progress
      </h2>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={`${step.step}-${i}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <StatusDot
              status={step.status === 'done' ? 'success' : step.status === 'error' ? 'error' : 'pending'}
            />
            <span className={`font-mono text-sm ${step.status === 'running' ? 'text-accent-green' : 'text-muted'}`}>
              {step.step}
            </span>
            {step.detail && (
              <span className="font-mono text-xs text-subtle ml-auto">{step.detail}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
