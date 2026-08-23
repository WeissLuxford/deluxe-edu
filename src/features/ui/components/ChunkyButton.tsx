import type { MouseEventHandler, ReactNode } from 'react'
import Link from 'next/link'

type ChunkyButtonColor = 'brand' | 'success' | 'danger' | 'info' | 'neutral'
type ChunkyButtonSize = 'sm' | 'md' | 'lg'

type CommonProps = {
  children: ReactNode
  color?: ChunkyButtonColor
  size?: ChunkyButtonSize
  icon?: ReactNode
  trailingIcon?: ReactNode
  fullWidth?: boolean
  ariaLabel?: string
  className?: string
}

type ButtonProps = CommonProps & {
  href?: undefined
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

type LinkProps = CommonProps & {
  href: string
  disabled?: undefined
  type?: undefined
  onClick?: undefined
}

type ChunkyButtonProps = ButtonProps | LinkProps

export function ChunkyButton({
  children,
  color = 'brand',
  size = 'md',
  icon,
  trailingIcon,
  fullWidth,
  ariaLabel,
  className: extraClassName,
  href,
  ...rest
}: ChunkyButtonProps) {
  const className = `chunky-btn chunky-btn--${size}${fullWidth ? ' chunky-btn--full' : ''}${extraClassName ? ` ${extraClassName}` : ''}`
  const face = (
    <span className="chunky-btn__face">
      {icon && <span className="chunky-btn__icon">{icon}</span>}
      <span className="chunky-btn__label">{children}</span>
      {trailingIcon && <span className="chunky-btn__icon">{trailingIcon}</span>}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className={className} data-color={color} aria-label={ariaLabel}>
        {face}
      </Link>
    )
  }

  const { type = 'button', disabled, onClick } = rest as ButtonProps

  return (
    <button
      type={type}
      className={className}
      data-color={color}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {face}
    </button>
  )
}
