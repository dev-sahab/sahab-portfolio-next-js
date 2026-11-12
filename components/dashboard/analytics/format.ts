export type ValueFormat = 'number' | 'percent' | 'duration' | 'decimal'

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat('en-US')

export function formatValue(value: number, format: ValueFormat = 'number', short = false) {
  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(1)}%`
    case 'duration': {
      const m = Math.floor(value / 60)
      const s = Math.round(value % 60)
      return m ? `${m}m ${s}s` : `${s}s`
    }
    case 'decimal':
      return value.toFixed(1)
    default:
      return short && value >= 10_000 ? compact.format(value) : whole.format(Math.round(value))
  }
}

/** "Mar 3" from an ISO date (UTC, so server and browser agree). */
export function shortDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))
}

/** % change vs previous; null when there's no previous value to compare. */
export function change(current: number, previous: number) {
  if (!previous) return null
  return (current - previous) / previous
}
