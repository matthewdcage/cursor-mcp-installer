import { describe, it, expect } from 'vitest';
import { isNpmPackage, resolveNpmPackage, formatServerName } from '../src/install/npm.js';
import { resolveUvxPackage } from '../src/install/uvx.js';
import { isGitUrl } from '../src/install/git.js';

describe('npm Install', () => {
  it('isNpmPackage returns true for real package', async () => {
    const result = await isNpmPackage('@modelcontextprotocol/server-memory');
    expect(result).toBe(true);
  });

  it('isNpmPackage returns false for nonexistent package', async () => {
    const result = await isNpmPackage('definitely-not-a-real-package-xyzzy-12345');
    expect(result).toBe(false);
  });

  it('resolveNpmPackage returns valid entry', async () => {
    const entry = await resolveNpmPackage('@modelcontextprotocol/server-memory');
    expect(entry.command).toBe('npx');
    expect(entry.args).toContain('-y');
    expect(entry.args).toContain('@modelcontextprotocol/server-memory');
    expect(entry.type).toBe('stdio');
  });

  it('resolveNpmPackage throws for nonexistent package', async () => {
    await expect(resolveNpmPackage('definitely-not-a-real-package-xyzzy-12345'))
      .rejects.toThrow();
  });
});

describe('uvx Install', () => {
  it('resolveUvxPackage returns valid entry', () => {
    const entry = resolveUvxPackage('my-mcp-server');
    expect(entry.command).toBe('uvx');
    expect(entry.args).toContain('my-mcp-server');
    expect(entry.type).toBe('stdio');
  });

  it('passes extra args', () => {
    const entry = resolveUvxPackage('my-server', ['--port', '3000']);
    expect(entry.args).toEqual(['my-server', '--port', '3000']);
  });
});

describe('git Detection', () => {
  it('detects GitHub URLs', () => {
    expect(isGitUrl('https://github.com/user/repo')).toBe(true);
    expect(isGitUrl('https://github.com/user/repo.git')).toBe(true);
  });

  it('detects GitLab URLs', () => {
    expect(isGitUrl('https://gitlab.com/user/repo.git')).toBe(true);
  });

  it('rejects non-git URLs', () => {
    expect(isGitUrl('@modelcontextprotocol/server-memory')).toBe(false);
    expect(isGitUrl('my-local-package')).toBe(false);
  });
});

describe('formatServerName', () => {
  it('formats scoped packages', () => {
    expect(formatServerName('@modelcontextprotocol/server-memory')).toBe('Memory');
  });

  it('formats unscoped packages', () => {
    expect(formatServerName('mcp-server-github')).toBe('Github');
  });

  it('handles plain names', () => {
    expect(formatServerName('postgres')).toBe('Postgres');
  });
});
