import { describe, it, expect } from 'vitest'
import { formatSD, formatDallE } from '../formatPrompt'
import type { SelectedTag, Tag } from '../../types'

const mockTags: Tag[] = [
  { id: 'masterpiece', text: 'masterpiece', category: 'quality' },
  { id: '1girl', text: '1girl', category: 'character' },
  { id: 'long_hair', text: 'long hair', category: 'appearance' },
]

const findTag = (id: string) => mockTags.find((t) => t.id === id)!

describe('formatSD', () => {
  it('joins tags with commas', () => {
    const selected: SelectedTag[] = [{ tagId: 'masterpiece' }, { tagId: '1girl' }]
    expect(formatSD(selected, findTag)).toBe('masterpiece, 1girl')
  })

  it('applies weight brackets', () => {
    const selected: SelectedTag[] = [{ tagId: 'long_hair', weight: 1.2 }]
    expect(formatSD(selected, findTag)).toBe('(long hair:1.2)')
  })

  it('omits weight brackets for weight 1.0', () => {
    const selected: SelectedTag[] = [{ tagId: 'masterpiece', weight: 1.0 }]
    expect(formatSD(selected, findTag)).toBe('masterpiece')
  })

  it('returns empty string for empty list', () => {
    expect(formatSD([], findTag)).toBe('')
  })
})

describe('formatDallE', () => {
  it('joins tags into a natural sentence', () => {
    const selected: SelectedTag[] = [{ tagId: 'masterpiece' }, { tagId: '1girl' }]
    const result = formatDallE(selected, findTag)
    expect(result).toContain('masterpiece')
    expect(result).toContain('1girl')
  })
})
