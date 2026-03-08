import { useState } from 'react'
import { usePromptStore } from '../../stores/usePromptStore'
import { WorkspaceTag } from './WorkspaceTag'

export function Workspace() {
  const selectedTags = usePromptStore((s) => s.selectedTags)
  const negativeTags = usePromptStore((s) => s.negativeTags)
  const clearAll = usePromptStore((s) => s.clearAll)
  const savePreset = usePromptStore((s) => s.savePreset)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')

  const isEmpty = selectedTags.length === 0 && negativeTags.length === 0

  const handleSavePreset = () => {
    const name = presetName.trim()
    if (!name) return
    savePreset(name)
    setPresetName('')
    setShowSaveDialog(false)
  }

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      {/* Positive tags */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-zinc-400">Positive Tags</h2>
          {!isEmpty && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
        {selectedTags.length === 0 ? (
          <p className="text-sm text-zinc-600 italic">
            Click tags from the library to add them here
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((st) => (
              <WorkspaceTag key={st.tagId} tagId={st.tagId} weight={st.weight} />
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="flex items-center gap-2 text-zinc-700">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs">Negative</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* Negative tags */}
      <section>
        {negativeTags.length === 0 ? (
          <p className="text-sm text-zinc-600 italic">
            Right-click tags to move them here
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {negativeTags.map((st) => (
              <WorkspaceTag
                key={st.tagId}
                tagId={st.tagId}
                weight={st.weight}
                isNegative
              />
            ))}
          </div>
        )}
      </section>

      {/* Save as preset */}
      {!isEmpty && (
        <div className="pt-2 border-t border-zinc-800">
          {showSaveDialog ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                placeholder="Preset name..."
                autoFocus
                className="flex-1 px-2 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded
                  text-zinc-200 placeholder:text-zinc-500
                  focus:outline-none focus:border-violet-500"
              />
              <button
                type="button"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="px-3 py-1.5 text-xs bg-violet-600 text-white rounded
                  hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => { setShowSaveDialog(false); setPresetName('') }}
                className="px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSaveDialog(true)}
              className="w-full py-1.5 text-xs text-zinc-400 bg-zinc-800/50 border border-zinc-800 rounded
                hover:bg-zinc-800 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Save as preset
            </button>
          )}
        </div>
      )}
    </div>
  )
}
