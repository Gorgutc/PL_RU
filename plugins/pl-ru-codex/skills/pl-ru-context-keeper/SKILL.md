---
name: pl-ru-context-keeper
description: Use when a PL_RU task needs a small read-only slice of the codebase, such as current layout theme setup, available tokens, or a component's existing structure.
---

# PL_RU Context Keeper

Use read-only commands such as `rg`, `rg --files`, `Get-Content`, and `git show` to return the smallest useful file slice. Do not edit files, install packages, or call network services from this skill.

Return:

- paths with line numbers when possible
- short snippets only when they are necessary
- no whole file over 80 lines unless explicitly requested
- a concise summary under 300 words

This skill replaces the former Claude agent `.claude/agents/ts-context-keeper.md`.
