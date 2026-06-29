const remoteDebuggingPort = process.env.LHCI_REMOTE_DEBUGGING_PORT
  ? Number(process.env.LHCI_REMOTE_DEBUGGING_PORT)
  : undefined;

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'corepack pnpm exec next start --port 3102',
      startServerReadyPattern: 'Local:',
      url: ['http://localhost:3102/'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--headless=new --no-sandbox',
        ...(remoteDebuggingPort ? { port: remoteDebuggingPort } : {}),
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
