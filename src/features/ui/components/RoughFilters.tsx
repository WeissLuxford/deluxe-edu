export function RoughFilters() {
  return (
    <svg width="0" height="0" aria-hidden style={{ position: 'absolute' }}>
      <defs>
        <filter id="hg-filter-rough">
          <feTurbulence type="fractalNoise" baseFrequency={0.08} numOctaves={4} />
          <feDisplacementMap in="SourceGraphic" scale={5} />
        </filter>
      </defs>
    </svg>
  )
}
