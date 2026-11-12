'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Monitor, RefreshCw, Smartphone } from 'lucide-react'
import type { PageSpeedData, Strategy } from '@/lib/analytics/pagespeed'

/** Lighthouse bands: 90+ good, 50–89 needs work, under 50 poor (label + colour, never colour alone). */
function band(score: number) {
  if (score >= 90) return { tone: 'good', word: 'Good' }
  if (score >= 50) return { tone: 'warn', word: 'Needs work' }
  return { tone: 'poor', word: 'Poor' }
}

function ScoreGauge({ label, value }: { label: string; value: number }) {
  const r = 30
  const c = 2 * Math.PI * r
  const { tone, word } = band(value)
  return (
    <div className={`an-gauge is-${tone}`}>
      <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
        <circle cx="36" cy="36" r={r} className="an-gauge__track" />
        <circle cx="36" cy="36" r={r} className="an-gauge__value" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="an-gauge__num">{value}</span>
      <p className="an-gauge__label">{label}</p>
      <p className="an-gauge__word">{word}</p>
    </div>
  )
}

/** Runs PageSpeed Insights for the live homepage (results cached for 6 hours on the server). */
export default function PageSpeedPanel() {
  const [strategy, setStrategy] = useState<Strategy>('mobile')
  const [data, setData] = useState<Partial<Record<Strategy, PageSpeedData>>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (s: Strategy) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/analytics/pagespeed?strategy=${s}&path=/`)
      const json = await res.json()
      if (!json.success) throw new Error(json.error || 'Test failed')
      setData((d) => ({ ...d, [s]: json.data }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!data[strategy] && !loading) void run(strategy)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategy])

  const current = data[strategy]

  return (
    <div className="an-card an-psi">
      <div className="an-card__head">
        <h3>PageSpeed · {current ? new URL(current.url).pathname : 'homepage'}</h3>
        <div className="an-seg" role="group" aria-label="Device">
          {(['mobile', 'desktop'] as const).map((s) => (
            <button key={s} type="button" aria-pressed={strategy === s} className={strategy === s ? 'is-active' : ''} onClick={() => setStrategy(s)}>
              {s === 'mobile' ? <Smartphone aria-hidden="true" /> : <Monitor aria-hidden="true" />}
              {s === 'mobile' ? 'Mobile' : 'Desktop'}
            </button>
          ))}
          <button type="button" onClick={() => run(strategy)} disabled={loading} aria-label="Run the test again">
            <RefreshCw aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading && !current && (
        <p className="an-psi__loading">
          <Loader2 className="an-spin" aria-hidden="true" /> Testing the live site… this takes 10–30 seconds.
        </p>
      )}
      {error && <p className="an-setup__error">{error}</p>}

      {current && (
        <>
          <div className="an-gauges">
            {current.scores.map((s) => (
              <ScoreGauge key={s.key} label={s.label} value={s.value} />
            ))}
          </div>
          <dl className="an-vitals">
            {current.vitals.map((v) => {
              const tone = v.score === null ? '' : v.score >= 0.9 ? 'good' : v.score >= 0.5 ? 'warn' : 'poor'
              return (
                <div key={v.key} className={tone ? `is-${tone}` : ''}>
                  <dt>{v.label}</dt>
                  <dd>
                    <i aria-hidden="true" />
                    {v.display}
                  </dd>
                </div>
              )
            })}
          </dl>
          <p className="an-note">
            Lab test by Google Lighthouse · {new Date(current.fetchedAt).toLocaleString()} {loading && '· refreshing…'}
          </p>
        </>
      )}
    </div>
  )
}
