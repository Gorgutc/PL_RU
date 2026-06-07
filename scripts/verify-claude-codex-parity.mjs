#!/usr/bin/env node
/**
 * verify-claude-codex-parity.mjs — frozen rule A16.
 *
 * PL_RU keeps two equivalent agent canons: Claude (`.claude/` + `CLAUDE.md`) and
 * Codex (`.codex/` + `plugins/pl-ru-codex/` + `AGENTS.md`). This guard fails if
 * the two wrappers drift:
 *   - every Codex skill has a Claude skill mirror with the same name (and vice versa);
 *   - each Claude skill's frontmatter `name` matches its folder;
 *   - every Codex agent role has a Claude agent mirror with the same name (and vice versa);
 *   - the shared hook runbooks exist on both sides;
 *   - AGENTS.md and CLAUDE.md both reference the authority order and rule A16.
 *
 * Run directly: `node scripts/verify-claude-codex-parity.mjs`
 * It is also invoked by verify-frozen.ts as rule A16 (`pnpm verify`).
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const errors = [];

function dirNames(rel, hasFile) {
  const abs = path.join(ROOT, rel);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => (hasFile ? existsSync(path.join(abs, name, hasFile)) : true));
}

function fileBasenames(rel, ext) {
  const abs = path.join(ROOT, rel);
  if (!existsSync(abs)) return [];
  return readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(ext))
    .map((e) => e.name.slice(0, -ext.length));
}

function diffSets(label, a, b, aName, bName) {
  const setA = new Set(a);
  const setB = new Set(b);
  for (const x of setA)
    if (!setB.has(x)) errors.push(`${label}: "${x}" present in ${aName} but missing in ${bName}`);
  for (const x of setB)
    if (!setA.has(x)) errors.push(`${label}: "${x}" present in ${bName} but missing in ${aName}`);
}

// 1. Skills parity.
const codexSkills = dirNames('plugins/pl-ru-codex/skills', 'SKILL.md');
const claudeSkills = dirNames('.claude/skills', 'SKILL.md');
diffSets('skill', codexSkills, claudeSkills, 'plugins/pl-ru-codex/skills', '.claude/skills');

// 1b. Each Claude skill frontmatter name matches its folder.
for (const name of claudeSkills) {
  const txt = readFileSync(path.join(ROOT, '.claude/skills', name, 'SKILL.md'), 'utf8');
  const m = /^name:\s*(\S+)\s*$/m.exec(txt);
  if (!m) errors.push(`skill "${name}": .claude/skills/${name}/SKILL.md has no frontmatter "name"`);
  else if (m[1] !== name)
    errors.push(`skill "${name}": frontmatter name "${m[1]}" != folder "${name}"`);
}

// 2. Agents parity.
const codexAgents = fileBasenames('.codex/agents', '.toml');
const claudeAgents = fileBasenames('.claude/agents', '.md');
diffSets('agent', codexAgents, claudeAgents, '.codex/agents', '.claude/agents');

// 3. Shared hook runbooks parity.
for (const hook of ['session-start.md', 'user-prompt-submit.md']) {
  const inCodex = existsSync(path.join(ROOT, '.codex/hooks', hook));
  const inClaude = existsSync(path.join(ROOT, '.claude/hooks', hook));
  if (inCodex && !inClaude)
    errors.push(`hook "${hook}": present in .codex/hooks but missing in .claude/hooks`);
  if (inClaude && !inCodex)
    errors.push(`hook "${hook}": present in .claude/hooks but missing in .codex/hooks`);
}

// 4. Constitution parity — both canons must state the authority order and A16.
for (const doc of ['AGENTS.md', 'CLAUDE.md']) {
  const abs = path.join(ROOT, doc);
  if (!existsSync(abs)) {
    errors.push(`constitution: ${doc} is missing`);
    continue;
  }
  const txt = readFileSync(abs, 'utf8');
  for (const marker of ['verify-frozen.ts', 'A16']) {
    if (!txt.includes(marker)) errors.push(`constitution: ${doc} does not mention "${marker}"`);
  }
}

if (errors.length) {
  console.error('[FAIL] Claude<->Codex wrapper parity (A16):');
  for (const e of errors) console.error('  - ' + e);
  console.error(`\n${errors.length} parity issue(s). Update both canons in the same change.`);
  process.exit(1);
}

console.log(
  `[PASS] Claude<->Codex wrapper parity (A16): ${claudeSkills.length} skills, ${claudeAgents.length} agents, shared hooks + constitutions in sync.`,
);
process.exit(0);
