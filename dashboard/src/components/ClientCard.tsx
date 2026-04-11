import { motion } from 'framer-motion';
import { StatusDot } from './StatusDot';
import type { ClientDetection } from '../types';

interface ClientCardProps {
  client: ClientDetection;
  selected: boolean;
  onToggle: () => void;
}

const iconMap: Record<string, string> = {
  claude: '🟤',
  cursor: '🔷',
  vscode: '💜',
  openclaw: '🦅',
  'claude-code': '⬛',
  chatgpt: '🟢',
};

export function ClientCard({ client, selected, onToggle }: ClientCardProps) {
  const status = client.installed
    ? client.configExists ? 'success' : 'warning'
    : 'idle';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-4 cursor-pointer transition-all ${
        selected ? 'ring-1 ring-accent-green/50' : ''
      } ${!client.installed ? 'opacity-50' : ''}`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{iconMap[client.icon] ?? '🔌'}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-medium">{client.name}</span>
              <StatusDot status={status} />
            </div>
            <p className="font-mono text-xs text-subtle mt-0.5 truncate max-w-[200px]">
              {client.configPath}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggle}
            disabled={!client.installed}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-card-border rounded-full peer peer-checked:bg-accent-green/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-foreground after:rounded-full after:h-4 after:w-4 after:transition-all" />
        </label>
      </div>

      {client.existingServers.length > 0 && (
        <div className="mt-3 pt-3 border-t border-card-border">
          <p className="font-mono text-xs text-muted">
            {client.existingServers.length} server{client.existingServers.length !== 1 ? 's' : ''} configured
          </p>
        </div>
      )}
    </motion.div>
  );
}
