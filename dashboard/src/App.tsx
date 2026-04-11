import { useEffect, useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { SystemInfo } from './components/SystemInfo';
import { ClientCard } from './components/ClientCard';
import { InstallForm } from './components/InstallForm';
import { StatusTimeline } from './components/StatusTimeline';
import { HealthReport } from './components/HealthReport';
import { ErrorPanel } from './components/ErrorPanel';
import { useWebSocket } from './hooks/useWebSocket';
import { useInstaller } from './hooks/useInstaller';
import type { InstallStep, HealthReport as HealthReportType } from './types';

export default function App() {
  const wsUrl = `ws://${window.location.hostname}:${window.location.port || 3939}/ws`;
  const { connected, messages } = useWebSocket(wsUrl);
  const { system, loading, report, error, detectSystem, install } = useInstaller();
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());

  useEffect(() => {
    detectSystem();
  }, [detectSystem]);

  useEffect(() => {
    if (system?.clients) {
      setSelectedClients(
        new Set(system.clients.filter(c => c.installed).map(c => c.id))
      );
    }
  }, [system]);

  const steps = useMemo(() => {
    const s: InstallStep[] = [];
    for (const msg of messages) {
      if (msg.type === 'install_step') s.push(msg.data);
    }
    return s;
  }, [messages]);

  const wsReport = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === 'report_complete') {
        return (messages[i] as { type: 'report_complete'; data: HealthReportType }).data;
      }
    }
    return null;
  }, [messages]);

  const finalReport = report ?? wsReport;

  const toggleClient = (id: string) => {
    setSelectedClients(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Layout wsConnected={connected}>
      <AnimatePresence>
        {error && <ErrorPanel error={error} onDismiss={() => {}} />}
      </AnimatePresence>

      {system && <SystemInfo data={system} />}

      {system && (
        <div className="mb-6">
          <h2 className="font-display text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            AI Clients
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {system.clients.map(client => (
              <ClientCard
                key={client.id}
                client={client}
                selected={selectedClients.has(client.id)}
                onToggle={() => toggleClient(client.id)}
              />
            ))}
          </div>
        </div>
      )}

      <InstallForm
        onInstall={install}
        selectedClients={Array.from(selectedClients)}
        loading={loading}
      />

      <StatusTimeline steps={steps} />

      {finalReport && <HealthReport report={finalReport} />}
    </Layout>
  );
}
