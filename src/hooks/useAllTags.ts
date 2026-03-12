import { useCallback, useMemo } from 'react'
import { builtinCategories, builtinTags } from '../data'
import { useCustomTagStore } from '../stores/useCustomTagStore'
import type { Category, Tag } from '../types'

export function useAllTags(): Tag[] {
  const customTags = useCustomTagStore((state) => state.customTags)

  return useMemo(() => [...builtinTags, ...customTags], [customTags])
}

export function useAllCategories(): Category[] {
  const customCategories = useCustomTagStore((state) => state.customCategories)

  return useMemo(
    () => [...builtinCategories, ...customCategories].sort((left, right) => left.order - right.order),
    [customCategories]
  )
}

export function useFindTag(): (id: string) => Tag {
  const allTags = useAllTags()

  return useCallback(
    (id: string) => allTags.find((tag) => tag.id === id) ?? { id, text: id, category: '' },
    [allTags]
  )
}
