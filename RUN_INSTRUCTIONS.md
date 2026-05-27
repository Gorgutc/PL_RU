# PL_RU Run Instructions

Use pnpm only.

## Start

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

## Verify

```bash
pnpm quality:fast
pnpm quality:deep
pnpm quality:all
pnpm codex:ship
```

## Codex Bootstrap

1. Read `AGENTS.md`.
2. Check `git status --short --branch`.
3. For broad work, read `docs/agent/orchestration.md`.
4. Use repo-local skills in `plugins/pl-ru-codex/skills/`.
5. Do not edit read-only reference folders.
6. Before commit/push, run `pnpm codex:ship` and check `DO_NOT_PUSH.md`.
