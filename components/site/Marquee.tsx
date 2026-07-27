const items = ['WordPress','Webflow','MERN Stack','Framer','WooCommerce','Figma to Code','React','Node.js','Elementor','Wix Studio']
const doubled = [...items, ...items]

export default function Marquee({ speed = '30s' }: { speed?: string }) {
  return (
    <div className="marquee-wrap" aria-hidden="true">
      <div className="marquee-track" style={{ '--ms': speed } as React.CSSProperties}>
        {doubled.map((item, i) => (
          <span key={i} className="marquee-item">
            {item}
            <span className="marquee-sep">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
