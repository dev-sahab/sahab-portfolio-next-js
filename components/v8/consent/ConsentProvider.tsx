'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import {
  ACTIVE_TOOLS,
  CLARITY_ID,
  GA_ID,
  GOOGLE_ADS_ID,
  LINKEDIN_PARTNER_ID,
  META_PIXEL_ID,
  NEEDS_CONSENT,
  readConsent,
  writeConsent,
  type ConsentState,
} from '@/lib/v8/consent'
import CookieBanner from './CookieBanner'
import CookiePreferences from './CookiePreferences'

interface ConsentContextValue {
  /** null = the visitor hasn't chosen yet. */
  consent: ConsentState | null
  /** True when at least one tracking tool is configured. */
  needed: boolean
  save: (state: ConsentState) => void
  openPreferences: () => void
}

const ConsentContext = createContext<ConsentContextValue | null>(null)

export function useConsent() {
  const ctx = useContext(ConsentContext)
  if (!ctx) throw new Error('useConsent must be used inside ConsentProvider')
  return ctx
}

/** Best-effort removal of tracking cookies after consent is withdrawn. */
function clearTrackingCookies() {
  const names = ['_ga', '_gid', '_gat', '_gcl_au', '_gcl_aw', '_fbp', '_fbc', '_clck', '_clsk', 'CLID', 'li_sugr', 'li_fat_id']
  const host = location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim()
    if (!names.some((n) => name === n || name.startsWith(`${n}_`))) continue
    for (const d of domains) document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ''}`
  }
}

/**
 * Cookie consent for the v8 site. Tracking scripts (GA4, Google Ads,
 * Clarity, Meta Pixel, LinkedIn) are rendered only for the categories the visitor accepted, so
 * nothing non-essential loads before a choice. With no tool configured
 * (see lib/v8/consent.ts) it renders nothing at all.
 */
export default function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null)
  const [ready, setReady] = useState(false)
  const [prefsOpen, setPrefsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setConsent(readConsent())
    setReady(true)
  }, [])

  const save = useCallback(
    (next: ConsentState) => {
      const withdrew = (consent?.analytics && !next.analytics) || (consent?.marketing && !next.marketing)
      writeConsent(next)
      setConsent(next)
      setPrefsOpen(false)
      if (withdrew) {
        // Already-loaded scripts can't be unloaded: clear their cookies and reload clean.
        clearTrackingCookies()
        window.location.reload()
      }
    },
    [consent],
  )

  const openPreferences = useCallback(() => setPrefsOpen(true), [])

  // Meta Pixel doesn't see client-side navigations by itself.
  useEffect(() => {
    if (!consent?.marketing || !META_PIXEL_ID) return
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq
    fbq?.('track', 'PageView')
  }, [pathname, consent?.marketing])

  const value = useMemo(() => ({ consent, needed: NEEDS_CONSENT, save, openPreferences }), [consent, save, openPreferences])
  const has = (id: string) => ACTIVE_TOOLS.some((t) => t.id === id)

  return (
    <ConsentContext.Provider value={value}>
      {children}

      {NEEDS_CONSENT && ready && (
        <>
          {!consent && !prefsOpen && <CookieBanner />}
          {prefsOpen && <CookiePreferences onClose={() => setPrefsOpen(false)} />}
        </>
      )}

      {/* ── Google tag: GA4 (analytics) and/or Google Ads (marketing), one script, consent mode set from the choice ── */}
      {((consent?.analytics && has('ga4')) || (consent?.marketing && has('google-ads'))) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${consent?.analytics && has('ga4') ? GA_ID : GOOGLE_ADS_ID}`} strategy="afterInteractive" />
          <Script id="v8-gtag" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'${consent?.analytics ? 'granted' : 'denied'}',ad_storage:'${consent?.marketing ? 'granted' : 'denied'}',ad_user_data:'${consent?.marketing ? 'granted' : 'denied'}',ad_personalization:'${consent?.marketing ? 'granted' : 'denied'}'});gtag('js',new Date());${consent?.analytics && has('ga4') ? `gtag('config','${GA_ID}',{anonymize_ip:true});` : ''}${consent?.marketing && has('google-ads') ? `gtag('config','${GOOGLE_ADS_ID}');` : ''}`}
          </Script>
        </>
      )}
      {/* Clarity needs an explicit Consent API v2 signal for EEA/UK/CH visitors (enforced since 31 Oct 2025). */}
      {consent?.analytics && has('clarity') && (
        <Script id="v8-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${CLARITY_ID}");window.clarity("consentv2",{analytics_Storage:"granted",ad_Storage:"${consent?.marketing ? 'granted' : 'denied'}"});`}
        </Script>
      )}

      {/* ── Marketing (only after consent) ── */}
      {consent?.marketing && has('linkedin') && (
        <Script id="v8-linkedin" strategy="afterInteractive">
          {`window._linkedin_partner_id="${LINKEDIN_PARTNER_ID}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(window._linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`}
        </Script>
      )}
      {consent?.marketing && has('meta-pixel') && (
        <Script id="v8-meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </ConsentContext.Provider>
  )
}
