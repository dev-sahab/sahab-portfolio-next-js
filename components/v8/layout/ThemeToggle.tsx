'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cx } from '@/lib/v8/cx'
import { applyTheme, readTheme, THEME_EVENT, type Theme } from '@/lib/v8/theme'
import '@/styles/v8/layout/ThemeToggle.scss'

/** Segmented sun/moon switch (Figma "Theme toggle"). Choice persists. */
export default function ThemeToggle() {
  // `null` until mounted so SSR markup never claims the wrong theme.
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(readTheme())
    const onChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail)
    window.addEventListener(THEME_EVENT, onChange)
    return () => window.removeEventListener(THEME_EVENT, onChange)
  }, [])

  const options: { id: Theme; label: string; Icon: typeof Sun }[] = [
    { id: 'light', label: 'Light theme', Icon: Sun },
    { id: 'dark', label: 'Dark theme', Icon: Moon },
  ]

  return (
    <div className="v8-theme-toggle" role="radiogroup" aria-label="Color theme">
      {options.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={theme === id}
          aria-label={label}
          className={cx('v8-theme-toggle__option', theme === id && 'is-active')}
          onClick={() => theme !== id && applyTheme(id)}
        >
          <Icon aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
