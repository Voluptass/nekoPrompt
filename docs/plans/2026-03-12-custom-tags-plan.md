# Custom Tags Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add custom tag/category CRUD with persistent storage, mixed TagLibrary display, and unified SD/DALL·E formatting.

**Architecture:** Independent `useCustomTagStore` (Zustand + persist) manages custom tags/categories. A `useAllTags` hook merges builtin + custom for unified lookup. All components switch from `builtinTags` to the merged hook.

**Tech Stack:** React 19, TypeScript, Zustand (persist), TailwindCSS 4, Vite, Vitest

**Spec:** `docs/plans/2026-03-12-custom-tags-design.md`

---

## Chunk 1: Data Layer

### Task 1: Create useCustomTagStore

**Files:**
- Create: `src/stores/useCustomTagStore.ts`

- [ ] **Step 1: Create store with CRUD actions**

```typescript
// src/stores/useCustomTagStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tag, Category } from '../types'
import { usePromptStore } from './usePromptStore'

interface CustomTagStore {
  customTags: Tag[]
  customCategories: Category[]

  addCustomTag: (tag: Omit<Tag, 'id'>) => void
  updateCustomTag: (id: string, updates: Partial<Omit<Tag, 'id'>>) => void
  deleteCustomTag: (id: string) => void

  addCustomCategory: (cat: Omit<Category, 'id' | 'order'>) => void
  updateCustomCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void
  deleteCustomCategory: (id: string) => void
}

function nextCategoryOrder(cats: Category[]): number {
  return cats.length === 0 ? 100 : Math.max(...cats.map((c) => c.order)) + 1
}

function removeTagIdFromStore(tagId: string) {
  const ps = usePromptStore.getState()
  const filter = (arr: { tagId: string }[]) => arr.filter((t) => t.tagId !== tagId)
  usePromptStore.setState({
    selectedTags: filter(ps.selectedTags),
    negativeTags: filter(ps.negativeTags),
    presets: ps.presets.map((p) => ({
      ...p,
      tags: filter(p.tags),
      negativeTags: filter(p.negativeTags),
    })),
  })
}

export const useCustomTagStore = create<CustomTagStore>()(
  persist(
    (set, get) => ({
      customTags: [],
      customCategories: [],

      addCustomTag: (tag) =>
        set((s) => ({
          customTags: [...s.customTags, { ...tag, id: `custom-${crypto.randomUUID()}` }],
        })),

      updateCustomTag: (id, updates) =>
        set((s) => ({
          customTags: s.customTags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteCustomTag: (id) => {
        removeTagIdFromStore(id)
        set((s) => ({ customTags: s.customTags.filter((t) => t.id !== id) }))
      },

      addCustomCategory: (cat) =>
        set((s) => ({
          customCategories: [
            ...s.customCategories,
            { ...cat, id: `custom-cat-${crypto.randomUUID()}`, order: nextCategoryOrder(s.customCategories) },
          ],
        })),

      updateCustomCategory: (id, updates) =>
        set((s) => ({
          customCategories: s.customCategories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCustomCategory: (id) => {
        // Cascade: remove affected tags from usePromptStore before deleting
        const tagsToRemove = get().customTags.filter((t) => t.category === id)
        tagsToRemove.forEach((t) => removeTagIdFromStore(t.id))
        set((s) => ({
          customCategories: s.customCategories.filter((c) => c.id !== id),
          customTags: s.customTags.filter((t) => t.category !== id),
        }))
      },
    }),
    {
      name: 'nekoPrompt:customTags',
      version: 1,
      migrate: (persisted, version) => {
        if (version === 0) {
          const old = (persisted ?? {}) as Record<string, unknown>
          return {
            customTags: Array.isArray(old.customTags) ? old.customTags : [],
            customCategories: Array.isArray(old.customCategories) ? old.customCategories : [],
          }
        }
        return persisted as { customTags: Tag[]; customCategories: Category[] }
      },
    }
  )
)
```

- [ ] **Step 2: Verify store compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/stores/useCustomTagStore.ts
git commit -m "feat: add useCustomTagStore with CRUD and delete cascade"
```

---

### Task 2: Create useAllTags hook

**Files:**
- Create: `src/hooks/useAllTags.ts`

- [ ] **Step 1: Create unified lookup hooks**

```typescript
// src/hooks/useAllTags.ts
import { useMemo, useCallback } from 'react'
import { builtinTags, builtinCategories } from '../data'
import { useCustomTagStore } from '../stores/useCustomTagStore'
import type { Tag, Category } from '../types'

