import { formatValue, type ValueFormat } from './format'

interface BarListProps {
  title: string
  rows: { label: string; value: number }[]
  valueLabel: string
  format?: ValueFormat
  empty?: string
}

/** Ranked list with a thin magnitude bar behind each row (one hue: magnitude, not identity). */
export default function BarList({ title, rows, valueLabel, format = 'number', empty = 'No data for this period yet.' }: BarListProps) {
  const max = Math.max(1, ...rows.map((r) => r.value))
  return (
    <div className="an-card">
      <div className="an-card__head">
        <h3>{title}</h3>
        <span>{valueLabel}</span>
      </div>
      {rows.length ? (
        <ol className="an-bars">
          {rows.map((row) => (
            <li key={row.label}>
              <span className="an-bars__fill" style={{ width: `${(row.value / max) * 100}%` }} aria-hidden="true" />
              <span className="an-bars__label" title={row.label}>
                {row.label}
              </span>
              <span className="an-bars__value">{formatValue(row.value, format)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="an-empty">{empty}</p>
      )}
    </div>
  )
}
