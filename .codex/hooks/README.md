# PL_RU Codex Hook Runbook

These files describe deterministic hook behavior for environments that support
repo-local hooks. They are not executable by themselves.

- `session-start.md`: what a fresh Codex session should read first.
- `user-prompt-submit.md`: when to trigger orchestration or focused skills.

If an environment does not load these hooks, `AGENTS.md` and
`docs/agent/bootstrap.md` remain the fallback.
