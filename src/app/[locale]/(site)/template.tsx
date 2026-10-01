import { ReactNode } from 'react'

// A template remounts on every navigation, so each page fades in instead of
// snapping into place. The header and footer live in the layout and stay put.
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>
}
