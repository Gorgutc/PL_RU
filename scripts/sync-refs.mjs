#!/usr/bin/env node
/**
 * sync-refs.mjs
 *
 * Cross-platform Codex replacement for the old Claude SessionStart hook.
 * It asserts reference folders exist and records a per-session manifest hash
 * for read-only references so scripts/verify-reference.js can detect drift.
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  REFERENCE_PATHS,
  ROOT,
  STATE_DIR,
  manifestHash,
  referenceStateName,
  toPosix,
  walkReferenceFiles,
} from './lib/reference-manifest.mjs';

mkdirSync(STATE_DIR, { recursive: true });
console.log(`[sync-refs] root=${ROOT}`);

let failed = false;
for (const ref of REFERENCE_PATHS) {
  const abs = path.join(ROOT, ref);
  if (!existsSync(abs)) {
    console.log(`[sync-refs] FAIL: reference folder missing: ${toPosix(ref)}`);
    failed = true;
    continue;
  }
  const files = walkReferenceFiles(abs);
  const hash = manifestHash(abs);
  writeFileSync(path.join(STATE_DIR, `${referenceStateName(ref)}.sha256`), `${hash}\n`, 'utf8');
  console.log(`[sync-refs] ${toPosix(ref)}: ${files.length} files, baseline=${hash.slice(0, 12)}`);
}

console.log(`[sync-refs] READ-ONLY references:
  Blueprints_lib — Palantir Blueprint monorepo reference.
  Osiris_ref — OSIRIS dashboard reference.
  plugins/pl-ru-codex/skills/blueprint-design — Blueprint design-system skill.
  plugins/pl-ru-codex/skills/osiris-design — OSIRIS design-system skill.
  Never edit these; use them as read-only references.`);

process.exit(failed ? 1 : 0);
