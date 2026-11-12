/** "Mar 3, 2026" — fixed to UTC so server and browser always print the same day. */
export function formatDate(iso: string | undefined, month: 'short' | 'long' = 'short') {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { month, day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date)
}
