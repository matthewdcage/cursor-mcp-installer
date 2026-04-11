export interface McpServerEntry {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  type?: string;
  url?: string;
  transport?: string;
}

export interface WriteResult {
  success: boolean;
  configPath: string;
  backupPath: string | null;
  serverName: string;
  error?: string;
}

export interface ValidationResult {
  client: string;
  status: 'pass' | 'fail' | 'skip';
  toolCount?: number;
  latencyMs?: number;
  error?: string;
  hint?: string;
}

export interface ClientWriter {
  readonly name: string;
  readonly id: string;
  detect(): { installed: boolean; configPath: string; existing: Record<string, unknown> | null };
  write(serverName: string, config: McpServerEntry): WriteResult;
  getConfigKey(): string;
}
