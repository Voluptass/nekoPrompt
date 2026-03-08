# Pitfalls Research

**Domain:** React SPA UI/UX refurbishment (localization + interaction fix + visual polish)
**Researched:** 2026-03-08
**Confidence:** HIGH (based on codebase analysis + known React/Zustand patterns)

## Critical Pitfalls

### Pitfall 1: Breaking localStorage Backward Compatibility During Refurbishment

**What goes wrong:**
Changing store shape, renaming keys, or altering the `SelectedTag`/`Preset` structures during the negative-tag auto-categorization fix or store refactors causes existing users' persisted data (under `nekoPrompt:workspace`) to deserialize into an incompatible shape. The app either crashes on load or silently loses all saved presets and workspace state.

**Why it happens:**
The Zustand persist config at `src/stores/usePromptStore.ts:122-129` has no `version` field and no `migrate` function. Any shape change to `selectedTags`, `negativeTags`, or `presets` is a silent breaking change. The current `partialize` only selects three fields -- if any field is renamed or restructured, old data loads as `undefined`.

**How to avoid:**
1. Do NOT rename any existing store fields (`selectedTags`, `negativeTags`, `presets`).
2. If adding new fields (e.g., a `category` hint on `SelectedTag` for auto-categorization), add them as optional -- old data lacking the field must still work.
3. If store shape must change, add `version: 2` and a `migrate` function to the persist config before any structural changes.
4. Test by: load the current production site, accumulate presets, export localStorage, then import into the new build.

**Warning signs:**
- Any `git diff` that renames or removes a field in `SelectedTag`, `Preset`, or the top-level store state.
- Adding `version` to persist config without a corresponding `migrate`.
- New required (non-optional) fields on existing types.

**Phase to address:**
Phase 1 (negative tag fix) -- the most likely phase to touch store shape. Add the `version` + `migrate` scaffold before any store changes.

---

### Pitfall 2: Hardcoding Chinese Strings Scattered Across Components

**What goes wrong:**
The localization pass replaces English strings with Chinese text directly in JSX. Strings end up scattered across 8+ component files with no central reference. Future maintenance (fixing a typo, adjusting wording, or ever adding i18n) requires hunting through every component. Worse, some strings get missed -- the app ships with a mix of Chinese labels and leftover English placeholders/tooltips.

**Why it happens:**
The project explicitly scopes out i18n infrastructure. The temptation is to do a find-and-replace in each component file. This is correct for the scope, but without a systematic inventory of all user-facing strings, coverage is incomplete.

**How to avoid:**
1. Before changing any string, create a complete inventory of all user-facing text in the codebase. Sources:
   - `title` attributes (e.g., `WorkspaceTag.tsx:44` -- "Right-click: move to positive/negative")
   - `placeholder` attributes (e.g., `SearchBar.tsx:13` -- "Search tags...", `Preview.tsx:67` -- "Select tags to generate prompt...")
   - Button labels (e.g., `Header.tsx:86,99` -- "Import"/"Export", `Workspace.tsx:119` -- "Save as preset")
   - Section headings (e.g., `Workspace.tsx:28` -- "Positive Tags", `Preview.tsx:61` -- "Prompt")
   - Empty state text (e.g., `Workspace.tsx:41` -- "Click tags from the library...")
   - Status bar text (`StatusBar.tsx:23-31` -- "Selected", "tags", "Negative", "Storage")
   - Alert messages (`Header.tsx:41,65` -- "Import failed:", "Import successful!")
   - Copy feedback (`Preview.tsx:90` -- "Copied!")
2. Group all strings into a single `src/constants/ui-text.ts` file. Not i18n, just a single source of truth.
3. Replace strings in components with references to this constants file.
4. Verify coverage by searching for remaining English text patterns after the pass.

**Warning signs:**
- Directly writing Chinese strings inside JSX without checking all string locations first.
- No grep/audit for remaining English strings after the localization pass.
- Forgetting `title` and `placeholder` attributes (they are invisible in normal UI testing).

**Phase to address:**
Phase 2 (localization) -- must be addressed as the first step of that phase, before any string changes begin.

---

### Pitfall 3: Non-Atomic Store Operations Creating Flash-of-Inconsistent-State

