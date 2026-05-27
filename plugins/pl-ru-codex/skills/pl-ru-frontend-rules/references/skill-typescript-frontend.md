# Skill: TypeScript frontend

Apply these checks to every TSX file touched in this repo.

## Strictness

- `tsconfig.json` is `"strict": true`. No `any` in new code. If a third-party lib has weak types, narrow at the boundary, not deep in the codebase.
- Prefer `unknown` over `any` when you must accept arbitrary input, then narrow.
- Prefer type-only imports: `import type { ... }`.

## File organisation

- One default export per file (component) or zero (utility file with named exports).
- Co-locate types with the consumer if they're internal; export from `src/lib/types/` if shared.
- Index re-exports are allowed for `src/components/<Name>/index.ts` if there's a benefit; otherwise import the component file directly.

## Naming

- Components: PascalCase (`ExampleCard`).
- Hooks: camelCase starting with `use` (`useFocusTrap`).
- Files: match the symbol (`ExampleCard.tsx`, `useFocusTrap.ts`).
- Constants: SCREAMING_SNAKE only for true compile-time constants. UI labels live in tokens / i18n.

## React 19 idioms

- Use the `use` hook for promises in Server Components.
- Prefer `'use client'` only when actually needed (event handlers, refs, state, browser APIs).
- Never `useEffect` for data fetching in Server Components — fetch at top level.
- Server Actions over fetch-from-client when the operation is a mutation owned by your own backend.
