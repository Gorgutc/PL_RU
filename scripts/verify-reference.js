#!/usr/bin/env node
/**
 * verify-reference.js
 *
 * Codex reference guard. Verifies that read-only reference folders have not
 * drifted since `pnpm refs:sync` recorded their manifest hashes.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
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

const results = [];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ` — ${detail}` : ''}`);
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

function checkGitClean(ref) {
  const displayRef = toPosix(ref);
  try {
    const out = execFileSync('git', ['status', '--porcelain', '--', displayRef], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    const drift = out.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('??'));
    if (drift.length === 0) {
      record(`git-clean:${displayRef}`, true);
      return true;
    }
    record(
      `git-clean:${displayRef}`,
      false,
      `tracked changes detected:\n${drift.join('\n')}\n  remediate: restore the reference folder from Git`,
    );
    return false;
  } catch (error) {
    record(`git-clean:${displayRef}`, false, `git status failed: ${error.message}`);
    return false;
  }
}

function checkBaseline(ref) {
  const displayRef = toPosix(ref);
  const baselinePath = path.join(STATE_DIR, `${stateName(ref)}.sha256`);
  if (!existsSync(baselinePath)) {
    record(
      `baseline:${displayRef}`,
      true,
      'no baseline file; run pnpm refs:sync to enable manifest checking',
    );
    return true;
  }
  const expected = readFileSync(baselinePath, 'utf8').trim();
  const actual = manifestHash(path.join(ROOT, ref));
  if (expected === actual) {
    record(`baseline:${displayRef}`, true, `sha=${actual.slice(0, 12)}`);
    return true;
  }
  record(
    `baseline:${displayRef}`,
    false,
    `manifest changed: expected ${expected.slice(0, 12)}, got ${actual.slice(0, 12)}`,
  );
  return false;
}

console.log('=== verify-reference.js ===');
for (const ref of REFS) {
  const abs = path.join(ROOT, ref);
  if (!existsSync(abs)) {
    record(`exists:${toPosix(ref)}`, false, 'folder missing');
    continue;
  }
  checkGitClean(ref);
  checkBaseline(ref);
}

const pass = results.filter((result) => result.pass).length;
const fail = results.length - pass;
console.log(`\nSUMMARY: ${pass}/${results.length} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
