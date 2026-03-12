import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import { usePromptStore } from '../../stores/usePromptStore'
import { TagLibrary } from './TagLibrary'

describe('TagLibrary custom tags', () => {
  beforeEach(() => {
    localStorage.clear()
    usePromptStore.getState().reset()
    useCustomTagStore.setState({ customTags: [], customCategories: [] })
  })

  it('renders searchable custom categories and custom tags with their visual marker', async () => {
    const user = userEvent.setup()

    useCustomTagStore.setState({
      customTags: [
        {
          id: 'custom-tag-1',
          text: 'cyberpunk city',
          category: 'custom-cat-1',
          aliases: ['neon skyline'],
        },
      ],
      customCategories: [{ id: 'custom-cat-1', name: 'Custom Scenes', order: 100 }],
    })

    render(<TagLibrary searchQuery="neon" />)

    await user.click(screen.getByRole('button', { name: /Custom Scenes/ }))

    const tagButton = screen.getByRole('button', { name: 'cyberpunk city ✦' })
    expect(tagButton).toHaveClass('border-violet-700')
    expect(tagButton).toHaveClass('text-violet-300')
  })

  it('shows a custom badge for custom categories', () => {
    useCustomTagStore.setState({
      customTags: [{ id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' }],
      customCategories: [{ id: 'custom-cat-1', name: 'Custom Scenes', order: 100 }],
    })

    render(<TagLibrary />)

    expect(screen.getByText('自定义')).toBeInTheDocument()
  })

  it('creates a custom tag and category from the tag library controls', async () => {
    const user = userEvent.setup()

    render(<TagLibrary />)

    await user.click(screen.getByRole('button', { name: '+ 新建标签' }))

    const dialog = screen.getByRole('dialog', { name: '新建标签' })
    await user.type(within(dialog).getByLabelText('标签文本'), 'cyberpunk city')
    await user.selectOptions(within(dialog).getByLabelText('分类'), '__new__')
    await user.type(within(dialog).getByLabelText('新分类名称'), '夜景灵感')
    await user.click(within(dialog).getByRole('button', { name: '创建' }))

    expect(useCustomTagStore.getState().customCategories).toEqual([
      expect.objectContaining({ name: '夜景灵感' }),
    ])
    expect(useCustomTagStore.getState().customTags).toEqual([
      expect.objectContaining({ text: 'cyberpunk city' }),
    ])
    expect(screen.getByRole('button', { name: /夜景灵感/ })).toBeInTheDocument()
  })

  it('deletes a custom tag from the manage modal', async () => {
    const user = userEvent.setup()

    useCustomTagStore.setState({
      customTags: [{ id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' }],
      customCategories: [{ id: 'custom-cat-1', name: 'Custom Scenes', order: 100 }],
    })

    render(<TagLibrary />)

    await user.click(screen.getByRole('button', { name: '管理' }))

    const dialog = screen.getByRole('dialog', { name: '管理自定义标签' })
    await user.click(within(dialog).getByRole('button', { name: '删除标签 cyberpunk city' }))
    await user.click(within(dialog).getByRole('button', { name: '确认删除标签 cyberpunk city' }))

    expect(useCustomTagStore.getState().customTags).toEqual([])
    expect(within(dialog).getByText('还没有自定义标签')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '管理' })).not.toBeInTheDocument()
  })
})
