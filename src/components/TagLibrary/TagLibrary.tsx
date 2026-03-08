import { builtinCategories, builtinTags } from '../../data'
import { filterTags } from '../../hooks/useTagSearch'
import { CategoryGroup } from './CategoryGroup'
import { PresetGroup } from './PresetGroup'

interface TagLibraryProps {
  searchQuery?: string
}

export function TagLibrary({ searchQuery = '' }: TagLibraryProps) {
  const filtered = filterTags(builtinTags, searchQuery)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      {builtinCategories.map((cat) => {
        const catTags = filtered.filter((t) => t.category === cat.id)
        return <CategoryGroup key={cat.id} category={cat} tags={catTags} />
      })}
      <PresetGroup />
    </div>
  )
}
