import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import eslintConfigPrettier from 'eslint-config-prettier';

// eslint-config-next v16 ships ready-made flat configs (core-web-vitals already
// bundles the TypeScript config). Importing them directly avoids the legacy
// FlatCompat().extends('next/...') path, which crashed here with
// "Converting circular structure to JSON" via @eslint/eslintrc's validator.

// Reuse the @typescript-eslint plugin instance the next config already registers,
// so our rule override resolves without adding the (transitive) plugin as a direct
// dependency. Guarded: if the shape ever changes, we skip the override rather than throw.
const tsPlugin = nextCoreWebVitals.find((c) => c.plugins?.['@typescript-eslint'])?.plugins[
  '@typescript-eslint'
];

const config = [
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  ...(tsPlugin
    ? [
        {
          files: ['**/*.ts', '**/*.tsx'],
          plugins: { '@typescript-eslint': tsPlugin },
          rules: {
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
          },
        },
      ]
    : []),
  {
    // Read-only reference folders + generated output are not our code to lint.
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'Osiris_ref/**',
      'Blueprints_lib/**',
      '.claude/**',
    ],
  },
];

export default config;
