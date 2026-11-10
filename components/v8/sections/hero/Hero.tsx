import { Code, PenLine, Search, TrendingUp, Wrench } from 'lucide-react'
import { hero } from '@/content/v8/hero'
import Eyebrow from '../../ui/Eyebrow'
import Stars from '../../ui/Stars'
import { ButtonLink } from '../../ui/Button'
import { renderRich } from '../../ui/RichText'
import HeroFloats, { ReviewCard } from './HeroFloats'
import KeyboardHint from './KeyboardHint'
import '@/styles/v8/sections/Hero.scss'

const CAPABILITY_ICONS = {
  pen: PenLine,
  code: Code,
  search: Search,
  trend: TrendingUp,
  wrench: Wrench,
} as const

export default function Hero() {
  return (
    <section className="v8-hero" aria-labelledby="v8-hero-title">
      <div className="v8-hero__bg" aria-hidden="true">
        <div className="v8-hero__grid" />
        <div className="v8-hero__glow" />
      </div>

      <HeroFloats />

      <div className="v8-container v8-hero__content">
        <Eyebrow className="v8-rise">{hero.eyebrow}</Eyebrow>

        <h1 id="v8-hero-title" className="v8-hero__title v8-rise v8-rise--1">
          {renderRich(hero.title)}
        </h1>

        <p className="v8-hero__lede v8-rise v8-rise--2">{renderRich(hero.lede)}</p>

        <ul className="v8-hero__pills v8-rise v8-rise--2" aria-label="What I handle">
          {hero.capabilities.map(({ icon, label }) => {
            const Icon = CAPABILITY_ICONS[icon]
            return (
              <li key={label} className="v8-pill">
                <Icon className="v8-pill__icon" aria-hidden="true" />
                {label}
              </li>
            )
          })}
        </ul>

        <div className="v8-hero__ctas v8-rise v8-rise--3">
          <ButtonLink href={hero.primaryCta.href} arrow glow>
            {hero.primaryCta.label}
          </ButtonLink>
          <ButtonLink href={hero.secondaryCta.href} variant="secondary">
            {hero.secondaryCta.label}
          </ButtonLink>
        </div>

        <ul className="v8-hero__trust v8-rise v8-rise--3">
          <li>
            <Stars label={`Rated ${hero.trust.rating} out of 5`} />
            <strong>{hero.trust.rating}</strong>
            <span>{hero.trust.ratingLabel}</span>
          </li>
          {hero.trust.facts.map((fact) => (
            <li key={fact.strong}>
              <strong>{fact.strong}</strong>
              <span>{fact.rest}</span>
            </li>
          ))}
        </ul>

        <KeyboardHint className="v8-rise v8-rise--4" text={hero.keyboardHint} />

        {/* Figma mobile: the review card sits inline once the floating cards are hidden. */}
        <ReviewCard className="v8-hero__inline-review v8-rise v8-rise--4" />
      </div>
    </section>
  )
}
