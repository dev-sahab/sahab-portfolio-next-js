'use client'

import { useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { formatValue, shortDate, type ValueFormat } from './format'

export interface TrendSeries {
  label: string
  /** CSS color, e.g. var(--chart-1). */
  color: string
  values: number[]
  /** Previous-period comparison: drawn dashed in a neutral ink. */
  compare?: boolean
}

interface TrendChartProps {
  title: string
  dates: string[]
  series: TrendSeries[]
  format?: ValueFormat
  height?: number
}

const PAD = { top: 12, right: 12, bottom: 26, left: 44 }

function niceMax(v: number) {
  if (v <= 0) return 4
  const pow = 10 ** Math.floor(Math.log10(v))
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow * 4 >= v)! * pow
  return step * 4
}

/**
 * Line/area chart over time: one y-axis, 2px lines, area tint on the main
 * series, crosshair + tooltip on hover (and arrow keys when focused), and a
 * table view for screen readers / exact numbers.
 */
export default function TrendChart({ title, dates, series, format = 'number', height = 220 }: TrendChartProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)
  const [hover, setHover] = useState<number | null>(null)
  const gradientId = useId().replace(/:/g, '')

  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const n = dates.length
  const max = useMemo(() => niceMax(Math.max(0, ...series.flatMap((s) => s.values))), [series])
  const plotW = width - PAD.left - PAD.right
  const plotH = height - PAD.top - PAD.bottom
  const x = (i: number) => PAD.left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW)
  const y = (v: number) => PAD.top + plotH - (v / max) * plotH
  const path = (values: number[]) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')
  const main = series.find((s) => !s.compare) ?? series[0]
  const ticks = [0, 1, 2, 3, 4].map((k) => (max / 4) * k)
  const xLabels = n ? [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i) : []

  const indexAt = (clientX: number) => {
    const box = wrap.current!.getBoundingClientRect()
    const rel = Math.min(Math.max(clientX - box.left - PAD.left, 0), plotW)
    return n <= 1 ? 0 : Math.round((rel / plotW) * (n - 1))
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    setHover((h) => Math.min(n - 1, Math.max(0, (h ?? (e.key === 'ArrowLeft' ? n : -1)) + (e.key === 'ArrowLeft' ? -1 : 1))))
  }

  const tipLeft = hover === null ? 0 : x(hover)
  const flip = tipLeft > width * 0.6

  return (
    <figure className="an-chart">
      <figcaption className="an-chart__head">
        <h3>{title}</h3>
        {series.length > 1 && (
          <ul className="an-legend">
            {series.map((s) => (
              <li key={s.label}>
                <span className={`an-legend__swatch${s.compare ? ' is-dashed' : ''}`} style={{ color: s.color }} aria-hidden="true" />
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </figcaption>

      <div
        ref={wrap}
        className="an-chart__plot"
        style={{ height }}
        tabIndex={0}
        role="img"
        aria-label={`${title}. Use left and right arrow keys to read values.`}
        onMouseMove={(e) => setHover(indexAt(e.clientX))}
        onMouseLeave={() => setHover(null)}
        onBlur={() => setHover(null)}
        onKeyDown={onKey}
      >
        <svg width={width} height={height} aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={main.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={main.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} className="an-chart__grid" />
              <text x={PAD.left - 8} y={y(t)} className="an-chart__tick" textAnchor="end" dominantBaseline="middle">
                {formatValue(t, format, true)}
              </text>
            </g>
          ))}
          {xLabels.map((i) => (
            <text key={i} x={x(i)} y={height - 6} className="an-chart__tick" textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
              {shortDate(dates[i])}
            </text>
          ))}
          {n > 1 && <path d={`${path(main.values)}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={`url(#${gradientId})`} />}
          {series.map((s) => (
            <path
              key={s.label}
              d={path(s.values)}
              fill="none"
              stroke={s.compare ? 'var(--muted)' : s.color}
              strokeWidth={2}
              strokeDasharray={s.compare ? '4 4' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} className="an-chart__cross" />
              {series.map((s) => (
                <circle key={s.label} cx={x(hover)} cy={y(s.values[hover] ?? 0)} r={4.5} fill={s.compare ? 'var(--muted)' : s.color} className="an-chart__dot" />
              ))}
            </g>
          )}
        </svg>

        {hover !== null && (
          <div className={`an-tip${flip ? ' is-flipped' : ''}`} style={{ left: tipLeft }}>
            <p className="an-tip__date">{shortDate(dates[hover])}</p>
            {series.map((s) => (
              <p key={s.label} className="an-tip__row">
                <span className={`an-legend__swatch${s.compare ? ' is-dashed' : ''}`} style={{ color: s.compare ? 'var(--muted)' : s.color }} aria-hidden="true" />
                {s.label}
                <strong>{formatValue(s.values[hover] ?? 0, format)}</strong>
              </p>
            ))}
          </div>
        )}
      </div>

      <details className="an-chart__table">
        <summary>Show as table</summary>
        <div className="an-table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Date</th>
                {series.map((s) => (
                  <th key={s.label} scope="col">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((d, i) => (
                <tr key={d}>
                  <td>{shortDate(d)}</td>
                  {series.map((s) => (
                    <td key={s.label}>{formatValue(s.values[i] ?? 0, format)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}
