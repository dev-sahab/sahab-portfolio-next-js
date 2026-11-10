/** Joins truthy class names — a tiny local `clsx` so v8 has no new dependency. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
