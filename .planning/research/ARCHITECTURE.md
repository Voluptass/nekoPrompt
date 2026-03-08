# Architecture Patterns

**Domain:** UI/UX improvements for existing React 19 + Zustand prompt manager SPA
**Researched:** 2026-03-08
**Overall Confidence:** HIGH (based on direct codebase analysis; no external libraries introduced)

## Current Architecture Snapshot

The app follows a clean unidirectional data flow: static data + Zustand store feed three panels composed in `App.tsx`. The architecture is already well-structured for the planned improvements -- no structural overhaul needed.

```
                    App.tsx (owns searchQuery state)
                        |
        +---------------+---------------+
        |               |               |
   TagLibrary      Workspace        Preview
   (left panel)   (center panel)   (right panel)
        |               |               |
   reads from:     reads from:     reads from:
   - builtinTags   - store.        - store.
   - builtinCats     selectedTags    selectedTags
   - filterTags()  - store.        - store.
                     negativeTags    negativeTags
   writes to:                      - builtinTags
   - store.        writes to:      - formatSD/
     toggleTag()   - store.          formatDallE
                     remove*()
                   - store.
                     setWeight()
                   - store.
                     moveToNeg/Pos()
```

## Recommended Architecture for UI/UX Improvements

No new layers or state management patterns needed. All three improvement areas (negative auto-categorize, Chinese localization, UI polish) integrate into the existing structure with surgical changes. The architecture stays the same; the implementation details change.

### Component Boundaries After Changes

| Component | Current Responsibility | Change Required | Scope |
|-----------|----------------------|-----------------|-------|
| `TagItem` | Renders a tag button, calls `toggleTag` on click | Add category awareness: if `tag.category === 'negative'`, call `addNegativeTag` instead of `toggleTag`. Pass category down or detect from tag data. | Small -- 1 conditional |
| `CategoryGroup` | Accordion for a tag category | No logic change. Translate header label (already Chinese via `category.name`). | None |
| `TagLibrary` | Composes categories + preset list | No change. Category names already Chinese. | None |
| `Workspace` | Shows positive/negative tag areas, preset save | Translate all English strings to Chinese. | Strings only |
| `WorkspaceTag` | Renders a workspace tag with weight controls | Translate tooltip strings. | Strings only |
| `Preview` | Format toggle, prompt display, copy button | Translate labels and button text. | Strings only |
| `Header` | Logo, search bar, import/export buttons | Translate button text. | Strings only |
| `SearchBar` | Search input with clear | Translate placeholder text. | Strings only |
| `StatusBar` | Counts and storage display | Translate label text. | Strings only |
| `PresetGroup` | Preset list with context menu | Translate "Presets" label and "Delete" text. | Strings only |
| `usePromptStore` | All state mutations | Add `smartAddTag(tagId, category)` or modify `toggleTag` to accept category hint. | Small -- 1 action |

### Component Communication Map (Post-Changes)

```
Static Data Layer (unchanged)
  builtinTags[]  -----> TagLibrary, WorkspaceTag, Preview
  builtinCategories[] -> TagLibrary

Store Layer (minor addition)
  usePromptStore
    State:  selectedTags[], negativeTags[], presets[]
    Actions (existing): toggleTag, addTag, removeTag, addNegativeTag,
                        removeNegativeTag, moveToNeg/Pos, setWeight,
                        clearAll, savePreset, loadPreset, deletePreset
    Action (new):       smartAddTag(tagId, category)  <-- routes to
                        addTag or addNegativeTag based on category

UI Layer (string changes + 1 logic change)
  App.tsx -----> Header (props: searchQuery, onSearchChange)
           |--> TagLibrary (props: searchQuery)
           |      |--> CategoryGroup (props: category, tags)
           |      |      |--> TagItem (props: tag)  <-- uses smartAddTag
           |      |--> PresetGroup (reads store directly)
           |--> Workspace (reads store directly)
           |      |--> WorkspaceTag (props: tagId, weight, isNegative)
           |--> Preview (reads store directly)
           |--> StatusBar (reads store directly)
```

