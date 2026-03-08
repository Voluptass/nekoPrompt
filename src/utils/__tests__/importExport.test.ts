import { describe, it, expect } from 'vitest'
import { exportUserData, validateImport } from '../importExport'
import type { UserData } from '../../types'

describe('importExport', () => {
  const validData: UserData = {
    version: 1,
    customTags: [],
    customCategories: [],
    hiddenBuiltinTags: [],
    presets: [],
    settings: { defaultPlatform: 'sd' },
  }

  it('exports user data as JSON string', () => {
    const json = exportUserData(validData)
    expect(JSON.parse(json)).toEqual(validData)
  })

  it('validates correct import data', () => {
    const json = JSON.stringify(validData)
    expect(validateImport(json).success).toBe(true)
  })

  it('rejects invalid JSON', () => {
    expect(validateImport('not json').success).toBe(false)
  })

  it('rejects data without version', () => {
    expect(validateImport('{"customTags":[]}').success).toBe(false)
  })
})
