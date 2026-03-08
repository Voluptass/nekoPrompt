# Coding Conventions

**Analysis Date:** 2026-03-08

## Naming Patterns

**Files:**
- Components: PascalCase matching the exported component name: `TagItem.tsx`, `CategoryGroup.tsx`, `Preview.tsx`
- Hooks: camelCase with `use` prefix: `useTagSearch.ts`, `useLocalStorage.ts`
- Stores: camelCase with `use` prefix (Zustand convention): `usePromptStore.ts`
- Utils: camelCase describing the function group: `formatPrompt.ts`, `importExport.ts`
- Data files: camelCase nouns: `categories.ts`, `tags.ts`
- Type files: `index.ts` in a `types/` directory
- Barrel exports: `index.ts` in each component group directory

**Functions:**
- React components: PascalCase named function declarations: `export function TagLibrary() {}`
- Hooks/utilities: camelCase: `filterTags()`, `loadUserData()`, `formatSD()`
- Event handlers inside components: `handle` prefix with camelCase: `handleExport`, `handleImport`, `handleSavePreset`, `handleContextMenu`
- Store actions: camelCase verbs: `addTag`, `removeTag`, `toggleTag`, `moveToNegative`, `clearAll`

**Variables:**
- Local state: camelCase: `searchQuery`, `presetName`, `showSaveDialog`
- Constants: camelCase (not SCREAMING_CASE): `defaultUserData`, `defaultWorkspace`
- Storage keys: namespaced string literals: `'nekoPrompt:workspace'`, `'nekoPrompt:userData'`

**Types:**
- Interfaces: PascalCase nouns: `Tag`, `Category`, `SelectedTag`, `Preset`, `UserData`
- Props interfaces: component name + `Props` suffix: `TagItemProps`, `HeaderProps`, `SearchBarProps`, `CategoryGroupProps`, `WorkspaceTagProps`
- Store interface: store name + `Store` suffix (private, not exported): `PromptStore`
- Type aliases: PascalCase: `Platform`, `Format`
- Union types for platform strings: `'sd' | 'dalle' | 'mj' | 'general'`

## Code Style

**Formatting:**
- No dedicated formatter config (no Prettier/Biome config files). Relies on editor defaults.
- 2-space indentation
- Single quotes for strings
- No semicolons (ASI style)
- Trailing commas in multiline structures

**Linting:**
- No ESLint config. TypeScript strict mode serves as the primary quality gate.
- `tsconfig.app.json` enforces: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`

**TypeScript Strictness:**
- All files use strict TypeScript
- Use `type` keyword for type-only imports: `import type { Tag } from '../types'`
- Non-null assertions used sparingly and only at known-safe points: `document.getElementById('root')!`
- Prefer type narrowing over type assertions (see `validateImport` in `src/utils/importExport.ts`)

## Import Organization

**Order:**
1. React imports (`react`, `react-dom`)
2. Third-party libraries (`zustand`, `zustand/middleware`)
3. Internal absolute/relative imports (stores, utils, data, types)

**Path Style:**
- Relative paths throughout: `../../stores/usePromptStore`, `../types`
- No path aliases configured (no `@/` or `~/`)

**Type Imports:**
- Use `import type` for type-only imports: `import type { Tag } from '../../types'`
- Combine in same import statement when importing both values and types from same module is avoided; types always get their own `import type` line

**Barrel Exports:**
- Each component group directory has an `index.ts` barrel file
- Pattern: `export { ComponentName } from './ComponentName'`
- Used in: `src/components/TagLibrary/index.ts`, `src/components/Workspace/index.ts`, `src/components/Preview/index.ts`, `src/components/Common/index.ts`, `src/data/index.ts`
- Consumers import from the directory: `import { TagLibrary } from './components/TagLibrary'`

## Component Patterns

**Component Definition:**
- Use named function declarations, not arrow functions: `export function MyComponent() {}`
- Export directly from definition (no separate export statement)
- Default export only for `App` component (`src/App.tsx`). All other components use named exports.

**Props:**
- Define props interface directly above the component in the same file
- Use destructuring in function signature: `export function TagItem({ tag }: TagItemProps)`
- Optional props use `?` with defaults in destructuring: `{ searchQuery = '' }: TagLibraryProps`

**State Management:**
- Global state: Zustand store with `persist` middleware (`src/stores/usePromptStore.ts`)
- Local UI state: React `useState` for component-specific concerns (expand/collapse, dialogs, form inputs)
- Zustand selector pattern for performance: `usePromptStore((s) => s.selectedTags)` -- always use selectors, never `usePromptStore()` without a selector (except in `Header.tsx` which destructures the full store)

**Styling:**
- TailwindCSS 4 utility classes directly in JSX
- Conditional classes via template literals with ternary: `` `${condition ? 'class-a' : 'class-b'}` ``
- Custom CSS limited to `src/index.css` for scrollbar styling only
- Color palette: zinc for neutrals, violet for primary accent, red for negative/destructive

**Inline SVG:**
- Small icons are inline SVG elements (not an icon library)
- See `src/components/Common/SearchBar.tsx` and `src/components/TagLibrary/PresetGroup.tsx`

## Error Handling

**Patterns:**
- Try/catch with silent fallback to defaults for localStorage operations (see `src/hooks/useLocalStorage.ts`)
- Early return with guard clauses: `if (!tag) return null` in components, `if (!file) return` in handlers
- Validation functions return result objects: `{ success: boolean; data?: T; error?: string }` (see `validateImport` in `src/utils/importExport.ts`)
- User-facing errors shown via `alert()` (simple approach, no toast library)
- Empty `catch` blocks (no error logging) -- acceptable for localStorage fallbacks

**State Guards:**
- Prevent duplicate additions: `if (s.selectedTags.some((t) => t.tagId === tagId)) return s`
- Clamp numeric values to valid ranges: `clampWeight` function in `src/stores/usePromptStore.ts`
- Return unchanged state (`return s`) when no-op detected in Zustand reducers

## Logging

**Framework:** None. No logging library or `console.log` statements in production code.

## Comments

**When to Comment:**
- Section dividers in JSX: `{/* Positive tags */}`, `{/* Context menu */}`, `{/* Copy button */}`
- Category groups in data files: `// quality`, `// character`, etc. in `src/data/tags.ts`
- No JSDoc/TSDoc on functions -- types serve as documentation

**Style:**
- JSX comments for UI sections: `{/* Section Name */}`
- Line comments for data grouping: `// category-name`
- No block comments or documentation comments

## Function Design

**Size:** Functions are short and focused. Largest component is `Workspace.tsx` (~127 lines including JSX). Utility functions are under 20 lines.

**Parameters:** Prefer object destructuring for props. Utility functions use positional parameters (kept to 2-3 max).

**Return Values:**
- Components return JSX or `null` for empty states
- Utility functions return typed values or result objects
- Store actions return `void` (mutate state via `set()`)

## Module Design

**Exports:**
- Named exports everywhere except `App` (default export)
- One primary export per file (component or function group)
- Barrel files re-export the public API of each directory

**Module Boundaries:**
- `src/types/` -- shared type definitions (no runtime code)
- `src/data/` -- static builtin data (categories, tags)
- `src/stores/` -- Zustand stores (global state + actions)
- `src/hooks/` -- custom hooks and pure utility functions for hooks
- `src/utils/` -- pure utility functions (no React dependency)
- `src/components/` -- React components grouped by feature area

---

*Convention analysis: 2026-03-08*
