import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const checks = [];

function record(name, pass, detail) {
  checks.push({ name, pass, detail });
  const tag = pass ? 'PASS' : 'FAIL';
  console.log(`[${tag}] ${name}${detail ? ` - ${detail}` : ''}`);
}

async function exists(file) {
  try {
    await stat(path.join(root, file));
    return true;
  } catch {
    return false;
  }
}

async function readJson(file) {
  return JSON.parse(await readFile(path.join(root, file), 'utf8'));
}

async function verifyPluginManifest() {
  const manifestPath = 'plugins/pl-ru-codex/.codex-plugin/plugin.json';
  const manifest = await readJson(manifestPath);
  record('plugin manifest exists', manifest.name === 'pl-ru-codex');
  record('plugin manifest points at skills', manifest.skills === './skills/');
  record(
    'plugin default prompts mention bootstrap',
    manifest.interface?.defaultPrompt?.some((line) => line.includes('pl-ru-session-bootstrap')),
  );
}

async function verifyMarketplace() {
  const marketplace = await readJson('.agents/plugins/marketplace.json');
  const plugin = marketplace.plugins?.find((item) => item.name === 'pl-ru-codex');
  record('marketplace lists pl-ru-codex', Boolean(plugin));
  record('marketplace path is local plugin', plugin?.source?.path === './plugins/pl-ru-codex');
}

async function verifySkills() {
  const skillsDir = path.join(root, 'plugins/pl-ru-codex/skills');
  const entries = await readdir(skillsDir, { withFileTypes: true });
  const skillDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const required = [
    'pl-ru-session-bootstrap',
    'pl-ru-audit-orchestrator',
    'pl-ru-context-keeper',
    'pl-ru-frontend-rules',
    'pl-ru-spec-guardian',
    'pl-ru-frozen-decisions',
    'pl-ru-quality-gate',
    'pl-ru-quality-tooling',
    'pl-ru-deadwood-audit',
    'pl-ru-instruction-drift',
    'pl-ru-ship',
    'blueprint-design',
    'osiris-design',
  ];

  for (const name of required) {
    record(`skill exists: ${name}`, skillDirs.includes(name));
    const skillPath = `plugins/pl-ru-codex/skills/${name}/SKILL.md`;
    const agentPath = `plugins/pl-ru-codex/skills/${name}/agents/openai.yaml`;
    const hasSkill = await exists(skillPath);
    record(`skill has SKILL.md: ${name}`, hasSkill);
    if (hasSkill) {
      const body = await readFile(path.join(root, skillPath), 'utf8');
      record(`skill frontmatter name: ${name}`, body.includes(`name: ${name}`));
      record(`skill frontmatter description: ${name}`, body.includes('description: '));
    }
    record(`skill has openai agent metadata: ${name}`, await exists(agentPath));
  }
}

async function verifyDocs() {
  const docs = [
    'docs/agent/bootstrap.md',
    'docs/agent/architecture.md',
    'docs/agent/code_review.md',
    'docs/agent/verification.md',
    'docs/agent/orchestration.md',
    'docs/agent/frozen-decisions.md',
    'docs/agent/archive_policy.md',
    'docs/agent/plan_template.md',
    'docs/agent/quality-tooling.md',
    'docs/agent/evals.md',
    'docs/agent/adr/0001-codex-first-orchestration.md',
    'docs/agent/adr/0002-quality-tooling-stack.md',
  ];
  for (const file of docs) {
    record(`agent doc exists: ${file}`, await exists(file));
  }
}

async function verifyCodexMirror() {
  const files = [
    '.codex/config.toml',
    '.codex/hooks/README.md',
    '.codex/hooks/session-start.md',
    '.codex/hooks/user-prompt-submit.md',
    '.codex/agents/code_deadwood_auditor.toml',
    '.codex/agents/runtime_behavior_mapper.toml',
    '.codex/agents/tech_stack_cartographer.toml',
    '.codex/agents/instruction_drift_auditor.toml',
    '.codex/agents/quality_tooling_architect.toml',
    '.codex/agents/codex_infra_architect.toml',
    '.codex/agents/frozen_decisions_guardian.toml',
  ];
  for (const file of files) {
    record(`codex mirror exists: ${file}`, await exists(file));
  }
}

await verifyPluginManifest();
await verifyMarketplace();
await verifySkills();
await verifyDocs();
await verifyCodexMirror();

const passed = checks.filter((check) => check.pass).length;
const failed = checks.length - passed;
console.log(`\nSUMMARY: ${passed}/${checks.length} PASS, ${failed} FAIL`);
process.exit(failed === 0 ? 0 : 1);
