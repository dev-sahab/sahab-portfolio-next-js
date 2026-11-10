/**
 * Theme helpers for the v8 page. Uses the same `data-theme` attribute and
 * `sahab-theme` localStorage key as the rest of the site (see the inline
 * script in `app/layout.tsx`), so a visitor's choice carries across pages.
 */

export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'sahab-theme'
export const THEME_EVENT = 'v8:theme-change'

export function readTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
}

/** Applies a theme with a short colour cross-fade (skipped for reduced motion). */
export function applyTheme(next: Theme) {
  const root = document.documentElement
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!reduce) {
    root.classList.add('v8-theme-fade')
    window.setTimeout(() => root.classList.remove('v8-theme-fade'), 260)
  }

  root.setAttribute('data-theme', next)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next)
  } catch {
    /* storage blocked — the attribute change still applies for this visit */
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: next }))
}

export function toggleTheme() {
  applyTheme(readTheme() === 'dark' ? 'light' : 'dark')
}
