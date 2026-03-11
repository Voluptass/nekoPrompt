import type { SelectedTag, Tag } from '../types'

type TagLookup = (id: string) => Tag

function collectTags(tags: SelectedTag[], findTag: TagLookup): Tag[] {
  return tags
    .map((st) => findTag(st.tagId))
    .filter((tag): tag is Tag => Boolean(tag))
}

function joinNaturally(texts: string[]): string {
  if (texts.length <= 1) return texts[0] ?? ''
  if (texts.length === 2) return `${texts[0]} and ${texts[1]}`
  return `${texts.slice(0, -1).join(', ')}, and ${texts[texts.length - 1]}`
}

function uniq(texts: string[]): string[] {
  return [...new Set(texts.filter(Boolean))]
}

function withArticle(text: string): string {
  if (/^(a|an|the)\b/i.test(text)) return text
  if (text.endsWith('s')) return text
  return `${/^[aeiou]/i.test(text) ? 'an' : 'a'} ${text}`
}

function normalizeCharacter(text: string): string {
  switch (text) {
    case '1girl':
      return 'a girl'
    case '1boy':
      return 'a boy'
    case 'couple':
      return 'a couple'
    default:
      return text
  }
}

function normalizeQuality(text: string): string {
  switch (text) {
    case 'masterpiece':
    case 'best quality':
      return 'high-quality'
    case 'highres':
    case 'absurdres':
    case 'incredibly absurdres':
      return 'high-resolution'
    case 'ultra-detailed':
    case 'detailed background':
      return 'highly detailed'
    default:
      return text
  }
}

function normalizeExpression(text: string): string {
  switch (text) {
    case 'smile':
      return 'smiling'
    case 'open mouth':
      return 'with an open mouth'
    case 'looking at viewer':
      return 'looking at the viewer'
    case 'closed eyes':
      return 'with closed eyes'
    case 'blush':
      return 'blushing'
    default:
      return text
  }
}

function normalizeScene(text: string): string {
  switch (text) {
    case 'classroom':
      return 'in a classroom'
    case 'city':
      return 'in the city'
    case 'beach':
      return 'on a beach'
    case 'forest':
      return 'in a forest'
    case 'night':
      return 'at night'
    case 'sunset':
      return 'at sunset'
    default:
      return text
  }
}

function buildSceneClause(texts: string[]): string {
  const normalized = uniq(texts.map(normalizeScene))
  const locations = normalized.filter((text) => /^in |^on |^outdoors$|^indoors$/.test(text))
  const times = normalized.filter((text) => /^at /.test(text))
  const misc = normalized.filter((text) => !locations.includes(text) && !times.includes(text))

  const parts: string[] = []

  if (locations.length && times.length) {
    parts.push(`${locations[0]} ${times.join(' ')}`)
    if (locations.length > 1) parts.push(...locations.slice(1))
  } else {
    parts.push(...locations)
    parts.push(...times)
  }

  parts.push(...misc)
  return joinNaturally(parts)
}

function normalizeStyle(text: string): string {
  return `${withArticle(text)} style`
}

function normalizeComposition(text: string): string {
  switch (text) {
    case 'close-up':
      return 'framed as a close-up'
    case 'full body':
      return 'shown in a full-body composition'
    default:
      return `with ${text} composition`
  }
}

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
  const resolvedTags = collectTags(tags, findTag)
  if (resolvedTags.length === 0) return ''

  const byCategory = {
    quality: resolvedTags.filter((tag) => tag.category === 'quality').map((tag) => tag.text),
    character: resolvedTags.filter((tag) => tag.category === 'character').map((tag) => tag.text),
    appearance: resolvedTags.filter((tag) => tag.category === 'appearance').map((tag) => tag.text),
    clothing: resolvedTags.filter((tag) => tag.category === 'clothing').map((tag) => tag.text),
    expression: resolvedTags.filter((tag) => tag.category === 'expression').map((tag) => tag.text),
    scene: resolvedTags.filter((tag) => tag.category === 'scene').map((tag) => tag.text),
    style: resolvedTags.filter((tag) => tag.category === 'style').map((tag) => tag.text),
    lighting: resolvedTags.filter((tag) => tag.category === 'lighting').map((tag) => tag.text),
    composition: resolvedTags.filter((tag) => tag.category === 'composition').map((tag) => tag.text),
  }

  const quality = uniq(byCategory.quality.map(normalizeQuality))
  const subject = joinNaturally(uniq(byCategory.character.map(normalizeCharacter))) || 'a subject'
  const appearance = uniq(byCategory.appearance)
  const clothing = uniq(byCategory.clothing.map(withArticle))
  const expression = uniq(byCategory.expression.map(normalizeExpression))
  const scene = buildSceneClause(byCategory.scene)
  const style = uniq(byCategory.style.map(normalizeStyle))
  const lighting = uniq(byCategory.lighting)
  const composition = uniq(byCategory.composition.map(normalizeComposition))

  let sentence = quality.length
    ? `Create a ${joinNaturally(quality)} image of ${subject}`
    : `Create an image of ${subject}`

  if (appearance.length) sentence += ` with ${joinNaturally(appearance)}`
  if (clothing.length) sentence += `, wearing ${joinNaturally(clothing)}`
  if (expression.length) sentence += `, ${joinNaturally(expression)}`
  if (scene) sentence += `, ${scene}`
  if (style.length) sentence += `, in ${joinNaturally(style)}`
  if (lighting.length) sentence += `, with ${joinNaturally(lighting)}`
  if (composition.length) sentence += `, ${joinNaturally(composition)}`

  return `${sentence}.`
}

export function formatDallENegative(tags: SelectedTag[], findTag: TagLookup): string {
  const texts = uniq(collectTags(tags, findTag).map((tag) => tag.text))
  if (texts.length === 0) return ''
  return `Avoid ${joinNaturally(texts)}.`
}
