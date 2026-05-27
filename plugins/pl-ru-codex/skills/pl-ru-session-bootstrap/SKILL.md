---
name: pl-ru-session-bootstrap
description: Use at the start of substantial PL_RU work to load the canonical repo context, branch/status, and orchestration rules before editing.
---

# PL_RU Session Bootstrap

Use this before substantial PL_RU tasks, especially audits, refactors,
instruction changes, quality-tooling changes, or GitHub delivery.

## Steps

1. Read `AGENTS.md`.
2. Check `git status --short --branch`.
3. Confirm the source of truth order:
   `verify-frozen.ts > current user request > AGENTS.md > plugins/pl-ru-codex/skills/**`.
4. If the task touches UI or source code, use `$pl-ru-frontend-rules`.
5. If the task is broad, use `$pl-ru-audit-orchestrator`.
6. Treat `.codex/` and `docs/agent/` as runbooks, not higher authority.
7. Do not edit read-only reference folders.

## Output

Return a concise bootstrap summary:

```text
bootstrap: ready
- branch: codex/example
- status: clean
- task class: broad audit
- next skill: pl-ru-audit-orchestrator
```
