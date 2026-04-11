import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { log } from './logging.js';

export function getAppDataPath(): string {
  if (process.platform === 'win32') {
    return process.env.APPDATA ?? path.join(os.homedir(), 'AppData', 'Roaming');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support');
  }
  return process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config');
}

export function wrapCommandForWindows(command: string, args: string[]): { command: string; args: string[] } {
  if (process.platform !== 'win32') {
    return { command, args };
  }

  if (['npx', 'npm', 'node', 'python', 'python3', 'uvx', 'git'].includes(command)) {
    return {
      command: 'cmd',
      args: ['/c', command, ...args],
    };
  }

  return { command, args };
}

export function isSnapApp(appPath: string): boolean {
  return appPath.includes('/snap/') || appPath.includes('\\snap\\');
}

export function isFlatpakApp(appPath: string): boolean {
  return appPath.includes('.var/app/') || appPath.includes('/flatpak/');
}

export function getLinuxXDGConfigPath(appName: string): string {
  const xdgConfig = process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), '.config');
  return path.join(xdgConfig, appName);
}

export function generateLaunchdPlist(serviceName: string, command: string, args: string[], env?: Record<string, string>): string {
  const envEntries = env
    ? Object.entries(env).map(([k, v]) =>
        `        <key>${escapeXml(k)}</key>\n        <string>${escapeXml(v)}</string>`
      ).join('\n')
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${escapeXml(serviceName)}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${escapeXml(command)}</string>
${args.map(a => `        <string>${escapeXml(a)}</string>`).join('\n')}
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>${envEntries ? `\n    <key>EnvironmentVariables</key>\n    <dict>\n${envEntries}\n    </dict>` : ''}
    <key>StandardOutPath</key>
    <string>${path.join(os.homedir(), 'Library', 'Logs', `${serviceName}.stdout.log`)}</string>
    <key>StandardErrorPath</key>
    <string>${path.join(os.homedir(), 'Library', 'Logs', `${serviceName}.stderr.log`)}</string>
</dict>
</plist>`;
}

export function generateSystemdUnit(serviceName: string, command: string, args: string[], env?: Record<string, string>): string {
  const envLines = env
    ? Object.entries(env).map(([k, v]) => `Environment="${k}=${v}"`).join('\n')
    : '';

  return `[Unit]
Description=${serviceName} MCP HTTP Bridge
After=network.target

[Service]
Type=simple
ExecStart=${command} ${args.join(' ')}
Restart=on-failure
RestartSec=5
${envLines}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
`;
}

export function generateWindowsTaskXml(serviceName: string, command: string, args: string[]): string {
  return `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Description>${serviceName} MCP HTTP Bridge</Description>
  </RegistrationInfo>
  <Triggers>
    <LogonTrigger>
      <Enabled>true</Enabled>
    </LogonTrigger>
  </Triggers>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
  </Settings>
  <Actions>
    <Exec>
      <Command>${escapeXml(command)}</Command>
      <Arguments>${escapeXml(args.join(' '))}</Arguments>
    </Exec>
  </Actions>
</Task>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function detectVSCodeVariant(): { variant: string; configBase: string } | null {
  if (process.platform !== 'linux') return null;

  const snapPath = '/snap/code/current';
  if (fs.existsSync(snapPath)) {
    return { variant: 'snap', configBase: path.join(os.homedir(), 'snap', 'code', 'current', '.config', 'Code') };
  }

  const flatpakPath = path.join(os.homedir(), '.var', 'app', 'com.visualstudio.code');
  if (fs.existsSync(flatpakPath)) {
    return { variant: 'flatpak', configBase: path.join(flatpakPath, 'config', 'Code') };
  }

  return null;
}
