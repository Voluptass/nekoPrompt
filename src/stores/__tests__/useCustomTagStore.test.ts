import { beforeEach, describe, expect, it } from 'vitest'
import { usePromptStore } from '../usePromptStore'
import { useCustomTagStore, migrateCustomTagState } from '../useCustomTagStore'

describe('useCustomTagStore', () => {
  beforeEach(() => {
    localStorage.clear()
    usePromptStore.getState().reset()
    useCustomTagStore.setState({ customTags: [], customCategories: [] })
  })

  it('adds custom tags with generated ids', () => {
    useCustomTagStore.getState().addCustomTag({
      text: 'cyberpunk city',
      category: 'custom-cat-scene',
      aliases: ['neon city'],
    })

    expect(useCustomTagStore.getState().customTags).toEqual([
      expect.objectContaining({
        id: expect.stringMatching(/^custom-/),
        text: 'cyberpunk city',
        category: 'custom-cat-scene',
        aliases: ['neon city'],
      }),
    ])
  })

  it('deletes custom tags and removes them from workspace state and presets', () => {
    useCustomTagStore.setState({
      customTags: [{ id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-scene' }],
      customCategories: [],
    })
    usePromptStore.setState({
      selectedTags: [{ tagId: 'custom-tag-1' }, { tagId: 'masterpiece' }],
      negativeTags: [{ tagId: 'custom-tag-1' }, { tagId: 'lowres' }],
      presets: [
        {
          id: 'preset-1',
          name: 'Night city',
          tags: [{ tagId: 'custom-tag-1' }, { tagId: 'masterpiece' }],
          negativeTags: [{ tagId: 'custom-tag-1' }, { tagId: 'lowres' }],
          createdAt: 1,
        },
      ],
    })

    useCustomTagStore.getState().deleteCustomTag('custom-tag-1')

    expect(useCustomTagStore.getState().customTags).toEqual([])
    expect(usePromptStore.getState().selectedTags).toEqual([{ tagId: 'masterpiece' }])
    expect(usePromptStore.getState().negativeTags).toEqual([{ tagId: 'lowres' }])
    expect(usePromptStore.getState().presets).toEqual([
      {
        id: 'preset-1',
        name: 'Night city',
        tags: [{ tagId: 'masterpiece' }],
        negativeTags: [{ tagId: 'lowres' }],
        createdAt: 1,
      },
    ])
  })

  it('adds categories after builtin ordering and cascades category deletion', () => {
    useCustomTagStore.getState().addCustomCategory({ name: '自定义场景' })

    const customCategory = useCustomTagStore.getState().customCategories[0]
    expect(customCategory).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^custom-cat-/),
        name: '自定义场景',
        order: 100,
      })
    )

    useCustomTagStore.setState((state) => ({
      customTags: [
        ...state.customTags,
        { id: 'custom-tag-1', text: 'cyberpunk city', category: customCategory.id },
      ],
    }))
    usePromptStore.setState({
      selectedTags: [{ tagId: 'custom-tag-1' }],
      negativeTags: [{ tagId: 'custom-tag-1' }],
      presets: [
        {
          id: 'preset-1',
          name: 'Night city',
          tags: [{ tagId: 'custom-tag-1' }],
          negativeTags: [{ tagId: 'custom-tag-1' }],
          createdAt: 1,
        },
      ],
    })

    useCustomTagStore.getState().deleteCustomCategory(customCategory.id)

    expect(useCustomTagStore.getState().customCategories).toEqual([])
    expect(useCustomTagStore.getState().customTags).toEqual([])
    expect(usePromptStore.getState().selectedTags).toEqual([])
    expect(usePromptStore.getState().negativeTags).toEqual([])
    expect(usePromptStore.getState().presets).toEqual([
      {
        id: 'preset-1',
        name: 'Night city',
        tags: [],
        negativeTags: [],
        createdAt: 1,
      },
    ])
  })

  it('migrates version 0 persisted data with safe defaults', () => {
    expect(migrateCustomTagState({}, 0)).toEqual({
      customTags: [],
      customCategories: [],
    })

    expect(
      migrateCustomTagState(
        {
          customTags: [{ id: 'custom-tag-1', text: 'city', category: 'custom-cat-1' }],
          customCategories: [{ id: 'custom-cat-1', name: '场景', order: 100 }],
        },
        0
      )
    ).toEqual({
      customTags: [{ id: 'custom-tag-1', text: 'city', category: 'custom-cat-1' }],
      customCategories: [{ id: 'custom-cat-1', name: '场景', order: 100 }],
    })
  })

  it('persist config has version 1', () => {
    const persistOptions = (useCustomTagStore as any).persist
    expect(persistOptions).toBeDefined()
    expect(persistOptions.getOptions().version).toBe(1)
  })
})
