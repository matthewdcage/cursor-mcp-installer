import { useState, useCallback } from 'react';
import type { SystemData, HealthReport } from '../types';

const API_BASE = '/api';

export function useInstaller() {
  const [system, setSystem] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<HealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectSystem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/system`);
      const data = await res.json() as SystemData;
      setSystem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect system');
    } finally {
      setLoading(false);
    }
  }, []);

  const install = useCallback(async (opts: {
    package: string;
    method: string;
    clients: string[];
    env: Record<string, string>;
    args: string[];
  }) => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch(`${API_BASE}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      });
      const data = await res.json();
      if (data.report) setReport(data.report);
      if (data.error) setError(data.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Installation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { system, loading, report, error, detectSystem, install };
}
