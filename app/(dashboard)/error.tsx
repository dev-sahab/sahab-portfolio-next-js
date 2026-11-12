'use client'

import ErrorScreen from '@/components/ErrorScreen'

/** Dashboard pages: keep the sidebar, show what failed. */
export default function DashboardError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return <ErrorScreen error={error} retry={unstable_retry} homeHref="/dashboard" homeLabel="Back to the dashboard" />
}
