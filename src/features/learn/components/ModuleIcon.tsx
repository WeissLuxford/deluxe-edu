'use client'

import { BookOpen, Target, Medal, Compass, Rocket, Globe } from 'lucide-react'
import { BoilingIcon } from '@/features/ui/components/BoilingIcon'

const MODULE_ICONS = [BookOpen, Target, Medal, Compass, Rocket, Globe]

export function ModuleIcon({ index, size = 32 }: { index: number; size?: number }) {
  return <BoilingIcon icon={MODULE_ICONS[index % MODULE_ICONS.length]} color="var(--brand-text)" size={size} />
}