export function useAllTags(): Tag[] {
  const customTags = useCustomTagStore((s) => s.customTags)
  return useMemo(() => [...builtinTags, ...customTags], [customTags])
}

export function useAllCategories(): Category[] {
  const customCategories = useCustomTagStore((s) => s.customCategories)
  return useMemo(
    () => [...builtinCategories, ...customCategories].sort((a, b) => a.order - b.order),
    [customCategories]
  )
}

export function useFindTag(): (id: string) => Tag {
  const allTags = useAllTags()
  return useCallback(
    (id: string): Tag => allTags.find((t) => t.id === id) ?? { id, text: id, category: '' },
    [allTags]
  )
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAllTags.ts
git commit -m "feat: add useAllTags/useAllCategories/useFindTag hooks"
```

---

### Task 3: Update formatPrompt for custom categories

**Files:**
- Modify: `src/utils/formatPrompt.ts:174-214` (formatDallE function)

- [ ] **Step 1: Add misc bucket to formatDallE**

In `formatDallE`, after the `byCategory` block (line 192), add misc collection. Replace the sentence-building section:

```typescript
// Add after line 192, inside formatDallE:
const knownCategories = new Set([
  'quality', 'character', 'appearance', 'clothing',
  'expression', 'scene', 'style', 'lighting', 'composition', 'negative',
])
const misc = uniq(
  resolvedTags.filter((t) => !knownCategories.has(t.category)).map((t) => t.text)
)

// ... existing sentence building stays the same ...
// Before the return, after composition line, add:
if (misc.length) sentence += `, with ${joinNaturally(misc)}`
```

- [ ] **Step 2: Run existing tests**

Run: `npx vitest run src/utils/formatPrompt.test.ts`
Expected: All existing tests pass (misc is empty for builtin tags)

- [ ] **Step 3: Commit**

```bash
git add src/utils/formatPrompt.ts
git commit -m "feat: add misc category fallback in formatDallE"
```

---

### Task 4: Replace builtinTags lookups in Preview, Workspace, WorkspaceTag

**Files:**
- Modify: `src/components/Preview/Preview.tsx:3,14-15`
- Modify: `src/components/Workspace/Workspace.tsx:3,28`
- Modify: `src/components/Workspace/WorkspaceTag.tsx:2,23-24`

- [ ] **Step 1: Update Preview.tsx**

Replace:
```typescript
import { builtinTags } from '../../data'
// ...
const findTag = (id: string): Tag =>
  builtinTags.find((t) => t.id === id) ?? { id, text: id, category: '' }
```

With:
```typescript
import { useFindTag } from '../../hooks/useAllTags'
// ...
const findTag = useFindTag()
```

Remove unused `Tag` import if `type Tag` was only used for `findTag` return type (it's also used in the file, so keep it).

- [ ] **Step 2: Update WorkspaceTag.tsx**

Replace:
```typescript
import { builtinTags } from '../../data'
// ...
const tag = builtinTags.find((t) => t.id === tagId)
if (!tag) return null
```

With:
```typescript
import { useFindTag } from '../../hooks/useAllTags'
// ...
const findTag = useFindTag()
const tag = findTag(tagId)
```

Remove the `if (!tag) return null` guard (useFindTag always returns a fallback).

- [ ] **Step 3: Update Workspace.tsx**

Replace:
```typescript
import { builtinTags } from '../../data'
// ...
const tag = builtinTags.find((item) => item.id === activeTag.tagId)
```

With:
```typescript
import { useFindTag } from '../../hooks/useAllTags'
// ...
const findTag = useFindTag()
// ... inside MobileTagActionSheet:
const tag = findTag(activeTag.tagId)
```

- [ ] **Step 4: Verify compiles and existing tests pass**

Run: `npx tsc --noEmit && npx vitest run`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/components/Preview/Preview.tsx src/components/Workspace/WorkspaceTag.tsx src/components/Workspace/Workspace.tsx
git commit -m "refactor: replace builtinTags lookups with useFindTag hook"
```

---

### Task 5: Update TagLibrary to use merged tags/categories

**Files:**
- Modify: `src/components/TagLibrary/TagLibrary.tsx:1,11,15-18`

- [ ] **Step 1: Replace builtinTags/builtinCategories with hooks**

Replace:
```typescript
import { builtinCategories, builtinTags } from '../../data'
```

With:
```typescript
import { useAllTags, useAllCategories } from '../../hooks/useAllTags'
```

Inside the component, replace:
```typescript
const filtered = filterTags(builtinTags, searchQuery)
```

With:
```typescript
const allTags = useAllTags()
const allCategories = useAllCategories()
const filtered = filterTags(allTags, searchQuery)
```

Replace `builtinCategories` references with `allCategories` in the map/render section.

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/TagLibrary/TagLibrary.tsx
git commit -m "refactor: TagLibrary uses merged tags/categories hooks"
```

---

## Chunk 2: UI Components

### Task 6: Create TagItem visual distinction for custom tags

**Files:**
- Modify: `src/components/TagLibrary/TagItem.tsx`

- [ ] **Step 1: Add custom tag visual indicator**

The `TagItem` component receives a `Tag` prop. Add a check for `tag.id.startsWith('custom-')` to render the `✦` marker and purple gradient border.

In the button className logic, add a condition for custom tags alongside the existing selected/negative states. For unselected custom tags, use:
```
bg-gradient-to-r from-zinc-800 to-violet-950/30 border-violet-700 text-violet-300
```

Append ` ✦` to the displayed tag text when the tag is custom.

- [ ] **Step 2: Verify visually**

Run: `npx vite dev`
Expected: Custom tags (once added) show ✦ marker with purple tint

- [ ] **Step 3: Commit**

```bash
git add src/components/TagLibrary/TagItem.tsx
git commit -m "feat: custom tag visual distinction with ✦ marker"
```

---

### Task 7: Add custom category badge in CategoryGroup

**Files:**
- Modify: `src/components/TagLibrary/CategoryGroup.tsx`

- [ ] **Step 1: Add "自定义" badge for custom categories**

Check `category.id.startsWith('custom-cat-')` and render a small badge:
```html
<span className="text-[9px] text-violet-400 bg-violet-950 px-1.5 rounded ml-1.5">自定义</span>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TagLibrary/CategoryGroup.tsx
git commit -m "feat: custom category badge in TagLibrary"
```

---

### Task 8: Create CreateTagModal

**Files:**
- Create: `src/components/Common/CreateTagModal.tsx`

- [ ] **Step 1: Build progressive form modal**

```typescript
// src/components/Common/CreateTagModal.tsx
import { useState } from 'react'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import { useAllCategories } from '../../hooks/useAllTags'
import type { Tag, Platform } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  editTag?: Tag // if provided, edit mode
}

