export interface RuntimeInfo {
  name: string;
  available: boolean;
  version: string | null;
  path: string | null;
}

export interface OsInfo {
  platform: string;
  arch: string;
  isAppleSilicon: boolean;
  release: string;
  homedir: string;
  displayName: string;
}

export interface RuntimesReport {
  node: RuntimeInfo;
  npm: RuntimeInfo;
  npx: RuntimeInfo;
  uvx: RuntimeInfo;
  python: RuntimeInfo;
  git: RuntimeInfo;
}

export interface ClientDetection {
  name: string;
  id: string;
  installed: boolean;
  configPath: string;
  configExists: boolean;
  existingServers: string[];
  icon: string;
}

export interface SystemData {
  os: OsInfo;
  runtimes: RuntimesReport;
  clients: ClientDetection[];
}

export interface ValidationResult {
  client: string;
  status: 'pass' | 'fail' | 'skip';
  toolCount?: number;
  latencyMs?: number;
  error?: string;
  hint?: string;
}

export interface HealthReport {
  serverName: string;
  timestamp: string;
  os: OsInfo;
  runtimes: RuntimesReport;
  results: ValidationResult[];
  hints: string[];
}

export interface InstallStep {
  step: string;
  status: 'running' | 'done' | 'error';
  detail?: string;
}

export type WsMessage =
  | { type: 'system_detected'; data: SystemData }
  | { type: 'clients_detected'; data: ClientDetection[] }
  | { type: 'install_step'; data: InstallStep }
  | { type: 'validation_result'; data: ValidationResult }
  | { type: 'report_complete'; data: HealthReport };