## Data Flow

### Current Tag Selection Flow (Problem)

1. User expands "negative common" category in TagLibrary
2. Clicks a negative tag (e.g., "lowres")
3. `TagItem` calls `toggleTag("lowres")`
4. Store adds `{ tagId: "lowres" }` to `selectedTags` (positive)
5. Tag appears in Workspace positive section -- WRONG

### Recommended Tag Selection Flow (Fix)

1. User expands "negative common" category in TagLibrary
2. Clicks a negative tag (e.g., "lowres")
3. `TagItem` knows the tag's category is `"negative"` (already available via `tag.category`)
4. `TagItem` calls `smartAddTag(tag.id, tag.category)` instead of `toggleTag`
5. Store detects `category === 'negative'`, routes to `addNegativeTag`
6. Tag appears in Workspace negative section -- CORRECT

### Implementation Option A: Store-level routing (recommended)

Add one action to the store that encapsulates the routing logic:

```typescript
// In usePromptStore.ts
smartAddTag: (tagId, category) => {
  const { selectedTags, negativeTags } = get()
  const isSelected = selectedTags.some(t => t.tagId === tagId)
  const isNegative = negativeTags.some(t => t.tagId === tagId)

  // If already in either list, remove (toggle off)
  if (isSelected) { get().removeTag(tagId); return }
  if (isNegative) { get().removeNegativeTag(tagId); return }

  // Route by category
  if (category === 'negative') {
    get().addNegativeTag(tagId)
  } else {
    get().addTag(tagId)
  }
}
```

Then `TagItem` changes from:

```typescript
onClick={() => toggleTag(tag.id)}
```

to:

```typescript
onClick={() => smartAddTag(tag.id, tag.category)}
```

**Why this approach:** Logic stays in the store (single source of truth for mutation rules). Component stays dumb. No prop drilling of category info through intermediate components -- `TagItem` already has the full `Tag` object.

### Implementation Option B: Component-level routing (rejected)

Could add an `if` in `TagItem.onClick` to decide which store action to call. Rejected because it splits mutation logic between component and store, violating the current pattern where all business logic lives in store actions.

### Chinese Localization Data Flow

No new data flow needed. Approach: direct string replacement in JSX.

**What NOT to do:** Do not create a translation map, i18n context, or string constants file. The project explicitly scopes out i18n framework, and only ~30 strings need changing. A constants file would add indirection for no benefit at this scale.

**What to do:** Find-and-replace English strings directly in component JSX. Every string to change is a literal in a component file -- there are no computed English strings.

**Inventory of strings to translate:**

| Component | Current English | Target Chinese |
|-----------|----------------|---------------|
| `Workspace` | "Positive Tags" | "正面提示词" |
| `Workspace` | "Clear all" | "清除全部" |
| `Workspace` | "Click tags from the library to add them here" | "从左侧标签库点击添加" |
| `Workspace` | "Negative" (divider) | "负面提示词" |
| `Workspace` | "Right-click tags to move them here" | "右键标签可移入此处" |
| `Workspace` | "Save as preset" | "保存为预设" |
| `Workspace` | "Preset name..." | "预设名称..." |
| `Workspace` | "Save" | "保存" |
| `Workspace` | "Cancel" | "取消" |
| `Preview` | "SD Format" | "SD 格式" |
| `Preview` | "DALL-E Format" | "DALL-E 格式" |
| `Preview` | "Prompt" | "提示词" |
| `Preview` | "Select tags to generate prompt..." | "选择标签生成提示词..." |
| `Preview` | "Negative Prompt" | "负面提示词" |
| `Preview` | "No negative tags..." | "无负面标签..." |
| `Preview` | "Copy to Clipboard" / "Copied!" | "复制到剪贴板" / "已复制" |
| `Header` | "Import" | "导入" |
| `Header` | "Export" | "导出" |
| `SearchBar` | "Search tags..." | "搜索标签..." |
| `StatusBar` | "Selected ... tags" | "已选 ... 个标签" |
| `StatusBar` | "Negative" | "负面" |
| `StatusBar` | "Storage" | "存储" |
| `PresetGroup` | "Presets" | "预设" |
| `PresetGroup` | "Delete" | "删除" |
| `WorkspaceTag` | tooltip: "Right-click: move to positive/negative" | "右键：移到正面/负面" |
| `Header` | alert "Import failed:" | "导入失败：" |
| `Header` | alert "Import successful!" | "导入成功！" |

