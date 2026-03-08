# Architecture

**Analysis Date:** 2026-03-08

## Pattern Overview

**Overall:** Single-Page Application with Zustand global store (flux-like unidirectional data flow)

**Key Characteristics:**
- Pure client-side React SPA -- no server, no API, no database
- Zustand store is the single source of truth for workspace state (selected tags, negative tags, presets)
- Static builtin data (tags, categories) imported directly from `src/data/` -- not stored in state
- Persistence via Zustand `persist` middleware backed by `localStorage`
- Three-panel layout: TagLibrary (left) -> Workspace (center) -> Preview (right)

## Layers

**Types (domain model):**
- Purpose: Define all shared TypeScript interfaces for the application
- Location: `src/types/index.ts`
- Contains: `Tag`, `Category`, `SelectedTag`, `Preset`, `UserData`, `WorkspaceState`, `UserSettings`, `Platform`
- Depends on: Nothing
- Used by: Every other layer

**Static Data:**
- Purpose: Provide the builtin tag library and category definitions (97 tags, 10 categories)
- Location: `src/data/`
- Contains: `builtinTags` array (`src/data/tags.ts`), `builtinCategories` array (`src/data/categories.ts`), barrel export (`src/data/index.ts`)
- Depends on: `src/types/index.ts`
- Used by: Components (TagLibrary, WorkspaceTag, Preview), hooks (useTagSearch)

**State Management (Store):**
- Purpose: Global workspace state -- tag selection, negative tags, presets, and all mutation actions
- Location: `src/stores/usePromptStore.ts`
- Contains: Single Zustand store `usePromptStore` with `persist` middleware
- Depends on: `src/types/index.ts`
- Used by: All components that read or mutate workspace state
- Persistence key: `nekoPrompt:workspace` in `localStorage`
- Partializes: Only `selectedTags`, `negativeTags`, `presets` are persisted

**Utilities:**
- Purpose: Pure functions for prompt formatting and import/export
- Location: `src/utils/`
- Contains:
  - `formatPrompt.ts` -- `formatSD()` and `formatDallE()` formatters
  - `importExport.ts` -- `exportUserData()`, `validateImport()`, `triggerDownload()`, `readFileAsText()`
- Depends on: `src/types/index.ts`
- Used by: Preview component, Header component

**Hooks:**
- Purpose: Reusable logic extracted from components
- Location: `src/hooks/`
- Contains:
  - `useTagSearch.ts` -- exports `filterTags()` pure function (not actually a hook despite the file name)
  - `useLocalStorage.ts` -- `loadUserData()`, `saveUserData()`, `loadWorkspace()`, `saveWorkspace()` (legacy helpers, not currently used by components -- store uses Zustand persist instead)
- Depends on: `src/types/index.ts`
- Used by: `TagLibrary` component uses `filterTags`

**Components (UI):**
- Purpose: React function components organized by feature
- Location: `src/components/`
- Contains: Four feature groups (Common, TagLibrary, Workspace, Preview), each with barrel `index.ts`
- Depends on: Store, Data, Utils, Types
- Used by: `src/App.tsx`

## Data Flow

**Tag Selection Flow:**

1. User clicks a tag button in `TagLibrary/TagItem` component
2. `TagItem` calls `usePromptStore.toggleTag(tagId)`
3. Store updates `selectedTags` array (or removes if already present)
4. Zustand `persist` middleware writes to `localStorage` under `nekoPrompt:workspace`
5. All subscribed components re-render: `Workspace` shows the tag, `Preview` regenerates prompt text, `StatusBar` updates count

**Prompt Generation Flow:**

1. `Preview` component reads `selectedTags` and `negativeTags` from store
2. For each `SelectedTag`, looks up the full `Tag` object from `builtinTags` via `findTag()` helper
3. Passes `SelectedTag[]` and `findTag` to the active formatter (`formatSD` or `formatDallE`)
4. Formatter produces comma-separated string (SD format supports weight syntax `(tag:1.2)`)
5. Result displayed in read-only textareas; copy button writes full prompt to clipboard

**Preset Save/Load Flow:**

