export default function BrandMarquee() {
  return (
    <section>
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={`m1-${i}`}>HIGHGATE</span>
        ))}
      </div>
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={`m2-${i}`}>HIGHGATE</span>
        ))}
      </div>
    </section>
  )
}
