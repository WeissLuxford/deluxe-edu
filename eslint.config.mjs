import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

export default [
  { ignores: ['.next/**', 'node_modules/**', '_inspiration/**', 'next-env.d.ts'] },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { files: ['*.config.js'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
  {
    rules: {
      // Existing debt is tracked in docs/AUDIT.md; warn so new code is visible without blocking.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  }
]
