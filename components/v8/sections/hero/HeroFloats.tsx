import { ArrowRight, Code, Globe } from 'lucide-react'
import { heroFloats } from '@/content/v8/hero'
import CodeLines from '../../ui/CodeLines'
import Stars from '../../ui/Stars'
import TechIcon from '../../ui/TechIcon'
import ParallaxFloats from './ParallaxFloats'
import ScoreRing from './ScoreRing'

/**
 * The four tilted cards around the hero headline. Purely decorative (they
 * repeat content found elsewhere on the page), so hidden from assistive tech
 * and below the desktop breakpoint.
 */
/** The client-review card — floating on desktop, inline under the hero on smaller screens. */
export function ReviewCard({ className }: { className?: string }) {
  const { review } = heroFloats
  return (
    <div className={`v8-float v8-float--review ${className ?? ''}`}>
      <div className="v8-float__rating">
        <Stars size={12} gap={2} />
        <span>{review.rating}</span>
      </div>
      <p className="v8-float__quote">{review.quote}</p>
      <p className="v8-float__meta">{review.author}</p>
    </div>
  )
}

export default function HeroFloats() {
  const { snippet, pipeline, performance } = heroFloats

  return (
    <ParallaxFloats>
      <ReviewCard />


      <div className="v8-float v8-float--snippet">
        <div className="v8-float__bar">
          <span className="v8-dots">
            <i />
            <i />
            <i />
          </span>
          <Code className="v8-float__bar-icon" />
          <span>{snippet.file}</span>
        </div>
        <div className="v8-float__code">
          <CodeLines lines={snippet.lines} />
        </div>
      </div>

      <div className="v8-float v8-float--pipeline">
        {pipeline.map((stage, i) => (
          <span key={stage.label} className="v8-float__stage-wrap">
            {i > 0 && <ArrowRight className="v8-float__arrow" />}
            <span className={`v8-float__stage${'live' in stage && stage.live ? ' is-live' : ''}`}>
              {stage.tech ? (
                <TechIcon tech={stage.tech} size={13} />
              ) : 'live' in stage && stage.live ? (
                <Globe width={13} height={13} />
              ) : (
                <Code width={13} height={13} />
              )}
              {stage.label}
            </span>
          </span>
        ))}
      </div>

      <div className="v8-float v8-float--perf">
        <ScoreRing score={performance.score} label={performance.label} />
        <span className="v8-float__perf-text">
          <strong>{performance.title}</strong>
          <span>{performance.note}</span>
        </span>
      </div>
    </ParallaxFloats>
  )
}
