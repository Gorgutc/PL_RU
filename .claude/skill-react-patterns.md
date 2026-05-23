# Skill: React patterns

## State
- Lift state up only when 2+ siblings need it. Don't pre-lift.
- For derived state: compute in render, don't `useEffect + setState`.
- For server state: use Server Components or React Query / SWR — never `useEffect(fetch)`.
- URL is state: prefer `searchParams` over local state for things users should be able to share / bookmark.

## Effects
- Each `useEffect` does one thing. Multi-purpose effects are a smell.
- Cleanup is mandatory if the effect subscribes / observes / sets a timer.
- Dependency array: list every reactive value. Disabling the lint rule is almost always a bug — narrow the dep instead.

## Composition
- Children > render props > HOC, in that order.
- Prefer the slot pattern (`<Card><Card.Header /></Card>`) over `header={<X />}` props for layout components.

## Performance
- `React.memo` only after profiling; default is no memo.
- `useMemo` / `useCallback` only when (a) dep array contains stable refs AND (b) downstream consumer is memoised.
- Don't memoise primitives — the comparison costs more than recomputing.

## Forms
- Uncontrolled inputs by default (use `defaultValue` + ref / FormData on submit). Controlled only when you need to react to every keystroke.
- For complex forms reach for `react-hook-form` — but don't add it to the starter; the dashboard project decides.
