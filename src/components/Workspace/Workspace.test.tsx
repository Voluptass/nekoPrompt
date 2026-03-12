import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Workspace } from './Workspace'
import { usePromptStore } from '../../stores/usePromptStore'

function mockViewport(matches: boolean) {
  const matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))

  vi.stubGlobal('matchMedia', matchMedia)
}

describe('Workspace mobile actions', () => {
  beforeEach(() => {
    localStorage.clear()
    usePromptStore.getState().reset()
  })

  it('opens a mobile action sheet for positive tags and supports weight + move actions', async () => {
    mockViewport(true)
    usePromptStore.setState({
      selectedTags: [{ tagId: 'masterpiece' }],
      negativeTags: [{ tagId: 'lowres' }],
      presets: [],
    })
    const user = userEvent.setup()

    render(<Workspace />)

    await user.click(screen.getByText('masterpiece'))

    const dialog = screen.getByRole('dialog', { name: 'Tag actions' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Increase weight' })).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Move to Negative' })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Increase weight' }))
    expect(screen.getByText('(1.1)')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Move to Negative' }))

    expect(screen.queryByRole('dialog', { name: 'Tag actions' })).not.toBeInTheDocument()

    const negativeSection = screen.getByLabelText('Negative tags section')
    expect(within(negativeSection).getByText('masterpiece')).toBeInTheDocument()
  })

  it('opens a mobile action sheet for negative tags and supports moving back to positive', async () => {
    mockViewport(true)
    usePromptStore.setState({
      selectedTags: [],
      negativeTags: [{ tagId: 'lowres' }],
      presets: [],
    })
    const user = userEvent.setup()

    render(<Workspace />)

    await user.click(screen.getByText('lowres'))

    const dialog = screen.getByRole('dialog', { name: 'Tag actions' })
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).queryByRole('button', { name: 'Increase weight' })).not.toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Move to Positive' })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Move to Positive' }))

    const positiveSection = screen.getByLabelText('Positive tags section')
    expect(within(positiveSection).getByText('lowres')).toBeInTheDocument()
  })

  it('keeps desktop hover controls available without opening the mobile action sheet', async () => {
    mockViewport(false)
    usePromptStore.setState({
      selectedTags: [{ tagId: 'masterpiece' }],
      negativeTags: [{ tagId: 'lowres' }],
      presets: [],
    })
    const user = userEvent.setup()

    render(<Workspace />)

    await user.click(screen.getByText('masterpiece'))

    expect(screen.queryByRole('dialog', { name: 'Tag actions' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Increase weight' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move to Negative' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Move to Positive' })).toBeInTheDocument()
  })
})
