# PL_RU Claude Hook Runbook

These files describe deterministic session behavior for Claude Code, mirroring
`.codex/hooks/`. They are runbooks, not executable hooks by themselves — apply
them manually (or wire them into `.claude/settings.json` hooks if desired).

- `session-start.md`: what a fresh Claude session should read first.
- `user-prompt-submit.md`: when to trigger orchestration or focused skills.

Both canons stay in sync (parity guard A16). If an environment does not load
these, `CLAUDE.md` / `AGENTS.md` and `docs/agent/bootstrap.md` remain the fallback.
