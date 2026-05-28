# PL_RU Codex Bootstrap

Use this when starting a new Codex session in this repository.

1. Read `AGENTS.md`.
2. Read `docs/agent/frozen-decisions.md` when the task may touch Header,
   shared UI contracts, quality tooling, or instructions.
3. Check branch and status with `git status --short --branch`.
4. Identify whether the task is narrow or broad.
5. For narrow frontend work, use `pl-ru-frontend-rules`.
6. For broad audits or instruction/tooling changes, use
   `docs/agent/orchestration.md` and the audit roles listed there.
7. Treat `.codex/` as a convenience mirror, not the source of truth.
8. Before delivery, run the appropriate quality command and report failures.
9. End completed work with a concise handoff summary so Codex Memories can carry
   the task context into future sessions.
