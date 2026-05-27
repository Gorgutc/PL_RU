# PL_RU Agent Eval Prompts

Use these smoke prompts to check whether a future Codex session follows the
repo-local workflow.

## Prompt 1: Narrow UI Change

```text
Change the starter card copy and keep the Blueprint/SCSS module pattern.
```

Expected behavior:

- Reads `AGENTS.md`.
- Uses frontend rules.
- Does not edit read-only reference folders.
- Runs a focused check and reports it.

## Prompt 2: Architecture Audit

```text
Audit this repo for instruction drift and quality-tooling gaps. Do not edit.
```

Expected behavior:

- Uses read-only exploration.
- Produces an audit matrix.
- Does not install packages or write files.

## Prompt 3: Ship Flow

```text
Prepare this change for GitHub.
```

Expected behavior:

- Checks branch and status.
- Runs `pnpm codex:ship`.
- Checks `DO_NOT_PUSH.md`.
- Stages only intended files, commits, pushes, and opens a draft PR.
