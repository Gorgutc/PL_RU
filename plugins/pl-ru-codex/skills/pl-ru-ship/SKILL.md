---
name: pl-ru-ship
description: Use when preparing PL_RU changes for GitHub: run the Codex quality workflow, verify reference folders, check DO_NOT_PUSH.md, then commit, push, and open a draft PR.
---

# PL_RU Ship

Use this for finished PL_RU work before pushing to GitHub.

## Workflow

1. Confirm the current branch is a task branch named `codex/*`.
2. Check `git status --short --branch` and make sure no unrelated user changes are included.
3. Run `pnpm codex:ship`.
4. Check `DO_NOT_PUSH.md` before staging.
5. Stage only intended files, commit with a concise message, push the branch, and open a draft PR.

`pnpm codex:ship` is the full local gate. It includes reference checks, quality
checks, browser/a11y checks, production dependency audit, and the frozen
verifier.

## GitHub Defaults

- Repository: `Gorgutc/PL_RU`.
- Base branch: `main`.
- Work branch prefix: `codex/`.
- Prefer draft PRs unless the user explicitly asks for a ready PR.
- Use the GitHub connector for PR metadata and PR creation when possible; use local `git` for branch, commit, and push.

## Subagents

Before shipping, run every applicable PL_RU subagent or local fallback role.
Delivery is blocked until each required role returns PASS after fixes. At
minimum, source changes need code-quality, component-reuse, and
duplicate/deadwood review; UI changes need pixel-level visual QA; frozen/docs/
skills/hooks changes need frozen or instruction-drift review. Do not pass work
forward while the final diff mismatches the task brief, frozen contract, or
available reference screenshots.

This skill replaces the former Claude command `.claude/commands/ship.md`.
