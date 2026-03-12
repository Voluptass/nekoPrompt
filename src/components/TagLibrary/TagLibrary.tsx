import { useState } from 'react'
import { CreateTagModal, ManageModal } from '../Common'
import { useAllCategories, useAllTags } from '../../hooks/useAllTags'
import { filterTags } from '../../hooks/useTagSearch'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import { CategoryGroup } from './CategoryGroup'
import { PresetGroup } from './PresetGroup'

interface TagLibraryProps {
  searchQuery?: string
}

export function TagLibrary({ searchQuery = '' }: TagLibraryProps) {
  const allTags = useAllTags()
  const allCategories = useAllCategories()
  const customTagCount = useCustomTagStore((state) => state.customTags.length)
  const filtered = filterTags(allTags, searchQuery)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [manageModalOpen, setManageModalOpen] = useState(false)

  return (
    <>
      <div className="h-full overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="rounded border border-violet-700 bg-violet-950/40 px-2.5 py-1.5 text-xs text-violet-300 transition-colors hover:bg-violet-900/50"
          >
            + 新建标签
          </button>
          {customTagCount > 0 && (
            <button
              type="button"
              onClick={() => setManageModalOpen(true)}
              className="rounded bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              管理
            </button>
          )}
        </div>
        {allCategories.map((cat) => {
          const catTags = filtered.filter((t) => t.category === cat.id)
          return <CategoryGroup key={cat.id} category={cat} tags={catTags} />
        })}
        <PresetGroup />
      </div>
      <CreateTagModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <ManageModal open={manageModalOpen} onClose={() => setManageModalOpen(false)} />
    </>
  )
}
