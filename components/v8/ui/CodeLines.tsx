import type { CodeLine } from '@/content/v8/types'
import '@/styles/v8/ui/CodeLines.scss'

interface CodeLinesProps {
  lines: readonly (readonly CodeLine[number][])[]
  /** Render a blinking caret at the end of this (0-based) line. */
  caretLine?: number
}

/** Syntax-highlighted lines for the fake editors (hero snippet, process window). */
export default function CodeLines({ lines, caretLine }: CodeLinesProps) {
  return (
    <code className="v8-code">
      {lines.map((line, i) => (
        <span key={i} className="v8-code__line">
          {line.map((token, j) => (
            <span key={j} className={token.tone ? `v8-code__${token.tone}` : undefined}>
              {token.text}
            </span>
          ))}
          {/* zero-width space keeps empty lines at full line-height */}
          {line.every((t) => !t.text) && '​'}
          {caretLine === i && <span className="v8-code__caret" aria-hidden="true" />}
        </span>
      ))}
    </code>
  )
}
