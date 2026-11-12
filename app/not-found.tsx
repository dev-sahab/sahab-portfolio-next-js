import type { Metadata } from 'next'
import V8Shell from '@/components/v8/layout/V8Shell'
import NotFoundContent from '@/components/v8/pages/NotFoundContent'

export const metadata: Metadata = { title: { absolute: 'Page not found · Sahab Uddin' }, robots: { index: false, follow: false } }

/**
 * Any URL that matches no route at all lands here, outside every route
 * group, so it renders the site frame itself to look like every other page.
 */
export default function NotFound() {
  return (
    <V8Shell>
      <NotFoundContent />
    </V8Shell>
  )
}
