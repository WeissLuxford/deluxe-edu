'use client'
import { useTranslations } from 'next-intl'
export function useT(ns?: string) {
  return useTranslations(ns)
}
