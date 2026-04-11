import * as http from 'node:http';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { log, cliPrint } from '../utils/logging.js';
import { handleApiRequest } from './routes.js';
import { WebSocketManager } from './websocket.js';

export async function startApiServer(port: number = 3939): Promise<void> {
  const wsManager = new WebSocketManager();

  const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.url?.startsWith('/api/')) {
      await handleApiRequest(req, res, wsManager);
      return;
    }

    const currentDir = new URL('.', import.meta.url).pathname;
    const dashboardDir = path.resolve(currentDir, '..', '..', 'dashboard', 'dist');
    if (fs.existsSync(dashboardDir)) {
      serveDashboard(req, res, dashboardDir);
    } else {
      serveFallbackPage(req, res, port);
    }
  });

  server.on('upgrade', (req, socket, head) => {
    wsManager.handleUpgrade(req, socket, head);
  });

  server.listen(port, () => {
    cliPrint(`Dashboard: http://localhost:${port}`);
    cliPrint(`API:       http://localhost:${port}/api/system`);
    cliPrint('Press Ctrl+C to stop.\n');

    tryOpenBrowser(`http://localhost:${port}`);
  });
}

function serveDashboard(req: http.IncomingMessage, res: http.ServerResponse, dashboardDir: string): void {
  let filePath = path.join(dashboardDir, req.url === '/' ? 'index.html' : req.url!);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(dashboardDir, 'index.html');
  }

  const ext = path.extname(filePath);
  const mimeTypes: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
  };

  res.setHeader('Content-Type', mimeTypes[ext] ?? 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

function serveFallbackPage(req: http.IncomingMessage, res: http.ServerResponse, port: number): void {
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Universal MCP Installer</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Figtree:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-primary: #000000;
      --text-primary: #ffffff;
      --text-muted: rgba(255, 255, 255, 0.5);
      --accent-green: #00ff77;
      --border-color: rgba(255, 255, 255, 0.1);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: 'DM Sans', system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 600px;
      padding: 48px;
      text-align: center;
    }
    h1 {
      font-family: 'Figtree', system-ui, sans-serif;
      font-size: 32px;
      font-weight: 500;
      margin-bottom: 16px;
    }
    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--accent-green);
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 2s ease-in-out infinite;
    }
    p {
      color: var(--text-muted);
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    code {
      font-family: 'DM Mono', monospace;
      background: rgba(255, 255, 255, 0.05);
      padding: 2px 8px;
      border-radius: 4px;
      color: var(--accent-green);
      font-size: 14px;
    }
    .api-links a {
      display: block;
      color: var(--accent-green);
      font-family: 'DM Mono', monospace;
      font-size: 14px;
      margin: 8px 0;
      text-decoration: none;
    }
    .api-links a:hover { text-decoration: underline; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  </style>
</head>
<body>
  <div class="container">
    <h1><span class="dot"></span> Universal MCP Installer</h1>
    <p>Dashboard UI is being built. In the meantime, the API is running and available:</p>
    <div class="api-links">
      <a href="/api/system">/api/system</a>
      <a href="/api/clients">/api/clients</a>
    </div>
    <p style="margin-top: 32px;">Use the CLI for full functionality:</p>
    <p><code>npx universal-mcp-installer install &lt;package&gt;</code></p>
  </div>
</body>
</html>`);
}

function tryOpenBrowser(url: string): void {
  import('node:child_process').then(({ exec }) => {
    const cmd = process.platform === 'darwin' ? 'open' :
      process.platform === 'win32' ? 'start' : 'xdg-open';
    exec(`${cmd} ${url}`, () => { /* ignore errors */ });
  }).catch(() => { /* ignore */ });
}
