'use client'

import { useEffect, useState } from 'react'

/** Live clock in Sahab's time zone. Rendered after mount only, so server and browser HTML always match. */
export default function LocalTime({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone })
    const tick = () => setTime(format.format(new Date()))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return <span suppressHydrationWarning>{time ?? '—'}</span>
}
