import type { Metadata } from 'next'
import { Syne, Outfit, JetBrains_Mono } from 'next/font/google'
import connectDB from '@/lib/mongodb'
import SiteSettingsModel from '@/models/SiteSettings'
import './globals.css'
import '../styles/main.scss'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '600', '700', '800'],
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400'],
})

async function getSettings() {
  try {
    await connectDB()
    return await SiteSettingsModel.findOne().lean() as { siteTitle?: string; siteDescription?: string; favicon?: string } | null
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const title = settings?.siteTitle || 'Sahab Uddin Mintu'
  const description = settings?.siteDescription || 'WordPress & MERN developer turning Figma into pixel-perfect, high-converting websites.'
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://shahabweb.vercel.app'),
    title: { default: `${title} — WordPress & MERN Developer`, template: `%s — ${title}` },
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
      <body className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
