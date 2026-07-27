import type { Metadata } from 'next'
import { Syne, Outfit, JetBrains_Mono } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  title: { default: 'Sahab Uddin Mintu — WordPress & MERN Developer', template: '%s — Sahab Uddin Mintu' },
  description: 'WordPress & MERN developer turning Figma into pixel-perfect, high-converting websites.',
  keywords: ['WordPress', 'MERN', 'Webflow', 'Framer', 'Developer', 'Freelance'],
  authors: [{ name: 'Sahab Uddin Mintu' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Sahab Uddin Mintu',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('sahab-theme')||'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
        }} />
      </head>
      <body className={`${syne.variable} ${outfit.variable} ${jetbrainsMono.variable}`}
        style={{ fontFamily: 'var(--font-outfit, Outfit, sans-serif)' }}>
        {children}
      </body>
    </html>
  )
}
