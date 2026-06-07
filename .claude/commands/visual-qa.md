---
description: Пиксельное визуальное QA UI-изменения против референс-PNG + DOM/CSS-метрики.
allowed-tools: Bash, Read, Grep, Glob
---

Выполни навык `pl-ru-visual-qa` (`.claude/skills/pl-ru-visual-qa/SKILL.md`) или подними
субагента `visual_qa_guardian` (`.claude/agents/visual_qa_guardian.md`).
Сними Playwright-скриншоты по нужным viewport и состояниям, сравни попиксельно с
закоммиченными референсами (`tests/visual-qa/...`) с явным толерансом, дополни
DOM/CSS-метриками. Финальные actual/diff-PNG держи под игнорируемым `reports/visual-qa/`.
Верни `visual-qa: PASS/FAIL` с референсами, viewport, состояниями, толерансом,
областями расхождений и метриками.
