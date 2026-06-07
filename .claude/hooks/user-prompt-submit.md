# User Prompt Submit Hook (Claude)

Mirror of `.codex/hooks/user-prompt-submit.md` — keep both canons in sync (parity guard A16).

Classify the prompt before acting:

- Narrow code/UI change: inspect local pattern, then apply frontend rules.
- Project-wide audit: use read-only orchestration before implementation.
- Instruction/skill/hook change: run instruction drift and infra checks.
- Final delivery: use `pl-ru-ship` and run `pnpm codex:ship`.

Always raise the applicable PL_RU subagents before final delivery (spawn via the
Agent tool using `.claude/agents/*`). UI changes require visual QA with
pixel-level screenshot comparison against available reference PNGs plus DOM/CSS
metric checks. Code changes require code-quality/readability/reusability/
optimization review. Source or UI changes require component-reuse review. Source
changes require duplicate/deadwood review. Frozen/docs/skills/hooks changes
require frozen or instruction-drift review.

Do not pass work forward while any required role is failing, while repeated code
or spaghetti coupling remains unresolved, or while the implementation mismatches
the task brief, frozen contract, or available reference screenshot.

If subagents are unavailable, perform the same roles locally and report the
audit matrix.
