import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SelectedTag, Preset } from '../types'

type PersistedState = {
  selectedTags: SelectedTag[]
  negativeTags: SelectedTag[]
  presets: Preset[]
}

export function migratePersistedState(
  persisted: unknown,
  version: number
): PersistedState {
  if (version === 0) {
    const old = (persisted ?? {}) as Record<string, unknown>
    return {
      selectedTags: Array.isArray(old.selectedTags) ? old.selectedTags : [],
      negativeTags: Array.isArray(old.negativeTags) ? old.negativeTags : [],
      presets: Array.isArray(old.presets) ? old.presets : [],
    }
  }
  return persisted as PersistedState
}

interface PromptStore {
  // State
  selectedTags: SelectedTag[]
  negativeTags: SelectedTag[]
  presets: Preset[]

  // Tag actions
  addTag: (tagId: string) => void
  removeTag: (tagId: string) => void
  toggleTag: (tagId: string) => void
  addNegativeTag: (tagId: string) => void
  removeNegativeTag: (tagId: string) => void
  moveToNegative: (tagId: string) => void
  moveToPositive: (tagId: string) => void
  setWeight: (tagId: string, weight: number) => void
  clearAll: () => void

  // Preset actions
  savePreset: (name: string) => void
  loadPreset: (presetId: string) => void
  deletePreset: (presetId: string) => void

  // Reset
  reset: () => void
}

const clampWeight = (w: number) =>
  Math.round(Math.max(0.1, Math.min(2.0, w)) * 10) / 10

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      selectedTags: [],
      negativeTags: [],
      presets: [],

      addTag: (tagId) =>
        set((s) => {
          if (s.selectedTags.some((t) => t.tagId === tagId)) return s
          return { selectedTags: [...s.selectedTags, { tagId }] }
        }),

      removeTag: (tagId) =>
        set((s) => ({
          selectedTags: s.selectedTags.filter((t) => t.tagId !== tagId),
        })),

      toggleTag: (tagId) => {
        const { selectedTags } = get()
        if (selectedTags.some((t) => t.tagId === tagId)) {
          get().removeTag(tagId)
        } else {
          get().addTag(tagId)
        }
      },

      addNegativeTag: (tagId) =>
        set((s) => {
          if (s.negativeTags.some((t) => t.tagId === tagId)) return s
          return { negativeTags: [...s.negativeTags, { tagId }] }
        }),

      removeNegativeTag: (tagId) =>
        set((s) => ({
          negativeTags: s.negativeTags.filter((t) => t.tagId !== tagId),
        })),

      moveToNegative: (tagId) =>
        set((s) => ({
          selectedTags: s.selectedTags.filter((t) => t.tagId !== tagId),
          negativeTags: s.negativeTags.some((t) => t.tagId === tagId)
            ? s.negativeTags
            : [...s.negativeTags, { tagId }],
        })),

      moveToPositive: (tagId) =>
        set((s) => ({
          negativeTags: s.negativeTags.filter((t) => t.tagId !== tagId),
          selectedTags: s.selectedTags.some((t) => t.tagId === tagId)
            ? s.selectedTags
            : [...s.selectedTags, { tagId }],
        })),

      setWeight: (tagId, weight) =>
        set((s) => ({
          selectedTags: s.selectedTags.map((t) =>
            t.tagId === tagId ? { ...t, weight: clampWeight(weight) } : t
          ),
        })),

      clearAll: () => set({ selectedTags: [], negativeTags: [] }),

      savePreset: (name) =>
        set((s) => ({
          presets: [
            ...s.presets,
            {
              id: crypto.randomUUID(),
              name,
              tags: [...s.selectedTags],
              negativeTags: [...s.negativeTags],
              createdAt: Date.now(),
            },
          ],
        })),

      loadPreset: (presetId) =>
        set((s) => {
          const preset = s.presets.find((p) => p.id === presetId)
          if (!preset) return s
          return {
            selectedTags: [...preset.tags],
            negativeTags: [...preset.negativeTags],
          }
        }),

      deletePreset: (presetId) =>
        set((s) => ({
          presets: s.presets.filter((p) => p.id !== presetId),
        })),

      reset: () => set({ selectedTags: [], negativeTags: [], presets: [] }),
    }),
    {
      name: 'nekoPrompt:workspace',
      version: 1,
      migrate: migratePersistedState,
      partialize: (state) => ({
        selectedTags: state.selectedTags,
        negativeTags: state.negativeTags,
        presets: state.presets,
      }),
    }
  )
)
