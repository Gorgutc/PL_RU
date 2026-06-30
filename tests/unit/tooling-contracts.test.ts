import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// cspell:ignore lhci

function read(path: string) {
  return readFileSync(path, 'utf8');
}

const verifierPath = path.resolve('scripts/verify-reference.js');
const referencePaths = [
  'Blueprints_lib',
  'Osiris_ref',
  path.join('plugins', 'pl-ru-codex', 'skills', 'blueprint-design'),
  path.join('plugins', 'pl-ru-codex', 'skills', 'osiris-design'),
];

function git(cwd: string, args: string[]) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

function createReferenceRepo() {
  const cwd = mkdtempSync(path.join(tmpdir(), 'pl-ru-reference-guard-'));

  git(cwd, ['init', '-q']);
  git(cwd, ['config', 'user.email', 'codex@example.invalid']);
  git(cwd, ['config', 'user.name', 'Codex Test']);

  for (const ref of referencePaths) {
    const dir = path.join(cwd, ref);
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, 'README.md'), `${ref}\n`, 'utf8');
  }

  git(cwd, ['add', '.']);
  git(cwd, ['commit', '-q', '-m', 'baseline']);
  git(cwd, ['update-ref', 'refs/remotes/origin/main', 'HEAD']);

  return cwd;
}

function runVerifier(cwd: string) {
  try {
    return execFileSync(process.execPath, [verifierPath], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, REFERENCE_BASE_REF: 'origin/main' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string; status?: number };
    return `${failure.stdout ?? ''}${failure.stderr ?? ''}`;
  }
}

describe('quality tooling contracts', () => {
  it('uses package-manager-pinned corepack pnpm for nested quality commands', () => {
    const pkg = JSON.parse(read('package.json')) as {
      packageManager?: string;
      scripts?: Record<string, string>;
    };
    const scripts = pkg.scripts ?? {};

    expect(pkg.packageManager).toBe('pnpm@9.15.0');
    for (const scriptName of ['quality:fast', 'quality:deep', 'quality:all', 'codex:ship']) {
      expect(scripts[scriptName]).toContain('corepack pnpm');
      expect(scripts[scriptName]).not.toMatch(/(^|&& )pnpm /);
    }
    expect(scripts['quality:deep']).toContain('check:audit');
    expect(scripts['quality:all']).not.toContain('check:audit');

    expect(read('playwright.shared.config.ts')).toContain("command: 'corepack pnpm dev'");
    expect(read('scripts/check-visual-evidence.mjs')).toContain("command: 'corepack'");
    expect(read('scripts/run-lhci.mjs')).toContain('corepack pnpm exec lhci');
    expect(read('lighthouserc.cjs')).toContain('corepack pnpm exec next start');
  });

  it('uses package-manager-pinned corepack pnpm in Codex runbook commands', () => {
    const codexConfig = read('.codex/config.toml');
    const codexPromptHook = read('.codex/hooks/user-prompt-submit.md');

    for (const command of [
      'corepack pnpm run codex:ship',
      'corepack pnpm run verify',
      'corepack pnpm run quality:fast',
      'corepack pnpm run quality:deep',
      'corepack pnpm run quality:all',
      'corepack pnpm run check:visual',
    ]) {
      expect(codexConfig).toContain(command);
    }
    expect(codexConfig).not.toMatch(/=\s*"pnpm /);
    expect(codexPromptHook).toContain('corepack pnpm run codex:ship');
  });

  it('keeps manifest SVG glyphs on next/image instead of raw img elements', () => {
    for (const file of [
      'src/components/LeftRail/LeftRail.tsx',
      'src/components/TabTopControls/controls.tsx',
      'src/components/controls/SelectControl/SelectControl.tsx',
    ]) {
      const source = read(file);

      expect(source).toContain("from '@/components/DecorativeSvgImage/DecorativeSvgImage'");
      expect(source).not.toContain('<img');
    }
  });

  it('keeps Vitest Sass deprecation warning suppression explicit', () => {
    const vitestConfig = read('vitest.config.ts');

    expect(vitestConfig).toContain('preprocessorOptions');
    expect(vitestConfig).toContain('silenceDeprecations');
    expect(vitestConfig).toContain("'legacy-js-api'");
  });

  it('fails reference verification when read-only references changed against the base ref', () => {
    const verifier = read('scripts/verify-reference.js');

    expect(verifier).toContain('REFERENCE_BASE_REF');
    expect(verifier).toContain("'origin/main'");
    expect(verifier).toContain('`${baseRef}...HEAD`');
    expect(verifier).toContain('base-diff:');
    expect(verifier).toContain('read-only reference changed against');
    expect(verifier).toContain("'--others'");
    expect(verifier).toContain('untracked reference files detected');
  });

  it('fails reference verification for committed reference diffs against the base ref', () => {
    const cwd = createReferenceRepo();
    try {
      writeFileSync(path.join(cwd, 'Blueprints_lib', 'README.md'), 'changed\n', 'utf8');
      git(cwd, ['add', 'Blueprints_lib/README.md']);
      git(cwd, ['commit', '-q', '-m', 'change reference']);

      const output = runVerifier(cwd);

      expect(output).toContain('[FAIL] base-diff:Blueprints_lib');
      expect(output).toContain('read-only reference changed against origin/main...HEAD');
    } finally {
      rmSync(cwd, { force: true, recursive: true });
    }
  });

  it('fails reference verification for untracked files in read-only references', () => {
    const cwd = createReferenceRepo();
    try {
      writeFileSync(path.join(cwd, 'Blueprints_lib', 'untracked.txt'), 'untracked\n', 'utf8');

      const output = runVerifier(cwd);

      expect(output).toContain('[FAIL] git-untracked:Blueprints_lib');
      expect(output).toContain('untracked reference files detected');
    } finally {
      rmSync(cwd, { force: true, recursive: true });
    }
  });
});
