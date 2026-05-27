import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createServer } from 'node:net';

const WINDOWS_CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

function getLhciCommand() {
  if (process.platform === 'win32') {
    return [
      'cmd.exe',
      ['/d', '/s', '/c', 'pnpm.cmd exec lhci autorun --config=./lighthouserc.cjs'],
    ];
  }

  return ['pnpm', ['exec', 'lhci', 'autorun', '--config=./lighthouserc.cjs']];
}

function getChromePath() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }

  return WINDOWS_CHROME_PATHS.find((chromePath) => existsSync(chromePath));
}

async function getFreePort() {
  const server = createServer();

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

  if (!port) {
    throw new Error('Unable to allocate a remote debugging port for Chrome');
  }

  return port;
}

async function waitForChrome(port) {
  const url = `http://127.0.0.1:${port}/json/version`;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {}

    await delay(100);
  }

  throw new Error(`Chrome remote debugging port ${port} did not become ready`);
}

function killWindowsProcessTree(pid) {
  if (!pid) return;

  spawnSync('taskkill.exe', ['/PID', String(pid), '/T', '/F'], {
    stdio: 'ignore',
    windowsHide: true,
  });
}

async function startWindowsChrome() {
  const chromePath = getChromePath();
  if (!chromePath) {
    throw new Error('Chrome executable was not found for LHCI remote debugging');
  }

  const port = await getFreePort();
  const profileDir = mkdtempSync(join(tmpdir(), 'lhci-remote-'));
  const chrome = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--no-sandbox',
      'about:blank',
    ],
    {
      stdio: 'ignore',
      windowsHide: true,
    },
  );

  chrome.on('error', (error) => {
    console.error(error);
  });

  await waitForChrome(port);

  return {
    port,
    close() {
      killWindowsProcessTree(chrome.pid);

      try {
        rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
      } catch {
        // Chrome may release the Windows profile directory slightly after process exit.
      }
    },
  };
}

function runLhci(env) {
  const command = getLhciCommand();
  const child = spawn(command[0], command[1], {
    env,
    stdio: 'inherit',
    shell: false,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.error(`lhci exited with signal ${signal}`);
      process.exit(1);
    }
    process.exit(code ?? 1);
  });

  child.on('error', (error) => {
    console.error(error);
    process.exit(1);
  });
}

if (process.platform === 'win32') {
  const chrome = await startWindowsChrome();

  process.on('exit', chrome.close);
  process.on('SIGINT', () => {
    chrome.close();
    process.exit(130);
  });
  process.on('SIGTERM', () => {
    chrome.close();
    process.exit(143);
  });

  runLhci({
    ...process.env,
    LHCI_REMOTE_DEBUGGING_PORT: String(chrome.port),
  });
} else {
  runLhci(process.env);
}
