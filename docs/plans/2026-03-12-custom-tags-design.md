# Custom Tags Feature Design

## Overview

Add custom tag CRUD with persistent storage, mixed display in TagLibrary, and unified formatting support for SD/DALL·E output.

## Architecture

### Data Layer

**New store:** `src/stores/useCustomTagStore.ts`

- Zustand + persist middleware
- Persist key: `nekoPrompt:customTags`, version: 1, with migrate skeleton matching `usePromptStore` pattern
- Independent from existing `usePromptStore` (separation of concerns)

```typescript
interface CustomTagStore {
  customTags: Tag[]
  customCategories: Category[]

  // Tag CRUD
  addCustomTag: (tag: Omit<Tag, 'id'>) => void
  updateCustomTag: (id: string, updates: Partial<Tag>) => void
  deleteCustomTag: (id: string) => void

  // Category CRUD
  addCustomCategory: (cat: Omit<Category, 'id' | 'order'>) => void
  updateCustomCategory: (id: string, updates: Partial<Category>) => void
  deleteCustomCategory: (id: string) => void
}
```

**Tag ID convention:** `custom-${crypto.randomUUID()}`
**Category ID convention:** `custom-cat-${crypto.randomUUID()}`
**Category order:** Custom categories start from 100 to avoid conflicts with builtins.

**Unified lookup hook:** `src/hooks/useAllTags.ts`

```typescript
export function useAllTags(): Tag[]
// Returns [...builtinTags, ...customTags]

export function useAllCategories(): Category[]
// Returns [...builtinCategories, ...customCategories]

export function useFindTag(): (id: string) => Tag
// Searches allTags, fallback { id, text: id, category: '' }
```

### Delete Cascade

When a custom tag is deleted, automatically remove it from:

1. `usePromptStore.selectedTags` and `negativeTags`
2. All `presets[].tags` and `presets[].negativeTags` (prevent stale UUID references in saved presets)

Implementation: `deleteCustomTag` action calls `usePromptStore.getState()` and `setState()` to clean up all references.

## UI Components

### Create Tag Modal

- **Entry:** "+" button in TagLibrary header
- **Progressive form:**
  - Default (collapsed): tag text (required) + category select (required)
  - Advanced (expandable): aliases, description, platforms
- **Category select:** dropdown listing all builtin + custom categories, plus "新建分类..." option at bottom
- **File:** `src/components/Common/CreateTagModal.tsx`

### Manage Modal

- **Entry:** "管理" button in TagLibrary header
- **Tabs:** Tags | Categories
- **Tags tab:** list of custom tags with text, category, edit/delete buttons
- **Categories tab:** list of custom categories with name, edit/delete buttons
- **Edit:** reuses CreateTagModal form with pre-filled data
- **File:** `src/components/Common/ManageModal.tsx`

### TagLibrary Mixed Display

- Custom tags mixed into their assigned categories alongside builtins
- Visual distinction: `✦` suffix + purple gradient border (`border-violet-700`)
- Custom categories appear after builtins with a "自定义" badge
- Replace `filterTags(builtinTags, ...)` with `filterTags(useAllTags(), ...)` so search covers custom tags
- **Modified files:** `TagLibrary.tsx`, `TagItem.tsx`, `CategoryGroup.tsx`

## Formatting

### SD Format

No changes needed. `formatSD` joins tag text with commas regardless of source.

### DALL·E Format

- Tags in builtin categories: processed by existing normalize functions
- Tags in unknown/custom categories: after building `byCategory` for the 9 known categories, compute `misc = resolvedTags.filter(t => !knownCategoryIds.has(t.category)).map(t => t.text)`. Append `, with {joinNaturally(misc)}` before the final period.
- **Modified file:** `src/utils/formatPrompt.ts` — add misc collection and fallback clause in `formatDallE`

### Preview Component

- Replace hardcoded `builtinTags.find()` with `useFindTag()` hook
- **Modified file:** `src/components/Preview/Preview.tsx`

### Workspace Component

- Replace hardcoded `builtinTags.find()` with `useFindTag()` hook
- Remove `if (!tag) return null` guard in `WorkspaceTag.tsx` (useFindTag always returns a fallback)
- Also update `MobileTagActionSheet` lookup inside `Workspace.tsx`
- **Modified files:** `src/components/Workspace/Workspace.tsx`, `WorkspaceTag.tsx`

## Import/Export

Extend `src/utils/importExport.ts`:

- Export: merge data from both stores into `UserData` (which already has `customTags`/`customCategories` fields)
- Import: restore custom tags/categories to `useCustomTagStore`

## Out of Scope (YAGNI)

- Drag-and-drop tag reordering
- Batch tag operations
- Custom category icon picker
- Tag deduplication warnings
