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

## GitHub Defaults

- Repository: `Gorgutc/PL_RU`.
- Base branch: `main`.
- Work branch prefix: `codex/`.
- Prefer draft PRs unless the user explicitly asks for a ready PR.
- Use the GitHub connector for PR metadata and PR creation when possible; use local `git` for branch, commit, and push.

## Subagents

Codex subagents are not an automatic replacement for Claude `/ship`. Spawn parallel subagents only when the user explicitly asks for parallel agent work. Otherwise use `$pl-ru-spec-guardian`, `$pl-ru-quality-gate`, and `pnpm codex:ship` as the standard local gate.

This skill replaces the former Claude command `.claude/commands/ship.md`.
