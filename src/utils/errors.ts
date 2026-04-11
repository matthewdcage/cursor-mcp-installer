export interface RecoveryHint {
  message: string;
  action?: string;
  url?: string;
  autoFixAvailable?: boolean;
}

export class InstallerError extends Error {
  public readonly code: string;
  public readonly hint: RecoveryHint;

  constructor(message: string, code: string, hint: RecoveryHint) {
    super(message);
    this.name = 'InstallerError';
    this.code = code;
    this.hint = hint;
  }
}

const knownIssues: Record<string, (detail?: string) => RecoveryHint> = {
  EACCES: () => ({
    message: 'Permission denied when writing config file.',
    action: 'Check file permissions or run with appropriate privileges.',
    autoFixAvailable: false,
  }),
  NODE_NOT_FOUND: () => ({
    message: 'Node.js is not installed or not on PATH.',
    action: 'Install Node.js from https://nodejs.org/',
    url: 'https://nodejs.org/',
    autoFixAvailable: false,
  }),
  NPM_NOT_FOUND: () => ({
    message: 'npm is not available.',
    action: 'npm ships with Node.js. Reinstall Node.js if missing.',
    url: 'https://nodejs.org/',
    autoFixAvailable: false,
  }),
  UVX_NOT_FOUND: () => ({
    message: 'uv/uvx is not installed.',
    action: 'Install uv: curl -LsSf https://astral.sh/uv/install.sh | sh',
    url: 'https://docs.astral.sh/uv/',
    autoFixAvailable: false,
  }),
  GIT_NOT_FOUND: () => ({
    message: 'git is not installed.',
    action: 'Install git from https://git-scm.com/',
    url: 'https://git-scm.com/',
    autoFixAvailable: false,
  }),
  PYTHON_NOT_FOUND: () => ({
    message: 'Python is not installed or not on PATH.',
    action: 'Install Python from https://python.org/',
    url: 'https://python.org/',
    autoFixAvailable: false,
  }),
  NPM_VIEW_FAILED: (detail) => ({
    message: `Failed to look up package: ${detail ?? 'unknown'}`,
    action: 'Check network connection, proxy settings, and npm registry config.',
    autoFixAvailable: false,
  }),
  GIT_CLONE_FAILED: (detail) => ({
    message: `Failed to clone repository: ${detail ?? 'unknown'}`,
    action: 'Check SSH keys or try HTTPS URL. Verify the repository exists and is accessible.',
    autoFixAvailable: false,
  }),
  CONFIG_PARSE_ERROR: (detail) => ({
    message: `Config file has invalid JSON: ${detail ?? 'unknown'}`,
    action: 'Fix the JSON syntax error or let the installer create a fresh config.',
    autoFixAvailable: true,
  }),
  CONFIG_DIR_MISSING: (detail) => ({
    message: `Config directory does not exist: ${detail ?? 'unknown'}`,
    action: 'The installer can create the directory automatically.',
    autoFixAvailable: true,
  }),
  HANDSHAKE_TIMEOUT: () => ({
    message: 'MCP server did not respond to initialize request within 10 seconds.',
    action: 'Test the server manually with: npx @modelcontextprotocol/inspector',
    autoFixAvailable: false,
  }),
  HANDSHAKE_FAILED: (detail) => ({
    message: `MCP handshake failed: ${detail ?? 'unknown'}`,
    action: 'Check server logs and verify it implements the MCP protocol correctly.',
    autoFixAvailable: false,
  }),
  PACKAGE_NOT_FOUND: (detail) => ({
    message: `Package not found: ${detail ?? 'unknown'}`,
    action: 'Verify the package name exists in npm registry or try a full git URL.',
    autoFixAvailable: false,
  }),
  PATH_NOT_FOUND: (detail) => ({
    message: `Path does not exist: ${detail ?? 'unknown'}`,
    action: 'Check the path is correct and accessible.',
    autoFixAvailable: false,
  }),
  WINDOWS_NPX_WRAPPER: () => ({
    message: 'On Windows, some clients need "cmd /c npx" instead of bare "npx".',
    action: 'The installer handles this automatically for Claude Desktop on Windows.',
    autoFixAvailable: true,
  }),
};

export function getHint(code: string, detail?: string): RecoveryHint {
  const factory = knownIssues[code];
  if (factory) return factory(detail);
  return {
    message: `Unknown error: ${code}`,
    action: 'Check logs for more details.',
  };
}

export function createError(code: string, detail?: string): InstallerError {
  const hint = getHint(code, detail);
  return new InstallerError(hint.message, code, hint);
}
