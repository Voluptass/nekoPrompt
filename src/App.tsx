import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Header, StatusBar } from './components/Common'
import { TagLibrary } from './components/TagLibrary'
import { Workspace } from './components/Workspace'
import { Preview } from './components/Preview'

type ActiveDrawer = 'tags' | 'preview' | null

function useMobileLayout() {
  const getMatches = () =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches

  const [isMobileLayout, setIsMobileLayout] = useState(getMatches)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const syncLayout = () => setIsMobileLayout(mediaQuery.matches)
    syncLayout()

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncLayout)
      return () => mediaQuery.removeEventListener('change', syncLayout)
    }

    mediaQuery.addListener(syncLayout)
    return () => mediaQuery.removeListener(syncLayout)
  }, [])

  return isMobileLayout
}

interface MobileDrawerProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  position: 'left' | 'right'
  title: 'Tag library' | 'Preview'
}

function MobileDrawer({ children, isOpen, onClose, position, title }: MobileDrawerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label={`Dismiss ${title}`}
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute top-0 h-full w-[min(24rem,calc(100vw-2rem))] bg-zinc-950 shadow-2xl ${
          position === 'left'
            ? 'left-0 border-r border-zinc-800'
            : 'right-0 border-l border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-100">{title}</h2>
          <button
            type="button"
            aria-label={`Close ${title.toLowerCase()}`}
            onClick={onClose}
            className="rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
        <div className="h-[calc(100%-53px)] overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

export default function App() {
  const isMobileLayout = useMobileLayout()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null)

  useEffect(() => {
    if (!isMobileLayout) {
      setActiveDrawer(null)
    }
  }, [isMobileLayout])

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobileLayout={isMobileLayout}
        onOpenTagLibrary={() => setActiveDrawer('tags')}
        onOpenPreview={() => setActiveDrawer('preview')}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isMobileLayout ? (
          <main aria-label="Workspace panel" className="flex-1 overflow-hidden">
            <Workspace />
          </main>
        ) : (
          <>
            <aside aria-label="Tag library panel" className="w-64 shrink-0 overflow-hidden">
              <TagLibrary searchQuery={searchQuery} />
            </aside>
            <main
              aria-label="Workspace panel"
              className="flex-1 overflow-hidden border-x border-zinc-800"
            >
              <Workspace />
            </main>
            <aside aria-label="Preview panel" className="w-80 shrink-0 overflow-hidden">
              <Preview />
            </aside>
          </>
        )}
      </div>
      <StatusBar />
      <MobileDrawer
        title="Tag library"
        position="left"
        isOpen={isMobileLayout && activeDrawer === 'tags'}
        onClose={() => setActiveDrawer(null)}
      >
        <TagLibrary searchQuery={searchQuery} />
      </MobileDrawer>
      <MobileDrawer
        title="Preview"
        position="right"
        isOpen={isMobileLayout && activeDrawer === 'preview'}
        onClose={() => setActiveDrawer(null)}
      >
        <Preview />
      </MobileDrawer>
    </div>
  )
}
