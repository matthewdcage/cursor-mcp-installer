import { describe, it, expect } from 'vitest';
import { detectOs } from '../src/detect/os.js';
import { detectRuntimes } from '../src/detect/runtimes.js';
import { detectClients } from '../src/detect/clients.js';

describe('OS Detection', () => {
  it('returns valid platform', () => {
    const os = detectOs();
    expect(['darwin', 'win32', 'linux']).toContain(os.platform);
    expect(os.arch).toBeTruthy();
    expect(os.homedir).toBeTruthy();
    expect(os.displayName).toBeTruthy();
    expect(typeof os.isAppleSilicon).toBe('boolean');
  });

  it('detects Apple Silicon on darwin arm64', () => {
    const os = detectOs();
    if (process.platform === 'darwin' && process.arch === 'arm64') {
      expect(os.isAppleSilicon).toBe(true);
      expect(os.displayName).toContain('Apple Silicon');
    }
  });

  it('includes release version', () => {
    const os = detectOs();
    expect(os.release).toBeTruthy();
    expect(os.release.length).toBeGreaterThan(0);
  });
});

describe('Runtime Detection', () => {
  it('detects node (we are running in node)', async () => {
    const runtimes = await detectRuntimes();
    expect(runtimes.node.available).toBe(true);
    expect(runtimes.node.version).toBeTruthy();
  });

  it('detects npm', async () => {
    const runtimes = await detectRuntimes();
    expect(runtimes.npm.available).toBe(true);
    expect(runtimes.npm.version).toBeTruthy();
  });

  it('detects npx', async () => {
    const runtimes = await detectRuntimes();
    expect(runtimes.npx.available).toBe(true);
  });

  it('returns structured info for all runtimes', async () => {
    const runtimes = await detectRuntimes();
    for (const [name, info] of Object.entries(runtimes)) {
      expect(info.name).toBe(name);
      expect(typeof info.available).toBe('boolean');
      if (info.available) {
        expect(info.version).toBeTruthy();
      } else {
        expect(info.version).toBeNull();
      }
    }
  });
});

describe('Client Detection', () => {
  it('returns array of client detections', () => {
    const clients = detectClients();
    expect(Array.isArray(clients)).toBe(true);
    expect(clients.length).toBeGreaterThanOrEqual(6);
  });

  it('each client has required fields', () => {
    const clients = detectClients();
    for (const client of clients) {
      expect(client.name).toBeTruthy();
      expect(client.id).toBeTruthy();
      expect(typeof client.installed).toBe('boolean');
      expect(typeof client.configPath).toBe('string');
      expect(typeof client.configExists).toBe('boolean');
      expect(Array.isArray(client.existingServers)).toBe(true);
      expect(client.icon).toBeTruthy();
    }
  });

  it('includes expected client IDs', () => {
    const clients = detectClients();
    const ids = clients.map(c => c.id);
    expect(ids).toContain('cursor');
    expect(ids).toContain('claude-desktop');
    expect(ids).toContain('vscode');
    expect(ids).toContain('openclaw');
    expect(ids).toContain('claude-code');
    expect(ids).toContain('chatgpt');
  });
});
