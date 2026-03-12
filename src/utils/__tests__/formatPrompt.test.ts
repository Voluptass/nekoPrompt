import { describe, it, expect } from 'vitest'
import { formatSD, formatDallE, formatDallENegative } from '../formatPrompt'
import type { SelectedTag, Tag } from '../../types'

const mockTags: Tag[] = [
  { id: 'masterpiece', text: 'masterpiece', category: 'quality' },
  { id: 'ultra_detailed', text: 'ultra-detailed', category: 'quality' },
  { id: '1girl', text: '1girl', category: 'character' },
  { id: 'long_hair', text: 'long hair', category: 'appearance' },
  { id: 'blue_eyes', text: 'blue eyes', category: 'appearance' },
  { id: 'school_uniform', text: 'school uniform', category: 'clothing' },
  { id: 'smile', text: 'smile', category: 'expression' },
  { id: 'classroom', text: 'classroom', category: 'scene' },
  { id: 'night', text: 'night', category: 'scene' },
  { id: 'anime', text: 'anime', category: 'style' },
  { id: 'dramatic_lighting', text: 'dramatic lighting', category: 'lighting' },
  { id: 'close_up', text: 'close-up', category: 'composition' },
  { id: 'cyberpunk_city', text: 'cyberpunk city', category: 'custom-cat-scene' },
  { id: 'lowres', text: 'lowres', category: 'negative' },
  { id: 'bad_hands', text: 'bad hands', category: 'negative' },
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
  it('supports an illustration-style prompt variant', () => {
    const selected: SelectedTag[] = [
      { tagId: 'masterpiece' },
      { tagId: '1girl' },
      { tagId: 'long_hair' },
      { tagId: 'classroom' },
      { tagId: 'dramatic_lighting' },
      { tagId: 'close_up' },
    ]
    const result = formatDallE(selected, findTag, 'illustration')
    expect(result).toContain('illustration')
    expect(result).toContain('a girl')
    expect(result).toContain('dramatic lighting')
  })

  it('supports a photography-style prompt variant', () => {
    const selected: SelectedTag[] = [
      { tagId: 'masterpiece' },
      { tagId: '1girl' },
      { tagId: 'long_hair' },
      { tagId: 'classroom' },
      { tagId: 'dramatic_lighting' },
      { tagId: 'close_up' },
    ]
    const result = formatDallE(selected, findTag, 'photo')
    expect(result).toContain('photo')
    expect(result).toContain('portrait')
    expect(result).toContain('dramatic lighting')
    expect(result).not.toContain('illustration')
  })

  it('produces different wording for illustration and photo styles', () => {
    const selected: SelectedTag[] = [
      { tagId: 'masterpiece' },
      { tagId: '1girl' },
      { tagId: 'long_hair' },
      { tagId: 'classroom' },
    ]
    const illustration = formatDallE(selected, findTag, 'illustration')
    const photo = formatDallE(selected, findTag, 'photo')
    expect(illustration).not.toBe(photo)
  })

  it('turns categorized tags into a natural English prompt', () => {
    const selected: SelectedTag[] = [
      { tagId: 'masterpiece' },
      { tagId: 'ultra_detailed' },
      { tagId: '1girl' },
      { tagId: 'long_hair' },
      { tagId: 'blue_eyes' },
      { tagId: 'school_uniform' },
      { tagId: 'smile' },
      { tagId: 'classroom' },
      { tagId: 'night' },
      { tagId: 'anime' },
      { tagId: 'dramatic_lighting' },
      { tagId: 'close_up' },
    ]
    const result = formatDallE(selected, findTag)
    expect(result).toMatch(/^Create a/)
    expect(result).toContain('high-quality')
    expect(result).toContain('highly detailed')
    expect(result).toContain('a girl')
    expect(result).toContain('long hair and blue eyes')
    expect(result).toContain('wearing a school uniform')
    expect(result).toContain('smiling')
    expect(result).toContain('in a classroom at night')
    expect(result).toContain('anime style')
    expect(result).toContain('dramatic lighting')
    expect(result).toContain('close-up')
    expect(result).not.toContain('1girl')
    expect(result).toContain('.')
  })

  it('ignores SD-style weight syntax and keeps natural language readable', () => {
    const selected: SelectedTag[] = [
      { tagId: 'masterpiece', weight: 1.4 },
      { tagId: 'long_hair', weight: 1.2 },
    ]
    const result = formatDallE(selected, findTag)
    expect(result).toContain('high-quality')
    expect(result).toContain('long hair')
    expect(result).not.toContain('(')
    expect(result).not.toContain(':1.2')
  })

  it('appends uncategorized custom tags at the end of the sentence', () => {
    const selected: SelectedTag[] = [{ tagId: '1girl' }, { tagId: 'cyberpunk_city' }]
    const result = formatDallE(selected, findTag)

    expect(result).toContain('a girl')
    expect(result).toContain('with cyberpunk city')
  })
})

describe('formatDallENegative', () => {
  it('formats negative tags as avoidance guidance', () => {
    const selected: SelectedTag[] = [{ tagId: 'lowres' }, { tagId: 'bad_hands' }]
    const result = formatDallENegative(selected, findTag)
    expect(result).toMatch(/^Avoid /)
    expect(result).toContain('lowres')
    expect(result).toContain('bad hands')
    expect(result).toContain('.')
  })

  it('uses different negative guidance for illustration and photo styles', () => {
    const selected: SelectedTag[] = [{ tagId: 'lowres' }, { tagId: 'bad_hands' }]
    const illustration = formatDallENegative(selected, findTag, 'illustration')
    const photo = formatDallENegative(selected, findTag, 'photo')
    expect(illustration).toContain('illustration')
    expect(photo).toContain('photo')
    expect(illustration).not.toBe(photo)
  })
})
