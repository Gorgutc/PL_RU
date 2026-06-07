---
name: pl-ru-session-bootstrap
description: Use at the start of substantial PL_RU work to load the canonical repo context, branch/status, and orchestration rules before editing.
---

# PL_RU Session Bootstrap

Use this before substantial PL_RU tasks, especially audits, refactors,
instruction changes, quality-tooling changes, or GitHub delivery.

## Steps

1. Read `AGENTS.md`.
2. Do a quick Memories pass before deep repo work: use the provided memory
   summary, then search the session memory index for PL_RU/task keywords and
   open only the directly relevant notes. Codex memory lives at
   `~/.codex/memories/MEMORY.md`; Claude memory lives at
   `.claude/projects/<project>/memory/MEMORY.md`.
3. Check `git status --short --branch`.
4. Confirm the source of truth order:
   `verify-frozen.ts > current user request > AGENTS.md = CLAUDE.md > skills (.claude/skills/** = plugins/pl-ru-codex/skills/**) > design references`.
5. If the task touches UI or source code, use `/pl-ru-frontend-rules`.
6. If the task is broad, use `/pl-ru-audit-orchestrator`.
7. Always raise the applicable PL_RU subagents before delivery when subagent
   tooling is available. UI work needs visual QA, code work needs
   code-quality/readability/reusability/optimization review, source/UI work
   needs component-reuse review, source work needs duplicate/deadwood review,
   and frozen/docs/skills/hooks work needs frozen or instruction-drift review.
8. For UI work, visual QA must use pixel-level screenshot comparison against
   available reference PNGs plus DOM/CSS metric checks.
9. Treat any mismatch with the current task brief, frozen contract, or
   reference screenshot as FAIL until fixed and rechecked.
10. Treat `.codex/` and `docs/agent/` as runbooks, not higher authority.
11. Do not edit read-only reference folders.

## Output

Return a concise bootstrap summary:

```text
bootstrap: ready
- branch: codex/example
- status: clean
- task class: broad audit
- next skill: pl-ru-audit-orchestrator
```
