#!/usr/bin/env tsx
/**
 * verify-frozen.ts — Architecture regression for the TS frontend starter.
 *
 * Mirrors Codex Studio's verify-frozen.js pattern: a single Node script that
 * launches Playwright, drives a dev server, and asserts every frozen rule
 * with a PASS/FAIL line. Run via `pnpm verify` (or `pnpm verify:static` to
 * skip the runtime tests on machines without a working Chromium download).
 *
 * Add a new rule? Append a `test*` function and call it from `main()`.
 */

import { chromium, type Page } from 'playwright';
import { readdir, readFile, stat } from 'node:fs/promises';
import type { Dirent } from 'node:fs';
import path from 'node:path';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';

type TestResult = { name: string; pass: boolean; detail?: string };
const results: TestResult[] = [];

function record(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const NEXT_BIN = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  let entries: Dirent<string>[];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

async function readSourceFiles(
  filePattern: RegExp,
): Promise<Array<{ file: string; text: string }>> {
  const files = await walk(SRC);
  const matches: Array<{ file: string; text: string }> = [];

  for (const file of files) {
    if (!filePattern.test(file)) continue;
    matches.push({ file, text: await readFile(file, 'utf8') });
  }

  return matches;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getTomlSection(text: string, section: string) {
  const header = new RegExp(`^\\[${escapeRegExp(section)}\\]\\s*$`, 'm').exec(text);
  if (!header) return '';

  const sectionBody = text.slice(header.index + header[0].length);
  const nextSection = sectionBody.search(/^\[[^\]]+\]\s*$/m);
  return nextSection === -1 ? sectionBody : sectionBody.slice(0, nextSection);
}

function hasTomlSetting(text: string, section: string, key: string, value: string) {
  const sectionBody = getTomlSection(text, section);
  const setting = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=\\s*${escapeRegExp(value)}\\s*$`, 'm');
  return setting.test(sectionBody);
}

function getScssTokenValue(text: string, token: string) {
  const match = new RegExp(`^${escapeRegExp(token)}\\s*:\\s*(.+);\\s*$`, 'm').exec(text);
  return match?.[1].trim().toLowerCase().replace(/\s+/g, ' ') ?? null;
}

async function pathExists(file: string) {
  try {
    await stat(path.join(ROOT, file));
    return true;
  } catch {
    return false;
  }
}

function missingSnippets(text: string, snippets: readonly string[]) {
  return snippets.filter((snippet) => !text.includes(snippet));
}

function hasPhrase(text: string, phrase: string) {
  const normalize = (value: string) => value.replace(/\s+/g, ' ').trim();
  return normalize(text).includes(normalize(phrase));
}

// ─── A. Static (no server) ───────────────────────────────────────────────────

async function testNoTailwind() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const banned = Object.keys(allDeps).filter((d) => /tailwind/i.test(d));
  record(
    'A1: no tailwind in package.json',
    banned.length === 0,
    banned.length ? `banned: ${banned.join(', ')}` : undefined,
  );
}

async function testNoCssInJs() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const banned = Object.keys(allDeps).filter((d) =>
    /^(styled-components|@emotion\/|@stitches\/|@vanilla-extract\/|@linaria\/)/.test(d),
  );
  record(
    'A2: no CSS-in-JS libraries',
    banned.length === 0,
    banned.length ? banned.join(', ') : undefined,
  );
}

async function testPnpmOnly() {
  const npmLock = path.join(ROOT, 'package-lock.json');
  const yarnLock = path.join(ROOT, 'yarn.lock');
  let bad = '';
  try {
    await stat(npmLock);
    bad = 'package-lock.json present';
  } catch {
    /* ok */
  }
  try {
    await stat(yarnLock);
    bad = bad ? `${bad}; yarn.lock present` : 'yarn.lock present';
  } catch {
    /* ok */
  }
  record('A3: pnpm only (no npm/yarn lock)', bad === '', bad || undefined);
}

async function testTokensExist() {
  const tokens = path.join(SRC, 'styles', '_tokens.scss');
  try {
    const s = await stat(tokens);
    record('A4: src/styles/_tokens.scss exists', s.isFile());
  } catch {
    record('A4: src/styles/_tokens.scss exists', false, 'file missing');
  }
}

async function testNoInlineHex() {
  // Files explicitly allowed to contain hex values:
  //   _tokens.scss              — the source of truth for raw values.
  //   blueprint-overrides.scss  — bridges tokens into Blueprint CSS variables.
  //   src/app/layout.tsx        — exports `viewport.themeColor`, a string
  //                               literal consumed by Next as a <meta> tag.
  //                               It is TS, not SCSS, and structurally cannot
  //                               `@use` SCSS tokens; the color is mirrored
  //                               manually from `$color-bg` in _tokens.scss.
  // Everything else under src/ that defines styles must reach those tokens
  // via @use.
  const ALLOW = new Set([
    path.join('src', 'styles', '_tokens.scss'),
    path.join('src', 'styles', 'blueprint-overrides.scss'),
    path.join('src', 'app', 'layout.tsx'),
  ]);
  const files = await walk(SRC);
  const offenders: string[] = [];
  for (const f of files) {
    if (!/\.(tsx?|scss)$/.test(f)) continue;
    const rel = path.relative(ROOT, f);
    if (ALLOW.has(rel)) continue;
    const txt = await readFile(f, 'utf8');
    const hex = txt.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hex) offenders.push(`${rel} (${hex.length})`);
  }
  record(
    'A5: no inline hex outside _tokens.scss / blueprint-overrides.scss / layout.tsx',
    offenders.length === 0,
    offenders.length ? offenders.join('; ') : undefined,
  );
}

async function testNoLocalStorage() {
  const offenders: string[] = [];
  for (const { file, text } of await readSourceFiles(/\.(tsx?|jsx?)$/)) {
    if (/\b(localStorage|sessionStorage)\b/.test(text)) {
      offenders.push(path.relative(ROOT, file));
    }
  }
  record(
    'A6: no localStorage/sessionStorage in src/',
    offenders.length === 0,
    offenders.length ? offenders.join(', ') : undefined,
  );
}

async function testNoBlueprintInternalImports() {
  const offenders: string[] = [];
  for (const { file, text } of await readSourceFiles(/\.(tsx?|jsx?)$/)) {
    const imports = text.match(/from\s+['"]@blueprintjs\/[^'"\/]+\/[^'"]+['"]/g);
    if (imports) offenders.push(`${path.relative(ROOT, file)}: ${imports.join(' | ')}`);
  }
  record(
    'A7: no Blueprint internal-path imports',
    offenders.length === 0,
    offenders.length ? offenders.slice(0, 3).join(' / ') : undefined,
  );
}

async function testNoPxFontSize() {
  const files = await walk(SRC);
  const offenders: string[] = [];
  for (const f of files) {
    if (!/\.scss$/.test(f)) continue;
    const txt = await readFile(f, 'utf8');
    const lines = txt.split('\n');
    lines.forEach((line, i) => {
      // detect `font-size: NNpx`
      if (/font-size\s*:\s*[\d.]+px/i.test(line)) {
        offenders.push(`${path.relative(ROOT, f)}:${i + 1}`);
      }
    });
  }
  record(
    'A8: no `px` for font-size (use rem / clamp)',
    offenders.length === 0,
    offenders.length ? offenders.slice(0, 3).join(', ') : undefined,
  );
}

async function testCodexMemoryContract() {
  const config = await readFile(path.join(ROOT, '.codex', 'config.toml'), 'utf8');
  const agents = await readFile(path.join(ROOT, 'AGENTS.md'), 'utf8');
  const frozen = await readFile(path.join(ROOT, 'docs', 'agent', 'frozen-decisions.md'), 'utf8');
  const bootstrap = await readFile(path.join(ROOT, 'docs', 'agent', 'bootstrap.md'), 'utf8');
  const bootstrapSkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-session-bootstrap', 'SKILL.md'),
    'utf8',
  );
  const missing: string[] = [];

  if (!hasTomlSetting(config, 'features', 'memories', 'true')) {
    missing.push('.codex/config.toml [features].memories=true');
  }
  if (!agents.includes('## Session Memory')) missing.push('AGENTS.md Session Memory section');
  if (!agents.includes('At the end of every completed task')) {
    missing.push('AGENTS.md completed-task memory handoff rule');
  }
  if (!agents.includes('At the start of every PL_RU session, do a quick Memories pass')) {
    missing.push('AGENTS.md startup Memories pass rule');
  }
  if (!agents.includes('extensions/ad_hoc/notes/')) {
    missing.push('AGENTS.md explicit user-request memory update path');
  }
  if (!frozen.includes('## Session Memory')) missing.push('frozen-decisions Session Memory');
  if (!bootstrap.includes('Do a quick Memories pass')) {
    missing.push('docs/agent/bootstrap.md Memories pass step');
  }
  if (!bootstrapSkill.includes('Do a quick Memories pass')) {
    missing.push('pl-ru-session-bootstrap Memories pass step');
  }

  record(
    'A9: Codex Memories enabled and documented',
    missing.length === 0,
    missing.length ? missing.join('; ') : undefined,
  );
}

async function testFrozenHeaderContract() {
  const tokens = await readFile(path.join(SRC, 'styles', '_tokens.scss'), 'utf8');
  const header = await readFile(path.join(SRC, 'components', 'Header', 'Header.tsx'), 'utf8');
  const styles = await readFile(
    path.join(SRC, 'components', 'Header', 'Header.module.scss'),
    'utf8',
  );
  const headerSpec = await readFile(path.join(ROOT, 'tests', 'e2e', 'header.spec.ts'), 'utf8');
  const expectedTokens = new Map([
    ['$color-header-bg', '#0c1316'],
    ['$color-header-border', 'rgb(233 234 235 / 50%)'],
    ['$color-header-tab-active', '#2970ff'],
    ['$color-header-tab-hover', '#528bff'],
    ['$color-header-action-text', '#d3d3d3'],
    ['$color-header-data', '#1c6e42'],
    ['$color-header-action-hover', '#84adff'],
    ['$color-header-dropdown-bg', '#171d20'],
    ['$color-header-dropdown-border', '#727677'],
    ['$color-header-dropdown-filter-bg', '#33434b'],
    ['$header-height', '3rem'],
    ['$header-edge-padding', '0.5rem'],
    ['$header-side-width', '20.625rem'],
    ['$header-tab-compact-width', '5rem'],
    ['$header-tab-width', '9.5625rem'],
    ['$header-tab-lead-width', '9.625rem'],
    ['$header-expanded-breakpoint', '120rem'],
    ['$header-action-height', '1.875rem'],
    ['$header-dropdown-offset', '0.25rem'],
    ['$header-dropdown-padding-block', '1rem'],
    ['$header-dropdown-padding-inline', '0.5rem'],
    ['$header-account-menu-item-gap', '0.5rem'],
    ['$fs-header-filter', '0.625rem'],
    ['$radius-xs', '0.1875rem'],
    ['$radius-dropdown', '0.125rem'],
  ]);
  const failures: string[] = [];
  const frozen = await readFile(path.join(ROOT, 'docs', 'agent', 'frozen-decisions.md'), 'utf8');

  for (const [token, expected] of expectedTokens) {
    const actual = getScssTokenValue(tokens, token);
    if (actual !== expected) failures.push(`${token}=${actual ?? '(missing)'}`);
  }

  failures.push(
    ...missingSnippets(header, [
      'export type HeaderProps = {',
      'activeTab: HeaderTabId;',
      'onTabChange: (id: HeaderTabId) => void;',
      'tabs?: readonly HeaderTab[];',
      'className?: string;',
      'data-testid="praios-header-tabs"',
      'PopupKind.MENU',
      'PopupKind.DIALOG',
      "useState<NotificationFilterId>('all')",
      'aria-label={tab.title}',
      'text="Данные"',
      'text="База данных"',
      'text="Аккаунт"',
      'aria-label="Уведомления"',
      'role="group"',
      'aria-expanded={isAccountDropdownOpen}',
      'aria-expanded={isNotificationsDropdownOpen}',
      'text="Изменить профиль"',
      'text="Выйти из аккаунта"',
      "label: 'AI Info'",
      "label: 'Unread'",
      'Mark all as read',
      'role="dialog"',
      'onMarkAllRead',
    ]).map((snippet) => `Header.tsx missing ${snippet}`),
  );

  failures.push(
    ...missingSnippets(styles, [
      'width: t.$header-tab-compact-width;',
      'background: t.$color-header-tab-hover !important;',
      'background: t.$color-header-tab-active !important;',
      'display: none;',
      '@media (min-width: t.$header-expanded-breakpoint)',
      'width: t.$header-tab-width;',
      'width: t.$header-tab-lead-width;',
      'height: t.$header-action-height;',
      'border-radius: t.$radius-xs;',
      'border-color: t.$color-header-action-hover;',
      'background: t.$color-header-tab-active !important;',
      'opacity: 1 !important;',
      'color: t.$color-header-text-on-color !important;',
      'padding-block-start: t.$header-dropdown-offset;',
      'padding: t.$header-dropdown-padding-block t.$header-dropdown-padding-inline;',
      'gap: t.$header-account-menu-item-gap;',
      'background: t.$color-header-dropdown-bg;',
      'outline: 0.125rem solid t.$color-header-text-on-color;',
    ]).map((snippet) => `Header.module.scss missing ${snippet}`),
  );

  failures.push(
    ...missingSnippets(frozen, [
      'hover uses `#84adff`',
      '`Аккаунт` opens a Blueprint Popover/Menu profile dropdown',
      '`Уведомления` opens a Blueprint Popover notification panel',
      '`All` filtering',
      'Header action dropdown panels use `#171d20` surface',
      'sit `4px` below their trigger buttons',
      '`8px` item gap',
    ]).map((snippet) => `frozen-decisions.md missing ${snippet}`),
  );

  failures.push(
    ...missingSnippets(headerSpec, [
      'keeps compact icon-only header layout',
      'keeps expanded Figma header dimensions',
      'uses Figma tab colors and keeps base tabs borderless',
      'opens account dropdown from the account action button',
      'opens notification dropdown and filters placeholder notifications',
      'keeps account and notification popovers mutually exclusive',
      'expectDropdownOffset',
      'Unread (11)',
      'Mark all as read',
    ]).map((snippet) => `tests/e2e/header.spec.ts missing ${snippet}`),
  );

  record(
    'A10: Header responsive tabs, action states, and dropdowns remain frozen',
    failures.length === 0,
    failures.length ? failures.slice(0, 8).join('; ') : undefined,
  );
}

