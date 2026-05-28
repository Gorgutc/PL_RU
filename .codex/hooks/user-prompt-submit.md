# User Prompt Submit Hook

Classify the prompt before acting:

- Narrow code/UI change: inspect local pattern, then apply frontend rules.
- Project-wide audit: use read-only orchestration before implementation.
- Instruction/skill/hook change: run instruction drift and Codex infra checks.
- Final delivery: use `pl-ru-ship` and run `pnpm codex:ship`.

Always raise the applicable PL_RU subagents before final delivery when subagent
tooling is available. UI changes require visual QA with pixel-level screenshot
comparison against available reference PNGs plus DOM/CSS metric checks. Code
changes require code-quality/readability/reusability/optimization review.

If subagents are unavailable, perform the same roles locally and report the
audit matrix.
