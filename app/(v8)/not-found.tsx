import type { Metadata } from 'next'
import NotFoundContent from '@/components/v8/pages/NotFoundContent'

export const metadata: Metadata = { title: { absolute: 'Page not found · Sahab Uddin' }, robots: { index: false, follow: false } }

/** Missing project / post (notFound() inside the site). */
export default function NotFound() {
  return <NotFoundContent />
}
