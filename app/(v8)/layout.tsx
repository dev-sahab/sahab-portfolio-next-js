import type { Metadata } from 'next'
import V8Shell from '@/components/v8/layout/V8Shell'
import { SITE_URL, absoluteUrl, routes } from '@/lib/v8/routes'
import { DEFAULT_OG_IMAGE, IS_PREVIEW } from '@/lib/v8/seo'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Inner pages set their own title ("Projects") and get " · Sahab Uddin" appended.
  // `absolute` so the root layout's dashboard title pattern isn't applied on top.
  title: { absolute: 'Freelance Web Developer for WordPress & Web Apps · Sahab Uddin', template: '%s · Sahab Uddin' },
  description:
    'Freelance web developer for WordPress, WooCommerce, Webflow and custom web apps. 300+ projects, 5.0 from 200+ reviews. Fixed quotes, reply within 24 hours.',
  alternates: { canonical: absoluteUrl(routes.home) },
  openGraph: {
    type: 'website',
    url: absoluteUrl(routes.home),
    siteName: 'Sahab Uddin',
    title: 'Freelance Web Developer for WordPress & Web Apps · Sahab Uddin',
    description:
      'Freelance web developer for WordPress, WooCommerce, Webflow and custom web apps. 300+ projects, 5.0 from 200+ reviews.',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: 'Sahab Uddin, freelance web developer' }],
  },
  twitter: { card: 'summary_large_image', images: [DEFAULT_OG_IMAGE] },
  robots: IS_PREVIEW ? { index: false, follow: false } : undefined,
}

/** The public site (the "v8" design): every page under app/(v8) gets the shared frame. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <V8Shell>{children}</V8Shell>
}
