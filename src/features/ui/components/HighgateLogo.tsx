import registry from '@/content/media.json'

type Entry = { src?: string; srcLight?: string }
const slots = registry as unknown as Record<string, Entry>

export function HighgateLogo({ className = "h-7 w-auto" }: { className?: string }) {
  const entry = slots['brand.header.logo']
  return (
    <span>
      <img src={entry?.srcLight} alt="Highgate" className={`logo-light ${className}`} />
      <img src={entry?.src} alt="Highgate" className={`logo-dark ${className}`} />
    </span>
  )
}
