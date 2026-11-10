'use client'

import { cx } from '@/lib/v8/cx'
import { pressKeycaps, useCommandMenu } from '../../command/CommandMenuProvider'

/** "Press ⌘ K to search…" — clickable, and the keycaps animate on the real hotkey. */
export default function KeyboardHint({ text, className }: { text: string; className?: string }) {
  const { open } = useCommandMenu()

  return (
    <button
      type="button"
      className={cx('v8-key-hint', className)}
      onClick={() => {
        pressKeycaps()
        window.setTimeout(open, 140)
      }}
    >
      <span>Press</span>
      <kbd className="v8-kbd v8-keycap" data-cmdk-key>
        ⌘
      </kbd>
      <kbd className="v8-kbd v8-keycap" data-cmdk-key>
        K
      </kbd>
      <span>{text}</span>
    </button>
  )
}
