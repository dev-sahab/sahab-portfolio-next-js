'use client'

import { useEffect, useId, useMemo, useRef, useState, type ComponentType, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Copy, Hash, Search, Send, SunMoon } from 'lucide-react'
import { FaGithub, FaLinkedinIn } from 'react-icons/fa'
import { cx } from '@/lib/v8/cx'
import { toggleTheme } from '@/lib/v8/theme'
import { lockScroll, scrollToTarget } from '@/lib/v8/smoothScroll'
import { FOCUS_QUOTE_EVENT } from '@/lib/v8/quote'
import { sectionIds } from '@/content/v8/site'
import TechIcon from '../ui/TechIcon'
import { useCopy } from '../providers/ToastProvider'
import { filterCommands, type Command, type CommandGlyph } from './commands'
import '@/styles/v8/command/CommandMenu.scss'

const GLYPHS: Record<CommandGlyph, ComponentType<{ className?: string }>> = {
  hash: Hash,
  copy: Copy,
  send: Send,
  theme: SunMoon,
  book: BookOpen,
  github: FaGithub,
  linkedin: FaLinkedinIn,
}

function CommandIcon({ icon }: { icon: Command['icon'] }) {
  if ('tech' in icon) {
    return (
      <span className="v8-cmdk__ico v8-cmdk__ico--brand">
        <TechIcon tech={icon.tech} size={15} />
      </span>
    )
  }
  const Glyph = GLYPHS[icon.glyph]
  return (
    <span className="v8-cmdk__ico">
      <Glyph className="v8-cmdk__glyph" />
    </span>
  )
}

interface CommandMenuProps {
  open: boolean
  onClose: () => void
}

export default function CommandMenu({ open, onClose }: CommandMenuProps) {
  const router = useRouter()
  const copy = useCopy()
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const results = useMemo(() => filterCommands(query), [query])

  // Open/close side effects: remember + restore focus, lock page scroll.
  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement | null
    setQuery('')
    setActive(0)
    const unlockScroll = lockScroll()
    const t = window.setTimeout(() => inputRef.current?.focus(), 10)
    return () => {
      window.clearTimeout(t)
      unlockScroll()
      returnFocus.current?.focus?.()
    }
  }, [open])

  // Keep the highlighted row in view while arrowing through results.
  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const run = (cmd: Command | undefined) => {
    if (!cmd) return
    onClose()
    const { action } = cmd
    switch (action.type) {
      case 'copy':
        void copy(action.value, action.message)
        break
      case 'theme':
        toggleTheme()
        break
      case 'link':
        if (action.external) window.open(action.href, '_blank', 'noopener,noreferrer')
        else router.push(action.href)
        break
      case 'scroll':
        // Wait a frame so the scroll lock is released before scrolling.
        requestAnimationFrame(() => {
          scrollToTarget(action.target)
          if (action.target === sectionIds.contact) window.dispatchEvent(new Event(FOCUS_QUOTE_EVENT))
        })
        break
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (results.length ? (i + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'Tab') {
      // The input is the only focus stop inside the dialog.
      e.preventDefault()
    }
  }

  let lastGroup = ''

  return (
    <div className="v8-cmdk-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="v8-cmdk" role="dialog" aria-modal="true" aria-label="Search the site">
        <div className="v8-cmdk__field">
          <Search className="v8-cmdk__search" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search projects, services, contact…"
            aria-label="Search the site"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={results.length ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="v8-cmdk__kbd v8-cmdk__esc">esc</kbd>
          {/* Phones have no Esc key: the search is full-screen there, so it needs a visible way out. */}
          <button type="button" className="v8-cmdk__cancel" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="v8-cmdk__list" id={listId} role="listbox" aria-label="Results" ref={listRef}>
          {results.length === 0 && <p className="v8-cmdk__empty">Nothing matches that. Try “woo” or “email”.</p>}
          {results.map((cmd, i) => {
            const groupLabel = cmd.group !== lastGroup ? cmd.group : null
            lastGroup = cmd.group
            return (
              <div key={cmd.id} role="presentation">
                {groupLabel && (
                  <p className="v8-cmdk__group" role="presentation">
                    {groupLabel}
                  </p>
                )}
                <div
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={i === active}
                  className={cx('v8-cmdk__item', i === active && 'is-active')}
                  onMouseMove={() => i !== active && setActive(i)}
                  onClick={() => run(cmd)}
                >
                  <CommandIcon icon={cmd.icon} />
                  <span>
                    <b className="v8-cmdk__label">{cmd.label}</b>
                  </span>
                  <span className="v8-cmdk__meta">
                    {cmd.meta}
                    <kbd className="v8-cmdk__kbd v8-cmdk__go" aria-hidden="true">
                      ↵
                    </kbd>
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="v8-cmdk__foot" aria-hidden="true">
          <span>
            <kbd className="v8-cmdk__kbd">↑</kbd>
            <kbd className="v8-cmdk__kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="v8-cmdk__kbd">↵</kbd> open
          </span>
        </div>
      </div>
    </div>
  )
}
