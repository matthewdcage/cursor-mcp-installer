import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { CursorWriter } from '../src/clients/cursor.js';
import { ClaudeDesktopWriter } from '../src/clients/claude-desktop.js';
import { VSCodeWriter } from '../src/clients/vscode.js';
import { OpenClawWriter } from '../src/clients/openclaw.js';
import { ClaudeCodeWriter } from '../src/clients/claude-code.js';
import { ChatGPTBridgeWriter } from '../src/clients/chatgpt-bridge.js';

describe('Config Writers - Integration', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('CursorWriter detects installation status', () => {
    const writer = new CursorWriter();
    const detection = writer.detect();
    expect(detection).toHaveProperty('installed');
    expect(detection).toHaveProperty('configPath');
    expect(detection.configPath).toContain('.cursor');
  });

  it('ClaudeDesktopWriter uses correct path per platform', () => {
    const writer = new ClaudeDesktopWriter();
    const detection = writer.detect();
    if (process.platform === 'darwin') {
      expect(detection.configPath).toContain('Application Support/Claude');
    } else if (process.platform === 'win32') {
      expect(detection.configPath).toContain('Claude');
    }
  });

  it('VSCodeWriter uses servers key not mcpServers', () => {
    const writer = new VSCodeWriter();
    expect(writer.getConfigKey()).toBe('servers');
  });

  it('OpenClawWriter uses nested mcp.servers path', () => {
    const writer = new OpenClawWriter();
    expect(writer.getConfigKey()).toBe('mcp.servers');
  });

  it('ClaudeCodeWriter uses mcpServers key', () => {
    const writer = new ClaudeCodeWriter();
    expect(writer.getConfigKey()).toBe('mcpServers');
  });

  it('ChatGPTBridgeWriter always reports installed', () => {
    const writer = new ChatGPTBridgeWriter();
    const detection = writer.detect();
    expect(detection.installed).toBe(true);
    expect(detection.configPath).toContain('N/A');
  });
});

describe('Config I/O', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-io-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes and reads JSON config correctly', async () => {
    const { writeJsonFile, readJsonFile } = await import('../src/utils/config-io.js');
    const configPath = path.join(tmpDir, 'test.json');

    writeJsonFile(configPath, { mcpServers: { test: { command: 'node' } } });

    const result = readJsonFile(configPath);
    expect(result).toEqual({ mcpServers: { test: { command: 'node' } } });
  });

  it('creates backup before write', async () => {
    const { writeJsonFile, backupFile } = await import('../src/utils/config-io.js');
    const configPath = path.join(tmpDir, 'config.json');

    writeJsonFile(configPath, { original: true });
    const backup = backupFile(configPath);

    expect(backup).toBeTruthy();
    expect(fs.existsSync(backup!)).toBe(true);
    expect(backup!).toContain('.bak');
  });

  it('merges servers without clobbering existing keys', async () => {
    const { mergeServerIntoConfig } = await import('../src/utils/config-io.js');

    const existing = {
      mcpServers: { existing: { command: 'old' } },
      otherKey: 'preserved',
    };

    const result = mergeServerIntoConfig(existing, 'mcpServers', 'new-server', { command: 'new' });

    expect(result).toEqual({
      mcpServers: {
        existing: { command: 'old' },
        'new-server': { command: 'new' },
      },
      otherKey: 'preserved',
    });
  });
});
