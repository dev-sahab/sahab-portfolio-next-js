'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import CommandMenu from './CommandMenu'

interface CommandMenuApi {
  open: () => void
  close: () => void
  toggle: () => void
}

const CommandMenuContext = createContext<CommandMenuApi | null>(null)

/** Flashes every on-page ⌘/K keycap (`[data-cmdk-key]`) like a real key press. */
function pressKeycaps() {
  const keys = document.querySelectorAll<HTMLElement>('[data-cmdk-key]')
  keys.forEach((k) => k.classList.add('is-pressed'))
  window.setTimeout(() => keys.forEach((k) => k.classList.remove('is-pressed')), 160)
}

/** Owns the ⌘K / Ctrl+K hotkey and the open state of the command menu. */
export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)

  const open = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((v) => !v), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        pressKeycaps()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  const api = useMemo(() => ({ open, close, toggle }), [open, close, toggle])

  return (
    <CommandMenuContext.Provider value={api}>
      {children}
      <CommandMenu open={isOpen} onClose={close} />
    </CommandMenuContext.Provider>
  )
}

export function useCommandMenu(): CommandMenuApi {
  const ctx = useContext(CommandMenuContext)
  if (!ctx) throw new Error('useCommandMenu must be used inside <CommandMenuProvider>')
  return ctx
}

export { pressKeycaps }
