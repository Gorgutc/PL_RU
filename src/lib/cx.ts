/**
 * Join truthy class names into a single `className` string.
 * Shared helper so components don't each re-declare their own `cx`.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
