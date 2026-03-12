import { useFindTag } from '../../hooks/useAllTags'
import { usePromptStore } from '../../stores/usePromptStore'

interface WorkspaceTagProps {
  tagId: string
  weight?: number
  isNegative?: boolean
  onActivate?: () => void
}

export function WorkspaceTag({
  tagId,
  weight,
  isNegative = false,
  onActivate,
}: WorkspaceTagProps) {
  const removeTag = usePromptStore((s) => s.removeTag)
  const removeNegativeTag = usePromptStore((s) => s.removeNegativeTag)
  const setWeight = usePromptStore((s) => s.setWeight)
  const moveToNegative = usePromptStore((s) => s.moveToNegative)
  const moveToPositive = usePromptStore((s) => s.moveToPositive)
  const findTag = useFindTag()

  const tag = findTag(tagId)

  const displayWeight = weight && weight !== 1.0
  const remove = isNegative ? removeNegativeTag : removeTag

  const adjustWeight = (delta: number) => {
    const current = weight ?? 1.0
    setWeight(tagId, current + delta)
  }

  return (
    <div
      onClick={onActivate}
      className={`
        group flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-all duration-150
        ${onActivate ? 'cursor-pointer' : ''}
        ${isNegative ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'}
      `}
    >
      <span>{tag.text}</span>
      {displayWeight && (
        <span className="text-xs text-zinc-500">({weight})</span>
      )}

      <span className="hidden group-hover:flex items-center gap-0.5 ml-1">
        {!isNegative && (
          <>
            <button
              type="button"
              aria-label="Decrease weight"
              onClick={(event) => {
                event.stopPropagation()
                adjustWeight(-0.1)
              }}
              className="w-4 h-4 flex items-center justify-center text-xs text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-700 cursor-pointer"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Increase weight"
              onClick={(event) => {
                event.stopPropagation()
                adjustWeight(0.1)
              }}
              className="w-4 h-4 flex items-center justify-center text-xs text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-700 cursor-pointer"
            >
              +
            </button>
          </>
        )}
        <button
          type="button"
          aria-label={isNegative ? 'Move to Positive' : 'Move to Negative'}
          onClick={(event) => {
            event.stopPropagation()
            if (isNegative) {
              moveToPositive(tagId)
              return
            }
            moveToNegative(tagId)
          }}
          className="w-4 h-4 flex items-center justify-center text-zinc-500 hover:text-zinc-300 rounded hover:bg-zinc-700 cursor-pointer"
          title={isNegative ? '移至正面' : '移至负面'}
        >
          {isNegative ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M8 14a.75.75 0 0 1-.75-.75V4.56L4.03 7.78a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.75 4.56v8.69A.75.75 0 0 1 8 14Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M8 2a.75.75 0 0 1 .75.75v8.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.22 3.22V2.75A.75.75 0 0 1 8 2Z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </span>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          remove(tagId)
        }}
        className="ml-auto text-xs text-zinc-600 hover:text-zinc-300 cursor-pointer"
      >
        ✕
      </button>
    </div>
  )
}
