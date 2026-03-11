import { useRef } from 'react'
import { SearchBar } from './SearchBar'
import { usePromptStore } from '../../stores/usePromptStore'
import {
  exportUserData,
  validateImport,
  triggerDownload,
  readFileAsText,
} from '../../utils/importExport'
import type { UserData } from '../../types'

interface HeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  isMobileLayout?: boolean
  onOpenTagLibrary?: () => void
  onOpenPreview?: () => void
}

export function Header({
  searchQuery,
  onSearchChange,
  isMobileLayout = false,
  onOpenTagLibrary,
  onOpenPreview,
}: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const store = usePromptStore()

  const handleExport = () => {
    const data: UserData = {
      version: 1,
      customTags: [],
      customCategories: [],
      hiddenBuiltinTags: [],
      presets: store.presets,
      settings: { defaultPlatform: 'sd' },
    }
    triggerDownload(exportUserData(data), 'nekoPrompt-backup.json')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const text = await readFileAsText(file)
    const result = validateImport(text)

    if (!result.success || !result.data) {
      alert(`Import failed: ${result.error}`)
      return
    }

    // Merge presets from imported data
    const imported = result.data
    if (imported.presets?.length) {
      for (const preset of imported.presets) {
        store.savePreset(preset.name)
        // Load the tags from imported preset
        const saved = usePromptStore.getState()
        const newPreset = saved.presets[saved.presets.length - 1]
        if (newPreset) {
          usePromptStore.setState((s) => ({
            presets: s.presets.map((p) =>
              p.id === newPreset.id
                ? { ...p, tags: preset.tags, negativeTags: preset.negativeTags }
                : p
            ),
          }))
        }
      }
    }

    alert('Import successful!')
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="flex flex-col gap-3 px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold tracking-tight text-zinc-100">
            neko<span className="text-violet-400">Prompt</span>
          </h1>
          {isMobileLayout && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenTagLibrary}
                className="rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
              >
                Tags
              </button>
              <button
                type="button"
                onClick={onOpenPreview}
                className="rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
              >
                Preview
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <SearchBar value={searchQuery} onChange={onSearchChange} />

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 text-xs text-zinc-400 bg-zinc-800 rounded hover:bg-zinc-700 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleExport}
              className="px-2.5 py-1.5 text-xs text-zinc-400 bg-zinc-800 rounded hover:bg-zinc-700 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
