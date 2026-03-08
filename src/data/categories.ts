import type { Category } from '../types'

export const builtinCategories: Category[] = [
  { id: 'quality', name: '质量', order: 0 },
  { id: 'character', name: '人物', order: 1 },
  { id: 'appearance', name: '外貌', order: 2 },
  { id: 'clothing', name: '服装', order: 3 },
  { id: 'expression', name: '表情/动作', order: 4 },
  { id: 'scene', name: '场景', order: 5 },
  { id: 'style', name: '风格', order: 6 },
  { id: 'lighting', name: '光影', order: 7 },
  { id: 'composition', name: '构图', order: 8 },
  { id: 'negative', name: '负面常用', order: 9 },
]
