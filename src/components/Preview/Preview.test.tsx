import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { Preview } from './Preview'
import { usePromptStore } from '../../stores/usePromptStore'

describe('Preview DALL·E style toggle', () => {
  beforeEach(() => {
    localStorage.clear()
    usePromptStore.getState().reset()
    usePromptStore.setState({
      selectedTags: [
        { tagId: 'masterpiece' },
        { tagId: '1girl' },
        { tagId: 'long_hair' },
        { tagId: 'classroom' },
        { tagId: 'dramatic_lighting' },
        { tagId: 'close_up' },
      ],
      negativeTags: [{ tagId: 'lowres' }, { tagId: 'bad_hands' }],
    })
  })

  it('shows Illustration and Photo toggles only in DALL·E mode and switches prompt text', async () => {
    const user = userEvent.setup()

    render(<Preview />)

    const promptBox = screen.getByPlaceholderText('Select tags to generate prompt...')
    const negativeBox = screen.getByPlaceholderText('No negative tags...')

    expect(screen.queryByRole('button', { name: 'Illustration' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Photo' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'DALL·E Format' }))

    expect(screen.getByRole('button', { name: 'Illustration' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Photo' })).toBeInTheDocument()
    expect((promptBox as HTMLTextAreaElement).value).toContain('illustration')
    expect((negativeBox as HTMLTextAreaElement).value).toContain('illustration')

    await user.click(screen.getByRole('button', { name: 'Photo' }))

    expect((promptBox as HTMLTextAreaElement).value).toContain('photo')
    expect((negativeBox as HTMLTextAreaElement).value).toContain('photo')
    expect((promptBox as HTMLTextAreaElement).value).not.toContain('illustration')
  })
})
