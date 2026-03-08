import { usePromptStore } from '../../stores/usePromptStore'

function getStorageSize(): string {
  try {
    let total = 0
    for (const key of Object.keys(localStorage)) {
      total += localStorage.getItem(key)?.length ?? 0
    }
    const kb = (total * 2) / 1024 // UTF-16 = 2 bytes per char
    return kb < 1024 ? `${kb.toFixed(1)}KB` : `${(kb / 1024).toFixed(1)}MB`
  } catch {
    return '0KB'
  }
}

export function StatusBar() {
  const selectedCount = usePromptStore((s) => s.selectedTags.length)
  const negativeCount = usePromptStore((s) => s.negativeTags.length)

  return (
    <footer className="flex items-center gap-4 px-4 py-1.5 border-t border-zinc-800 bg-zinc-950/80 text-xs text-zinc-500">
      <span>
        Selected <span className="text-zinc-300">{selectedCount}</span> tags
      </span>
      <span className="text-zinc-700">|</span>
      <span>
        Negative <span className="text-zinc-300">{negativeCount}</span>
      </span>
      <span className="text-zinc-700">|</span>
      <span>
        Storage <span className="text-zinc-300">{getStorageSize()}</span> / 5MB
      </span>
    </footer>
  )
}
