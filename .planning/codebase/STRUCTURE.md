# Codebase Structure

**Analysis Date:** 2026-03-08

## Directory Layout

```
nekoPrompt/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment CI
├── .planning/
│   └── codebase/               # GSD codebase analysis documents
├── docs/
│   └── plans/                  # Design and implementation plan documents
├── src/
│   ├── components/
│   │   ├── Common/             # Shared layout components (Header, SearchBar, StatusBar)
│   │   ├── Preview/            # Prompt preview and copy panel
│   │   ├── TagLibrary/         # Tag browsing sidebar with categories and presets
│   │   └── Workspace/          # Tag workspace with positive/negative sections
│   ├── data/                   # Builtin static data (tags, categories)
│   │   └── __tests__/          # Data integrity tests
│   ├── hooks/                  # Custom hooks and pure helper functions
│   │   └── __tests__/          # Hook/helper tests
│   ├── stores/                 # Zustand global state
│   │   └── __tests__/          # Store tests
│   ├── test/                   # Test infrastructure (setup files)
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Pure utility functions (formatting, import/export)
│       └── __tests__/          # Utility tests
├── index.html                  # Vite HTML entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json               # Root TS config (project references)
├── tsconfig.app.json           # App-specific TS config (strict mode)
├── tsconfig.node.json          # Node/Vite TS config
└── vite.config.ts              # Vite + Vitest + TailwindCSS config
```

## Directory Purposes

**`src/components/Common/`:**
- Purpose: Shared UI components used in the top-level App layout
- Contains: `Header.tsx` (app bar with search, import/export), `SearchBar.tsx` (search input), `StatusBar.tsx` (footer with tag counts and storage info)
- Key files: `src/components/Common/index.ts` (barrel export)

**`src/components/TagLibrary/`:**
- Purpose: Left sidebar panel for browsing and selecting tags from the builtin library
- Contains: `TagLibrary.tsx` (container with filtering), `CategoryGroup.tsx` (collapsible category section), `TagItem.tsx` (individual tag button), `PresetGroup.tsx` (saved presets list with context menu)
- Key files: `src/components/TagLibrary/index.ts` (barrel export)

**`src/components/Workspace/`:**
- Purpose: Center panel showing currently selected positive and negative tags
- Contains: `Workspace.tsx` (layout with save-preset dialog), `WorkspaceTag.tsx` (tag chip with weight controls, remove, right-click to move between positive/negative)
- Key files: `src/components/Workspace/index.ts` (barrel export)

**`src/components/Preview/`:**
- Purpose: Right sidebar panel showing formatted prompt text and copy-to-clipboard
- Contains: `Preview.tsx` (format toggle SD/DALL-E, positive/negative textareas, copy button)
- Key files: `src/components/Preview/index.ts` (barrel export)

**`src/data/`:**
- Purpose: Static builtin data for the tag library
- Contains: `categories.ts` (10 categories: quality, character, appearance, etc.), `tags.ts` (97 builtin tags), `index.ts` (barrel export)
- Key files: `src/data/__tests__/data.test.ts`

**`src/hooks/`:**
- Purpose: Reusable logic functions
- Contains: `useTagSearch.ts` (exports `filterTags` pure function for text/alias matching), `useLocalStorage.ts` (localStorage load/save helpers -- legacy, not used by main flow)
- Key files: `src/hooks/__tests__/useTagSearch.test.ts`, `src/hooks/__tests__/useLocalStorage.test.ts`

**`src/stores/`:**
- Purpose: Global state management
- Contains: `usePromptStore.ts` (single Zustand store with persist middleware)
- Key files: `src/stores/__tests__/usePromptStore.test.ts`

**`src/types/`:**
- Purpose: Shared TypeScript interfaces and type aliases
- Contains: `index.ts` (all domain types: Tag, Category, SelectedTag, Preset, UserData, WorkspaceState, UserSettings, Platform)

**`src/utils/`:**
- Purpose: Pure utility functions with no React dependencies
- Contains: `formatPrompt.ts` (SD and DALL-E formatters), `importExport.ts` (JSON export/import/download/file-read)
- Key files: `src/utils/__tests__/formatPrompt.test.ts`, `src/utils/__tests__/importExport.test.ts`

**`src/test/`:**
- Purpose: Test infrastructure
- Contains: `setup.ts` (Vitest setup file, likely imports jest-dom matchers)

## Key File Locations

**Entry Points:**
- `index.html`: Vite HTML shell, mounts `<div id="root">`
- `src/main.tsx`: React entry -- `createRoot` + `StrictMode` + `<App />`
- `src/App.tsx`: Root component -- three-panel layout composition, owns search query state

