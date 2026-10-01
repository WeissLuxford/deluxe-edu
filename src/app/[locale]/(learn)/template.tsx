import { ReactNode } from 'react'

// Each learning page fades in inside the panel; the sidebar stays put.
export default function LearnTemplate({ children }: { children: ReactNode }) {
  return <div className="page-in">{children}</div>
}
