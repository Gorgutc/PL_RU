import htmlhint from 'htmlhint';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const { HTMLHint } = htmlhint;
const excluded = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}.lighthouseci${path.sep}`,
  `${path.sep}coverage${path.sep}`,
  `${path.sep}jscpd-report${path.sep}`,
  `${path.sep}playwright-report${path.sep}`,
  `${path.sep}reports${path.sep}`,
  `${path.sep}test-results${path.sep}`,
  `${path.sep}Blueprints_lib${path.sep}`,
  `${path.sep}Osiris_ref${path.sep}`,
  path.join('plugins', 'pl-ru-codex', 'skills', 'blueprint-design') + path.sep,
  path.join('plugins', 'pl-ru-codex', 'skills', 'osiris-design') + path.sep,
];

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = path.relative(root, abs);
    if (excluded.some((part) => abs.includes(part) || rel.startsWith(part))) {
      continue;
    }
    if (entry.isDirectory()) {
      await walk(abs, out);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      out.push(abs);
    }
  }
  return out;
}

const htmlFiles = await walk(root);

if (htmlFiles.length === 0) {
  console.log('htmlhint: no HTML files in lint scope');
  process.exit(0);
}

const config = JSON.parse(await readFile(path.join(root, '.htmlhintrc'), 'utf8'));
let failures = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const messages = HTMLHint.verify(html, config);
  if (messages.length > 0) {
    failures += messages.length;
    for (const item of messages) {
      const rel = path.relative(root, file);
      console.error(`${rel}:${item.line}:${item.col} ${item.type} ${item.message}`);
    }
  }
}

if (failures > 0) {
  console.error(`htmlhint: ${failures} issue(s)`);
  process.exit(1);
}

console.log(`htmlhint: ${htmlFiles.length} file(s) passed`);
