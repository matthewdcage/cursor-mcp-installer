import { motion } from 'framer-motion';

export function ErrorPanel({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-4 mb-6 border-accent-red/30"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <span className="text-accent-red text-lg">⚠</span>
          <div>
            <p className="font-sans font-medium text-sm">Error</p>
            <p className="font-mono text-xs text-muted mt-1 whitespace-pre-wrap">{error}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-subtle hover:text-foreground text-lg leading-none"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}
