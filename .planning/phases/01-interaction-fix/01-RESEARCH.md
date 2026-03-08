# Phase 1: 交互修复 - Research

**Researched:** 2026-03-09
**Domain:** Zustand store logic, React component conditional behavior, TailwindCSS conditional styling
**Confidence:** HIGH

## Summary

Phase 1 fixes four interaction issues in nekoPrompt: (1) negative-category tags incorrectly landing in Positive area on click, (2) move-to-positive/negative actions hidden behind right-click context menu, (3) no visual distinction for negative-category tags in the tag library, and (4) no persist migration safety net for store structure changes.

The codebase is small and well-structured. All four requirements involve straightforward modifications to existing components and the Zustand store -- no new libraries, no architectural changes, no complex patterns. The `TagItem` component needs a `category` prop to branch click behavior; `WorkspaceTag` needs visible arrow buttons replacing `onContextMenu`; `CategoryGroup` needs conditional red styling; and `usePromptStore` needs `version` + `migrate` added to its persist config.

**Primary recommendation:** This is pure refactoring of existing code. No new dependencies. Focus on correctness of the store's atomic operations and the persist migration path.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Hover-visible arrow buttons (up/down) on workspace tags, adjacent to the X delete button
- Remove onContextMenu entirely -- interaction unified to visible buttons
- Positive tags show down-arrow (move to negative), negative tags show up-arrow (move to positive)
- Negative-category tags in tag library use red tones (bg-red-900/30 text-red-300 or similar), matching workspace Negative area
- Negative category title uses red text; entire group visually unified
- Negative tags selected state (in workspace Negative area) shows deepened red in tag library, distinct from positive tags' violet selected state
- Clicking negative-category tags auto-enters Negative area (not Positive)
- Zustand persist version starts at 0 (current implicit), upgrades to 1
- Migration failure: show user notification, then reset to defaults
- Delete useLocalStorage.ts and its test file (dead code)
- moveToNegative/moveToPositive refactored to single atomic set() call

### Claude's Discretion
- Exact SVG design for arrow icons
- Exact Tailwind color values for red tones
- Specific implementation of migrate function field mapping
- Migration failure notification wording

### Deferred Ideas (OUT OF SCOPE)
None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INTR-01 | Click negative-category tags -> auto-enter Negative area | TagItem needs category prop; store needs toggleNegativeTag or TagItem branches on category === 'negative' |
| INTR-02 | Workspace tags have visible move-to-positive/negative buttons | WorkspaceTag: replace onContextMenu with hover-visible arrow buttons; moveToNegative/moveToPositive must be atomic single-set() |
| INTR-03 | Negative-category tags visually distinct in tag library | TagItem and CategoryGroup need conditional red styling based on tag.category === 'negative' |
| INTR-04 | Zustand persist version + migrate prevents data loss on store changes | Add version: 1 and migrate function to persist config; handle version 0 -> 1 migration |
</phase_requirements>

## Standard Stack

### Core (already installed, no changes needed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.11 | State management with persist middleware | Already in use; persist has built-in version/migrate |
| react | 19.2.4 | UI framework | Already in use |
| tailwindcss | 4.2.1 | Styling | Already in use for all conditional styles |
| vitest | 4.0.18 | Testing | Already in use, 27 tests passing |

### No New Dependencies
This phase requires zero new packages. All functionality is achievable with existing stack.

## Architecture Patterns

### Current Component Data Flow
```
TagLibrary.tsx
  -> CategoryGroup.tsx (receives category + tags[])
    -> TagItem.tsx (receives tag, calls toggleTag on click)

Workspace.tsx
  -> WorkspaceTag.tsx (receives tagId, weight, isNegative)
```

### Pattern 1: Category-Aware Click Behavior in TagItem
**What:** TagItem needs to know whether its tag belongs to the 'negative' category to choose between `toggleTag` (positive) and a negative-aware toggle.
**When to use:** When the click target behavior depends on data context rather than user interaction type.

The tag already has `tag.category` field. TagItem currently receives the full `Tag` object which includes `category: string`. No prop changes needed at the TagLibrary/CategoryGroup level -- `tag.category` is already available.

```typescript
// TagItem.tsx - branching on category
const isNegativeCategory = tag.category === 'negative'

// Click handler branches:
// - If negative category: toggle in negativeTags (addNegativeTag/removeNegativeTag)
// - If positive category: toggle in selectedTags (existing toggleTag)
```

### Pattern 2: Atomic Store Operations
**What:** moveToNegative/moveToPositive currently call two separate set() operations, creating an intermediate state where the tag exists in neither list.
**When to use:** Any operation that modifies two state slices that must change together.

