import { useState } from 'react'
import type { Category, Tag } from '../../types'
import { TagItem } from './TagItem'

interface CategoryGroupProps {
  category: Category
  tags: Tag[]
}

export function CategoryGroup({ category, tags }: CategoryGroupProps) {
  const [expanded, setExpanded] = useState(false)

  if (tags.length === 0) return null

  const isNegativeCategory = category.id === 'negative'
  const isCustomCategory = category.id.startsWith('custom-cat-')

  return (
    <div className="border-b border-zinc-800 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50 transition-colors cursor-pointer"
      >
        <span className="text-xs text-zinc-500">{expanded ? '▾' : '▸'}</span>
        <span className={isNegativeCategory ? 'text-red-400' : ''}>{category.name}</span>
        {isCustomCategory && (
          <span className="rounded bg-violet-950 px-1.5 text-[9px] text-violet-400">自定义</span>
        )}
        <span className={`ml-auto text-xs ${isNegativeCategory ? 'text-red-500/70' : 'text-zinc-600'}`}>{tags.length}</span>
      </button>
      {expanded && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TagItem key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  )
}
