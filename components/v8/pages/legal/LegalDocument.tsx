import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'
import PageHero from '../../ui/PageHero'
import Toc from '../../ui/Toc'
import { CONSENT_CATEGORIES, TRACKING_TOOLS } from '@/lib/v8/consent'
import { legalDocs, type LegalBlock, type LegalDoc } from '@/content/v8/legal'
import { routes } from '@/lib/v8/routes'
import { formatDate } from '@/lib/v8/format'
import { site } from '@/content/v8/site'
import CookieSettingsButton from '../../consent/CookieSettingsButton'
import '@/styles/v8/ui/Prose.scss'
import '@/styles/v8/pages/Blog.scss'
import '@/styles/v8/pages/Legal.scss'

const HREF: Record<LegalDoc['key'], string> = { privacy: routes.privacy, terms: routes.terms, cookies: routes.cookies }

/** `**bold**` and `code` inside legal copy. */
function inline(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    return <Fragment key={i}>{part}</Fragment>
  })
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p>{inline(block)}</p>
  if ('list' in block)
    return (
      <ul>
        {block.list.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ul>
    )
  // Every tracking tool the site uses (lib/v8/consent.ts).
  return (
    <div className="v8-legal-table" role="region" aria-label="Cookies used" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <th scope="col">Tool</th>
            <th scope="col">Category</th>
            <th scope="col">Purpose</th>
            <th scope="col">Cookies</th>
            <th scope="col">Kept for</th>
          </tr>
        </thead>
        <tbody>
          {TRACKING_TOOLS.map((tool) => (
            <tr key={tool.id}>
              <td>
                <strong>{tool.name}</strong>
                <span>{tool.provider}</span>
              </td>
              <td>{CONSENT_CATEGORIES.find((c) => c.id === tool.category)?.label}</td>
              <td>{tool.purpose}</td>
              <td>
                <code>{tool.cookies}</code>
              </td>
              <td>{tool.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Shared layout for Privacy / Terms / Cookies: hero, sticky contents list, sections, links to the other two. */
export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const others = legalDocs.filter((d) => d.key !== doc.key)

  return (
    <>
      <PageHero
        size="compact"
        crumbs={[{ label: doc.title, href: HREF[doc.key] }]}
        eyebrow="Legal"
        title={doc.heroTitle}
        intro={doc.intro}
        meta={[
          { label: 'Last updated', value: <time dateTime={doc.updated}>{formatDate(doc.updated, 'long')}</time> },
          { label: 'Questions', value: <a href={`mailto:${site.email}`}>{site.email}</a> },
        ]}
      >
        {doc.key === 'cookies' && <CookieSettingsButton variant="button" />}
      </PageHero>

      <div className="v8-container v8-article v8-article--toc v8-legal">
        <Toc items={doc.sections.map((s) => ({ id: s.id, text: s.heading }))} />

        <article className="v8-article__body">
          <div className="v8-prose">
            {doc.sections.map((section, i) => (
              <section key={section.id} aria-labelledby={section.id}>
                <h2 id={section.id}>
                  <span className="v8-legal__num">{String(i + 1).padStart(2, '0')}</span>
                  {section.heading}
                </h2>
                {section.body.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </section>
            ))}
          </div>

          <aside className="v8-legal__more" aria-label="Other legal pages">
            {others.map((d) => (
              <Link key={d.key} href={HREF[d.key]} className="v8-legal__card">
                <span>Read next</span>
                {d.title}
              </Link>
            ))}
          </aside>
        </article>
      </div>
    </>
  )
}
