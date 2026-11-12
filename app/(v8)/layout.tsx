import type { Metadata } from 'next'
import V8Shell from '@/components/v8/layout/V8Shell'
import { SITE_URL, absoluteUrl, routes } from '@/lib/v8/routes'
import { IS_PREVIEW } from '@/lib/v8/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Inner pages set their own title ("Projects") and get " · Sahab Uddin" appended.
  // `absolute` so the root layout's dashboard title pattern isn't applied on top.
  title: { absolute: 'Sahab Uddin · Web developer', template: '%s · Sahab Uddin' },
  description:
    'Sahab Uddin builds fast, SEO-friendly WordPress, Webflow and React websites. 300+ projects, 5.0 across 200+ reviews.',
  alternates: { canonical: absoluteUrl(routes.home) },
  robots: IS_PREVIEW ? { index: false, follow: false } : undefined,
}

/** The public site (the "v8" design): every page under app/(v8) gets the shared frame. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <V8Shell>{children}</V8Shell>
}
