const isStdioMode = process.argv.includes('--stdio') || process.argv[1]?.endsWith('index.js');

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

let currentLevel: LogLevel = 'info';
const levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error'];

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

function shouldLog(level: LogLevel): boolean {
  return levelOrder.indexOf(level) >= levelOrder.indexOf(currentLevel);
}

function formatMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (context && Object.keys(context).length > 0) {
    return `${base} ${JSON.stringify(context)}`;
  }
  return base;
}

export const log = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      process.stderr.write(formatMessage('debug', message, context) + '\n');
    }
  },
  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      process.stderr.write(formatMessage('info', message, context) + '\n');
    }
  },
  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      process.stderr.write(formatMessage('warn', message, context) + '\n');
    }
  },
  error(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      process.stderr.write(formatMessage('error', message, context) + '\n');
    }
  },
};

export function cliPrint(message: string): void {
  if (!isStdioMode) {
    process.stdout.write(message + '\n');
  }
}
