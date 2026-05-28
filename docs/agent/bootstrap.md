# PL_RU Codex Bootstrap

Use this when starting a new Codex session in this repository.

1. Read `AGENTS.md`.
2. Do a quick Memories pass: use the provided memory summary, search
   `~/.codex/memories/MEMORY.md` for PL_RU/task keywords, then open only the
   directly relevant rollout summaries or skill notes.
3. Read `docs/agent/frozen-decisions.md` when the task may touch Header,
   shared UI contracts, quality tooling, or instructions.
4. Check branch and status with `git status --short --branch`.
5. Identify whether the task is narrow or broad.
6. For narrow frontend work, use `pl-ru-frontend-rules`.
7. For broad audits or instruction/tooling changes, use
   `docs/agent/orchestration.md` and the audit roles listed there.
8. Always raise the applicable PL_RU subagents before delivery. UI work needs
   visual QA, code work needs code-quality/readability/reusability/optimization
   review, source/UI work needs component-reuse review, source work needs
   duplicate/deadwood review, and frozen/docs/skills/hooks work needs frozen or
   instruction-drift review.
9. For UI work, visual QA must use pixel-level screenshot comparison against
   available reference PNGs plus DOM/CSS metric checks.
10. Treat any mismatch with the current task brief, frozen contract, or
    reference screenshot as FAIL until fixed and rechecked.
11. Treat `.codex/` as a convenience mirror, not the source of truth.
12. Before delivery, run the appropriate quality command and report failures.
13. End completed work with a concise handoff summary so Codex Memories can carry
    the task context into future sessions.
