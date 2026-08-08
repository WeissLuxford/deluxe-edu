export function VertexLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <span>
      <img src="/brand/vertex_border-light.png" alt="Vertex" className={`logo-light ${className}`} />
      <img src="/brand/vertex_border-dark.png" alt="Vertex" className={`logo-dark ${className}`} />
    </span>
  )
}
