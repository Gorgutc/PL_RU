import { execFileSync, spawn } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const nextBin = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');

export async function waitForUrl(url, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // Server is not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not start at ${url} within ${timeoutMs}ms`);
}

export async function withNextDevServer({ port = 3101 } = {}, fn) {
  const server = spawn(process.execPath, [nextBin, 'dev', '--port', String(port)], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT: String(port) },
    detached: process.platform !== 'win32',
  });

  const baseUrl = `http://localhost:${port}`;
  let stderr = '';
  server.stderr?.on('data', (chunk) => {
    stderr += String(chunk);
  });

  try {
    await new Promise((resolve, reject) => {
      server.once('spawn', resolve);
      server.once('error', reject);
    });
    await waitForUrl(baseUrl);
    return await fn(baseUrl);
  } catch (error) {
    if (stderr.trim()) {
      console.error(stderr.trim());
    }
    throw error;
  } finally {
    if (server.pid) {
      try {
        if (process.platform === 'win32') {
          execFileSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
        } else {
          process.kill(-server.pid, 'SIGTERM');
        }
      } catch {
        // The process already exited.
      }
    }
  }
}
