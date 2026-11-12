'use client'

import { useEffect, type ReactNode } from 'react'
import { ToastProvider } from './ToastProvider'
import { CommandMenuProvider } from '../command/CommandMenuProvider'
import SpotlightTracker from './SpotlightTracker'
import SmoothScroll from './SmoothScroll'
import ConsentProvider from '../consent/ConsentProvider'

/** Client-side context for the v8 page: toasts + the ⌘K command menu. */
export default function V8Providers({ children }: { children: ReactNode }) {
  // Signals that React is live, which switches off the no-JS reveal fallback
  // (styles/v8/base.scss). Cleaned up when leaving the v8 route.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('v8-js', 'v8-hydrated')
    return () => root.classList.remove('v8-js', 'v8-hydrated')
  }, [])

  return (
    <ToastProvider>
      <ConsentProvider>
        <CommandMenuProvider>
          {children}
          <SpotlightTracker />
          <SmoothScroll />
        </CommandMenuProvider>
      </ConsentProvider>
    </ToastProvider>
  )
}
