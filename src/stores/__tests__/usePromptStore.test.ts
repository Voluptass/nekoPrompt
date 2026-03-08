import { describe, it, expect, beforeEach } from 'vitest'
import { usePromptStore, migratePersistedState } from '../usePromptStore'

describe('usePromptStore', () => {
  beforeEach(() => {
    usePromptStore.getState().reset()
  })

  describe('tag selection', () => {
    it('adds a tag to selected', () => {
      usePromptStore.getState().addTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toEqual([
        { tagId: 'masterpiece' },
      ])
    })

    it('removes a tag from selected', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().removeTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toEqual([])
    })

    it('does not add duplicate tags', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().addTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toHaveLength(1)
    })

    it('toggles a tag (add if missing, remove if present)', () => {
      usePromptStore.getState().toggleTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toHaveLength(1)
      usePromptStore.getState().toggleTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toHaveLength(0)
    })
  })

  describe('negative tags', () => {
    it('adds a tag to negative', () => {
      usePromptStore.getState().addNegativeTag('lowres')
      expect(usePromptStore.getState().negativeTags).toEqual([
        { tagId: 'lowres' },
      ])
    })

    it('moves tag from selected to negative', () => {
      usePromptStore.getState().addTag('lowres')
      usePromptStore.getState().moveToNegative('lowres')
      expect(usePromptStore.getState().selectedTags).toEqual([])
      expect(usePromptStore.getState().negativeTags).toEqual([
        { tagId: 'lowres' },
      ])
    })
  })

  describe('weight', () => {
    it('sets weight on a selected tag', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().setWeight('masterpiece', 1.2)
      expect(usePromptStore.getState().selectedTags[0].weight).toBe(1.2)
    })

    it('clamps weight between 0.1 and 2.0', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().setWeight('masterpiece', 3.0)
      expect(usePromptStore.getState().selectedTags[0].weight).toBe(2.0)
      usePromptStore.getState().setWeight('masterpiece', 0)
      expect(usePromptStore.getState().selectedTags[0].weight).toBe(0.1)
    })
  })

  describe('atomic move operations', () => {
    it('moveToNegative atomically moves tag from selectedTags to negativeTags', () => {
      usePromptStore.getState().addTag('lowres')
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().moveToNegative('lowres')

      const state = usePromptStore.getState()
      expect(state.selectedTags).toEqual([{ tagId: 'masterpiece' }])
      expect(state.negativeTags).toEqual([{ tagId: 'lowres' }])
    })

    it('moveToNegative does not duplicate if tag already in negativeTags', () => {
      usePromptStore.getState().addNegativeTag('lowres')
      usePromptStore.getState().addTag('lowres')
      usePromptStore.getState().moveToNegative('lowres')

      const state = usePromptStore.getState()
      expect(state.selectedTags).toEqual([])
      expect(state.negativeTags).toEqual([{ tagId: 'lowres' }])
    })

    it('moveToPositive atomically moves tag from negativeTags to selectedTags', () => {
      usePromptStore.getState().addNegativeTag('lowres')
      usePromptStore.getState().addNegativeTag('blurry')
      usePromptStore.getState().moveToPositive('lowres')

      const state = usePromptStore.getState()
      expect(state.negativeTags).toEqual([{ tagId: 'blurry' }])
      expect(state.selectedTags).toEqual([{ tagId: 'lowres' }])
    })

    it('moveToPositive does not duplicate if tag already in selectedTags', () => {
      usePromptStore.getState().addTag('lowres')
      usePromptStore.getState().addNegativeTag('lowres')
      usePromptStore.getState().moveToPositive('lowres')

      const state = usePromptStore.getState()
      expect(state.negativeTags).toEqual([])
      expect(state.selectedTags).toEqual([{ tagId: 'lowres' }])
    })
  })

  describe('persist migration', () => {
    it('persist config has version === 1', () => {
      // Access persist API to check version
      const persistOptions = (usePromptStore as any).persist
      expect(persistOptions).toBeDefined()
      expect(persistOptions.getOptions().version).toBe(1)
    })

    it('migrate handles version 0 data with valid arrays', () => {
      const v0Data = {
        selectedTags: [{ tagId: 'masterpiece' }],
        negativeTags: [{ tagId: 'lowres' }],
        presets: [],
      }
      const result = migratePersistedState(v0Data, 0)
      expect(result).toEqual({
        selectedTags: [{ tagId: 'masterpiece' }],
        negativeTags: [{ tagId: 'lowres' }],
        presets: [],
      })
    })

    it('migrate handles missing/undefined fields with safe defaults', () => {
      const result = migratePersistedState({}, 0)
      expect(result).toEqual({
        selectedTags: [],
        negativeTags: [],
        presets: [],
      })
    })

    it('migrate handles undefined persisted state', () => {
      const result = migratePersistedState(undefined, 0)
      expect(result).toEqual({
        selectedTags: [],
        negativeTags: [],
        presets: [],
      })
    })
  })
})
