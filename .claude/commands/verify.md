---
description: Прогнать frozen-верификатор PL_RU (и быстрый quality-гейт) и отчитаться PASS/FAIL.
allowed-tools: Bash
---

Запусти `pnpm verify` (это `tsx verify-frozen.ts`, правила A1..A16). При необходимости
добавь `pnpm quality:fast`. Отчитайся PASS/FAIL по каждому затронутому правилу с
конкретными путями. Не исправляй молча — покажи провалы и предложи минимальные фиксы.
