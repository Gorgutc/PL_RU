---
description: Подготовить PL_RU к GitHub — полный гейт, затем коммит/push/draft PR.
allowed-tools: Bash, Read, Grep, Glob
---

# /ship

Выполни навык `pl-ru-ship` (`.claude/skills/pl-ru-ship/SKILL.md`).
Кратко: убедись, что ветка — feature/`codex/*`; `git status` без лишнего; прогони
`pnpm codex:ship` (полный гейт); проверь `DO_NOT_PUSH.md`; застейдж только нужное;
коммит с кратким сообщением; push; открой draft PR в `main` (после подтверждения
пользователя). Перед доставкой все применимые PL_RU субагенты должны вернуть PASS.
