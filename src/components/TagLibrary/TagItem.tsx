import { usePromptStore } from '../../stores/usePromptStore'
import type { Tag } from '../../types'

interface TagItemProps {
  tag: Tag
}

export function TagItem({ tag }: TagItemProps) {
  const toggleTag = usePromptStore((s) => s.toggleTag)
  const isSelected = usePromptStore((s) =>
    s.selectedTags.some((t) => t.tagId === tag.id)
  )
  const isNegative = usePromptStore((s) =>
    s.negativeTags.some((t) => t.tagId === tag.id)
  )

  return (
    <button
      type="button"
      onClick={() => toggleTag(tag.id)}
      className={`
        px-2 py-0.5 rounded text-sm transition-colors cursor-pointer
        ${
          isSelected
            ? 'bg-violet-600 text-white'
            : isNegative
              ? 'bg-red-900/50 text-red-300'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }
      `}
      title={tag.description || tag.text}
    >
      {tag.text}
    </button>
  )
}