export function CreateTagModal({ open, onClose, editTag }: Props) {
  const { addCustomTag, updateCustomTag, addCustomCategory } = useCustomTagStore()
  const allCategories = useAllCategories()

  const [text, setText] = useState(editTag?.text ?? '')
  const [category, setCategory] = useState(editTag?.category ?? '')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [aliases, setAliases] = useState(editTag?.aliases?.join(', ') ?? '')
  const [description, setDescription] = useState(editTag?.description ?? '')
  const [platforms, setPlatforms] = useState<Platform[]>(editTag?.platforms ?? [])
  const [newCatName, setNewCatName] = useState('')
  const [showNewCat, setShowNewCat] = useState(false)

  const handleSubmit = () => {
    if (!text.trim() || (!category && !newCatName.trim())) return

    let catId = category
    if (showNewCat && newCatName.trim()) {
      // Create new category inline
      const tempId = `custom-cat-${crypto.randomUUID()}`
      addCustomCategory({ name: newCatName.trim() })
      // Get the just-created category's actual ID
      const created = useCustomTagStore.getState().customCategories.at(-1)
      catId = created?.id ?? tempId
    }

    const tagData: Omit<Tag, 'id'> = {
      text: text.trim(),
      category: catId,
      ...(aliases.trim() && { aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean) }),
      ...(description.trim() && { description: description.trim() }),
      ...(platforms.length > 0 && { platforms }),
    }

    if (editTag) {
      updateCustomTag(editTag.id, tagData)
    } else {
      addCustomTag(tagData)
    }
    onClose()
  }

  if (!open) return null

  const allPlatforms: Platform[] = ['sd', 'dalle', 'mj', 'general']
  const togglePlatform = (p: Platform) =>
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-lg p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-zinc-200">{editTag ? '编辑标签' : '新建标签'}</h3>
          <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">✕</button>
        </div>

        {/* Tag text */}
        <div className="mb-3">
          <label className="block text-xs text-zinc-500 mb-1">标签文本 *</label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如: cyberpunk city"
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-600"
          />
        </div>

        {/* Category select */}
        <div className="mb-3">
          <label className="block text-xs text-zinc-500 mb-1">分类 *</label>
          {showNewCat ? (
            <div className="flex gap-2">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="新分类名称"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-600"
              />
              <button type="button" onClick={() => setShowNewCat(false)} className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer">取消</button>
            </div>
          ) : (
            <select
              value={category}
              onChange={(e) => {
                if (e.target.value === '__new__') { setShowNewCat(true); setCategory('') }
                else setCategory(e.target.value)
              }}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-600"
            >
              <option value="">选择分类...</option>
              {allCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
              <option value="__new__">新建分类...</option>
            </select>
          )}
        </div>

        {/* Advanced toggle */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 cursor-pointer"
          >
            <span>{showAdvanced ? '▼' : '▶'}</span> 高级选项
          </button>

          {showAdvanced && (
            <div className="mt-2 pl-3 border-l-2 border-zinc-700 flex flex-col gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">别名（逗号分隔）</label>
                <input
                  value={aliases}
                  onChange={(e) => setAliases(e.target.value)}
                  placeholder="例: cyber, neon city"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">描述</label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="标签用途说明"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-600"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">适用平台</label>
                <div className="flex gap-1.5 flex-wrap">
                  {allPlatforms.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`px-2 py-0.5 text-xs rounded cursor-pointer transition-colors ${
                        platforms.includes(p)
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {p === 'sd' ? 'SD' : p === 'dalle' ? 'DALL·E' : p === 'mj' ? 'MJ' : 'General'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs text-zinc-400 bg-zinc-800 border border-zinc-700 rounded hover:bg-zinc-700 cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || (!category && !showNewCat) || (showNewCat && !newCatName.trim())}
            className="px-4 py-1.5 text-xs text-white bg-violet-600 rounded hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {editTag ? '保存' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Common/CreateTagModal.tsx
git commit -m "feat: CreateTagModal with progressive form"
```

---

### Task 9: Create ManageModal

**Files:**
- Create: `src/components/Common/ManageModal.tsx`

- [ ] **Step 1: Build management modal with tabs**

```typescript
// src/components/Common/ManageModal.tsx
import { useState } from 'react'
import { useCustomTagStore } from '../../stores/useCustomTagStore'
import { useAllCategories } from '../../hooks/useAllTags'
import { CreateTagModal } from './CreateTagModal'
import type { Tag } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
}

type Tab = 'tags' | 'categories'

export function ManageModal({ open, onClose }: Props) {
  const { customTags, customCategories, deleteCustomTag, deleteCustomCategory, updateCustomCategory } = useCustomTagStore()
  const allCategories = useAllCategories()
  const [tab, setTab] = useState<Tab>('tags')
  const [editTag, setEditTag] = useState<Tag | undefined>()
  const [editCatId, setEditCatId] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (!open) return null

  const getCategoryName = (catId: string) => allCategories.find((c) => c.id === catId)?.name ?? catId

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
        <div
          className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-[70vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-200">管理自定义标签</h3>
            <button type="button" onClick={onClose} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">✕</button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3">
            {(['tags', 'categories'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs rounded cursor-pointer transition-colors ${
                  tab === t ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {t === 'tags' ? '标签' : '分类'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'tags' && (
              customTags.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">还没有自定义标签</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {customTags.map((tag) => (
                    <div key={tag.id} className="flex items-center justify-between bg-zinc-800 rounded px-3 py-2">
                      <div>
                        <span className="text-sm text-zinc-200">{tag.text}</span>
                        <span className="text-xs text-zinc-500 ml-2">{getCategoryName(tag.category)}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setEditTag(tag)} className="text-xs text-zinc-400 hover:text-violet-400 cursor-pointer">✏️</button>
                        {confirmDelete === tag.id ? (
                          <button type="button" onClick={() => { deleteCustomTag(tag.id); setConfirmDelete(null) }} className="text-xs text-red-400 cursor-pointer">确认?</button>
                        ) : (
                          <button type="button" onClick={() => setConfirmDelete(tag.id)} className="text-xs text-zinc-400 hover:text-red-400 cursor-pointer">🗑️</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === 'categories' && (
              customCategories.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-8">还没有自定义分类</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {customCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between bg-zinc-800 rounded px-3 py-2">
                      {editCatId === cat.id ? (
                        <input
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          onBlur={() => { updateCustomCategory(cat.id, { name: editCatName }); setEditCatId(null) }}
                          onKeyDown={(e) => { if (e.key === 'Enter') { updateCustomCategory(cat.id, { name: editCatName }); setEditCatId(null) } }}
                          className="bg-zinc-700 border border-violet-600 rounded px-2 py-1 text-sm text-zinc-200 outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-sm text-zinc-200">{cat.name}</span>
                      )}
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => { setEditCatId(cat.id); setEditCatName(cat.name) }} className="text-xs text-zinc-400 hover:text-violet-400 cursor-pointer">✏️</button>
                        {confirmDelete === cat.id ? (
                          <button type="button" onClick={() => { deleteCustomCategory(cat.id); setConfirmDelete(null) }} className="text-xs text-red-400 cursor-pointer">确认?</button>
                        ) : (
                          <button type="button" onClick={() => setConfirmDelete(cat.id)} className="text-xs text-zinc-400 hover:text-red-400 cursor-pointer">🗑️</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-zinc-800 text-xs text-zinc-500">
            共 {customTags.length} 个自定义标签，{customCategories.length} 个自定义分类
          </div>
        </div>
      </div>

      {/* Edit tag modal (layered on top) */}
      {editTag && (
        <CreateTagModal open={true} onClose={() => setEditTag(undefined)} editTag={editTag} />
      )}
    </>
  )
}
```

- [ ] **Step 2: Verify compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/Common/ManageModal.tsx
git commit -m "feat: ManageModal for custom tags/categories"
```

---

### Task 10: Add buttons to TagLibrary header

**Files:**
- Modify: `src/components/TagLibrary/TagLibrary.tsx`

- [ ] **Step 1: Add "+ 新建标签" and "管理" buttons**

Add state for modal visibility. Render buttons at the top of TagLibrary, before the category groups. Wire up:
- "+" button → opens CreateTagModal
- "管理" button → opens ManageModal (only visible when customTags.length > 0)

- [ ] **Step 2: Update Common/index.ts exports**

Add exports for `CreateTagModal` and `ManageModal`.

- [ ] **Step 3: Verify dev server**

Run: `npx vite dev`
Expected: Buttons visible, modals open/close correctly

- [ ] **Step 4: Commit**

```bash
git add src/components/TagLibrary/TagLibrary.tsx src/components/Common/CreateTagModal.tsx src/components/Common/ManageModal.tsx src/components/Common/index.ts
git commit -m "feat: wire CreateTagModal and ManageModal into TagLibrary"
```

---

## Chunk 3: Import/Export & Polish

### Task 11: Update import/export for custom tags

**Files:**
- Modify: `src/components/Common/Header.tsx:31-39,42-77`

- [ ] **Step 1: Update handleExport**

In `handleExport`, replace empty arrays with actual store data:

```typescript
import { useCustomTagStore } from '../../stores/useCustomTagStore'
// ...
const { customTags, customCategories } = useCustomTagStore.getState()
// Include in UserData:
customTags,
customCategories,
```

- [ ] **Step 2: Update handleImport**

In `handleImport`, after validating, restore custom data:

```typescript
useCustomTagStore.setState({ customTags: data.customTags, customCategories: data.customCategories })
```

- [ ] **Step 3: Verify export/import roundtrip manually**

Run: `npx vite dev`
Expected: Export includes custom tags, import restores them

- [ ] **Step 4: Commit**

```bash
git add src/components/Common/Header.tsx
git commit -m "feat: import/export includes custom tags and categories"
```

---

### Task 12: Final verification

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All existing tests pass

- [ ] **Step 3: Build check**

Run: `npx vite build`
Expected: Build succeeds

- [ ] **Step 4: Manual smoke test**

Run: `npx vite dev`
Verify:
1. Create a custom tag → appears in TagLibrary with ✦ marker
2. Create a custom category → appears with "自定义" badge
3. Select custom tag → appears in Workspace
4. Preview shows custom tag in both SD and DALL·E formats
5. DALL·E format: custom-category tag appears in sentence tail
6. Edit/delete custom tag from Manage modal
7. Delete cascade: deleted tag removed from workspace
8. Export → import roundtrip preserves custom tags
9. Page reload → custom tags persist (localStorage)
