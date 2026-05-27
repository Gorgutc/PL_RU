#!/usr/bin/env node
/**
 * sync-refs.mjs
 *
 * Cross-platform Codex replacement for the old Claude SessionStart hook.
 * It asserts reference folders exist and records a per-session manifest hash
 * for read-only references so scripts/verify-reference.js can detect drift.
 */

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd();
const STATE_DIR = path.join(ROOT, '.codex-refs-baseline');
const REFS = [
  'Blueprints_lib',
  'Osiris_ref',
  path.join('plugins', 'pl-ru-codex', 'skills', 'blueprint-design'),
  path.join('plugins', 'pl-ru-codex', 'skills', 'osiris-design'),
];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function walk(dir, out = []) {
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(filePath, out);
    else out.push(filePath);
  }
  return out;
}

function manifestHash(absDir) {
  const rels = walk(absDir)
    .map((filePath) => {
      const rel = toPosix(path.relative(absDir, filePath));
      const stats = statSync(filePath);
      return `./${rel} ${stats.size}`;
    })
    .sort();
  return createHash('sha256')
    .update(`${rels.join('\n')}\n`)
    .digest('hex');
}

function stateName(ref) {
  return toPosix(ref).replaceAll('/', '-');
}

mkdirSync(STATE_DIR, { recursive: true });
console.log(`[sync-refs] root=${ROOT}`);

let failed = false;
for (const ref of REFS) {
  const abs = path.join(ROOT, ref);
  if (!existsSync(abs)) {
    console.log(`[sync-refs] FAIL: reference folder missing: ${toPosix(ref)}`);
    failed = true;
    continue;
  }
  const files = walk(abs);
  const hash = manifestHash(abs);
  writeFileSync(path.join(STATE_DIR, `${stateName(ref)}.sha256`), `${hash}\n`, 'utf8');
  console.log(`[sync-refs] ${toPosix(ref)}: ${files.length} files, baseline=${hash.slice(0, 12)}`);
}

console.log(`[sync-refs] READ-ONLY references:
  Blueprints_lib — Palantir Blueprint monorepo reference.
  Osiris_ref — OSIRIS dashboard reference.
  plugins/pl-ru-codex/skills/blueprint-design — Blueprint design-system skill.
  plugins/pl-ru-codex/skills/osiris-design — OSIRIS design-system skill.
  Never edit these; use them as read-only references.`);

process.exit(failed ? 1 : 0);
