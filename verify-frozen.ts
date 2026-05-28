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

function missingSnippets(text: string, snippets: readonly string[]) {
  return snippets.filter((snippet) => !text.includes(snippet));
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
  const missing: string[] = [];

  if (!hasTomlSetting(config, 'features', 'memories', 'true')) {
    missing.push('.codex/config.toml [features].memories=true');
  }
  if (!agents.includes('## Session Memory')) missing.push('AGENTS.md Session Memory section');
  if (!agents.includes('At the end of every completed task')) {
    missing.push('AGENTS.md completed-task memory handoff rule');
  }
  if (!frozen.includes('## Session Memory')) missing.push('frozen-decisions Session Memory');

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
  const expectedTokens = new Map([
    ['$color-header-bg', '#0c1316'],
    ['$color-header-border', 'rgb(233 234 235 / 50%)'],
    ['$color-header-tab-active', '#2970ff'],
    ['$color-header-tab-hover', '#528bff'],
    ['$color-header-action-text', '#d3d3d3'],
    ['$color-header-data', '#1c6e42'],
    ['$header-height', '3rem'],
    ['$header-edge-padding', '0.5rem'],
    ['$header-side-width', '20.625rem'],
    ['$header-tab-compact-width', '5rem'],
    ['$header-tab-width', '9.5625rem'],
    ['$header-tab-lead-width', '9.625rem'],
    ['$header-expanded-breakpoint', '120rem'],
    ['$header-action-height', '1.875rem'],
    ['$radius-xs', '0.1875rem'],
  ]);
  const failures: string[] = [];

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
      'aria-label={tab.title}',
      'text="Данные"',
      'text="База данных"',
      'text="Аккаунт"',
      'aria-label="Уведомления"',
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
      'opacity: 1 !important;',
      'outline: 0.125rem solid t.$color-header-text-on-color;',
    ]).map((snippet) => `Header.module.scss missing ${snippet}`),
  );

  record(
    'A10: Header responsive tabs and action buttons remain frozen',
    failures.length === 0,
    failures.length ? failures.slice(0, 8).join('; ') : undefined,
  );
}

async function testFrozenQualityToolingContract() {
  const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'));
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

  failures.push(
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

// ─── B. Runtime (dev server) ─────────────────────────────────────────────────

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
