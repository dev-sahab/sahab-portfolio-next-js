import { Fragment, type ReactNode } from 'react'

/**
 * Renders the lightweight markup used in `content/v8`:
 *   `*text*`   → italic serif accent (<em class="v8-em">)
 *   `**text**` → emphasised body text (<strong>)
 *   `\n`       → line break
 * Keeps headline styling in the data without shipping a markdown parser.
 */
export function renderRich(text: string): ReactNode {
  return text.split('\n').map((line, lineIndex, lines) => (
    <Fragment key={lineIndex}>
      {line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
        if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="v8-em">{part.slice(1, -1)}</em>
        return part
      })}
      {lineIndex < lines.length - 1 && <br />}
    </Fragment>
  ))
}
