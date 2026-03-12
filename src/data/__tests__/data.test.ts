import { describe, it, expect } from 'vitest'
import { builtinCategories, builtinTags } from '../index'

describe('builtin data', () => {
  it('has categories with unique ids', () => {
    const ids = builtinCategories.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThan(0)
  })

  it('has tags with unique ids', () => {
    const ids = builtinTags.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThan(0)
  })

  it('every tag references a valid category', () => {
    const categoryIds = new Set(builtinCategories.map((c) => c.id))
    for (const tag of builtinTags) {
      expect(categoryIds.has(tag.category)).toBe(true)
    }
  })

  it('includes representative common SD tags in the built-in library', () => {
    const expected = [
      ['2girls', 'character'],
      ['silver hair', 'appearance'],
      ['hair ornament', 'appearance'],
      ['jacket', 'clothing'],
      ['happy', 'expression'],
      ['street', 'scene'],
      ['detailed eyes', 'style'],
      ['volumetric lighting', 'lighting'],
      ['cowboy shot', 'composition'],
      ['extra fingers', 'negative'],
    ] as const

    for (const [text, category] of expected) {
      expect(builtinTags).toContainEqual(
        expect.objectContaining({ text, category })
      )
    }
  })

  it('categories are ordered', () => {
    for (let i = 1; i < builtinCategories.length; i++) {
      expect(builtinCategories[i].order).toBeGreaterThanOrEqual(
        builtinCategories[i - 1].order
      )
    }
  })
})
