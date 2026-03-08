# nekoPrompt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based text-to-image prompt manager with tag-based click-to-compose workflow.

**Architecture:** Pure frontend SPA using React 19 + TypeScript. State managed by Zustand, persisted to localStorage. Three-column layout: TagLibrary | Workspace | Preview. Built-in tag database as static JSON, user data layered on top.

**Tech Stack:** React 19, TypeScript, Vite, TailwindCSS 4, Zustand, Vitest + Testing Library

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `index.html`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Step 1: Scaffold Vite + React + TS project**

Run:
```bash
cd D:/GitHub/nekoPrompt
npm create vite@latest . -- --template react-ts
```

If prompted about existing files, choose to overwrite/ignore as needed.

**Step 2: Install dependencies**

Run:
```bash
npm install zustand
npm install -D tailwindcss @tailwindcss/vite vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Step 3: Configure Tailwind**

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

Replace `src/index.css` with:
```css
@import "tailwindcss";
```

**Step 4: Create test setup**

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom/vitest'
```

**Step 5: Clean up scaffolded files**

- Delete `src/App.css`
- Replace `src/App.tsx` with a minimal placeholder:

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <h1 className="text-2xl p-4">nekoPrompt</h1>
    </div>
  )
}
```

**Step 6: Verify dev server runs**

Run: `npm run dev`
Expected: App opens at localhost:5173 with dark background and "nekoPrompt" title.

**Step 7: Verify tests run**

Run: `npx vitest run`
Expected: Test suite initializes (0 tests or placeholder passes).

**Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TS + Tailwind project"
```

---

### Task 2: Type Definitions

**Files:**
- Create: `src/types/index.ts`

**Step 1: Write type definitions**

Create `src/types/index.ts`:
```typescript
export type Platform = 'sd' | 'dalle' | 'mj' | 'general'

export interface Tag {
  id: string
  text: string
  category: string
  aliases?: string[]
  description?: string
  platforms?: Platform[]
}

export interface Category {
  id: string
  name: string
  icon?: string
  order: number
}

export interface SelectedTag {
  tagId: string
  weight?: number
}

export interface Preset {
  id: string
  name: string
  tags: SelectedTag[]
  negativeTags: SelectedTag[]
  createdAt: number
}

export interface UserSettings {
  defaultPlatform: Platform
}

export interface UserData {
  version: number
  customTags: Tag[]
  customCategories: Category[]
  hiddenBuiltinTags: string[]
  presets: Preset[]
  settings: UserSettings
}

export interface WorkspaceState {
  selectedTags: SelectedTag[]
  negativeTags: SelectedTag[]
}
```

**Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

**Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add core type definitions"
```

---

### Task 3: Built-in Tag Data

**Files:**
- Create: `src/data/categories.ts`
- Create: `src/data/tags.ts`
- Create: `src/data/index.ts`
- Test: `src/data/__tests__/data.test.ts`

**Step 1: Write the test**

Create `src/data/__tests__/data.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { builtinCategories, builtinTags } from '../index'

