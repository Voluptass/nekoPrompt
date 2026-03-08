import { describe, it, expect, beforeEach } from 'vitest'
import { usePromptStore } from '../usePromptStore'

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
})
