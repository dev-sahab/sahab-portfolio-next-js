import { site } from '@/content/v8/site'
import '@/styles/v8/layout/Logo.scss'

/**
 * The full logo (person mark + name + role line) as SVG, so it stays razor
 * sharp at any size or screen density. Source: the Figma "Logo v3" component
 * (Shahab-Portfolio, node 65:1250). The name and role line are the Figma text
 * outlines as-is; the person mark is a raster in Figma, so it was traced from
 * its 1254px original into paths. The text colour is baked in, so there is one
 * file per theme; CSS shows the one matching `data-theme`.
 *
 * A plain <img> on purpose: SVG needs no next/image optimisation.
 */
export default function Logo({ href = '#top', onClick }: { href?: string; onClick?: () => void }) {
  return (
    <a href={href} className="v8-logo" aria-label={`${site.name}, back to top`} onClick={onClick}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v8/logo-dark.svg" alt="" width={188} height={47} className="v8-logo__img v8-logo__img--dark" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/v8/logo-light.svg" alt="" width={188} height={47} className="v8-logo__img v8-logo__img--light" />
    </a>
  )
}
