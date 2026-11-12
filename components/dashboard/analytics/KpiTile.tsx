import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { change, formatValue, type ValueFormat } from './format'

interface KpiTileProps {
  label: string
  value: number
  previous?: number
  format?: ValueFormat
  /** For metrics where lower is better (e.g. search position). */
  lowerIsBetter?: boolean
  hint?: string
}

/** Headline number with its change vs the previous period (arrow + word, never colour alone). */
export default function KpiTile({ label, value, previous, format = 'number', lowerIsBetter, hint }: KpiTileProps) {
  const delta = previous === undefined ? null : change(value, previous)
  const better = delta === null || delta === 0 ? null : lowerIsBetter ? delta < 0 : delta > 0
  const Icon = delta === null || delta === 0 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight

  return (
    <div className="an-kpi">
      <p className="an-kpi__label">{label}</p>
      <p className="an-kpi__value">{formatValue(value, format, true)}</p>
      {previous !== undefined && (
        <p className={`an-kpi__delta${better === null ? '' : better ? ' is-good' : ' is-bad'}`}>
          <Icon aria-hidden="true" />
          {delta === null ? 'No earlier data' : `${Math.abs(delta * 100).toFixed(delta && Math.abs(delta) < 0.1 ? 1 : 0)}% ${delta >= 0 ? 'up' : 'down'}`}
          <span> vs previous period</span>
        </p>
      )}
      {hint && <p className="an-kpi__hint">{hint}</p>}
    </div>
  )
}
