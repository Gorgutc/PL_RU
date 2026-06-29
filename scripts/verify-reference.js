#!/usr/bin/env node
/**
 * verify-reference.js
 *
 * Codex reference guard. Verifies that read-only reference folders have not
 * drifted since `pnpm refs:sync` recorded their manifest hashes.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import {
  REFERENCE_PATHS,
  ROOT,
  STATE_DIR,
  manifestHash,
  referenceStateName,
  toPosix,
} from './lib/reference-manifest.mjs';

const results = [];
const baseRef = process.env.REFERENCE_BASE_REF ?? 'origin/main';

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ` — ${detail}` : ''}`);
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

function checkUntracked(ref) {
  const displayRef = toPosix(ref);
  try {
    const out = execFileSync(
      'git',
      ['ls-files', '--others', '--exclude-standard', '--', displayRef],
      {
        cwd: ROOT,
        encoding: 'utf8',
      },
    );
    const untracked = out.split('\n').filter((line) => line.trim() !== '');
    if (untracked.length === 0) {
      record(`git-untracked:${displayRef}`, true);
      return true;
    }
    record(
      `git-untracked:${displayRef}`,
      false,
      `untracked reference files detected:\n${untracked.join(
        '\n',
      )}\n  remediate: remove untracked files from the read-only reference folder`,
    );
    return false;
  } catch (error) {
    record(`git-untracked:${displayRef}`, false, `git ls-files failed: ${error.message}`);
    return false;
  }
}

function checkBaseline(ref) {
  const displayRef = toPosix(ref);
  const baselinePath = path.join(STATE_DIR, `${referenceStateName(ref)}.sha256`);
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

function checkBaseDiff(ref) {
  const displayRef = toPosix(ref);
  const diffRange = `${baseRef}...HEAD`;

  try {
    const out = execFileSync(
      'git',
      ['diff', '--name-only', '--diff-filter=ACDMRTUXB', diffRange, '--', displayRef],
      {
        cwd: ROOT,
        encoding: 'utf8',
      },
    );
    const changed = out.split('\n').filter((line) => line.trim() !== '');
    if (changed.length === 0) {
      record(`base-diff:${displayRef}`, true, `base=${baseRef}`);
      return true;
    }
    record(
      `base-diff:${displayRef}`,
      false,
      `read-only reference changed against ${diffRange}:\n${changed.join(
        '\n',
      )}\n  remediate: remove reference-folder changes from the branch`,
    );
    return false;
  } catch (error) {
    record(`base-diff:${displayRef}`, false, `git diff ${diffRange} failed: ${error.message}`);
    return false;
  }
}

console.log('=== verify-reference.js ===');
for (const ref of REFERENCE_PATHS) {
  const abs = path.join(ROOT, ref);
  if (!existsSync(abs)) {
    record(`exists:${toPosix(ref)}`, false, 'folder missing');
    continue;
  }
  checkGitClean(ref);
  checkUntracked(ref);
  checkBaseline(ref);
  checkBaseDiff(ref);
}

const pass = results.filter((result) => result.pass).length;
const fail = results.length - pass;
console.log(`\nSUMMARY: ${pass}/${results.length} PASS, ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
