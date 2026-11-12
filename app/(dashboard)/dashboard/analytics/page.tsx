import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { can } from '@/lib/permissions'
import { RANGES, type RangeDays } from '@/lib/analytics/google'
import { getGa4 } from '@/lib/analytics/ga4'
import { getSearchConsole } from '@/lib/analytics/searchConsole'
import { getLeads } from '@/lib/analytics/leads'
import KpiTile from '@/components/dashboard/analytics/KpiTile'
import BarList from '@/components/dashboard/analytics/BarList'
import TrendChart from '@/components/dashboard/analytics/TrendChart'
import SetupCard from '@/components/dashboard/analytics/SetupCard'
import PageSpeedPanel from '@/components/dashboard/analytics/PageSpeedPanel'
import { formatValue } from '@/components/dashboard/analytics/format'
import '@/styles/pages/(dashboard)/dashboard/analytics/page.scss'

export const dynamic = 'force-dynamic'

const SA_STEPS = [
  'In Google Cloud, create a service account and download its JSON key.',
  'Enable the “Google Analytics Data API” and “Google Search Console API” for that project.',
  'Add the service account email as a Viewer in GA4 (Admin → Property access) and as a user in Search Console (Settings → Users).',
  'Put the email, private key and IDs in .env (see .env.example) and restart the server.',
]

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await auth()
  if (!can((session?.user as { role?: string })?.role, 'analytics.read')) redirect('/dashboard')

  const { range } = await searchParams
  const days: RangeDays = RANGES.includes(Number(range) as RangeDays) ? (Number(range) as RangeDays) : 28
  const [ga4, gsc, leads] = await Promise.all([getGa4(days), getSearchConsole(days), getLeads(days)])

  const users = ga4.status === 'ok' ? ga4.data.totals.find((t) => t.key === 'users') : undefined
  const views = ga4.status === 'ok' ? ga4.data.totals.find((t) => t.key === 'views') : undefined

  return (
    <div className="an-page">
      <header className="an-header">
        <div>
          <p className="an-eyebrow">Site Kit</p>
          <h1>Analytics</h1>
          <p className="an-sub">Traffic, search and speed for the live site, compared with the previous {days} days.</p>
        </div>
        <nav className="an-seg" aria-label="Date range">
          {RANGES.map((r) => (
            <Link key={r} href={`/dashboard/analytics?range=${r}`} aria-current={r === days ? 'page' : undefined} className={r === days ? 'is-active' : ''}>
              {r} days
            </Link>
          ))}
        </nav>
      </header>

      {/* ── At a glance ── */}
      <section className="an-kpis" aria-label="At a glance">
        {users && <KpiTile label="Visitors" value={users.value} previous={users.previous} />}
        {views && <KpiTile label="Page views" value={views.value} previous={views.previous} />}
        {gsc.status === 'ok' && <KpiTile label="Clicks from Google" value={gsc.data.totals.clicks} previous={gsc.data.previous.clicks} />}
        {gsc.status === 'ok' && <KpiTile label="Search impressions" value={gsc.data.totals.impressions} previous={gsc.data.previous.impressions} />}
        {leads.status === 'ok' && (
          <KpiTile
            label="Leads (quotes + messages)"
            value={leads.data.totals.quotes + leads.data.totals.contacts}
            previous={leads.data.previous.quotes + leads.data.previous.contacts}
          />
        )}
      </section>

      {/* ── Google Analytics ── */}
      <section className="an-section" aria-labelledby="an-ga4">
        <h2 id="an-ga4">Traffic <span>Google Analytics 4</span></h2>
        {ga4.status === 'ok' ? (
          <>
            <TrendChart
              title="Visitors per day"
              dates={ga4.data.daily.map((d) => d.date)}
              series={[
                { label: 'This period', color: 'var(--chart-1)', values: ga4.data.daily.map((d) => d.users) },
                { label: 'Previous period', color: 'var(--muted)', values: ga4.data.previousDaily.map((d) => d.users), compare: true },
              ]}
            />
            <div className="an-kpis an-kpis--small">
              {ga4.data.totals
                .filter((t) => ['sessions', 'engagement', 'duration', 'keyEvents'].includes(t.key))
                .map((t) => (
                  <KpiTile key={t.key} label={t.label} value={t.value} previous={t.previous} format={t.format} />
                ))}
            </div>
            <div className="an-grid">
              <BarList title="Top pages" rows={ga4.data.topPages} valueLabel="Views" />
              <BarList title="Traffic sources" rows={ga4.data.channels} valueLabel="Sessions" />
              <BarList title="Countries" rows={ga4.data.countries} valueLabel="Visitors" />
              <BarList title="Devices" rows={ga4.data.devices} valueLabel="Visitors" />
            </div>
          </>
        ) : (
          <SetupCard
            title="Google Analytics"
            missing={ga4.status === 'not-configured' ? ga4.missing : []}
            error={ga4.status === 'error' ? ga4.message : undefined}
            steps={[...SA_STEPS, 'GA4_PROPERTY_ID is the numeric ID in GA4 → Admin → Property details.']}
          />
        )}
      </section>

      {/* ── Search Console ── */}
      <section className="an-section" aria-labelledby="an-gsc">
        <h2 id="an-gsc">Search <span>Google Search Console</span></h2>
        {gsc.status === 'ok' ? (
          <>
            {/* Clicks and impressions differ by orders of magnitude: two charts, never two axes. */}
            <div className="an-grid an-grid--2">
              <TrendChart title="Clicks from Google" dates={gsc.data.daily.map((d) => d.date)} series={[{ label: 'Clicks', color: 'var(--chart-1)', values: gsc.data.daily.map((d) => d.clicks) }]} height={200} />
              <TrendChart title="Impressions" dates={gsc.data.daily.map((d) => d.date)} series={[{ label: 'Impressions', color: 'var(--chart-2)', values: gsc.data.daily.map((d) => d.impressions) }]} height={200} />
            </div>
            <div className="an-kpis an-kpis--small">
              <KpiTile label="Click-through rate" value={gsc.data.totals.ctr} previous={gsc.data.previous.ctr} format="percent" />
              <KpiTile label="Average position" value={gsc.data.totals.position} previous={gsc.data.previous.position} format="decimal" lowerIsBetter />
            </div>
            <div className="an-grid an-grid--2">
              <div className="an-card">
                <div className="an-card__head">
                  <h3>Top search queries</h3>
                  <span>Clicks · Impr. · Pos.</span>
                </div>
                {gsc.data.queries.length ? (
                  <div className="an-table-wrap">
                    <table className="an-table">
                      <thead>
                        <tr>
                          <th scope="col">Query</th>
                          <th scope="col">Clicks</th>
                          <th scope="col">Impr.</th>
                          <th scope="col">Pos.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gsc.data.queries.map((q) => (
                          <tr key={q.label}>
                            <td>{q.label}</td>
                            <td>{formatValue(q.clicks)}</td>
                            <td>{formatValue(q.impressions)}</td>
                            <td>{formatValue(q.position, 'decimal')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="an-empty">No search queries for this period yet.</p>
                )}
              </div>
              <BarList title="Top pages in Google" rows={gsc.data.pages} valueLabel="Clicks" />
            </div>
            <p className="an-note">Search Console data lags about 3 days, so this period ends 3 days ago.</p>
          </>
        ) : (
          <SetupCard
            title="Search Console"
            missing={gsc.status === 'not-configured' ? gsc.missing : []}
            error={gsc.status === 'error' ? gsc.message : undefined}
            steps={[...SA_STEPS, 'SEARCH_CONSOLE_SITE_URL is the property exactly as shown in Search Console, e.g. sc-domain:example.com or https://example.com/.']}
          />
        )}
      </section>

      {/* ── Speed ── */}
      <section className="an-section" aria-labelledby="an-speed">
        <h2 id="an-speed">Speed and SEO health <span>PageSpeed Insights</span></h2>
        <PageSpeedPanel />
      </section>

      {/* ── Leads ── */}
      <section className="an-section" aria-labelledby="an-leads">
        <h2 id="an-leads">Leads <span>From this site’s forms</span></h2>
        {leads.status === 'ok' ? (
          <TrendChart
            title="Enquiries per day"
            dates={leads.data.daily.map((d) => d.date)}
            series={[
              { label: 'Quote requests', color: 'var(--chart-1)', values: leads.data.daily.map((d) => d.quotes) },
              { label: 'Contact messages', color: 'var(--chart-2)', values: leads.data.daily.map((d) => d.contacts) },
            ]}
            height={200}
          />
        ) : (
          <SetupCard title="Leads" steps={[]} error={leads.status === "error" ? leads.message : "Not available"} />
        )}
      </section>

      {/* ── Ads ── */}
      <section className="an-section" aria-labelledby="an-ads">
        <h2 id="an-ads">Advertising <span>Coming next</span></h2>
        <div className="an-card an-ads">
          <p>
            Meta Ads, Google Ads and LinkedIn Ads reports need approved developer access to each platform’s reporting API. Their tracking tags already run on
            the site (with consent), so conversions show up in Google Analytics above as key events.
          </p>
          <ul>
            <li>Meta Ads · Marketing API</li>
            <li>Google Ads · developer token</li>
            <li>LinkedIn Ads · Marketing Developer Platform</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
