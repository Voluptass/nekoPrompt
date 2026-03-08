import { describe, it, expect, beforeEach } from 'vitest'
import { loadUserData, saveUserData } from '../useLocalStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('useLocalStorage', () => {
  it('returns default data when nothing stored', () => {
    const data = loadUserData()
    expect(data.version).toBe(1)
    expect(data.presets).toEqual([])
  })

  it('saves and loads user data', () => {
    const data = loadUserData()
    data.presets = [
      { id: '1', name: 'test', tags: [], negativeTags: [], createdAt: 0 },
    ]
    saveUserData(data)
    const loaded = loadUserData()
    expect(loaded.presets).toHaveLength(1)
    expect(loaded.presets[0].name).toBe('test')
  })
})
