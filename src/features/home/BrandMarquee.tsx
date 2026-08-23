export default function BrandMarquee() {
  return (
    <section className="marquee">
      <div className="marquee-row marquee-track">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={`m1-${i}`}>HIGHGATE</span>
        ))}
      </div>
      <div className="marquee-row marquee-track reverse">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={`m2-${i}`}>HIGHGATE</span>
        ))}
      </div>
    </section>
  )
}