async function testFrozenQualityToolingContract() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const jscpd = JSON.parse(await readFile(path.join(ROOT, '.jscpd.json'), 'utf8'));
  const shared = await readFile(path.join(ROOT, 'playwright.shared.config.ts'), 'utf8');
  const e2e = await readFile(path.join(ROOT, 'playwright.config.ts'), 'utf8');
  const quality = await readFile(path.join(ROOT, 'playwright.quality.config.ts'), 'utf8');
  const syncRefs = await readFile(path.join(ROOT, 'scripts', 'sync-refs.mjs'), 'utf8');
  const verifyRefs = await readFile(path.join(ROOT, 'scripts', 'verify-reference.js'), 'utf8');
  const pa11yScript = await readFile(path.join(ROOT, 'scripts', 'run-pa11y.mjs'), 'utf8');
  const failures: string[] = [];

  if (pkg.scripts?.['check:duplicates'] !== 'jscpd --config .jscpd.json --noTips .') {
    failures.push('package.json check:duplicates drifted');
  }
  if (pkg.scripts?.['check:visual'] !== 'node scripts/check-visual-evidence.mjs') {
    failures.push('package.json check:visual drifted');
  }
  if (!pkg.scripts?.['quality:deep']?.includes('pnpm check:visual')) {
    failures.push('package.json quality:deep must include pnpm check:visual');
  }
  if (jscpd.threshold !== 1) failures.push('.jscpd.json threshold must stay 1');
  for (const required of [
    'src/**/*.{ts,tsx,scss}',
    'tests/**/*.{ts,tsx,mjs}',
    'scripts/**/*.{js,mjs}',
    'verify-frozen.ts',
  ]) {
    if (!jscpd.files?.includes(required)) failures.push(`.jscpd.json files missing ${required}`);
  }
  for (const requiredIgnore of [
    '**/Blueprints_lib/**',
    '**/Osiris_ref/**',
    '**/plugins/pl-ru-codex/skills/blueprint-design/**',
    '**/plugins/pl-ru-codex/skills/osiris-design/**',
  ]) {
    if (!jscpd.ignore?.includes(requiredIgnore)) {
      failures.push(`.jscpd.json ignore missing ${requiredIgnore}`);
    }
  }

  failures.push(
    ...((await pathExists('scripts/check-visual-evidence.mjs'))
      ? []
      : ['scripts/check-visual-evidence.mjs missing']),
    ...missingSnippets(shared, ['createPlaywrightConfig', 'Desktop Chrome']).map(
      (snippet) => `playwright.shared.config.ts missing ${snippet}`,
    ),
    ...missingSnippets(e2e, ["createPlaywrightConfig('./tests/e2e')"]).map(
      (snippet) => `playwright.config.ts missing ${snippet}`,
    ),
    ...missingSnippets(quality, ["createPlaywrightConfig('./tests/quality')"]).map(
      (snippet) => `playwright.quality.config.ts missing ${snippet}`,
    ),
    ...missingSnippets(syncRefs, ['./lib/reference-manifest.mjs']).map(
      (snippet) => `sync-refs.mjs missing ${snippet}`,
    ),
    ...missingSnippets(verifyRefs, ['./lib/reference-manifest.mjs']).map(
      (snippet) => `verify-reference.js missing ${snippet}`,
    ),
    ...missingSnippets(pa11yScript, [
      "import { chromium } from 'playwright';",
      'chromium.executablePath()',
      'executablePath: chromiumExecutablePath',
    ]).map((snippet) => `run-pa11y.mjs missing ${snippet}`),
  );

  record(
    'A11: quality tooling shared contracts remain frozen',
    failures.length === 0,
    failures.length ? failures.join('; ') : undefined,
  );
}

