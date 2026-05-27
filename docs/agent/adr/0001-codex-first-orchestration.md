# ADR 0001: Codex-First Orchestration

## Status

Accepted.

## Context

PL_RU migrated from Claude-oriented instructions to Codex-oriented repo
guardrails. The reliable entrypoints in this environment are `AGENTS.md`,
repo-local plugin skills, pnpm scripts, and explicit verification commands.

## Decision

Keep `AGENTS.md` as the short canonical entrypoint. Keep
`plugins/pl-ru-codex` as the repo-local skill layer. Add `docs/agent/*` and
`.codex/*` as reproducible orchestration specs and fallback docs, but do not let
them outrank `verify-frozen.ts`, the current user request, or `AGENTS.md`.

## Consequences

Future sessions get a clear bootstrap path even if plugin discovery is partial.
Automatic agent orchestration cannot be guaranteed across every environment, so
the workflow is encoded in multiple visible places.