1. User enters preset name in `Workspace` component, clicks Save
2. `savePreset(name)` creates a new `Preset` with `crypto.randomUUID()`, clones current `selectedTags` and `negativeTags`
3. Preset stored in `presets` array in the Zustand store (persisted to `localStorage`)
4. `PresetGroup` in TagLibrary sidebar lists all presets
5. Click loads: `loadPreset(presetId)` replaces `selectedTags` and `negativeTags` with preset data
6. Right-click on preset shows context menu with Delete option

**Import/Export Flow:**

1. Export: `Header` builds a `UserData` object from current store state, serializes via `exportUserData()`, triggers browser download via `triggerDownload()`
2. Import: File input reads JSON via `readFileAsText()`, validates via `validateImport()`, merges presets into store

**State Management:**
- Single Zustand store handles all mutable state
- No React context providers -- components subscribe directly to store slices via selectors
- Component-local state (`useState`) used only for UI concerns: search query, expand/collapse, dialog visibility, format toggle, copy feedback

## Key Abstractions

**Tag:**
- Purpose: A prompt keyword with metadata (id, text, category, optional aliases/description/platforms)
- Examples: `src/types/index.ts` (interface), `src/data/tags.ts` (97 builtin instances)
- Pattern: Static data objects with string IDs, referenced by ID in selection state

**SelectedTag:**
- Purpose: A tag selected into the workspace, with optional weight
- Examples: `src/types/index.ts` (interface), `src/stores/usePromptStore.ts` (managed in arrays)
- Pattern: Lightweight reference object `{ tagId: string, weight?: number }` -- full Tag data resolved at render time by looking up `builtinTags`

**Category:**
- Purpose: Grouping mechanism for tags in the library sidebar
- Examples: `src/types/index.ts` (interface), `src/data/categories.ts` (10 builtin categories)
- Pattern: Ordered groups with string IDs matching `Tag.category`

**Preset:**
- Purpose: Named snapshot of a workspace state (positive + negative tags)
- Examples: `src/types/index.ts` (interface), `src/stores/usePromptStore.ts` (CRUD actions)
- Pattern: UUID-identified, timestamped, stored in Zustand persistent state

**Formatter:**
- Purpose: Convert `SelectedTag[]` into platform-specific prompt strings
- Examples: `src/utils/formatPrompt.ts` -- `formatSD()`, `formatDallE()`
- Pattern: Pure functions accepting a tag array and a lookup function, returning a string

## Entry Points

**Browser Entry:**
- Location: `index.html` -> `src/main.tsx`
- Triggers: Browser page load
- Responsibilities: Mounts React root with `<StrictMode>`, renders `<App />`

**App Root:**
- Location: `src/App.tsx`
- Triggers: React render tree root
- Responsibilities: Composes the three-panel layout (Header, TagLibrary, Workspace, Preview, StatusBar), owns search query state

**Store Initialization:**
- Location: `src/stores/usePromptStore.ts`
- Triggers: First import (module-level `create()` call)
- Responsibilities: Creates global Zustand store, rehydrates persisted state from `localStorage`

## Error Handling

**Strategy:** Minimal -- errors are caught at boundaries, failures shown via `alert()`

**Patterns:**
- Import validation: `validateImport()` in `src/utils/importExport.ts` returns `{ success: false, error: string }` on invalid JSON or missing version field; `Header` shows `alert()` with error message
- localStorage access: `try/catch` with fallback to defaults in `src/hooks/useLocalStorage.ts` (and implicitly in Zustand persist)
- Missing tag lookup: `WorkspaceTag` returns `null` if tag ID not found in `builtinTags`; `Preview.findTag()` returns a fallback `{ id, text: id, category: '' }` for unknown IDs
- Weight clamping: `clampWeight()` in store clamps to `[0.1, 2.0]` range, rounds to 1 decimal

## Cross-Cutting Concerns

**Logging:** None -- no logging framework, no console.log statements in production code
**Validation:** Minimal -- import JSON validation only; no form validation framework
**Authentication:** None -- pure client-side application with no auth
**Persistence:** Zustand `persist` middleware with `localStorage` backend; key `nekoPrompt:workspace`
**Styling:** TailwindCSS 4 utility classes applied inline in JSX; one custom CSS class `.scrollbar-thin` in `src/index.css`

---

*Architecture analysis: 2026-03-08*