async function testAgentVisualQaContract() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const agents = await readFile(path.join(ROOT, 'AGENTS.md'), 'utf8');
  const frozen = await readFile(path.join(ROOT, 'docs', 'agent', 'frozen-decisions.md'), 'utf8');
  const bootstrap = await readFile(path.join(ROOT, 'docs', 'agent', 'bootstrap.md'), 'utf8');
  const verification = await readFile(path.join(ROOT, 'docs', 'agent', 'verification.md'), 'utf8');
  const orchestration = await readFile(
    path.join(ROOT, 'docs', 'agent', 'orchestration.md'),
    'utf8',
  );
  const sessionStartHook = await readFile(
    path.join(ROOT, '.codex', 'hooks', 'session-start.md'),
    'utf8',
  );
  const promptHook = await readFile(
    path.join(ROOT, '.codex', 'hooks', 'user-prompt-submit.md'),
    'utf8',
  );
  const bootstrapSkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-session-bootstrap', 'SKILL.md'),
    'utf8',
  );
  const qualitySkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-quality-gate', 'SKILL.md'),
    'utf8',
  );
  const reuseSkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-reuse-audit', 'SKILL.md'),
    'utf8',
  );
  const visualSkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-visual-qa', 'SKILL.md'),
    'utf8',
  );
  const shipSkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-ship', 'SKILL.md'),
    'utf8',
  );
  const frozenSkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-frozen-decisions', 'SKILL.md'),
    'utf8',
  );
  const driftSkill = await readFile(
    path.join(ROOT, 'plugins', 'pl-ru-codex', 'skills', 'pl-ru-instruction-drift', 'SKILL.md'),
    'utf8',
  );
  const visualScript = await readFile(
    path.join(ROOT, 'scripts', 'check-visual-evidence.mjs'),
    'utf8',
  );
  const missing: string[] = [];
  const requiredSkills = ['pl-ru-reuse-audit', 'pl-ru-visual-qa'];
  const requiredAgents = [
    'code_deadwood_auditor',
    'code_quality_guardian',
    'component_reuse_guardian',
    'runtime_behavior_mapper',
    'tech_stack_cartographer',
    'instruction_drift_auditor',
    'quality_tooling_architect',
    'codex_infra_architect',
    'frozen_decisions_guardian',
    'visual_qa_guardian',
  ];

  for (const skill of requiredSkills) {
    if (!(await pathExists(path.join('plugins', 'pl-ru-codex', 'skills', skill, 'SKILL.md')))) {
      missing.push(`${skill} SKILL.md`);
    }
    if (
      !(await pathExists(
        path.join('plugins', 'pl-ru-codex', 'skills', skill, 'agents', 'openai.yaml'),
      ))
    ) {
      missing.push(`${skill} openai agent metadata`);
    }
  }

  for (const agent of requiredAgents) {
    if (!(await pathExists(path.join('.codex', 'agents', `${agent}.toml`)))) {
      missing.push(`.codex agent missing ${agent}`);
    }
    if (
      !hasPhrase(agents, agent) &&
      !hasPhrase(frozen, agent) &&
      !hasPhrase(orchestration, agent)
    ) {
      missing.push(`agent roster docs missing ${agent}`);
    }
  }

  if (!hasPhrase(agents, '## Mandatory Agents And Visual QA')) {
    missing.push('AGENTS.md mandatory agents section');
  }
  if (!hasPhrase(agents, 'Always raise the applicable PL_RU subagents')) {
    missing.push('AGENTS.md always-raise-subagents rule');
  }
  if (!hasPhrase(agents, 'component-reuse subagent')) {
    missing.push('AGENTS.md component-reuse subagent rule');
  }
  if (!hasPhrase(agents, 'dead-code / duplicate-code subagent')) {
    missing.push('AGENTS.md duplicate/deadwood subagent rule');
  }
  if (!hasPhrase(agents, 'A PASS is valid only')) {
    missing.push('AGENTS.md exact PASS rule');
  }
  if (!hasPhrase(agents, 'pixel-level screenshot comparison')) {
    missing.push('AGENTS.md pixel-level visual QA rule');
  }
  if (!hasPhrase(agents, 'reports/visual-qa/')) {
    missing.push('AGENTS.md visual artifact directory rule');
  }
  if (!hasPhrase(frozen, '## Agent Orchestration And Visual QA')) {
    missing.push('frozen-decisions agent/visual QA section');
  }
  if (!hasPhrase(frozen, 'reference PNG is inaccessible')) {
    missing.push('frozen-decisions reference PNG blocking rule');
  }
  if (!hasPhrase(frozen, 'unstaged worktree diff')) {
    missing.push('frozen-decisions visual gate worktree detection rule');
  }
  if (!hasPhrase(frozen, 'The gate cannot accept only a self-reported manifest')) {
    missing.push('frozen-decisions real pixel comparison rule');
  }
  if (!hasPhrase(frozen, 'VISUAL_QA_ALLOW_MISSING_BASE')) {
    missing.push('frozen-decisions fail-closed base-ref rule');
  }
  if (!hasPhrase(frozen, 'reports/visual-qa/')) {
    missing.push('frozen-decisions visual artifact directory rule');
  }
  if (!hasPhrase(frozen, 'default CI evidence must be a tracked `tests/visual-qa/latest.json`')) {
    missing.push('frozen-decisions tracked visual evidence rule');
  }
  if (!hasPhrase(frozen, 'Visual evidence cases may include `capture` metadata')) {
    missing.push('frozen-decisions visual capture rule');
  }
  for (const snippet of [
    '## Routing Decision',
    'Documentation: <docs/runbooks checked, or "No dependency documentation lookup needed">',
    'Selected skills: <PL_RU or plugin skills selected, or "none - reason">',
    'Selected agents: <.codex/agents roles selected, or "none - reason">',
    'Catalog candidates: <external/reference orchestration candidates considered, or "none - reason">',
    'Reason: <why this routing lowers delivery risk for the current task>',
    '## Subagent Prompt And Output Contract',
    'Every prompt to a PL_RU subagent must include:',
    '`Goal`: the exact task the role owns.',
    '`Success Criteria`: the concrete PASS conditions for the role.',
    '`Ownership / Write Zone`: read-only or exact files/directories the role may change.',
    '`Stop Rules`: blockers that require FAIL or escalation instead of guessing.',
    'Every subagent output must include:',
    '`PASS/FAIL`: one clear status.',
    'Explicit defers: bounded follow-up only, never a waiver for a blocker.',
    'Explicit defers cannot override blockers. Frozen contract mismatch',
  ]) {
    if (!hasPhrase(orchestration, snippet)) {
      missing.push(`docs/agent/orchestration.md missing ${snippet}`);
    }
  }
  for (const snippet of [
    'must record a `Routing Decision` with `Documentation`, `Selected skills`, `Selected agents`, `Catalog candidates`, and `Reason`',
    'Explicit spawned subagents must receive the PL_RU prompt/output contract',
    'Inline summaries are not a substitute for required spawned-agent evidence',
    'External orchestration packs remain references, not authority',
    'Explicit defers cannot override blockers. Frozen contract mismatch',
  ]) {
    if (!hasPhrase(frozen, snippet)) {
      missing.push(`frozen-decisions missing orchestration contract snippet: ${snippet}`);
    }
  }

  for (const [label, text] of [
    ['docs/agent/bootstrap.md', bootstrap],
    ['docs/agent/verification.md', verification],
    ['docs/agent/orchestration.md', orchestration],
    ['.codex/hooks/session-start.md', sessionStartHook],
    ['.codex/hooks/user-prompt-submit.md', promptHook],
    ['pl-ru-session-bootstrap', bootstrapSkill],
    ['pl-ru-quality-gate', qualitySkill],
  ] as const) {
    if (!hasPhrase(text, 'applicable PL_RU subagents')) {
      missing.push(`${label} subagent rule`);
    }
    if (!hasPhrase(text, 'component-reuse')) {
      missing.push(`${label} component-reuse rule`);
    }
    if (!hasPhrase(text, 'duplicate/deadwood')) {
      missing.push(`${label} duplicate/deadwood rule`);
    }
    if (!hasPhrase(text, 'pixel-level screenshot comparison')) {
      missing.push(`${label} pixel visual QA rule`);
    }
  }
  if (
    !hasPhrase(verification, 'base diff, unstaged worktree diff, staged diff, and untracked files')
  ) {
    missing.push('docs/agent/verification.md worktree detection rule');
  }
  if (!hasPhrase(verification, 'pixelComparison.cases')) {
    missing.push('docs/agent/verification.md pixel cases rule');
  }
  if (!hasPhrase(verification, 'writes a diff PNG')) {
    missing.push('docs/agent/verification.md diff PNG rule');
  }
  if (!hasPhrase(verification, 'The base diff fails closed')) {
    missing.push('docs/agent/verification.md fail-closed base-ref rule');
  }
  if (!hasPhrase(verification, 'must not overwrite a tracked file')) {
    missing.push('docs/agent/verification.md diff artifact safety rule');
  }
  if (
    !hasPhrase(
      verification,
      'default CI evidence manifest must be committed at `tests/visual-qa/latest.json`',
    )
  ) {
    missing.push('docs/agent/verification.md tracked visual evidence rule');
  }
  if (!hasPhrase(verification, '`VISUAL_QA_BASE_URL` or `http://localhost:3000`')) {
    missing.push('docs/agent/verification.md capture base-url rule');
  }

  for (const [label, text] of [
    ['pl-ru-reuse-audit', reuseSkill],
    ['pl-ru-visual-qa', visualSkill],
    ['pl-ru-quality-gate', qualitySkill],
    ['pl-ru-frozen-decisions', frozenSkill],
  ] as const) {
    if (!hasPhrase(text, 'task brief')) missing.push(`${label} task-brief alignment rule`);
    if (!hasPhrase(text, 'reference screenshot') && !hasPhrase(text, 'reference PNG')) {
      missing.push(`${label} reference alignment rule`);
    }
  }

  if (!hasPhrase(frozenSkill, 'pixel-level visual QA rules remain documented')) {
    missing.push('pl-ru-frozen-decisions visual QA guard rule');
  }
  if (
    !hasPhrase(
      frozenSkill,
      'Routing Decision and spawned subagent prompt/output contracts remain documented',
    )
  ) {
    missing.push('pl-ru-frozen-decisions routing contract rule');
  }
  if (
    !hasPhrase(
      frozenSkill,
      'Inline summaries remain insufficient when explicit spawned-agent evidence is required',
    )
  ) {
    missing.push('pl-ru-frozen-decisions spawned evidence rule');
  }
  if (!hasPhrase(frozenSkill, 'External orchestration references remain reference-only')) {
    missing.push('pl-ru-frozen-decisions external orchestration reference rule');
  }
  if (
    !hasPhrase(
      frozenSkill,
      'Explicit defers cannot override blockers such as frozen contract mismatch',
    )
  ) {
    missing.push('pl-ru-frozen-decisions explicit defer blocker rule');
  }
  if (
    !hasPhrase(
      driftSkill,
      'Do Routing Decision and subagent prompt/output contracts stay subordinate',
    )
  ) {
    missing.push('pl-ru-instruction-drift routing authority rule');
  }
  if (!hasPhrase(driftSkill, 'external orchestration references remain reference-only')) {
    missing.push('pl-ru-instruction-drift external orchestration reference rule');
  }
  if (
    !hasPhrase(
      driftSkill,
      'Do closeout rules preserve that explicit defers cannot override blockers',
    )
  ) {
    missing.push('pl-ru-instruction-drift closeout blocker rule');
  }
  if (!hasPhrase(qualitySkill, 'Explicit defers cannot override blockers')) {
    missing.push('pl-ru-quality-gate closeout blocker rule');
  }
  if (!hasPhrase(shipSkill, 'Explicit defers cannot override blockers')) {
    missing.push('pl-ru-ship closeout blocker rule');
  }
  if (hasPhrase(shipSkill, 'only when the user explicitly asks')) {
    missing.push('pl-ru-ship weak optional-subagent language');
  }
  if (pkg.scripts?.['check:visual'] !== 'node scripts/check-visual-evidence.mjs') {
    missing.push('package.json check:visual script');
  }
  if (!pkg.scripts?.['quality:deep']?.includes('pnpm check:visual')) {
    missing.push('package.json quality:deep visual gate');
  }
  for (const snippet of [
    'VISUAL_QA_EVIDENCE',
    'VISUAL_QA_BASE_URL',
    'trackedDefaultEvidencePath',
    'selectEvidencePath',
    'requireTrackedTestsManifest',
    'export const visualQaContract = Object.freeze({',
    "baseDiffFailureMode: 'fail-closed-unless-VISUAL_QA_ALLOW_MISSING_BASE'",
    "changeSources: ['base-diff', 'unstaged-worktree', 'staged-index', 'untracked-files']",
    "diffArtifactPathPrefixes: ['reports/visual-qa/', 'test-results/visual-qa/']",
    "pixelComparisonEngine: 'playwright-canvas-png-diff'",
    "screenshotCaptureEngine: 'playwright-live-app-screenshot'",
    'captureActualScreenshot',
    'pixelComparison',
    'pixelComparison.cases must list screenshot/reference PNG pairs',
    'referencePath',
    'actualPath',
    'diffPath',
    'mismatchedAreas',
    'domCssMetrics',
    'referenceUnavailable',
    'metricOnlyFallbackAcceptedByCurrentUser',
  ]) {
    if (!visualScript.includes(snippet)) missing.push(`check-visual-evidence missing ${snippet}`);
  }

  record(
    'A12: mandatory agents, reuse, exact-spec, and visual QA gates stay documented',
    missing.length === 0,
    missing.length ? missing.join('; ') : undefined,
  );
}