```typescript
// CURRENT (non-atomic, has intermediate state):
moveToNegative: (tagId) => {
  get().removeTag(tagId)      // set() #1: tag gone from positive
  get().addNegativeTag(tagId)  // set() #2: tag added to negative
}

// CORRECT (single atomic set):
moveToNegative: (tagId) =>
  set((s) => ({
    selectedTags: s.selectedTags.filter((t) => t.tagId !== tagId),
    negativeTags: s.negativeTags.some((t) => t.tagId === tagId)
      ? s.negativeTags
      : [...s.negativeTags, { tagId }],
  })),
```

### Pattern 3: Zustand Persist Migration
**What:** Adding `version` and `migrate` to persist config to handle store schema evolution.
**When to use:** Anytime the persisted state shape changes.

Verified from Zustand 5.0.11 source types (`persist.d.mts`):

```typescript
// Exact type from zustand 5.0.11:
interface PersistOptions<S, PersistedState = S> {
  version?: number  // default: 0 (implicit, not stored)
  migrate?: (persistedState: unknown, version: number) => PersistedState | Promise<PersistedState>
}
```

Key behaviors (verified from official docs + source):
- `version` defaults to `0` when not specified
- When stored version !== configured version, `migrate` is called
- `migrate` receives `(persistedState: unknown, version: number)` where `version` is the STORED version
- `persistedState` is typed as `unknown` -- must be cast/asserted
- If `migrate` throws, rehydration fails silently (state falls back to initial)

```typescript
// Migration pattern for this project:
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'nekoPrompt:workspace',
    version: 1,
    partialize: (state) => ({
      selectedTags: state.selectedTags,
      negativeTags: state.negativeTags,
      presets: state.presets,
    }),
    migrate: (persisted, version) => {
      if (version === 0) {
        // Version 0 -> 1: same shape, just tagging the version
        // Future migrations can transform fields here
        const old = persisted as {
          selectedTags?: SelectedTag[]
          negativeTags?: SelectedTag[]
          presets?: Preset[]
        }
        return {
          selectedTags: old.selectedTags ?? [],
          negativeTags: old.negativeTags ?? [],
          presets: old.presets ?? [],
        }
      }
      return persisted as {
        selectedTags: SelectedTag[]
        negativeTags: SelectedTag[]
        presets: Preset[]
      }
    },
  }
)
```

### Pattern 4: Hover-Visible Buttons (existing project pattern)
**What:** WorkspaceTag already uses `group` + `hidden group-hover:flex` for weight adjustment buttons.
**When to use:** For actions that should be discoverable but not clutter resting state.

```typescript
// Existing pattern in WorkspaceTag.tsx line 52:
<span className="hidden group-hover:flex items-center gap-0.5 ml-1">
```

The move-to buttons should use this exact same pattern, placed alongside the existing weight buttons and X button.

### Pattern 5: Conditional Category Styling (existing project pattern)
**What:** TagItem already branches styling with template literal ternaries.

```typescript
// Existing pattern in TagItem.tsx:
className={`
  px-2 py-0.5 rounded text-sm transition-colors cursor-pointer
  ${isSelected ? 'bg-violet-600 text-white'
    : isNegative ? 'bg-red-900/50 text-red-300'
    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}
`}
```

Extending this to handle negative-category tags needs a new condition: `isNegativeCategory && !isSelected && !isNegative` for the default red-tinted resting state.

### Anti-Patterns to Avoid
- **Two-step set() for atomic operations:** Current moveToNegative/moveToPositive bug. Always use a single `set()` call when modifying multiple state slices together.
- **Passing callbacks through multiple component layers:** TagItem already has store access via hooks. Don't thread click handlers through CategoryGroup -- just access the store directly in TagItem.
- **Complex migration logic for a simple version bump:** Version 0->1 doesn't change the shape. Don't over-engineer the migrate function. Keep it as a safety net with default fallbacks.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence | Custom localStorage wrapper | Zustand persist middleware | Already in use; useLocalStorage.ts is dead code to delete |
| Version migration | Manual localStorage version checks | Zustand persist `version` + `migrate` | Built-in, handles edge cases (async, errors) |
| Hover reveal UI | Custom mouse event handlers | TailwindCSS `group` + `group-hover:` | Already the project pattern, zero JS needed |

## Common Pitfalls

### Pitfall 1: Non-Atomic State Transitions
**What goes wrong:** Tag disappears from both lists momentarily during move operations. React may render between the two `set()` calls, causing a flash.
**Why it happens:** Zustand batches synchronous `set()` calls in React 18+ event handlers, but `get().removeTag()` followed by `get().addNegativeTag()` each call `set()` independently -- the batching depends on the calling context.
**How to avoid:** Single `set()` call that updates both `selectedTags` and `negativeTags` simultaneously.
**Warning signs:** Tags briefly disappearing during move, or test assertions failing between the two operations.

