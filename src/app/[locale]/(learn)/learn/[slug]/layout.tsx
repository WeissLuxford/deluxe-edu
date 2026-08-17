import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCourseTree } from '@/features/learn/progress'
import { LearnTopbar } from '@/features/learn/components/LearnTopbar'
import { LearnSidebar } from '@/features/learn/components/LearnSidebar'

export default async function LearnCourseLayout({
  children,
  params
}: {
  children: ReactNode
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect(`/${locale}/signin?next=/${locale}/learn/${slug}`)

  const tree = await getCourseTree(session.user.id, slug, locale)
  if (!tree) redirect(`/${locale}/courses/${slug}`)

  return (
    <>
      <LearnTopbar
        locale={locale}
        crumbs={[{ label: tree.title, href: `/${locale}/learn/${tree.slug}` }]}
      />

      <div className="learn-course">
        <LearnSidebar locale={locale} tree={tree} />
        <main className="learn-content">{children}</main>
      </div>
    </>
  )
}
