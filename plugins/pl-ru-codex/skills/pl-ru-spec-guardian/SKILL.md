---
name: pl-ru-spec-guardian
description: Use before accepting PL_RU TSX, SCSS, config, or architecture changes to validate them against AGENTS.md and verify-frozen.ts.
---

# PL_RU Spec Guardian

Validate a proposed or implemented change against the frozen architecture. Read `AGENTS.md`, `verify-frozen.ts`, and the changed files. Do not edit files.

## Checklist

- A1: no Tailwind imports, class conventions, config files, or dependencies.
- A2: no CSS-in-JS, styled-components, emotion, stitches, vanilla-extract, or linaria.
- A3: no `package-lock.json` or `yarn.lock`.
- A4: `src/styles/_tokens.scss` exists and owns raw style values.
- A5: no inline hex outside the files explicitly allowed by `verify-frozen.ts`.
- A6: no `localStorage` or `sessionStorage` in `src/`.
- A7: no Blueprint internal-path imports.
- A8: no `px` for `font-size` in SCSS.
- Component co-location remains `src/components/<Name>/<Name>.tsx` plus `<Name>.module.scss`.
- Images have alt text or use `next/image` appropriately.
- New TypeScript code avoids `any`; use `unknown` and narrow at boundaries.
- Existing components, Blueprint primitives, tokens, helpers, and frozen visual
  contracts are reused before adding new abstractions.
- Any mismatch with the current task brief, frozen contract, or reference
  screenshot is FAIL until fixed and rechecked.

## Output

Return either:

```text
spec-guardian: PASS
- A1: no Tailwind in package.json
- A7: Blueprint imports use package roots
```

or:

```text
spec-guardian: FAIL
- A5: inline hex at src/components/Foo/Foo.module.scss:18; add a token instead
```

> The Claude mirror of this skill is .claude/skills/pl-ru-spec-guardian/SKILL.md - keep both canons in sync (parity guard A16).
