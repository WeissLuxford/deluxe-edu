import type { MouseEventHandler, ReactNode } from 'react'
import Link from 'next/link'

type ButtonColor = 'brand' | 'success' | 'danger' | 'info' | 'neutral'
type ButtonSize = 'sm' | 'md' | 'lg'

type CommonProps = {
  children: ReactNode
  color?: ButtonColor
  size?: ButtonSize
  icon?: ReactNode
  trailingIcon?: ReactNode
  fullWidth?: boolean
  ariaLabel?: string
  className?: string
}

type ButtonAsButton = CommonProps & {
  href?: undefined
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

type ButtonAsLink = CommonProps & {
  href: string
  disabled?: undefined
  type?: undefined
  onClick?: undefined
}

type ButtonProps = ButtonAsButton | ButtonAsLink

export function Button({
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
}: ButtonProps) {
  const className = `action-btn${fullWidth ? ' action-btn--full' : ''}${extraClassName ? ` ${extraClassName}` : ''}`
  const content = (
    <>
      {icon && <span className="action-btn__icon">{icon}</span>}
      <span>{children}</span>
      {trailingIcon && <span className="action-btn__icon">{trailingIcon}</span>}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className} data-color={color} data-size={size} aria-label={ariaLabel}>
        {content}
      </Link>
    )
  }

  const { type = 'button', disabled, onClick } = rest as ButtonAsButton

  return (
    <button
      type={type}
      className={className}
      data-color={color}
      data-size={size}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
