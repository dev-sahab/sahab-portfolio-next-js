const defaultItems = ['WordPress','Webflow','MERN Stack','Framer','WooCommerce','Figma to Code','React','Node.js','Elementor','Wix Studio']

interface Props {
  items?: string[]
  separator?: string
  speed?: string
  reverse?: boolean
}

export default function Marquee({ items = defaultItems, separator = '✦', speed = '30s', reverse = false }: Props) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div
        className={`marquee-track${reverse ? ' rev' : ''}`}
        style={{ '--ms': speed } as React.CSSProperties}
      >
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-sep">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