**What goes wrong:**
The negative tag auto-categorization fix likely modifies `TagItem` click behavior so that tags in the "negative" category go to `negativeTags` instead of `selectedTags`. If implemented by chaining two store actions (like the existing `moveToNegative` at `usePromptStore.ts:72-74` which calls `removeTag` then `addNegativeTag` sequentially), subscribers see an intermediate state between the two `set()` calls. This causes a visual flash where the tag briefly appears removed before appearing in the negative section.

**Why it happens:**
This exact pattern already exists in the codebase and is flagged in CONCERNS.md. The `moveToNegative`/`moveToPositive` actions each trigger two separate re-renders. The natural inclination when adding auto-categorization is to reuse these non-atomic actions or follow the same pattern.

**How to avoid:**
1. Any new store logic that moves tags between arrays MUST use a single `set()` call.
2. Refactor `moveToNegative` and `moveToPositive` to be atomic while you are in the store file -- do not leave the existing fragile pattern as a template for new code.
3. For the auto-categorization: the decision logic (which array to target) should live in the component or a helper, and call `addTag` or `addNegativeTag` directly -- do not create a "smart add" that chains calls.

**Warning signs:**
- Any store action that calls `get().someAction()` followed by `get().anotherAction()`.
- Tags visually flickering during add/move operations during manual testing.

**Phase to address:**
Phase 1 (negative tag fix) -- refactor the non-atomic actions as part of fixing the categorization logic.

---

### Pitfall 4: Changing Click Behavior Without Visible Affordance

**What goes wrong:**
The negative tag auto-categorization changes what left-click does for tags in the "negative" category -- previously it toggled them in `selectedTags`, now it should add them to `negativeTags`. But the `TagItem` component looks identical regardless of category. Users clicking "negative" category tags see them appear in a different section than other tags, with no visual explanation of why. Right-click behavior (which currently moves workspace tags between positive/negative) also becomes confusing -- does right-clicking a "negative" category tag move it to positive?

**Why it happens:**
Behavior changes are implemented in the store/logic layer without corresponding visual changes. The `TagItem` component at `src/components/TagLibrary/TagItem.tsx` renders all categories' tags identically -- same color, same shape, same interaction feedback.

**How to avoid:**
1. Tags in the "negative" category MUST have a distinct visual treatment in the tag library sidebar (not just in the workspace). Use the existing `bg-red-900/50 text-red-300` pattern that already exists for negative-state tags (TagItem.tsx:26).
2. Add a tooltip or label change indicating the different click behavior (e.g., title="Click to add as negative prompt").
3. The workspace empty state text (`Workspace.tsx:62` -- "Right-click tags to move them here") must be updated to reflect the new auto-categorization path.
4. Test the full interaction matrix: left-click positive tag, left-click negative tag, right-click positive workspace tag, right-click negative workspace tag.

**Warning signs:**
- Store logic changes without any corresponding component visual changes.
- No update to tooltip/title attributes or empty state text after behavior changes.
- User confusion about where tags appeared after clicking.

**Phase to address:**
Phase 1 (negative tag fix) -- the visual affordance must ship alongside the behavior change, not in a later polish phase.

---

### Pitfall 5: Polishing UI While Ignoring the Existing "Return Null for Unknown Tags" Bug

**What goes wrong:**
During visual polish, the `WorkspaceTag` component gets styled, animated, and refined. But the invisible bug at `WorkspaceTag.tsx:18` (`if (!tag) return null`) remains. If any preset references a tag ID that does not exist in `builtinTags` (e.g., from a corrupted import or a future tag rename), the tag becomes an invisible phantom in the store -- occupying state, affecting the prompt output, but invisible in the workspace UI and unremovable.

**Why it happens:**
The `return null` path is a defensive guard that works silently. It never causes a visible crash, so it never gets noticed during manual polish testing. But after polish, users trust the UI more and are less likely to suspect invisible state issues.

**How to avoid:**
1. Replace `return null` with a fallback "unknown tag" chip that displays the raw tag ID and a remove button.
2. Style it distinctly (e.g., dashed border, warning color) so it is clearly a degraded state, not a normal tag.
3. This is a cheap fix (5 lines of JSX) that prevents a class of silent data corruption bugs.

**Warning signs:**
- Any workspace showing fewer tags than the store state's `selectedTags.length + negativeTags.length`.
- StatusBar count not matching visible tag count.

**Phase to address:**
Phase 3 (UI polish) -- must be included as a polish item, not deferred. It directly affects visual integrity.

