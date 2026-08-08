export function VertexLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <span>
      <img src="/brand/vertex-light.png" alt="Vertex" className={`logo-light ${className}`} />
      <img src="/brand/vertex-dark.png" alt="Vertex" className={`logo-dark ${className}`} />
    </span>
  )
}