Total: ~27 string replacements across 8 component files. Straightforward and safe.

## Patterns to Follow

### Pattern 1: Store Action Encapsulation

**What:** All mutation logic in Zustand store actions. Components call actions, never compute what to mutate.
**When:** Any time a click handler needs to decide between different state mutations.
**Already used:** `toggleTag`, `moveToNegative`, `moveToPositive` all encapsulate multi-step logic.
**Apply to:** New `smartAddTag` follows this same pattern.

### Pattern 2: Selector Subscriptions for Re-render Control

**What:** Each component subscribes to the minimal store slice it needs via `usePromptStore(s => s.specificField)`.
**When:** Always -- never call `usePromptStore()` without a selector (except Header, which currently does this and should be fixed).
**Current violation:** `Header` calls `const store = usePromptStore()` with no selector, subscribing to ALL state changes. Not critical but worth fixing during the polish pass.

```typescript
// Current (Header.tsx) -- subscribes to everything
const store = usePromptStore()

// Better -- subscribe only to what's needed
const presets = usePromptStore(s => s.presets)
const savePreset = usePromptStore(s => s.savePreset)
```

### Pattern 3: Static Data as Module-Level Constants

**What:** `builtinTags` and `builtinCategories` are imported directly, not stored in state.
**When:** Data that never changes at runtime.
**Preserve:** Do not move these into the store. The negative category ID (`'negative'`) is a static data concern, not a store concern. `TagItem` can read `tag.category` directly from the static `Tag` object it already receives as a prop.

### Pattern 4: Component-Local UI State

**What:** Transient UI state (expanded/collapsed, dialog visibility, copy feedback) stays in component `useState`.
**When:** State that does not need to persist or be shared across components.
**Preserve:** Do not move format selection, search query, or expand/collapse state into the Zustand store. These are correctly scoped as component-local today.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Translation Layer for <30 Strings

**What:** Creating a `translations.ts` map, React context, or i18n-lite helper.
**Why bad:** Adds indirection and a new abstraction for a problem that is fully solved by literal string replacement. The project has explicitly scoped out i18n. Adding a "lite" translation layer is over-engineering that will need to be ripped out if real i18n is ever added.
**Instead:** Replace English strings inline. If i18n is ever needed later, use a proper library (react-intl, i18next) and extract strings at that time.

### Anti-Pattern 2: Prop Drilling Category Through Intermediate Components

**What:** Passing `isNegativeCategory` through `TagLibrary -> CategoryGroup -> TagItem`.
**Why bad:** `TagItem` already receives the full `Tag` object which contains `tag.category`. No new prop needed.
**Instead:** `TagItem` reads `tag.category` directly from its existing `tag` prop.

### Anti-Pattern 3: Multiple Store Subscriptions in TagItem

**What:** Adding a third `usePromptStore` selector to `TagItem` for the new `smartAddTag` action.
**Why bad:** `TagItem` currently has 3 selectors (toggleTag, isSelected, isNegative). Adding a 4th when replacing `toggleTag` with `smartAddTag` is fine, but do not keep the old `toggleTag` selector -- replace it.
**Instead:** Replace `toggleTag` subscription with `smartAddTag`. Net selector count stays at 3.

### Anti-Pattern 4: CSS-in-JS or Component Library for "Polish"

**What:** Introducing shadcn/ui, Headless UI, or styled-components for the UI polish pass.
**Why bad:** Violates the "no new deps" constraint. TailwindCSS 4 is already sufficient for all planned improvements.
**Instead:** Use Tailwind utility classes and transitions. Add custom CSS to `index.css` only if a Tailwind utility doesn't exist (e.g., custom animations).

