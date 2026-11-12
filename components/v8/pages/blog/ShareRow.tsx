'use client'

import { Link2 } from 'lucide-react'
import { FaLinkedinIn } from 'react-icons/fa'
import { SiX } from 'react-icons/si'
import { useCopy } from '../../providers/ToastProvider'

/** Copy-link + share-to-X/LinkedIn. Plain links (no third-party scripts), so nothing extra loads. */
export default function ShareRow({ url, title }: { url: string; title: string }) {
  const copy = useCopy()
  const enc = encodeURIComponent
  return (
    <div className="v8-share" role="group" aria-label="Share this article">
      <button type="button" className="v8-share__btn" onClick={() => copy(url, 'Link copied', 2000)}>
        <Link2 aria-hidden="true" />
        Copy link
      </button>
      <a
        className="v8-share__btn v8-share__btn--icon"
        href={`https://x.com/intent/post?text=${enc(title)}&url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X (opens in a new tab)"
      >
        <SiX aria-hidden="true" />
      </a>
      <a
        className="v8-share__btn v8-share__btn--icon"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn (opens in a new tab)"
      >
        <FaLinkedinIn aria-hidden="true" />
      </a>
    </div>
  )
}
