import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import eslintConfigPrettier from 'eslint-config-prettier';

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  eslintConfigPrettier,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'Use server/state patterns; PL_RU forbids localStorage in src/.',
        },
        {
          name: 'sessionStorage',
          message: 'Use server/state patterns; PL_RU forbids sessionStorage in src/.',
        },
      ],
    },
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      '.claude/worktrees/**',
      'Blueprints_lib/**',
      'Osiris_ref/**',
      'plugins/pl-ru-codex/skills/blueprint-design/**',
      'plugins/pl-ru-codex/skills/osiris-design/**',
    ],
  },
];

export default config;
