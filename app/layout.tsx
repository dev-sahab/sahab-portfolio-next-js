import type { Metadata } from 'next'
import { v8FontVars } from '@/lib/v8/fonts'
import { getSiteSettings } from '@/lib/publicData'
import './globals.css'
import '../styles/main.scss'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings() as { siteTitle?: string; siteDescription?: string; favicon?: string } | null
  const title = settings?.siteTitle || 'Sahab Uddin'
  const description = settings?.siteDescription || 'Fast, SEO-friendly WordPress, Webflow and custom websites by Sahab Uddin.'
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sahabweb.vercel.app'),
    // The public site (app/(v8)/layout.tsx) sets its own titles; this covers dashboard + login.
    title: { default: title, template: `%s · ${title}` },
    description,
    keywords: ['WordPress', 'MERN', 'Webflow', 'Framer', 'Developer', 'Freelance'],
    authors: [{ name: title }],
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: title,
    },
    icons: settings?.favicon ? { icon: settings.favicon } : undefined,
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('sahab-theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
        }} />
      </head>
      <body className={v8FontVars}>
        {children}
      </body>
    </html>
  )
}
