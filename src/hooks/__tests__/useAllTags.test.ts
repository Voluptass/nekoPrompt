import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { builtinCategories, builtinTags } from '../../data'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import { useAllCategories, useAllTags, useFindTag } from '../useAllTags'

describe('useAllTags hooks', () => {
  beforeEach(() => {
    localStorage.clear()
    useCustomTagStore.setState({ customTags: [], customCategories: [] })
  })

  it('merges builtin and custom tags', () => {
    act(() => {
      useCustomTagStore.setState({
        customTags: [{ id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' }],
        customCategories: [],
      })
    })

    const { result } = renderHook(() => useAllTags())

    expect(result.current).toHaveLength(builtinTags.length + 1)
    expect(result.current.at(-1)).toEqual({
      id: 'custom-tag-1',
      text: 'cyberpunk city',
      category: 'custom-cat-1',
    })
  })

  it('sorts builtin and custom categories by order', () => {
    act(() => {
      useCustomTagStore.setState({
        customTags: [],
        customCategories: [{ id: 'custom-cat-1', name: '自定义中段', order: 4.5 }],
      })
    })

    const { result } = renderHook(() => useAllCategories())
    const customIndex = result.current.findIndex((category) => category.id === 'custom-cat-1')
    const expressionIndex = result.current.findIndex((category) => category.id === 'expression')
    const sceneIndex = result.current.findIndex((category) => category.id === 'scene')

    expect(result.current).toHaveLength(builtinCategories.length + 1)
    expect(customIndex).toBeGreaterThan(expressionIndex)
    expect(customIndex).toBeLessThan(sceneIndex)
  })

  it('finds custom tags and returns a fallback for unknown ids', () => {
    act(() => {
      useCustomTagStore.setState({
        customTags: [{ id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' }],
        customCategories: [],
      })
    })

    const { result } = renderHook(() => useFindTag())

    expect(result.current('custom-tag-1')).toEqual({
      id: 'custom-tag-1',
      text: 'cyberpunk city',
      category: 'custom-cat-1',
    })
    expect(result.current('missing-tag')).toEqual({
      id: 'missing-tag',
      text: 'missing-tag',
      category: '',
    })
  })
})
