# Session Start Hook

1. Read `AGENTS.md`.
2. Check `git status --short --branch`.
3. If the task is broad, read `docs/agent/orchestration.md`.
4. If the task touches UI/code, use `plugins/pl-ru-codex/skills/pl-ru-frontend-rules/SKILL.md`.
5. Always raise the applicable PL_RU subagents before delivery when subagent
   tooling is available: code quality, component-reuse, duplicate/deadwood,
   visual QA for UI, frozen/instruction drift for rules, and ship readiness.
6. UI work must include visual QA with pixel-level screenshot comparison against
   available reference PNGs plus DOM/CSS metric checks.
7. Treat any mismatch with the task brief, frozen contract, or reference
   screenshot as FAIL until fixed and rechecked.
8. Do not run `pnpm refs:sync` unless reference folders are needed.
9. Never edit read-only reference folders.
