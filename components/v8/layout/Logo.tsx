import Image from 'next/image'
import { site } from '@/content/v8/site'
import '@/styles/v8/layout/Logo.scss'

/**
 * The full logo (person mark + name + role line) as an image, exported from
 * the Figma "Logo v3" component at 4× (752 × 188) so it stays sharp on
 * retina screens. The text colour is baked in, so there is one file per
 * theme; CSS shows the one matching `data-theme`.
 */
const SIZE = { width: 752, height: 188 }

export default function Logo({ href = '#top', onClick }: { href?: string; onClick?: () => void }) {
  return (
    <a href={href} className="v8-logo" aria-label={`${site.name}, back to top`} onClick={onClick}>
      <Image src="/v8/logo-dark.png" alt="" {...SIZE} loading="eager" className="v8-logo__img v8-logo__img--dark" />
      <Image src="/v8/logo-light.png" alt="" {...SIZE} loading="eager" className="v8-logo__img v8-logo__img--light" />
    </a>
  )
}
