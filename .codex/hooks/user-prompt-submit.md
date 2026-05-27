# User Prompt Submit Hook

Classify the prompt before acting:

- Narrow code/UI change: inspect local pattern, then apply frontend rules.
- Project-wide audit: use read-only orchestration before implementation.
- Instruction/skill/hook change: run instruction drift and Codex infra checks.
- Final delivery: use `pl-ru-ship` and run `pnpm codex:ship`.

If subagents are unavailable, perform the same roles locally and report the
audit matrix.
