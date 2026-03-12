import { describe, it, expect } from 'vitest'
import { filterTags } from '../useTagSearch'
import type { Tag } from '../../types'

const tags: Tag[] = [
  { id: '1', text: '1girl', category: 'c', aliases: ['one girl'] },
  { id: '2', text: 'blue eyes', translation: '蓝色眼睛', category: 'c' },
]

describe('filterTags', () => {
  it('matches by text', () => {
    expect(filterTags(tags, 'girl')).toHaveLength(1)
  })

  it('matches by alias', () => {
    expect(filterTags(tags, 'one')).toHaveLength(1)
  })

  it('returns all when query is empty', () => {
    expect(filterTags(tags, '')).toHaveLength(2)
  })

  it('is case insensitive', () => {
    expect(filterTags(tags, 'BLUE')).toHaveLength(1)
  })

  it('matches by translation', () => {
    expect(filterTags(tags, '蓝色')).toHaveLength(1)
  })
})
