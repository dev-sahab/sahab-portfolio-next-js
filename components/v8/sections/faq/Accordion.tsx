'use client'

import { useId, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import type { FaqItem } from '@/content/v8/types'
import { cx } from '@/lib/v8/cx'

/** One-open-at-a-time accordion (Figma: "Accordion (one open at a time)"). */
export default function Accordion({ items, defaultOpen = 0 }: { items: FaqItem[]; defaultOpen?: number | null }) {
  const [openId, setOpenId] = useState<string | null>(defaultOpen === null ? null : (items[defaultOpen]?.id ?? null))
  const baseId = useId()

  return (
    <div className="v8-accordion">
      {items.map((item) => {
        const open = item.id === openId
        const buttonId = `${baseId}-${item.id}-q`
        const panelId = `${baseId}-${item.id}-a`
        return (
          <div key={item.id} className={cx('v8-accordion__item', open && 'is-open')}>
            <h3 className="v8-accordion__heading">
              <button
                type="button"
                id={buttonId}
                className="v8-accordion__trigger"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span>{item.question}</span>
                <span className="v8-accordion__icon" aria-hidden="true">
                  {open ? <Minus /> : <Plus />}
                </span>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={buttonId} className="v8-accordion__panel" inert={!open}>
              <div className="v8-accordion__panel-inner">
                <p>{item.answer}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
