import type { SelectedTag, Tag } from '../types'

type TagLookup = (id: string) => Tag

export function formatSD(tags: SelectedTag[], findTag: TagLookup): string {
  return tags
    .map((st) => {
      const tag = findTag(st.tagId)
      if (!tag) return ''
      const w = st.weight
      if (w && w !== 1.0) return `(${tag.text}:${w})`
      return tag.text
    })
    .filter(Boolean)
    .join(', ')
}

export function formatDallE(tags: SelectedTag[], findTag: TagLookup): string {
  const texts = tags
    .map((st) => findTag(st.tagId)?.text)
    .filter(Boolean)
  if (texts.length === 0) return ''
  return texts.join(', ')
}
