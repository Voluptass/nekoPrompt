import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, Tag } from '../types'
import { usePromptStore } from './usePromptStore'

type PersistedState = {
  customTags: Tag[]
  customCategories: Category[]
}

interface CustomTagStore {
  customTags: Tag[]
  customCategories: Category[]
  addCustomTag: (tag: Omit<Tag, 'id'>) => void
  updateCustomTag: (id: string, updates: Partial<Omit<Tag, 'id'>>) => void
  deleteCustomTag: (id: string) => void
  addCustomCategory: (cat: Omit<Category, 'id' | 'order'>) => void
  updateCustomCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void
  deleteCustomCategory: (id: string) => void
}

function nextCategoryOrder(categories: Category[]): number {
  return categories.length === 0 ? 100 : Math.max(...categories.map((category) => category.order)) + 1
}

function removeTagIdFromWorkspace(tagId: string) {
  const promptState = usePromptStore.getState()
  const filterSelectedTags = (tags: { tagId: string }[]) =>
    tags.filter((selectedTag) => selectedTag.tagId !== tagId)

  usePromptStore.setState({
    selectedTags: filterSelectedTags(promptState.selectedTags),
    negativeTags: filterSelectedTags(promptState.negativeTags),
    presets: promptState.presets.map((preset) => ({
      ...preset,
      tags: filterSelectedTags(preset.tags),
      negativeTags: filterSelectedTags(preset.negativeTags),
    })),
  })
}

export function migrateCustomTagState(persisted: unknown, version: number): PersistedState {
  if (version === 0) {
    const old = (persisted ?? {}) as Record<string, unknown>
    return {
      customTags: Array.isArray(old.customTags) ? (old.customTags as Tag[]) : [],
      customCategories: Array.isArray(old.customCategories)
        ? (old.customCategories as Category[])
        : [],
    }
  }

  return persisted as PersistedState
}

export const useCustomTagStore = create<CustomTagStore>()(
  persist(
    (set, get) => ({
      customTags: [],
      customCategories: [],

      addCustomTag: (tag) =>
        set((state) => ({
          customTags: [...state.customTags, { ...tag, id: `custom-${crypto.randomUUID()}` }],
        })),

      updateCustomTag: (id, updates) =>
        set((state) => ({
          customTags: state.customTags.map((tag) => (tag.id === id ? { ...tag, ...updates } : tag)),
        })),

      deleteCustomTag: (id) => {
        removeTagIdFromWorkspace(id)
        set((state) => ({
          customTags: state.customTags.filter((tag) => tag.id !== id),
        }))
      },

      addCustomCategory: (category) =>
        set((state) => ({
          customCategories: [
            ...state.customCategories,
            {
              ...category,
              id: `custom-cat-${crypto.randomUUID()}`,
              order: nextCategoryOrder(state.customCategories),
            },
          ],
        })),

      updateCustomCategory: (id, updates) =>
        set((state) => ({
          customCategories: state.customCategories.map((category) =>
            category.id === id ? { ...category, ...updates } : category
          ),
        })),

      deleteCustomCategory: (id) => {
        const tagsToRemove = get().customTags.filter((tag) => tag.category === id)
        tagsToRemove.forEach((tag) => removeTagIdFromWorkspace(tag.id))

        set((state) => ({
          customTags: state.customTags.filter((tag) => tag.category !== id),
          customCategories: state.customCategories.filter((category) => category.id !== id),
        }))
      },
    }),
    {
      name: 'nekoPrompt:customTags',
      version: 1,
      migrate: migrateCustomTagState,
      partialize: (state) => ({
        customTags: state.customTags,
        customCategories: state.customCategories,
      }),
    }
  )
)
