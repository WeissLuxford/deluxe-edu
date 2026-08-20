import Link from 'next/link'

export function TeacherPageHead({
  title,
  subtitle,
  backHref,
  backLabel,
  action
}: {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
}) {
  return (
    <header className="admin-page-head">
      <div className="admin-page-head__text">
        {backHref && (
          <Link href={backHref} className="admin-page-head__back">
            ← {backLabel ?? 'Назад'}
          </Link>
        )}
        <h1 className="admin-page-head__title">{title}</h1>
        {subtitle && <p className="admin-page-head__sub">{subtitle}</p>}
      </div>
      {action && <div className="admin-page-head__action">{action}</div>}
    </header>
  )
}