**Configuration:**
- `vite.config.ts`: Vite dev server (host 127.0.0.1), base path `/nekoPrompt/`, React plugin, TailwindCSS plugin, Vitest config (jsdom, globals, setup file)
- `tsconfig.json`: Project references root
- `tsconfig.app.json`: Strict TypeScript config targeting ES2020 with `react-jsx`
- `package.json`: Dependencies and npm scripts (`dev`, `build`, `preview`, `test`, `test:watch`)

**Core Logic:**
- `src/stores/usePromptStore.ts`: All workspace state and mutations (tag add/remove/toggle, weight, presets, clear/reset)
- `src/utils/formatPrompt.ts`: Prompt string generation (`formatSD`, `formatDallE`)
- `src/utils/importExport.ts`: JSON export/import with validation
- `src/hooks/useTagSearch.ts`: Tag filtering by text and alias matching

**Static Data:**
- `src/data/tags.ts`: 97 builtin tags across 10 categories
- `src/data/categories.ts`: 10 category definitions with display names and order

**Styling:**
- `src/index.css`: TailwindCSS import + custom `.scrollbar-thin` class

**Testing:**
- `src/test/setup.ts`: Vitest global setup
- `src/data/__tests__/data.test.ts`: Data integrity
- `src/hooks/__tests__/useTagSearch.test.ts`: Search/filter logic
- `src/hooks/__tests__/useLocalStorage.test.ts`: localStorage helpers
- `src/stores/__tests__/usePromptStore.test.ts`: Store actions
- `src/utils/__tests__/formatPrompt.test.ts`: Formatter output
- `src/utils/__tests__/importExport.test.ts`: Import validation and export

## Naming Conventions

**Files:**
- Components: PascalCase matching component name -- `TagItem.tsx`, `Workspace.tsx`, `Preview.tsx`
- Hooks/helpers: camelCase with `use` prefix for hooks -- `useTagSearch.ts`, `useLocalStorage.ts`
- Stores: camelCase with `use` prefix -- `usePromptStore.ts`
- Utils: camelCase -- `formatPrompt.ts`, `importExport.ts`
- Data: camelCase -- `categories.ts`, `tags.ts`
- Types: `index.ts` only (single file for all types)
- Tests: `*.test.ts` inside `__tests__/` subdirectories

**Directories:**
- Component groups: PascalCase -- `Common/`, `TagLibrary/`, `Workspace/`, `Preview/`
- Non-component dirs: camelCase -- `data/`, `hooks/`, `stores/`, `utils/`, `types/`, `test/`
- Test dirs: `__tests__/` (double underscore convention)

**Exports:**
- Every component directory has a barrel `index.ts` with named re-exports
- Components use named exports (not default), e.g. `export function Header()`
- Exception: `src/App.tsx` uses `export default function App()`

## Where to Add New Code

**New Feature (e.g., tag editing, custom tags):**
- Primary code: New component directory under `src/components/FeatureName/` with `FeatureName.tsx` and `index.ts` barrel
- State: Add actions/state to `src/stores/usePromptStore.ts`, or create a new store in `src/stores/useFeatureStore.ts`
- Types: Add interfaces to `src/types/index.ts`
- Tests: `src/stores/__tests__/` for store logic, `src/components/FeatureName/__tests__/` for component tests

**New Component within existing feature:**
- Implementation: Add `ComponentName.tsx` in the appropriate `src/components/FeatureName/` directory
- Update barrel: Add export to `src/components/FeatureName/index.ts`

**New Utility Function:**
- Implementation: Add to existing util file if related (e.g., new formatter in `src/utils/formatPrompt.ts`), or create new file in `src/utils/`
- Tests: Add test file in `src/utils/__tests__/`

**New Hook:**
- Implementation: `src/hooks/useHookName.ts`
- Tests: `src/hooks/__tests__/useHookName.test.ts`

**New Builtin Tags/Categories:**
- Tags: Append to the array in `src/data/tags.ts` following existing `{ id, text, category }` pattern
- Categories: Append to array in `src/data/categories.ts` with the next `order` value

**New Data/Types:**
- Types: Add to `src/types/index.ts`
- Static data: Add new file in `src/data/`, export from `src/data/index.ts`

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents (this file and peers)
- Generated: By analysis tooling
- Committed: Yes

**`docs/plans/`:**
- Purpose: Design documents and implementation plans
- Generated: No (manually authored)
- Committed: Yes
- Key files: `docs/plans/2026-03-08-neko-prompt-design.md`, `docs/plans/2026-03-08-neko-prompt-plan.md`

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes (by `npm run build`)
- Committed: No (in `.gitignore`)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes (by `npm install`)
- Committed: No (in `.gitignore`)

**`.github/workflows/`:**
- Purpose: CI/CD pipeline definitions
- Generated: No
- Committed: Yes
- Key files: `deploy.yml` (GitHub Pages deployment)

---

*Structure analysis: 2026-03-08*
