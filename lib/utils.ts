import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSchemaName(name: string): string {
  const lower = name.toLowerCase()
  let cleaned = ''
  let prevUnderscore = false
  for (const c of lower) {
    if (/[a-z0-9]/.test(c)) {
      cleaned += c
      prevUnderscore = false
    } else if (!prevUnderscore) {
      cleaned += '_'
      prevUnderscore = true
    }
  }
  cleaned = cleaned.replace(/^_+|_+$/g, '')
  return `proj_${cleaned || 'unnamed'}`
}
