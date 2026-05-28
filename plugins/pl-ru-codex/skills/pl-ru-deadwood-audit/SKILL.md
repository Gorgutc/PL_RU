---
name: pl-ru-deadwood-audit
description: Use for read-only PL_RU dead-code, duplicate-code, dependency, and cleanup candidate audits.
---

# PL_RU Deadwood Audit

Use read-only commands such as `rg`, `rg --files`, `pnpm check:dead`, and
`pnpm check:duplicates` when appropriate. Do not delete code from this skill.
Repeated logic, repeated SCSS structures, oversized modules, and spaghetti
coupling are blockers until fixed, extracted, or explicitly accepted by the
current user request.

## Scope

Include:

- `src/**`
- `tests/**`
- `scripts/**`
- root configs
- non-reference repo-local skills

Also inspect `.jscpd.json` and `knip.json` when the task changes quality
tooling or duplicate/dead-code gates.

Exclude:

- `Blueprints_lib/**`
- `Osiris_ref/**`
- `plugins/pl-ru-codex/skills/blueprint-design/**`
- `plugins/pl-ru-codex/skills/osiris-design/**`

## Output

Report evidence, confidence, and recommended action:

- keep
- fix
- remove
- archive
- needs user decision
