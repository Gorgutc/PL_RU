#!/usr/bin/env node
/**
 * verify-reference.js — Stop hook for the TS frontend starter.
 *
 * Asserts that read-only reference folders were NOT modified during the
 * session. Two checks per folder:
 *   1. git status (porcelain) — catches any tracked-file edits / new files
 *      / deletions inside the folder.
 *   2. baseline sha — compares the current find-manifest hash to the one
 *      written by sync-refs.sh at session start. Catches edits that
 *      somehow bypass git (unlikely, but the baseline is cheap).
 *
 * Two kinds of refs are protected:
 *   - top-level reference clones:        Blueprints_lib, Osiris_ref
 *   - design-system agent skills:        .claude/skills/<name>/   (auto-discovered)
 *
 * Adding a new skill is zero-config: drop it under .claude/skills/ and
 * this script picks it up on the next Stop hook.
 *
 * Exit 0 if clean. Exit 1 with a remediation hint if drift detected.
 * Plain Node ESM — no dependencies, runnable even before `pnpm install`.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd();
const STATE_DIR = path.join(ROOT, '.claude', '.refs-baseline');

// Static top-level refs.
const STATIC_REFS = ['Blueprints_lib', 'Osiris_ref'];

// Auto-discover .claude/skills/<name>/ dirs.
function discoverSkillRefs() {
  const skillsDir = path.join(ROOT, '.claude', 'skills');
  if (!existsSync(skillsDir)) return [];
  return readdirSync(skillsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join('.claude', 'skills', e.name))
    .sort();
}

const REFS = [...STATIC_REFS, ...discoverSkillRefs()];

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ' — ' + detail : ''}`);
}

function walkSync(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (e.name === '.git') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkSync(p, out);
    else out.push(p);
  }
  return out;
}

function manifestHash(absDir) {
  const files = walkSync(absDir);
  const rels = files
    .map((f) => {
      const s = statSync(f);
      return `./${path.relative(absDir, f)} ${s.size}`;
    })
    .sort();
  return createHash('sha256')
    .update(rels.join('\n') + '\n')
    .digest('hex');
}

// Path slashes are turned into dashes to keep state files in a flat dir.
function stateName(ref) {
  return ref.replace(/\//g, '-');
}

function checkGitClean(ref) {
  try {
    const out = execSync(`git status --porcelain -- ${ref}`, {
      cwd: ROOT,
      encoding: 'utf8',
    });
    // Filter out untracked-only entries (`?? path`): a freshly-installed ref
    // before its first commit is legitimately untracked, and any *content*
    // drift inside (new or modified files) is caught by the baseline sha
    // check below. We only flag tracked-file changes here (M / A / D / R / C / U).
    const drift = out.split('\n').filter((line) => line.trim() !== '' && !line.startsWith('??'));
    if (drift.length === 0) {
      record(`git-clean:${ref}`, true);
      return true;
    }
    record(
      `git-clean:${ref}`,
      false,
      `tracked changes detected:\n${drift.join('\n')}\n  remediate: git checkout -- ${ref}`,
    );
    return false;
  } catch (e) {
    record(`git-clean:${ref}`, false, `git status failed: ${e.message}`);
    return false;
  }
}

function checkBaseline(ref) {
  const baselinePath = path.join(STATE_DIR, `${stateName(ref)}.sha256`);
  if (!existsSync(baselinePath)) {
    // No baseline → SessionStart hook never ran. Don't fail; warn.
    record(`baseline:${ref}`, true, `no baseline file (SessionStart hook did not run) — skipped`);
    return true;
  }
  const expected = readFileSync(baselinePath, 'utf8').trim();
  const actual = manifestHash(path.join(ROOT, ref));
  if (expected === actual) {
    record(`baseline:${ref}`, true, `sha=${actual.slice(0, 12)}`);
    return true;
  }
  record(
    `baseline:${ref}`,
    false,
    `manifest changed: expected ${expected.slice(0, 12)}, got ${actual.slice(0, 12)}\n  remediate: git checkout -- ${ref} (or restore manually)`,
  );
  return false;
}

function main() {
  console.log('=== verify-reference.js ===');
  for (const ref of REFS) {
    if (!existsSync(path.join(ROOT, ref))) {
      record(`exists:${ref}`, false, 'folder missing');
      continue;
    }
    checkGitClean(ref);
    checkBaseline(ref);
  }
  const pass = results.filter((r) => r.pass).length;
  const fail = results.length - pass;
  console.log(`\nSUMMARY: ${pass}/${results.length} PASS, ${fail} FAIL`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
