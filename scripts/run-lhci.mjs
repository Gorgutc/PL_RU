import { spawn } from 'node:child_process';

const command =
  process.platform === 'win32'
    ? ['cmd.exe', ['/d', '/s', '/c', 'pnpm.cmd exec lhci autorun --config=./lighthouserc.cjs']]
    : ['pnpm', ['exec', 'lhci', 'autorun', '--config=./lighthouserc.cjs']];

const child = spawn(command[0], command[1], {
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
