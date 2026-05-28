import { createHash } from 'node:crypto';
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';

export const ROOT = process.cwd();
export const STATE_DIR = path.join(ROOT, '.codex-refs-baseline');
export const REFERENCE_PATHS = [
  'Blueprints_lib',
  'Osiris_ref',
  path.join('plugins', 'pl-ru-codex', 'skills', 'blueprint-design'),
  path.join('plugins', 'pl-ru-codex', 'skills', 'osiris-design'),
];

export function toPosix(value) {
  return value.split(path.sep).join('/');
}

export function walkReferenceFiles(dir, out = []) {
  let entries = [];
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkReferenceFiles(filePath, out);
    else out.push(filePath);
  }
  return out;
}

export function manifestHash(absDir) {
  const rels = walkReferenceFiles(absDir)
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

export function referenceStateName(ref) {
  return toPosix(ref).replaceAll('/', '-');
}
