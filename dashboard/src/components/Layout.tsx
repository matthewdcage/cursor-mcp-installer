import type { ReactNode } from 'react';
import { StatusDot } from './StatusDot';

interface LayoutProps {
  children: ReactNode;
  wsConnected: boolean;
}

export function Layout({ children, wsConnected }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <div className="grain-overlay" />

      <header className="sticky top-0 z-40 nav-blur border-b border-card-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-green/20 flex items-center justify-center">
              <span className="text-accent-green text-lg font-bold">⚡</span>
            </div>
            <h1 className="font-display text-lg font-semibold">Universal MCP Installer</h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-mono text-muted">
            <StatusDot status={wsConnected ? 'success' : 'idle'} />
            <span>{wsConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
