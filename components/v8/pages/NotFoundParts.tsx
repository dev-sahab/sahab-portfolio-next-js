'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search } from 'lucide-react'
import { headerNav } from '@/content/v8/site'
import { routes } from '@/lib/v8/routes'
import { useCommandMenu } from '../command/CommandMenuProvider'
import Kbd from '../ui/Kbd'

/** Opens the ⌘K site search. */
export function NotFoundSearch() {
  const { open } = useCommandMenu()
  return (
    <button type="button" className="v8-btn v8-btn--secondary v8-btn--md" onClick={open}>
      <Search className="v8-btn__icon" aria-hidden="true" />
      <span>Search the site</span>
      <Kbd className="v8-404__kbd">⌘K</Kbd>
    </button>
  )
}

/** Terminal card: the URL that was tried, its 404, and the pages that do exist. */
export function NotFoundTerminal() {
  const pathname = usePathname() || '/'
  const pages = [{ label: 'Home', href: routes.home }, ...headerNav]
  return (
    <div className="v8-404__term">
      <div className="v8-404__term-bar" aria-hidden="true">
        <span className="v8-404__dots">
          <i />
          <i />
          <i />
        </span>
        <span>~/sahab-uddin</span>
      </div>
      <div className="v8-404__term-body">
        <p>
          <span className="v8-404__prompt">$</span> curl -I <span className="v8-404__path">{pathname}</span>
        </p>
        <p className="v8-404__status">
          HTTP/2 <strong>404</strong> Not Found
        </p>
        <p className="v8-404__gap">
          <span className="v8-404__prompt">$</span> ls ./pages
        </p>
        <ul className="v8-404__pages" aria-label="Pages on this site">
          {pages.map((page) => (
            <li key={page.href}>
              <Link href={page.href}>{page.href === '/' ? 'home' : page.href.replace(/^\//, '')}/</Link>
            </li>
          ))}
        </ul>
        <p className="v8-404__gap">
          <span className="v8-404__prompt">$</span> <span className="v8-404__caret" aria-hidden="true" />
        </p>
      </div>
    </div>
  )
}
