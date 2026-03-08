import { usePromptStore } from '../../stores/usePromptStore'
import { builtinTags } from '../../data'

interface WorkspaceTagProps {
  tagId: string
  weight?: number
  isNegative?: boolean
}

export function WorkspaceTag({ tagId, weight, isNegative = false }: WorkspaceTagProps) {
  const removeTag = usePromptStore((s) => s.removeTag)
  const removeNegativeTag = usePromptStore((s) => s.removeNegativeTag)
  const setWeight = usePromptStore((s) => s.setWeight)
  const moveToNegative = usePromptStore((s) => s.moveToNegative)
  const moveToPositive = usePromptStore((s) => s.moveToPositive)

  const tag = builtinTags.find((t) => t.id === tagId)
  if (!tag) return null

  const displayWeight = weight && weight !== 1.0
  const remove = isNegative ? removeNegativeTag : removeTag

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isNegative) {
      moveToPositive(tagId)
    } else {
      moveToNegative(tagId)
    }
  }

  const adjustWeight = (delta: number) => {
    const current = weight ?? 1.0
    setWeight(tagId, current + delta)
  }

  return (
    <div
      className={`
        group flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-all duration-150
        ${isNegative ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}
      `}
      onContextMenu={handleContextMenu}
      title={isNegative ? 'Right-click: move to positive' : 'Right-click: move to negative'}
    >
      <span>{tag.text}</span>
      {displayWeight && (
        <span className="text-xs text-zinc-500">({weight})</span>
      )}

      {!isNegative && (
        <span className="hidden group-hover:flex items-center gap-0.5 ml-1">
          <button
            type="button"
            onClick={() => adjustWeight(-0.1)}
            className="w-4 h-4 flex items-center justify-center text-xs text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-700 cursor-pointer"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => adjustWeight(0.1)}
            className="w-4 h-4 flex items-center justify-center text-xs text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-700 cursor-pointer"
          >
            +
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={() => remove(tagId)}
        className="ml-auto text-xs text-zinc-600 hover:text-zinc-300 cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}