describe('builtin data', () => {
  it('has categories with unique ids', () => {
    const ids = builtinCategories.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThan(0)
  })

  it('has tags with unique ids', () => {
    const ids = builtinTags.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.length).toBeGreaterThan(0)
  })

  it('every tag references a valid category', () => {
    const categoryIds = new Set(builtinCategories.map((c) => c.id))
    for (const tag of builtinTags) {
      expect(categoryIds.has(tag.category)).toBe(true)
    }
  })

  it('categories are ordered', () => {
    for (let i = 1; i < builtinCategories.length; i++) {
      expect(builtinCategories[i].order).toBeGreaterThanOrEqual(
        builtinCategories[i - 1].order
      )
    }
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/__tests__/data.test.ts`
Expected: FAIL - cannot find module.

**Step 3: Create categories data**

Create `src/data/categories.ts`:
```typescript
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
```

**Step 4: Create tags data**

Create `src/data/tags.ts` with a representative set of tags per category. Include at minimum 5-8 tags per category (total ~60-80 tags). Each tag follows the `Tag` interface with `id`, `text`, `category`, and optional `aliases`. Use the tag text as a base for the id (e.g., `id: 'masterpiece'`).

Categories to populate:
- quality: masterpiece, best quality, highres, absurdres, ultra-detailed
- character: 1girl, 1boy, solo, multiple girls, multiple boys
- appearance: long hair, short hair, blue eyes, red eyes, blonde hair, black hair, twintails, ponytail
- clothing: school uniform, dress, armor, hoodie, skirt, suit
- expression: smile, open mouth, sitting, standing, looking at viewer, closed eyes
- scene: outdoors, indoors, classroom, city, night, sunset, beach, forest
- style: anime, realistic, watercolor, pixel art, oil painting, illustration
- lighting: dramatic lighting, soft light, backlight, rim light, studio lighting
- composition: close-up, full body, upper body, from above, from below, portrait
- negative: lowres, bad hands, blurry, watermark, text, error, cropped, worst quality, low quality, normal quality

**Step 5: Create barrel export**

Create `src/data/index.ts`:
```typescript
export { builtinCategories } from './categories'
export { builtinTags } from './tags'
```

**Step 6: Run tests**

Run: `npx vitest run src/data/__tests__/data.test.ts`
Expected: All 4 tests PASS.

**Step 7: Commit**

```bash
git add src/data/ src/types/
git commit -m "feat: add builtin tag and category data"
```

---

### Task 4: Zustand Store - Core Logic

**Files:**
- Create: `src/stores/usePromptStore.ts`
- Test: `src/stores/__tests__/usePromptStore.test.ts`

**Step 1: Write failing tests for tag selection**

Create `src/stores/__tests__/usePromptStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { usePromptStore } from '../usePromptStore'

describe('usePromptStore', () => {
  beforeEach(() => {
    usePromptStore.getState().reset()
  })

  describe('tag selection', () => {
    it('adds a tag to selected', () => {
      usePromptStore.getState().addTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toEqual([
        { tagId: 'masterpiece' },
      ])
    })

    it('removes a tag from selected', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().removeTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toEqual([])
    })

    it('does not add duplicate tags', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().addTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toHaveLength(1)
    })

    it('toggles a tag (add if missing, remove if present)', () => {
      usePromptStore.getState().toggleTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toHaveLength(1)
      usePromptStore.getState().toggleTag('masterpiece')
      expect(usePromptStore.getState().selectedTags).toHaveLength(0)
    })
  })

  describe('negative tags', () => {
    it('adds a tag to negative', () => {
      usePromptStore.getState().addNegativeTag('lowres')
      expect(usePromptStore.getState().negativeTags).toEqual([
        { tagId: 'lowres' },
      ])
    })

    it('moves tag from selected to negative', () => {
      usePromptStore.getState().addTag('lowres')
      usePromptStore.getState().moveToNegative('lowres')
      expect(usePromptStore.getState().selectedTags).toEqual([])
      expect(usePromptStore.getState().negativeTags).toEqual([
        { tagId: 'lowres' },
      ])
    })
  })

  describe('weight', () => {
    it('sets weight on a selected tag', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().setWeight('masterpiece', 1.2)
      expect(usePromptStore.getState().selectedTags[0].weight).toBe(1.2)
    })

    it('clamps weight between 0.1 and 2.0', () => {
      usePromptStore.getState().addTag('masterpiece')
      usePromptStore.getState().setWeight('masterpiece', 3.0)
      expect(usePromptStore.getState().selectedTags[0].weight).toBe(2.0)
      usePromptStore.getState().setWeight('masterpiece', 0)
      expect(usePromptStore.getState().selectedTags[0].weight).toBe(0.1)
    })
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/stores/__tests__/usePromptStore.test.ts`
Expected: FAIL - cannot find module.

**Step 3: Implement the store**

Create `src/stores/usePromptStore.ts`:
```typescript
import { create } from 'zustand'
import type { SelectedTag, Preset } from '../types'

interface PromptStore {
  // State
  selectedTags: SelectedTag[]
  negativeTags: SelectedTag[]
  presets: Preset[]

  // Tag actions
  addTag: (tagId: string) => void
  removeTag: (tagId: string) => void
  toggleTag: (tagId: string) => void
  addNegativeTag: (tagId: string) => void
  removeNegativeTag: (tagId: string) => void
  moveToNegative: (tagId: string) => void
  moveToPositive: (tagId: string) => void
  setWeight: (tagId: string, weight: number) => void
  clearAll: () => void

  // Preset actions
  savePreset: (name: string) => void
  loadPreset: (presetId: string) => void
  deletePreset: (presetId: string) => void

  // Reset
  reset: () => void
}

const clampWeight = (w: number) => Math.round(Math.max(0.1, Math.min(2.0, w)) * 10) / 10

export const usePromptStore = create<PromptStore>((set, get) => ({
  selectedTags: [],
  negativeTags: [],
  presets: [],

  addTag: (tagId) =>
    set((s) => {
      if (s.selectedTags.some((t) => t.tagId === tagId)) return s
      return { selectedTags: [...s.selectedTags, { tagId }] }
    }),

  removeTag: (tagId) =>
    set((s) => ({
      selectedTags: s.selectedTags.filter((t) => t.tagId !== tagId),
    })),

  toggleTag: (tagId) => {
    const { selectedTags } = get()
    if (selectedTags.some((t) => t.tagId === tagId)) {
      get().removeTag(tagId)
    } else {
      get().addTag(tagId)
    }
  },

  addNegativeTag: (tagId) =>
    set((s) => {
      if (s.negativeTags.some((t) => t.tagId === tagId)) return s
      return { negativeTags: [...s.negativeTags, { tagId }] }
    }),

  removeNegativeTag: (tagId) =>
    set((s) => ({
      negativeTags: s.negativeTags.filter((t) => t.tagId !== tagId),
    })),

  moveToNegative: (tagId) => {
    get().removeTag(tagId)
    get().addNegativeTag(tagId)
  },

  moveToPositive: (tagId) => {
    get().removeNegativeTag(tagId)
    get().addTag(tagId)
  },

  setWeight: (tagId, weight) =>
    set((s) => ({
      selectedTags: s.selectedTags.map((t) =>
        t.tagId === tagId ? { ...t, weight: clampWeight(weight) } : t
      ),
    })),

  clearAll: () => set({ selectedTags: [], negativeTags: [] }),

  savePreset: (name) =>
    set((s) => ({
      presets: [
        ...s.presets,
        {
          id: crypto.randomUUID(),
          name,
          tags: [...s.selectedTags],
          negativeTags: [...s.negativeTags],
          createdAt: Date.now(),
        },
      ],
    })),

  loadPreset: (presetId) =>
    set((s) => {
      const preset = s.presets.find((p) => p.id === presetId)
      if (!preset) return s
      return {
        selectedTags: [...preset.tags],
        negativeTags: [...preset.negativeTags],
      }
    }),

  deletePreset: (presetId) =>
    set((s) => ({
      presets: s.presets.filter((p) => p.id !== presetId),
    })),

  reset: () => set({ selectedTags: [], negativeTags: [], presets: [] }),
}))
```

**Step 4: Run tests**

Run: `npx vitest run src/stores/__tests__/usePromptStore.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/stores/
git commit -m "feat: add Zustand prompt store with tag/preset management"
```

---

### Task 5: Prompt Formatter Utility

**Files:**
- Create: `src/utils/formatPrompt.ts`
- Test: `src/utils/__tests__/formatPrompt.test.ts`

**Step 1: Write failing tests**

Create `src/utils/__tests__/formatPrompt.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { formatSD, formatDallE } from '../formatPrompt'
import type { SelectedTag, Tag } from '../../types'

const mockTags: Tag[] = [
  { id: 'masterpiece', text: 'masterpiece', category: 'quality' },
  { id: '1girl', text: '1girl', category: 'character' },
  { id: 'long_hair', text: 'long hair', category: 'appearance' },
]

const findTag = (id: string) => mockTags.find((t) => t.id === id)!

describe('formatSD', () => {
  it('joins tags with commas', () => {
    const selected: SelectedTag[] = [{ tagId: 'masterpiece' }, { tagId: '1girl' }]
    expect(formatSD(selected, findTag)).toBe('masterpiece, 1girl')
  })

  it('applies weight brackets', () => {
    const selected: SelectedTag[] = [{ tagId: 'long_hair', weight: 1.2 }]
    expect(formatSD(selected, findTag)).toBe('(long hair:1.2)')
  })

  it('omits weight brackets for weight 1.0', () => {
    const selected: SelectedTag[] = [{ tagId: 'masterpiece', weight: 1.0 }]
    expect(formatSD(selected, findTag)).toBe('masterpiece')
  })

  it('returns empty string for empty list', () => {
    expect(formatSD([], findTag)).toBe('')
  })
})

describe('formatDallE', () => {
  it('joins tags into a natural sentence', () => {
    const selected: SelectedTag[] = [{ tagId: 'masterpiece' }, { tagId: '1girl' }]
    const result = formatDallE(selected, findTag)
    expect(result).toContain('masterpiece')
    expect(result).toContain('1girl')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/__tests__/formatPrompt.test.ts`
Expected: FAIL.

**Step 3: Implement formatters**

Create `src/utils/formatPrompt.ts`:
```typescript
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
```

**Step 4: Run tests**

Run: `npx vitest run src/utils/__tests__/formatPrompt.test.ts`
Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/utils/
git commit -m "feat: add SD and DALL·E prompt formatters"
```

---

### Task 6: localStorage Persistence

**Files:**
- Create: `src/hooks/useLocalStorage.ts`
- Modify: `src/stores/usePromptStore.ts` (add persist middleware)
- Test: `src/hooks/__tests__/useLocalStorage.test.ts`

**Step 1: Write failing test**

Create `src/hooks/__tests__/useLocalStorage.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { loadUserData, saveUserData } from '../useLocalStorage'

beforeEach(() => {
  localStorage.clear()
})

describe('useLocalStorage', () => {
  it('returns default data when nothing stored', () => {
    const data = loadUserData()
    expect(data.version).toBe(1)
    expect(data.presets).toEqual([])
  })

  it('saves and loads user data', () => {
    const data = loadUserData()
    data.presets = [
      { id: '1', name: 'test', tags: [], negativeTags: [], createdAt: 0 },
    ]
    saveUserData(data)
    const loaded = loadUserData()
    expect(loaded.presets).toHaveLength(1)
    expect(loaded.presets[0].name).toBe('test')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useLocalStorage.test.ts`
Expected: FAIL.

**Step 3: Implement persistence helpers**

Create `src/hooks/useLocalStorage.ts`:
```typescript
import type { UserData, WorkspaceState } from '../types'

const USER_DATA_KEY = 'nekoPrompt:userData'
const WORKSPACE_KEY = 'nekoPrompt:workspace'

const defaultUserData: UserData = {
  version: 1,
  customTags: [],
  customCategories: [],
  hiddenBuiltinTags: [],
  presets: [],
  settings: { defaultPlatform: 'sd' },
}

const defaultWorkspace: WorkspaceState = {
  selectedTags: [],
  negativeTags: [],
}

export function loadUserData(): UserData {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY)
    if (!raw) return { ...defaultUserData }
    return { ...defaultUserData, ...JSON.parse(raw) }
  } catch {
    return { ...defaultUserData }
  }
}

export function saveUserData(data: UserData): void {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(data))
}

export function loadWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY)
    if (!raw) return { ...defaultWorkspace }
    return { ...defaultWorkspace, ...JSON.parse(raw) }
  } catch {
    return { ...defaultWorkspace }
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(state))
}
```

**Step 4: Add Zustand persist middleware to store**

Modify `src/stores/usePromptStore.ts` to use `zustand/middleware` persist with the `WORKSPACE_KEY` for selectedTags/negativeTags and subscribe to sync presets to UserData. Approach: use Zustand's built-in `persist` middleware with a `partialize` to store only workspace-relevant state under `nekoPrompt:workspace`, and a separate `subscribe` to persist presets into `nekoPrompt:userData`.

**Step 5: Run tests**

Run: `npx vitest run`
Expected: All tests PASS.

**Step 6: Commit**

```bash
git add src/hooks/ src/stores/
git commit -m "feat: add localStorage persistence for workspace and user data"
```

---

### Task 7: TagLibrary Component

**Files:**
- Create: `src/components/TagLibrary/TagLibrary.tsx`
- Create: `src/components/TagLibrary/CategoryGroup.tsx`
- Create: `src/components/TagLibrary/TagItem.tsx`
- Create: `src/components/TagLibrary/index.ts`

**Step 1: Build TagItem component**

A single clickable tag pill. Highlighted when selected. On click, calls `toggleTag`.

**Step 2: Build CategoryGroup component**

Collapsible section with category name header + list of TagItems. Default collapsed, click to expand.

**Step 3: Build TagLibrary component**

Scrollable left column. Maps `builtinCategories` (sorted by order) → `CategoryGroup` for each, passing filtered tags.

**Step 4: Verify renders correctly in App**

Import TagLibrary into App.tsx, verify categories and tags display.

**Step 5: Commit**

```bash
git add src/components/TagLibrary/
git commit -m "feat: add TagLibrary component with collapsible categories"
```

---

### Task 8: Workspace Component

**Files:**
- Create: `src/components/Workspace/Workspace.tsx`
- Create: `src/components/Workspace/WorkspaceTag.tsx`
- Create: `src/components/Workspace/index.ts`

**Step 1: Build WorkspaceTag component**

Displays a selected tag with:
- Tag text + weight (if not 1.0)
- ✕ button to remove
- Scroll / +- buttons to adjust weight
- Right-click context menu: "Move to negative"

**Step 2: Build Workspace component**

Middle column split into:
- Positive tags section (list of WorkspaceTag)
- Divider "── 负面提示词 ──"
- Negative tags section (list of WorkspaceTag with "Move to positive" option)
- "Save as preset" button at bottom

**Step 3: Wire into App**

**Step 4: Commit**

```bash
git add src/components/Workspace/
git commit -m "feat: add Workspace component with weight control and negative tags"
```

---

### Task 9: Preview Component

**Files:**
- Create: `src/components/Preview/Preview.tsx`
- Create: `src/components/Preview/index.ts`

**Step 1: Build Preview component**

Right column showing:
- Read-only textarea with formatted prompt (positive)
- Divider
- Read-only textarea with formatted prompt (negative)
- Format toggle buttons: [SD 格式] [DALL·E 格式]
- [一键复制] button using `navigator.clipboard.writeText()`
- Copy feedback: brief "已复制!" toast

**Step 2: Wire formatSD/formatDallE from utils**

**Step 3: Wire into App**

**Step 4: Commit**

```bash
git add src/components/Preview/
git commit -m "feat: add Preview component with format toggle and copy"
```

---

### Task 10: App Layout + Header

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/Common/SearchBar.tsx`
- Create: `src/components/Common/Header.tsx`

**Step 1: Build Header with title, search bar, import/export buttons**

**Step 2: Build SearchBar**

Text input that filters tags in TagLibrary. Store search query in a simple `useState` in App, pass down as prop.

**Step 3: Assemble three-column layout in App.tsx**

```tsx
<div className="flex flex-col h-screen">
  <Header />
  <div className="flex flex-1 overflow-hidden">
    <TagLibrary />    {/* left, w-64 */}
    <Workspace />     {/* center, flex-1 */}
    <Preview />       {/* right, w-80 */}
  </div>
  <StatusBar />
</div>
```

**Step 4: Verify full layout in browser**

Run: `npm run dev`
Expected: Three-column layout renders with all components functional.

**Step 5: Commit**

```bash
git add src/App.tsx src/components/Common/
git commit -m "feat: assemble three-column layout with header and search"
```

---

### Task 11: Search & Filter

**Files:**
- Create: `src/hooks/useTagSearch.ts`
- Modify: `src/components/TagLibrary/TagLibrary.tsx` (accept search query prop)

**Step 1: Write failing test**

Create `src/hooks/__tests__/useTagSearch.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { filterTags } from '../useTagSearch'
import type { Tag } from '../../types'

const tags: Tag[] = [
  { id: '1', text: '1girl', category: 'c', aliases: ['one girl'] },
  { id: '2', text: 'blue eyes', category: 'c' },
]

describe('filterTags', () => {
  it('matches by text', () => {
    expect(filterTags(tags, 'girl')).toHaveLength(1)
  })

  it('matches by alias', () => {
    expect(filterTags(tags, 'one')).toHaveLength(1)
  })

  it('returns all when query is empty', () => {
    expect(filterTags(tags, '')).toHaveLength(2)
  })

  it('is case insensitive', () => {
    expect(filterTags(tags, 'BLUE')).toHaveLength(1)
  })
})
```

**Step 2: Implement**

Create `src/hooks/useTagSearch.ts`:
```typescript
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
```

**Step 3: Run tests**

Run: `npx vitest run src/hooks/__tests__/useTagSearch.test.ts`
Expected: PASS.

**Step 4: Wire into TagLibrary**

**Step 5: Commit**

```bash
git add src/hooks/useTagSearch.ts src/hooks/__tests__/ src/components/TagLibrary/
git commit -m "feat: add tag search and filter"
```

---

### Task 12: Preset Management UI

**Files:**
- Create: `src/components/TagLibrary/PresetGroup.tsx`
- Modify: `src/components/TagLibrary/TagLibrary.tsx` (add preset section)
- Modify: `src/components/Workspace/Workspace.tsx` (save preset dialog)

**Step 1: Build PresetGroup component**

Listed under TagLibrary below categories:
- Each preset is a clickable item → `loadPreset()`
- Right-click / long press → delete option
- Shows preset name + tag count

**Step 2: Add "Save as preset" flow in Workspace**

Click button → simple modal/prompt for name → `savePreset(name)`

**Step 3: Test interactively**

- Save a preset, verify it appears in left sidebar
- Click preset, verify tags load
- Delete preset, verify it disappears

**Step 4: Commit**

```bash
git add src/components/
git commit -m "feat: add preset save, load, and delete UI"
```

---

### Task 13: Import / Export

**Files:**
- Create: `src/utils/importExport.ts`
- Test: `src/utils/__tests__/importExport.test.ts`
- Modify: `src/components/Common/Header.tsx` (wire buttons)

**Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest'
import { exportUserData, validateImport } from '../importExport'
import type { UserData } from '../../types'

describe('importExport', () => {
  it('exports user data as JSON string', () => {
    const data: UserData = {
      version: 1,
      customTags: [],
      customCategories: [],
      hiddenBuiltinTags: [],
      presets: [],
      settings: { defaultPlatform: 'sd' },
    }
    const json = exportUserData(data)
    expect(JSON.parse(json)).toEqual(data)
  })

  it('validates correct import data', () => {
    const json = '{"version":1,"customTags":[],"customCategories":[],"hiddenBuiltinTags":[],"presets":[],"settings":{"defaultPlatform":"sd"}}'
    expect(validateImport(json).success).toBe(true)
  })

  it('rejects invalid JSON', () => {
    expect(validateImport('not json').success).toBe(false)
  })

  it('rejects data without version', () => {
    expect(validateImport('{"customTags":[]}').success).toBe(false)
  })
})
```

**Step 2: Implement**

Create `src/utils/importExport.ts` with `exportUserData`, `validateImport`, `triggerDownload`, and `readFileAsText` helpers.

**Step 3: Wire to Header buttons**

- Export: serialize current UserData → trigger JSON file download
- Import: file input → read → validate → merge into store

**Step 4: Run tests**

**Step 5: Commit**

```bash
git add src/utils/importExport.ts src/utils/__tests__/ src/components/Common/Header.tsx
git commit -m "feat: add JSON import/export functionality"
```

---

### Task 14: Status Bar + Polish

**Files:**
- Create: `src/components/Common/StatusBar.tsx`
- Modify: `src/App.tsx`

**Step 1: Build StatusBar**

Displays:
- `已选 N 个标签 | 负面 N 个 | 存储已用 XKB/5MB`
- Calculate storage size from localStorage usage

**Step 2: UI polish pass**

- Hover states on tags
- Transition animations on tag add/remove
- Scroll styling on tag library
- Ensure dark theme consistency

**Step 3: Commit**

```bash
git add src/components/Common/StatusBar.tsx src/App.tsx
git commit -m "feat: add status bar and UI polish"
```

---

### Task 15: GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `vite.config.ts` (add base path)

**Step 1: Add base path to vite.config.ts**

```typescript
export default defineConfig({
  base: '/nekoPrompt/',
  // ...existing config
})
```

**Step 2: Create GitHub Actions workflow**

Create `.github/workflows/deploy.yml` for automated deployment:
- Trigger on push to main
- Build with `npm run build`
- Deploy `dist/` to GitHub Pages

**Step 3: Commit and push**

```bash
git add .github/ vite.config.ts
git commit -m "ci: add GitHub Pages deployment workflow"
```

**Step 4: Verify deployment**

After push, check GitHub Actions tab for successful deployment.
Visit `https://<username>.github.io/nekoPrompt/` to verify.

---

## Summary

| Task | Description | Priority |
|------|-------------|----------|
| 1 | Project scaffolding | P0 |
| 2 | Type definitions | P0 |
| 3 | Built-in tag data | P0 |
| 4 | Zustand store | P0 |
| 5 | Prompt formatter | P0 |
| 6 | localStorage persistence | P0 |
| 7 | TagLibrary component | P0 |
| 8 | Workspace component | P0 |
| 9 | Preview component | P0 |
| 10 | App layout + header | P0 |
| 11 | Search & filter | P1 |
| 12 | Preset management UI | P1 |
| 13 | Import/export | P1 |
| 14 | Status bar + polish | P1 |
| 15 | GitHub Pages deploy | P1 |
