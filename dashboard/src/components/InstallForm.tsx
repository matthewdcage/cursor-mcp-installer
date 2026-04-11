import { useState } from 'react';
import { Button } from './Button';

interface InstallFormProps {
  onInstall: (opts: { package: string; method: string; clients: string[]; env: Record<string, string>; args: string[] }) => void;
  selectedClients: string[];
  loading: boolean;
}

export function InstallForm({ onInstall, selectedClients, loading }: InstallFormProps) {
  const [packageName, setPackageName] = useState('');
  const [method, setMethod] = useState('auto');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName.trim()) return;
    onInstall({
      package: packageName.trim(),
      method,
      clients: selectedClients,
      env: {},
      args: [],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 mb-6">
      <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wider mb-4">
        Install
      </h2>

      <div className="flex gap-3">
        <input
          type="text"
          value={packageName}
          onChange={(e) => setPackageName(e.target.value)}
          placeholder="Package name, git URL, or local path..."
          className="form-input flex-1"
        />

        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="form-input w-28 appearance-none"
        >
          <option value="auto">Auto</option>
          <option value="npm">npm</option>
          <option value="uvx">uvx</option>
          <option value="git">git</option>
          <option value="local">local</option>
        </select>

        <Button type="submit" variant="primary" loading={loading}>
          Install
        </Button>
      </div>

      {selectedClients.length === 0 && (
        <p className="mt-3 text-sm text-accent-yellow font-mono">
          No clients selected. Toggle clients above.
        </p>
      )}
    </form>
  );
}
