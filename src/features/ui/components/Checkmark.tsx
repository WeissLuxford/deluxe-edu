type CheckmarkProps = {
  animate?: boolean
  size?: number
}

export function Checkmark({ animate = true, size = 64 }: CheckmarkProps) {
  return (
    <svg
      className={`hg-checkmark${animate ? ' hg-checkmark--animate' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden
    >
      <circle cx="60" cy="60" r="46" />
      <path d="M40 62 L54 76 L82 46" />
    </svg>
  )
}
