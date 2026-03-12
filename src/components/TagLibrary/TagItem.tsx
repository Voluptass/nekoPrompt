import { usePromptStore } from '../../stores/usePromptStore'
import type { Tag } from '../../types'

interface TagItemProps {
  tag: Tag
}

export function TagItem({ tag }: TagItemProps) {
  const toggleTag = usePromptStore((s) => s.toggleTag)
  const addNegativeTag = usePromptStore((s) => s.addNegativeTag)
  const removeNegativeTag = usePromptStore((s) => s.removeNegativeTag)
  const isSelected = usePromptStore((s) =>
    s.selectedTags.some((t) => t.tagId === tag.id)
  )
  const isNegative = usePromptStore((s) =>
    s.negativeTags.some((t) => t.tagId === tag.id)
  )

  const isNegativeCategory = tag.category === 'negative'
  const isCustomTag = tag.id.startsWith('custom-')

  const handleClick = () => {
    if (isNegativeCategory) {
      isNegative ? removeNegativeTag(tag.id) : addNegativeTag(tag.id)
    } else {
      toggleTag(tag.id)
    }
  }

  const title = [tag.translation, tag.text, tag.description].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        inline-flex items-start px-2 py-1 rounded text-sm text-left transition-colors cursor-pointer
        ${
          isNegativeCategory
            ? isNegative
              ? 'bg-red-800/60 text-red-200'
              : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
            : isSelected
              ? 'bg-violet-600 text-white'
              : isCustomTag
                ? 'border border-violet-700 bg-gradient-to-r from-zinc-800 to-violet-950/30 text-violet-300 hover:from-zinc-700 hover:to-violet-900/40'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
        }
      `}
      title={title}
    >
      <span className="flex flex-col items-start leading-tight">
        <span>
          {tag.text}
          {isCustomTag ? ' ✦' : ''}
        </span>
        {tag.translation && (
          <span className="text-[10px] opacity-80">{tag.translation}</span>
        )}
      </span>
    </button>
  )
}
