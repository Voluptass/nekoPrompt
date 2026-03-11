import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { usePromptStore } from './stores/usePromptStore'

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

describe('App responsive layout', () => {
  beforeEach(() => {
    localStorage.clear()
    usePromptStore.getState().reset()
  })

  it('keeps the three-panel layout on desktop screens', () => {
    mockViewport(false)

    render(<App />)

    expect(screen.getByLabelText('Tag library panel')).toBeInTheDocument()
    expect(screen.getByLabelText('Workspace panel')).toBeInTheDocument()
    expect(screen.getByLabelText('Preview panel')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tags' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Preview' })).not.toBeInTheDocument()
  })

  it('opens the mobile tag library and preview drawers from the header', async () => {
    mockViewport(true)
    const user = userEvent.setup()

    render(<App />)

    expect(screen.getByLabelText('Workspace panel')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toHaveClass('flex-wrap')
    expect(screen.getByRole('button', { name: 'Tags' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Tag library' })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Preview' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Tags' }))
    expect(screen.getByRole('dialog', { name: 'Tag library' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close tag library' }))
    expect(screen.queryByRole('dialog', { name: 'Tag library' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Preview' }))
    expect(screen.getByRole('dialog', { name: 'Preview' })).toBeInTheDocument()
  })
})
