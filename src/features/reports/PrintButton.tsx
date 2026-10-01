'use client'

import { Button } from '@/design/components/Button'

export function PrintButton({ label }: { label: string }) {
  return (
    <Button variant="ink" size="md" dot onClick={() => window.print()}>
      {label}
    </Button>
  )
}
