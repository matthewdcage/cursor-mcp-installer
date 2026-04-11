import { describe, it, expect } from 'vitest';
import {
  wrapCommandForWindows,
  isSnapApp,
  isFlatpakApp,
  generateLaunchdPlist,
  generateSystemdUnit,
  generateWindowsTaskXml,
} from '../src/utils/platform.js';

describe('Windows Command Wrapping', () => {
  it('wraps npx with cmd /c on windows-like call', () => {
    const original = process.platform;
    if (original === 'win32') {
      const result = wrapCommandForWindows('npx', ['-y', 'server-memory']);
      expect(result.command).toBe('cmd');
      expect(result.args[0]).toBe('/c');
      expect(result.args[1]).toBe('npx');
    } else {
      const result = wrapCommandForWindows('npx', ['-y', 'server-memory']);
      expect(result.command).toBe('npx');
      expect(result.args).toEqual(['-y', 'server-memory']);
    }
  });
});

describe('Snap/Flatpak Detection', () => {
  it('detects Snap paths', () => {
    expect(isSnapApp('/snap/code/current/bin/code')).toBe(true);
    expect(isSnapApp('/usr/bin/code')).toBe(false);
  });

  it('detects Flatpak paths', () => {
    expect(isFlatpakApp('/home/user/.var/app/com.visualstudio.code/config')).toBe(true);
    expect(isFlatpakApp('/flatpak/app/code')).toBe(true);
    expect(isFlatpakApp('/usr/bin/code')).toBe(false);
  });
});

describe('Service Templates', () => {
  it('generates valid launchd plist', () => {
    const plist = generateLaunchdPlist('com.mcp.bridge', 'node', ['bridge.js', '--port', '3847']);
    expect(plist).toContain('<?xml version="1.0"');
    expect(plist).toContain('com.mcp.bridge');
    expect(plist).toContain('node');
    expect(plist).toContain('bridge.js');
    expect(plist).toContain('RunAtLoad');
  });

  it('generates launchd plist with env vars', () => {
    const plist = generateLaunchdPlist('com.mcp.bridge', 'node', ['bridge.js'], { API_KEY: 'test123' });
    expect(plist).toContain('API_KEY');
    expect(plist).toContain('test123');
  });

  it('generates valid systemd unit', () => {
    const unit = generateSystemdUnit('mcp-bridge', 'node', ['bridge.js', '--port', '3847']);
    expect(unit).toContain('[Unit]');
    expect(unit).toContain('[Service]');
    expect(unit).toContain('[Install]');
    expect(unit).toContain('mcp-bridge');
    expect(unit).toContain('node bridge.js --port 3847');
  });

  it('generates systemd unit with env vars', () => {
    const unit = generateSystemdUnit('mcp-bridge', 'node', ['bridge.js'], { API_KEY: 'test' });
    expect(unit).toContain('Environment="API_KEY=test"');
  });

  it('generates valid Windows Task Scheduler XML', () => {
    const xml = generateWindowsTaskXml('MCP-Bridge', 'node.exe', ['bridge.js', '--port', '3847']);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('MCP-Bridge');
    expect(xml).toContain('node.exe');
    expect(xml).toContain('LogonTrigger');
  });

  it('escapes XML special characters', () => {
    const plist = generateLaunchdPlist('com.test', 'node', ['--flag="value&more"']);
    expect(plist).toContain('&amp;');
    expect(plist).toContain('&quot;');
  });
});