### Pitfall 2: Persist Migrate Receives `unknown` Type
**What goes wrong:** TypeScript errors or runtime crashes when accessing properties of `persistedState`.
**Why it happens:** Zustand types `persistedState` as `unknown` because it comes from localStorage and could be anything.
**How to avoid:** Type-assert with defensive fallbacks: `const old = persisted as { field?: Type }` and use `??` for defaults.
**Warning signs:** `Property does not exist on type 'unknown'` TypeScript errors.

### Pitfall 3: Forgot to Handle "Tag Already Exists in Target List"
**What goes wrong:** Moving a tag that somehow already exists in the target list creates a duplicate.
**Why it happens:** Edge case from rapid clicking or corrupted state.
**How to avoid:** The atomic `set()` should check `.some()` before adding, exactly like `addTag` and `addNegativeTag` already do.
**Warning signs:** Duplicate tags in workspace.

### Pitfall 4: Negative Category Hardcoded String
**What goes wrong:** `tag.category === 'negative'` scattered across components, fragile if category ID changes.
**Why it happens:** Magic string used in multiple places.
**How to avoid:** Use `builtinCategories` data as source of truth. A simple constant `NEGATIVE_CATEGORY_ID = 'negative'` extracted from categories.ts, or just reference the category data directly.
**Warning signs:** Category renamed in one place but not others.

### Pitfall 5: TagItem Selection State for Negative-Category Tags
**What goes wrong:** TagItem currently only checks `isSelected` (in selectedTags) for the active/violet style, but negative-category tags go into `negativeTags` instead. Clicking a negative-category tag twice won't visually toggle because the "selected" check looks at the wrong list.
**Why it happens:** `isSelected` checks `selectedTags`; `isNegative` checks `negativeTags`. For negative-category tags, the "selected" state means being in `negativeTags`, but the component shows `isNegative` with red styling (which is correct -- just needs the toggle to use `isNegative` for negative-category tags).
**How to avoid:** For negative-category tags: click should toggle based on `isNegative` state (add/remove from negativeTags). For positive-category tags: click toggles based on `isSelected` state (existing behavior). The visual "active" state for negative-category tags is the deepened red, not violet.

## Code Examples

### TagItem: Category-Aware Click and Style (pattern, not final code)
```typescript
// Key additions to TagItem.tsx:
const isNegativeCategory = tag.category === 'negative'
const addNegativeTag = usePromptStore((s) => s.addNegativeTag)
const removeNegativeTag = usePromptStore((s) => s.removeNegativeTag)

const handleClick = () => {
  if (isNegativeCategory) {
    // Toggle in negativeTags list
    isNegative ? removeNegativeTag(tag.id) : addNegativeTag(tag.id)
  } else {
    // Toggle in selectedTags list (existing behavior)
    toggleTag(tag.id)
  }
}

// Styling: 4 states
// 1. Positive-category, selected (in selectedTags): violet
// 2. Positive-category, default: zinc
// 3. Negative-category, active (in negativeTags): deep red
// 4. Negative-category, default: muted red
```

### WorkspaceTag: Visible Move Buttons (pattern, not final code)
```typescript
// Replace onContextMenu with hover-visible arrow buttons
// Arrow button adjacent to existing X button
<span className="hidden group-hover:flex items-center gap-0.5">
  <button
    type="button"
    onClick={() => isNegative ? moveToPositive(tagId) : moveToNegative(tagId)}
    className="w-4 h-4 flex items-center justify-center text-xs text-zinc-500 hover:text-zinc-300"
    title={isNegative ? 'Move to positive' : 'Move to negative'}
  >
    {/* inline SVG arrow */}
  </button>
</span>
```

### Store: Atomic Move + Persist Migration (pattern, not final code)
```typescript
moveToNegative: (tagId) =>
  set((s) => ({
    selectedTags: s.selectedTags.filter((t) => t.tagId !== tagId),
    negativeTags: s.negativeTags.some((t) => t.tagId === tagId)
      ? s.negativeTags
      : [...s.negativeTags, { tagId }],
  })),

// persist config addition:
{
  name: 'nekoPrompt:workspace',
  version: 1,
  migrate: (persisted, version) => {
    if (version === 0) {
      const old = persisted as Record<string, unknown>
      return {
        selectedTags: Array.isArray(old.selectedTags) ? old.selectedTags : [],
        negativeTags: Array.isArray(old.negativeTags) ? old.negativeTags : [],
        presets: Array.isArray(old.presets) ? old.presets : [],
      }
    }
    return persisted as { selectedTags: SelectedTag[]; negativeTags: SelectedTag[]; presets: Preset[] }
  },
  partialize: (state) => ({
    selectedTags: state.selectedTags,
    negativeTags: state.negativeTags,
    presets: state.presets,
  }),
}
```

