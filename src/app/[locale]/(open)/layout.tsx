import { ReactNode } from 'react'
import { OpenAccessTopbar } from '@/features/ui/components/OpenAccessTopbar'

export default function OpenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="learn-shell">
      <OpenAccessTopbar />
      {children}
    </div>
  )
}
