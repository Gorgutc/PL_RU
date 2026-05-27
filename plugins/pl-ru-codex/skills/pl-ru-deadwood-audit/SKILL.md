---
name: pl-ru-deadwood-audit
description: Use for read-only PL_RU dead-code, duplicate-code, dependency, and cleanup candidate audits.
---

# PL_RU Deadwood Audit

Use read-only commands such as `rg`, `rg --files`, `pnpm check:dead`, and
`pnpm check:duplicates` when appropriate. Do not delete code from this skill.

## Scope

Include:

- `src/**`
- `tests/**`
- `scripts/**`
- root configs
- non-reference repo-local skills

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