## Suggested Build Order

Based on dependency analysis, the three improvement areas can be done in any order since they touch different concerns. But there is an optimal sequence:

### Phase 1: Negative Tag Auto-Categorize (logic change)

**Must come first because:**
- It changes the store API (adds `smartAddTag`)
- It changes `TagItem` click handler
- Chinese localization of `TagItem` tooltip text should happen after the logic is stable
- Tests should verify the new routing behavior before layering on cosmetic changes

**Files changed:** `usePromptStore.ts` (add action), `TagItem.tsx` (change click handler)
**Dependencies:** None -- standalone change
**Risk:** LOW -- additive store change, no breaking API

### Phase 2: Chinese Localization (string replacement)

**Should come second because:**
- Pure string replacement -- zero logic risk
- Reviewable in isolation (before polish muddles the diff)
- After logic is stable, so tooltip strings reflect actual behavior

**Files changed:** All 8 component files (string replacements only)
**Dependencies:** Phase 1 (so translated strings match final behavior)
**Risk:** VERY LOW -- no logic change

### Phase 3: UI/UX Polish (visual refinement)

**Should come last because:**
- Touches many files (CSS classes, layout tweaks)
- Easier to review when logic and strings are already finalized
- Most subjective -- may need iteration

**Files changed:** Multiple component files (Tailwind classes, possibly `index.css`)
**Dependencies:** Phase 2 complete (so polish is applied to final Chinese UI)
**Risk:** LOW -- visual only, but touches many files

## Scalability Considerations

Not a major concern for this project (pure client-side, static data), but worth noting:

| Concern | Current (97 tags) | At 500 tags | At 2000+ tags |
|---------|-------------------|-------------|---------------|
| Tag lookup in `findTag()` | Array.find, fine | Noticeable in Preview | Build a Map lookup |
| TagLibrary render | All categories rendered (collapsed) | Fine with virtualization | Consider `react-window` |
| Store updates | Immutable array spread | Fine | Fine (Zustand is efficient) |
| localStorage | ~2KB | ~20KB | ~100KB, still within 5MB |

None of these are concerns for the planned improvements. Mentioned for future reference only.

## Architecture Diagram (Post-Changes)

```
+-----------------------------------------------------------+
|  App.tsx                                                  |
|  State: searchQuery (local)                               |
+---+-------------------+-------------------+---------------+
    |                   |                   |
    v                   v                   v
+----------+    +-------------+    +-----------+
| Header   |    | TagLibrary  |    | Preview   |
| - Search |    | reads:      |    | reads:    |
| - Import |    |  builtinTags|    |  store.*  |
| - Export |    |  builtinCats|    |  builtinT |
+----------+    +------+------+    |  format*  |
                       |           +-----------+
          +------------+
          |            |
  +-------+---+  +----+-------+
  | Category  |  | PresetGroup|
  | Group     |  | reads:     |
  |           |  |  store.    |
  +-----+-----+  |  presets   |
        |        +------------+
  +-----+-----+
  | TagItem   |       +-------------+
  | calls:    |       | Workspace   |
  | smartAdd  |       | reads:      |
  | Tag()  *  |       |  store.*    |
  +-----------+       +------+------+
                             |
                      +------+------+
                      | WorkspaceTag|
                      | calls:      |
                      |  remove*()  |
                      |  setWeight()|
                      |  moveTo*() |
                      +-------------+

  * = changed from toggleTag to smartAddTag

Store: usePromptStore (Zustand + persist)
  selectedTags[]  negativeTags[]  presets[]
  + smartAddTag(tagId, category)  <-- NEW
```

## Sources

- Direct codebase analysis (all source files read and analyzed)
- Zustand documentation (store patterns, selectors, persist middleware)
- Project constraints from `.planning/PROJECT.md`

---

*Architecture analysis for UI/UX improvements: 2026-03-08*