### CategoryGroup: Conditional Red Title (pattern, not final code)
```typescript
// In CategoryGroup.tsx, conditional red text for negative category title:
const isNegativeCategory = category.id === 'negative'

<span className={isNegativeCategory ? 'text-red-400' : ''}>
  {category.name}
</span>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Zustand persist without version | Persist with version + migrate | Always available | Prevents data loss on schema changes |
| Context menu for move actions | Visible hover buttons | UX best practice | Discoverability; mobile-friendly |
| Separate set() calls for moves | Single atomic set() | Zustand recommendation | Prevents intermediate states |

**Dead code to remove:**
- `src/hooks/useLocalStorage.ts`: Superseded by Zustand persist. Contains `loadUserData`, `saveUserData`, `loadWorkspace`, `saveWorkspace` -- none are imported anywhere except its own test.
- `src/hooks/__tests__/useLocalStorage.test.ts`: Tests for dead code above.

## Open Questions

1. **Migration failure notification mechanism**
   - What we know: CONTEXT.md says "show toast/notification, then reset to defaults"
   - What's unclear: Project has no toast/notification component. Simple `console.warn` + fallback to defaults is the minimum. A visible notification would require a small UI addition.
   - Recommendation: Use `onRehydrateStorage` callback (available in persist config) to detect errors. For MVP, `console.error` + state reset is sufficient. A toast component can be added in a later phase if needed, or a simple inline banner.

2. **Store key collision during migration**
   - What we know: Current localStorage key is `nekoPrompt:workspace`. Zustand persist wraps stored data as `{ state: {...}, version: number }`.
   - What's unclear: If version field was never set, stored data has no version field. Zustand treats missing version as version `0`.
   - Recommendation: This is handled by the migrate function -- version 0 (no version field) migrates to version 1. Verified from Zustand source: `StorageValue<S> = { state: S; version?: number }` -- optional version, absent = 0.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 4.0.18 |
| Config file | vite.config.ts (test section) |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INTR-01 | Negative-category tag click adds to negativeTags, not selectedTags | unit | `npx vitest run src/stores/__tests__/usePromptStore.test.ts -t "negative category"` | Needs new tests |
| INTR-02 | moveToNegative/moveToPositive are atomic single-set operations | unit | `npx vitest run src/stores/__tests__/usePromptStore.test.ts -t "atomic move"` | Needs new tests |
| INTR-03 | Visual distinction (manual) + category styling logic (unit) | manual-only | Visual inspection in browser | N/A |
| INTR-04 | Persist migrate handles version 0 -> 1 correctly | unit | `npx vitest run src/stores/__tests__/usePromptStore.test.ts -t "migration"` | Needs new tests |

### Sampling Rate
- **Per task commit:** `npx vitest run`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before verify

### Wave 0 Gaps
- [ ] `src/stores/__tests__/usePromptStore.test.ts` -- add tests for: toggleNegativeTag behavior, atomic moveToNegative/moveToPositive, persist migration v0->v1
- [ ] Delete `src/hooks/__tests__/useLocalStorage.test.ts` (dead code removal, test count will drop by 2)
- [ ] Delete `src/hooks/useLocalStorage.ts` (dead code)

## Sources

### Primary (HIGH confidence)
- Zustand 5.0.11 installed in project -- types verified from `node_modules/zustand/esm/middleware/persist.d.mts`
- Existing codebase files: usePromptStore.ts, TagItem.tsx, WorkspaceTag.tsx, CategoryGroup.tsx, categories.ts, tags.ts, types/index.ts
- Existing test suite: 6 files, 27 tests, all passing

### Secondary (MEDIUM confidence)
- [Zustand persist official docs](https://zustand.docs.pmnd.rs/reference/middlewares/persist) -- version/migrate API confirmed
- [DEV Community: Zustand local storage migration](https://dev.to/diballesteros/how-to-migrate-zustand-local-storage-store-to-a-new-version-njp) -- migration pattern verified against source types

### Tertiary (LOW confidence)
- None; all findings verified against installed package source types

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing code verified
- Architecture: HIGH - simple component modifications, patterns already established in codebase
- Pitfalls: HIGH - verified against actual Zustand source types and existing code
- Migration: HIGH - persist.d.mts types confirm exact API; version 0 default confirmed

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable, no fast-moving dependencies)
