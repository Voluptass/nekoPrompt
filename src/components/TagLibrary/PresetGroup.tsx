import { useState } from 'react'
import { usePromptStore } from '../../stores/usePromptStore'

export function PresetGroup() {
  const presets = usePromptStore((s) => s.presets)
  const loadPreset = usePromptStore((s) => s.loadPreset)
  const deletePreset = usePromptStore((s) => s.deletePreset)
  const [expanded, setExpanded] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)

  if (presets.length === 0) return null

  return (
    <div className="border-t border-zinc-800">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-violet-400 hover:bg-zinc-900/50 cursor-pointer"
      >
        <span>Presets ({presets.length})</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-2 pb-2 flex flex-col gap-0.5">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => loadPreset(p.id)}
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ id: p.id, x: e.clientX, y: e.clientY })
              }}
              className="flex items-center justify-between px-2 py-1.5 text-sm text-zinc-300 rounded hover:bg-zinc-800 cursor-pointer text-left group"
            >
              <span className="truncate">{p.name}</span>
              <span className="text-xs text-zinc-600 group-hover:text-zinc-400">
                {p.tags.length + p.negativeTags.length}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
            onKeyDown={() => {}}
            role="presentation"
          />
          <div
            className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded shadow-lg py-1 min-w-[120px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              type="button"
              onClick={() => {
                deletePreset(contextMenu.id)
                setContextMenu(null)
              }}
              className="w-full px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-700 cursor-pointer text-left"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
