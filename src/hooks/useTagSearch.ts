import type { Tag } from '../types'

export function filterTags(tags: Tag[], query: string): Tag[] {
  if (!query.trim()) return tags
  const q = query.toLowerCase()
  return tags.filter(
    (t) =>
      t.text.toLowerCase().includes(q) ||
      t.aliases?.some((a) => a.toLowerCase().includes(q))
  )
}
