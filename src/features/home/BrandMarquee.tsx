export default function BrandMarquee() {
  return (
    <section id="block-marquee" data-section="marquee" className="marquee-wrap">
      <div className="marquee">
        <div className="marquee-row">
          <div className="marquee-track">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`m1-${i}`} className="text-6xl md:text-8xl font-black">VERTEX</span>
            ))}
          </div>
        </div>
        <div className="marquee-row">
          <div className="marquee-track reverse">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`m2-${i}`} className="text-6xl md:text-8xl font-black">VERTEX</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
