import { useState } from 'react'
import { useFindTag } from '../../hooks/useAllTags'
import { useMobileLayout } from '../../hooks/useMobileLayout'
import { usePromptStore } from '../../stores/usePromptStore'
import { WorkspaceTag } from './WorkspaceTag'

interface ActiveTagActions {
  tagId: string
  isNegative: boolean
  weight?: number
}

interface MobileTagActionSheetProps {
  activeTag: ActiveTagActions
  tagText: string
  tagTranslation?: string
  onClose: () => void
  onDecreaseWeight: () => void
  onIncreaseWeight: () => void
  onMove: () => void
}

function MobileTagActionSheet({
  activeTag,
  tagText,
  tagTranslation,
  onClose,
  onDecreaseWeight,
  onIncreaseWeight,
  onMove,
}: MobileTagActionSheetProps) {
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label="Dismiss tag actions"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tag actions"
        className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-zinc-800 bg-zinc-950 px-4 pb-5 pt-3 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-700" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-100">{tagText}</p>
            {tagTranslation && (
              <p className="text-xs text-zinc-400">{tagTranslation}</p>
            )}
            {!activeTag.isNegative && (
              <p className="text-xs text-zinc-400">Weight {(activeTag.weight ?? 1).toFixed(1)}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close tag actions"
            onClick={onClose}
            className="rounded bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
        <div className="grid gap-2">
          {!activeTag.isNegative && (
            <>
              <button
                type="button"
                aria-label="Decrease weight"
                onClick={onDecreaseWeight}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-left text-sm text-zinc-100 transition-colors hover:bg-zinc-800"
              >
                -0.1
              </button>
              <button
                type="button"
                aria-label="Increase weight"
                onClick={onIncreaseWeight}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-left text-sm text-zinc-100 transition-colors hover:bg-zinc-800"
              >
                +0.1
              </button>
            </>
          )}
          <button
            type="button"
            aria-label={activeTag.isNegative ? 'Move to Positive' : 'Move to Negative'}
            onClick={onMove}
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-left text-sm text-zinc-100 transition-colors hover:bg-zinc-800"
          >
            {activeTag.isNegative ? 'Move to Positive' : 'Move to Negative'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Workspace() {
  const selectedTags = usePromptStore((s) => s.selectedTags)
  const negativeTags = usePromptStore((s) => s.negativeTags)
  const clearAll = usePromptStore((s) => s.clearAll)
  const savePreset = usePromptStore((s) => s.savePreset)
  const setWeight = usePromptStore((s) => s.setWeight)
  const moveToNegative = usePromptStore((s) => s.moveToNegative)
  const moveToPositive = usePromptStore((s) => s.moveToPositive)
  const findTag = useFindTag()
  const isMobileLayout = useMobileLayout()
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [activeTag, setActiveTag] = useState<ActiveTagActions | null>(null)

  const isEmpty = selectedTags.length === 0 && negativeTags.length === 0

  const handleSavePreset = () => {
    const name = presetName.trim()
    if (!name) return
    savePreset(name)
    setPresetName('')
    setShowSaveDialog(false)
  }

  const openTagActions = (tagId: string, weight: number | undefined, isNegative: boolean) => {
    if (!isMobileLayout) return
    setActiveTag({ tagId, weight, isNegative })
  }

  const handleDecreaseWeight = () => {
    if (!activeTag || activeTag.isNegative) return
    const nextWeight = Math.max(0.1, Math.round(((activeTag.weight ?? 1) - 0.1) * 10) / 10)
    setWeight(activeTag.tagId, nextWeight)
    setActiveTag({ ...activeTag, weight: nextWeight })
  }

  const handleIncreaseWeight = () => {
    if (!activeTag || activeTag.isNegative) return
    const nextWeight = Math.min(2, Math.round(((activeTag.weight ?? 1) + 0.1) * 10) / 10)
    setWeight(activeTag.tagId, nextWeight)
    setActiveTag({ ...activeTag, weight: nextWeight })
  }

  const handleMove = () => {
    if (!activeTag) return

    if (activeTag.isNegative) {
      moveToPositive(activeTag.tagId)
      setActiveTag(null)
      return
    }

    moveToNegative(activeTag.tagId)
    setActiveTag(null)
  }

  const activeTagDetails = activeTag ? findTag(activeTag.tagId) : null

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      {/* Positive tags */}
      <section aria-label="Positive tags section" className="flex-1">
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
              <WorkspaceTag
                key={st.tagId}
                tagId={st.tagId}
                weight={st.weight}
                onActivate={() => openTagActions(st.tagId, st.weight, false)}
              />
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
      <section aria-label="Negative tags section">
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
                onActivate={() => openTagActions(st.tagId, st.weight, true)}
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
      {isMobileLayout && activeTag && activeTagDetails && (
        <MobileTagActionSheet
          activeTag={activeTag}
          tagText={activeTagDetails.text}
          tagTranslation={activeTagDetails.translation}
          onClose={() => setActiveTag(null)}
          onDecreaseWeight={handleDecreaseWeight}
          onIncreaseWeight={handleIncreaseWeight}
          onMove={handleMove}
        />
      )}
    </div>
  )
}