---

### Pitfall 6: Responsive Layout Regression During Visual Polish

**What goes wrong:**
The existing layout uses hardcoded widths (`w-64` for tag library, `w-80` for preview). During UI polish, developers add padding, margins, borders, or min-widths that further squeeze the center workspace panel. On screens around 1024px--1280px (common laptop sizes), the workspace becomes too narrow to display tags comfortably. The polish that looks great on a wide monitor breaks on typical user screens.

**Why it happens:**
The app has no responsive breakpoints (`CONCERNS.md` flags "Fixed 3-panel layout with hardcoded widths"). Polish work is typically done on the developer's monitor, which is often wider than the target user's. Each small visual addition (more padding, wider borders, icon additions) compounds the squeeze.

**How to avoid:**
1. Test at 1024px viewport width throughout the polish phase -- this is the minimum viable width for a 3-panel layout.
2. Do NOT increase `w-64` or `w-80` values. If anything, consider reducing them slightly.
3. If adding any horizontal element (icons, badges, wider buttons), verify the workspace center column at narrow widths.
4. Consider adding a single responsive breakpoint: below 768px, collapse the 3-panel into stacked/tabbed layout. This is out of the stated scope but is worth noting as a "looks done but isn't" issue.

**Warning signs:**
- Tags wrapping excessively in the workspace at 1024px width.
- Horizontal scrollbar appearing.
- Workspace narrower than 300px at any reasonable viewport.

