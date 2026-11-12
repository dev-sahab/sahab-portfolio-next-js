'use client'

import ErrorScreen from '@/components/ErrorScreen'

/** Errors that escape the root layout (replaces Next's blank default). */
export default function GlobalError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <title>Something went wrong</title>
        <ErrorScreen error={error} retry={unstable_retry} />
      </body>
    </html>
  )
}