// ─── B. Runtime (dev server) ─────────────────────────────────────────────────

async function testWorkspaceShellContract() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
  const tokens = await readFile(path.join(SRC, 'styles', '_tokens.scss'), 'utf8');
  const layout = await readFile(path.join(SRC, 'app', 'layout.tsx'), 'utf8');
  const appShell = await readFile(path.join(SRC, 'components', 'AppShell', 'AppShell.tsx'), 'utf8');
  const appShellStyles = await readFile(
    path.join(SRC, 'components', 'AppShell', 'AppShell.module.scss'),
    'utf8',
  );
  const leftRail = await readFile(path.join(SRC, 'components', 'LeftRail', 'LeftRail.tsx'), 'utf8');
  const tabSidePanel = await readFile(
    path.join(SRC, 'components', 'TabSidePanel', 'TabSidePanel.tsx'),
    'utf8',
  );
  const workspaceMap = await readFile(
    path.join(SRC, 'components', 'WorkspaceMap', 'WorkspaceMap.tsx'),
    'utf8',
  );
  const mapConfig = await readFile(
    path.join(SRC, 'components', 'WorkspaceMap', 'mapConfig.ts'),
    'utf8',
  );
  const workspaceSpec = await readFile(
    path.join(ROOT, 'tests', 'e2e', 'workspace-shell.spec.ts'),
    'utf8',
  );
  const frozen = await readFile(path.join(ROOT, 'docs', 'agent', 'frozen-decisions.md'), 'utf8');
  const failures: string[] = [];
  const expectedTokens = new Map([
    ['$color-workspace-bg', '#12181b'],
    ['$color-workspace-border', '#666'],
    ['$color-workspace-button-hover', '#528bff'],
    ['$color-workspace-button-active', '#2970ff'],
    ['$workspace-rail-width', '3.125rem'],
    ['$workspace-panel-width', '18.75rem'],
    ['$workspace-rail-button-size', '2.125rem'],
    ['$workspace-control-height', '2rem'],
  ]);

  for (const [token, expected] of expectedTokens) {
    const actual = getScssTokenValue(tokens, token);
    if (actual !== expected) failures.push(`${token}=${actual ?? '(missing)'}`);
  }

  if (!pkg.dependencies?.['maplibre-gl']) failures.push('package.json missing maplibre-gl');

  failures.push(
    ...missingSnippets(layout, ["import 'maplibre-gl/dist/maplibre-gl.css';"]).map(
      (snippet) => `layout.tsx missing ${snippet}`,
    ),
    ...missingSnippets(appShell, [
      '<main',
      '<section',
      'id="praios-tab-panel"',
      'role="tabpanel"',
      'data-testid="workspace-shell"',
      'data-testid="workspace-left-area"',
      'PraiOS workspace',
      'getWorkspaceSidebarMode(activeTab)',
      '<WorkspaceMap />',
    ]).map((snippet) => `AppShell.tsx missing ${snippet}`),
    ...missingSnippets(appShellStyles, [
      'height: calc(100dvh - t.$header-height);',
      'margin: t.$header-height 0 0;',
      'grid-template-columns: t.$workspace-rail-width minmax(0, 1fr);',
      'grid-template-columns: t.$workspace-panel-width minmax(0, 1fr);',
      '.tabPanelWide',
    ]).map((snippet) => `AppShell.module.scss missing ${snippet}`),
    ...missingSnippets(leftRail, [
      'Button',
      'Icon',
      'data-testid="left-rail"',
      "data-testid={item.primary ? 'left-rail-button-primary' : undefined}",
      'aria-pressed={pressed}',
      'onClick={onPress}',
    ]).map((snippet) => `LeftRail.tsx missing ${snippet}`),
    ...missingSnippets(tabSidePanel, [
      'HTMLSelect',
      'InputGroup',
      'TextArea',
      'Checkbox',
      'testId="kick-side-panel"',
      'testId="stats-side-panel"',
      'testId="sat-side-panel"',
      'Создание параметров для пуска',
      'Фильтры таблицы',
      'Зондирование',
    ]).map((snippet) => `TabSidePanel.tsx missing ${snippet}`),
    ...missingSnippets(workspaceMap, [
      'Card',
      'maplibregl.Map',
      'NavigationControl',
      'AttributionControl',
      'attributionControl: false',
      'compact: false',
      'center:',
      'maxZoom:',
      'minZoom:',
      'zoom:',
      'data-testid="workspace-map"',
      'data-testid="workspace-map-card"',
      'data-testid="workspace-map-canvas"',
    ]).map((snippet) => `WorkspaceMap.tsx missing ${snippet}`),
    ...missingSnippets(mapConfig, [
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      '&copy; OpenStreetMap contributors',
      'version: 8',
      'sources:',
      'tiles: [',
      'attribution:',
      "type: 'raster'",
      'tileSize: 256',
      'layers:',
    ]).map((snippet) => `mapConfig.ts missing ${snippet}`),
    ...missingSnippets(workspaceSpec, [
      'keeps compact left rail anchored',
      'syncs tab-specific left panels with Header state',
      'aligns side-panel controls to the same right edge as footer actions',
      'preserves keyboard focus on an active left rail button',
      'renders an interactive MapLibre map instead of the CSS placeholder',
      'maplibregl-canvas',
      'maplibregl-ctrl-attrib',
      'maplibregl-compact',
      'outline-style',
      'workspace-map-card',
      'left-rail-button-primary',
      'kick-side-panel',
      'stats-side-panel',
      'sat-side-panel',
      'RAIL_HEIGHTS = [768, 900, 1080, 1200, 1440, 2160]',
    ]).map((snippet) => `workspace-shell.spec.ts missing ${snippet}`),
    ...missingSnippets(frozen, [
      '## Workspace Shell And Left Sidebar',
      'compact left rail is fixed at `50px` wide',
      'Wide side panels are fixed at `300px` wide',
      'real client-side `MapLibre GL JS` map',
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      'expanded visible OSM',
      'within a `1px` tolerance',
      'Header visual contract is not part of this shell contract',
    ]).map((snippet) => `frozen-decisions.md missing ${snippet}`),
  );

  record(
    'A13: workspace shell, left sidebar, and real map contract stay frozen',
    failures.length === 0,
    failures.length ? failures.slice(0, 10).join('; ') : undefined,
  );
}

