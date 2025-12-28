import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toBe('base-class active-class')
  })

  it('filters out falsy values', () => {
    const result = cn('class1', false, null, undefined, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('merges Tailwind conflicting classes correctly', () => {
    // tailwind-merge only deduplicates conflicting Tailwind classes, not arbitrary classes
    const result = cn('px-2', 'py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })
})