**Phase to address:**
Phase 3 (UI polish) -- every visual change must be checked at 1024px width before merging.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline Chinese strings in JSX | Fast localization, no abstraction overhead | Every future text change requires hunting through components; no grep-able pattern | Acceptable ONLY if a text constants file is created as a centralized index |
| Keeping `return null` for unknown tags | No visual glitch for normal usage | Silent data corruption, orphaned store state, user confusion | Never -- replace with a fallback chip during polish |
| Using `alert()` for import feedback | Works, zero implementation cost | Blocks UI thread, looks unprofessional, not styled, cannot show detail | Acceptable for MVP only -- replace with toast/notification during polish |
| Keeping non-atomic `moveToNegative`/`moveToPositive` | No immediate visible bug at 60fps | Flash of inconsistent state, unreliable for fast interactions | Never -- fix during the store refactor in Phase 1 |
| Skipping the persist `version`/`migrate` setup | Saves time, current data shape is fine | First structural change breaks all existing users' data | Never -- add before any store shape changes |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `getStorageSize()` runs on every StatusBar render | Jank when store updates frequently (e.g., rapid tag adds) | Memoize with `useMemo` or compute only on write operations | Noticeable at 50+ rapid state changes (power user rapidly clicking tags) |
| `builtinTags.find()` per WorkspaceTag render | Slow workspace rendering with many selected tags | Build a `Map<string, Tag>` once at module level | Noticeable at 30+ selected tags (common for detailed prompts) |
| `filterTags` runs on every keystroke without debounce | Laggy search input on lower-end devices | Add `useMemo` around filter, or debounce search input by 150ms | Noticeable at 200+ tags or on mobile-class CPU |
| Adding CSS transitions/animations to every tag chip | Visual jank when adding/removing many tags at once | Use `will-change` sparingly, avoid animating layout properties (width/height), prefer opacity/transform | Noticeable at 20+ tags being re-rendered simultaneously |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Import validation only checks `version` field | Malformed JSON can crash the app or inject unexpected state | Add structural validation: check `presets` is array, each preset has `id`/`name`/`tags` fields, tags are arrays of `{tagId: string}` |
| No try/catch on `navigator.clipboard.writeText` | Promise rejection on HTTP or restricted contexts, no error feedback | Wrap in try/catch, fall back to `document.execCommand('copy')` or show error toast |
| No localStorage corruption recovery | Corrupt `nekoPrompt:workspace` key crashes app on load with no escape | Add `merge` validation in persist config; add a "reset" button accessible even in error state (or an error boundary that offers reset) |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Changing behavior (negative auto-categorization) without visual feedback | Users confused about where their tag went after clicking | Show a brief animation/highlight when tag lands in negative section; differentiate negative-category tags visually in the sidebar |
| `alert()` for import/export feedback | Jarring, blocks interaction, feels broken on modern UIs | Use an inline toast notification that auto-dismisses |
| "Right-click to move to negative" as only path | Mobile users cannot right-click; desktop users may not discover this | Add a visible move button on hover (similar to existing weight +/- buttons), keep right-click as shortcut |
| Localized labels but English tag text (e.g., "masterpiece", "best quality") | Cognitive dissonance -- UI is Chinese but core content is English | This is correct for this domain (AI model tags must be English); add a brief note in the UI explaining this, or show Chinese aliases alongside English tag text |
| No confirmation before `clearAll` | One misclick destroys all workspace state with no undo | Add a simple "confirm" step or a 3-second undo toast |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Localization:** All visible text is Chinese -- but check `title` attributes on WorkspaceTag, `placeholder` on SearchBar/Preview textareas, `alert()` messages in Header, and StatusBar labels. These are easy to miss.
- [ ] **Negative auto-categorization:** Tags from "negative" category go to negative area -- but verify: what happens when a negative-category tag is already in `selectedTags` (from before the fix)? Old presets with negative-category tags in `selectedTags` must still load correctly.
- [ ] **Copy button:** Works and shows "Copied!" -- but test over HTTP (not just HTTPS localhost). Clipboard API fails silently without the try/catch.
- [ ] **Context menu positioning:** Menu appears on right-click -- but test near viewport edges. Current implementation has no boundary checks (CONCERNS.md).
- [ ] **Empty states:** All empty states have Chinese text -- but also check the StatusBar when counts are zero, the search "no results" state, and the preset list when no presets exist.
- [ ] **Visual polish:** Tags look good -- but test with long tag text (e.g., "extremely detailed CG unity 8k wallpaper"), many tags selected (20+), and weight values displayed. Polish often breaks at edge cases.
- [ ] **Error boundary:** App looks polished -- but corrupt localStorage still white-screens the entire app with no recovery. An error boundary is the minimum viable safety net.

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| localStorage schema break | HIGH | Add `version: 2` + `migrate` function that transforms old shape to new. Deploy fix. Users who already lost data cannot recover unless they have a JSON export. |
| Missed English strings after localization | LOW | Grep for common English patterns (`/[A-Z][a-z]+\s[a-z]+/` in JSX strings). Fix and redeploy. No data loss. |
| Non-atomic store flash | LOW | Refactor action to single `set()` call. No data migration needed. |
| Unknown tag `return null` causing phantom state | MEDIUM | Deploy fallback chip fix. For users already affected: provide a "clean orphaned tags" utility function or a store reset option. |
| Responsive layout broken on narrow screens | LOW | Adjust widths/padding. Pure CSS fix, no data or logic impact. |
| alert() left in production | LOW | Replace with toast component. Purely visual, no data impact. |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| localStorage backward compatibility | Phase 1 (negative tag fix) | Export localStorage from current production, import into new build, verify presets and workspace load correctly |
| Non-atomic store operations | Phase 1 (negative tag fix) | Refactor `moveToNegative`/`moveToPositive` to single `set()`. Verify no visual flash on rapid toggling |
| Behavior change without visual affordance | Phase 1 (negative tag fix) | Negative-category tags must look visually distinct in sidebar. Tooltips must explain the different click behavior |
| Scattered hardcoded strings | Phase 2 (localization) | Create string inventory before changes. Grep for English text after changes. All `title`, `placeholder`, `alert` strings checked |
| Unknown tag return-null bug | Phase 3 (UI polish) | Add fallback chip. Test by manually adding a fake tagId to localStorage and reloading |
| Responsive layout regression | Phase 3 (UI polish) | Test every visual change at 1024px viewport width |
| alert() for user feedback | Phase 3 (UI polish) | Replace all `alert()` calls with styled toast notifications |
| Clipboard error handling | Phase 3 (UI polish) | Wrap clipboard call in try/catch. Test on HTTP context |
| No error boundary | Phase 3 (UI polish) | Add React error boundary at App root with "reset data" escape hatch |

## Sources

- Codebase analysis: all source files in `src/` read directly
- Known issues: `.planning/codebase/CONCERNS.md` (2026-03-08 audit)
- Project scope: `.planning/PROJECT.md`
- React/Zustand persist patterns: established patterns from library documentation
- localStorage behavior: Web Storage API specification (5MB limit, UTF-16 encoding)

---
*Pitfalls research for: nekoPrompt UI/UX refurbishment*
*Researched: 2026-03-08*
