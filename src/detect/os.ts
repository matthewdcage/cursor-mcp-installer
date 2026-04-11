import * as os from 'node:os';

export interface OsInfo {
  platform: 'darwin' | 'win32' | 'linux';
  arch: string;
  isAppleSilicon: boolean;
  release: string;
  homedir: string;
  hostname: string;
  displayName: string;
}

export function detectOs(): OsInfo {
  const platform = process.platform as OsInfo['platform'];
  const arch = process.arch;
  const release = os.release();
  const homedir = os.homedir();
  const hostname = os.hostname();
  const isAppleSilicon = platform === 'darwin' && arch === 'arm64';

  let displayName: string;
  switch (platform) {
    case 'darwin':
      displayName = `macOS ${release}${isAppleSilicon ? ' (Apple Silicon)' : ' (Intel)'}`;
      break;
    case 'win32':
      displayName = `Windows (${arch})`;
      break;
    case 'linux':
      displayName = `Linux ${release} (${arch})`;
      break;
    default:
      displayName = `${platform} ${release} (${arch})`;
  }

  return { platform, arch, isAppleSilicon, release, homedir, hostname, displayName };
}
