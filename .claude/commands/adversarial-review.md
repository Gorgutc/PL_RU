---
description: Состязательное (adversarial) ревью текущего диффа через Codex; фолбэк — Claude /code-review high.
allowed-tools: Bash, Read, Grep, Glob
---

Запусти состязательное ревью PL_RU-диффа (Claude-эквивалент Codex `/codex:adversarial-review`).

1. Собери дифф: `git diff origin/main...HEAD` (плюс незакоммиченное рабочее дерево).
2. Делегируй Codex: используй навык `codex:rescue` (или `codex` CLI) с задачей
   «adversarial review» — искать баги, нарушения frozen-контрактов
   (`verify-frozen.ts`, `docs/agent/frozen-decisions.md`), несоответствия ТЗ и
   референс-PNG, дубли/проблемы переиспользования, a11y и производительность.
3. Если Codex недоступен — выполни Claude `/code-review high`.
4. Верни находки с путями и серьёзностью. Ничего не исправляй без подтверждения
   пользователя, если он явно не попросил «исправить».
