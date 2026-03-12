import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import { usePromptStore } from '../../stores/usePromptStore'
import { Header } from './Header'

const { readFileAsTextMock, triggerDownloadMock } = vi.hoisted(() => ({
  readFileAsTextMock: vi.fn(),
  triggerDownloadMock: vi.fn(),
}))

vi.mock('../../utils/importExport', async () => {
  const actual = await vi.importActual<typeof import('../../utils/importExport')>(
    '../../utils/importExport'
  )

  return {
    ...actual,
    readFileAsText: readFileAsTextMock,
    triggerDownload: triggerDownloadMock,
  }
})

describe('Header import/export', () => {
  beforeEach(() => {
    localStorage.clear()
    usePromptStore.getState().reset()
    useCustomTagStore.setState({ customTags: [], customCategories: [] })
    triggerDownloadMock.mockReset()
    readFileAsTextMock.mockReset()
    vi.stubGlobal('alert', vi.fn())
  })

  it('exports custom tags and custom categories in the backup payload', async () => {
    const user = userEvent.setup()

    usePromptStore.setState({
      presets: [
        {
          id: 'preset-1',
          name: 'Night city',
          tags: [{ tagId: 'custom-tag-1' }],
          negativeTags: [],
          createdAt: 1,
        },
      ],
    })
    useCustomTagStore.setState({
      customTags: [{ id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' }],
      customCategories: [{ id: 'custom-cat-1', name: 'Custom Scenes', order: 100 }],
    })

    render(<Header searchQuery="" onSearchChange={() => {}} />)

    await user.click(screen.getByRole('button', { name: 'Export' }))

    expect(triggerDownloadMock).toHaveBeenCalledTimes(1)
    const [payload, filename] = triggerDownloadMock.mock.calls[0]
    const parsed = JSON.parse(payload)

    expect(parsed.customTags).toEqual([
      { id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' },
    ])
    expect(parsed.customCategories).toEqual([
      { id: 'custom-cat-1', name: 'Custom Scenes', order: 100 },
    ])
    expect(filename).toBe('nekoPrompt-backup.json')
  })

  it('restores custom tags and custom categories from an imported backup', async () => {
    readFileAsTextMock.mockResolvedValue(
      JSON.stringify({
        version: 1,
        customTags: [{ id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' }],
        customCategories: [{ id: 'custom-cat-1', name: 'Custom Scenes', order: 100 }],
        hiddenBuiltinTags: [],
        presets: [],
        settings: { defaultPlatform: 'sd' },
      })
    )

    const { container } = render(<Header searchQuery="" onSearchChange={() => {}} />)
    const fileInput = container.querySelector('input[type="file"]')

    expect(fileInput).not.toBeNull()

    fireEvent.change(fileInput as HTMLInputElement, {
      target: {
        files: [new File(['{}'], 'backup.json', { type: 'application/json' })],
      },
    })

    await waitFor(() =>
      expect(useCustomTagStore.getState().customTags).toEqual([
        { id: 'custom-tag-1', text: 'cyberpunk city', category: 'custom-cat-1' },
      ])
    )
    expect(useCustomTagStore.getState().customCategories).toEqual([
      { id: 'custom-cat-1', name: 'Custom Scenes', order: 100 },
    ])
    expect(globalThis.alert).toHaveBeenCalledWith('Import successful!')
  })
})