async function waitForUrl(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server did not start at ${url} within ${timeoutMs}ms`);
}

async function withDevServer(fn: (page: Page, baseURL: string) => Promise<void>) {
  const PORT = '3100';
  // On POSIX, `detached: true` puts the Next process in its own process group
  // so a single negative-PID kill cleans it up. Windows uses taskkill /t.
  const server: ChildProcess = spawn(process.execPath, [NEXT_BIN, 'dev', '--port', PORT], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, PORT },
    detached: process.platform !== 'win32',
  });
  const baseURL = `http://localhost:${PORT}`;
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('spawn', resolve);
      server.once('error', reject);
    });
    await waitForUrl(baseURL, 90_000);
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      await fn(page, baseURL);
    } finally {
      await browser.close();
    }
  } finally {
    if (server.pid) {
      try {
        if (process.platform === 'win32') {
          execFileSync('taskkill', ['/pid', String(server.pid), '/t', '/f'], { stdio: 'ignore' });
        } else {
          process.kill(-server.pid, 'SIGTERM');
        }
      } catch {
        /* group already gone */
      }
    }
  }
}

async function testRuntime() {
  await withDevServer(async (page, baseURL) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

    const resp = await page.goto(baseURL, { waitUntil: 'networkidle' });
    record('B1: index responds 2xx', !!resp && resp.status() < 400, `status=${resp?.status()}`);

    const themeCount = await page.locator('meta[name="theme-color"]').count();
    record('B2: exactly one <meta name=theme-color>', themeCount === 1, `count=${themeCount}`);

    const h1Count = await page.locator('h1').count();
    record('B3: page has an <h1>', h1Count >= 1, `count=${h1Count}`);

    const bpCard = await page.locator('.bp6-card, .bp5-card').count();
    record('B4: at least one Blueprint Card rendered', bpCard > 0, `count=${bpCard}`);

    record(
      'B5: no console errors on load',
      consoleErrors.length === 0,
      consoleErrors.slice(0, 3).join(' | '),
    );

    // B6: catch drift between the manual mirror in layout.tsx (themeColor) and
    // the source of truth ($color-bg in _tokens.scss). Parsing SCSS with a
    // regex is fine here: tokens are declared one per line in a flat file and
    // the rule only needs the first occurrence. `expandHexShorthand` normalises
    // 3-/4-digit forms (#abc, #abcd) to 6-/8-digit so #000 still compares equal
    // to #000000 — CSS treats them identically.
    const expandHexShorthand = (h: string): string => {
      const s = h.replace(/^#/, '');
      if (s.length === 3 || s.length === 4) {
        return (
          '#' +
          s
            .split('')
            .map((c) => c + c)
            .join('')
        );
      }
      return h;
    };
    const themeContent =
      themeCount >= 1
        ? await page.locator('meta[name="theme-color"]').first().getAttribute('content')
        : null;
    const tokensTxt = await readFile(path.join(SRC, 'styles', '_tokens.scss'), 'utf8');
    const colorBgMatch = tokensTxt.match(/^\$color-bg:\s*(#[0-9a-fA-F]{3,8})\b/m);
    const expectedBg = colorBgMatch ? expandHexShorthand(colorBgMatch[1].toLowerCase()) : null;
    const actualBg = themeContent !== null ? expandHexShorthand(themeContent.toLowerCase()) : null;
    const metaDetail =
      themeContent === null ? '(missing)' : themeContent === '' ? '(empty)' : themeContent;
    record(
      'B6: <meta theme-color> content matches $color-bg in _tokens.scss',
      expectedBg !== null && actualBg !== null && expectedBg === actualBg,
      `meta=${metaDetail} tokens=${expectedBg ?? '(no $color-bg match)'}`,
    );
  });
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== verify-frozen.ts ===\n');

  await testNoTailwind();
  await testNoCssInJs();
  await testPnpmOnly();
  await testTokensExist();
  await testNoInlineHex();
  await testNoLocalStorage();
  await testNoBlueprintInternalImports();
  await testNoPxFontSize();
  await testCodexMemoryContract();
  await testFrozenHeaderContract();
  await testFrozenQualityToolingContract();
  await testAgentVisualQaContract();
  await testWorkspaceShellContract();

  if (!process.argv.includes('--static')) {
    try {
      await testRuntime();
    } catch (e) {
      record('runtime: dev server', false, (e as Error).message);
    }
  } else {
    console.log('[SKIP] runtime tests (--static)');
  }

  const pass = results.filter((r) => r.pass).length;
  const fail = results.length - pass;
  console.log(`\nSUMMARY: ${pass}/${results.length} PASS, ${fail} FAIL`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
