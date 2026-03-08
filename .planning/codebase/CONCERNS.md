# Codebase Concerns

**Analysis Date:** 2026-03-08

## Tech Debt

**Import logic is fragile and lossy:**
- Issue: `handleImport` in `src/components/Common/Header.tsx` (lines 33-68) uses a roundabout approach to import presets. It calls `store.savePreset(preset.name)` which creates a *new* preset with current workspace tags, then immediately patches it with the imported preset's tags via `setState`. This discards the imported preset's `id` and `createdAt`, generating new values instead. It also only imports presets -- `customTags`, `customCategories`, `hiddenBuiltinTags`, and `settings` from the `UserData` payload are silently ignored.
- Files: `src/components/Common/Header.tsx` lines 46-63
- Impact: Import/export round-trip is not lossless. Users importing a backup lose custom tags, categories, hidden tags, and settings. The preset workaround also triggers multiple sequential state updates per preset which is inefficient.
- Fix approach: Add a dedicated `importPresets(presets: Preset[])` action to the store that bulk-merges presets directly. When `UserData` fields beyond presets are supported, add corresponding store actions or a separate `userDataStore`.

**`useLocalStorage` hook is dead code:**
- Issue: `src/hooks/useLocalStorage.ts` defines `loadUserData`, `saveUserData`, `loadWorkspace`, `saveWorkspace` with manual `localStorage` access. The actual persistence uses Zustand's `persist` middleware in `src/stores/usePromptStore.ts` under the key `nekoPrompt:workspace`. The hook functions are never called from any component or store -- only from their own test file.
- Files: `src/hooks/useLocalStorage.ts`, `src/hooks/__tests__/useLocalStorage.test.ts`
- Impact: Two separate persistence keys (`nekoPrompt:userData` vs `nekoPrompt:workspace`) with different schemas. Dead code adds confusion about which persistence mechanism is canonical. Tests pass but test dead code.
- Fix approach: Delete `src/hooks/useLocalStorage.ts` and its test. Zustand persist is the canonical persistence layer.

**Incomplete `UserData` model:**
- Issue: The `UserData` type in `src/types/index.ts` defines `customTags`, `customCategories`, `hiddenBuiltinTags`, and `settings`, but no store or UI code reads or writes these fields. Export in `src/components/Common/Header.tsx` (line 22-29) hardcodes empty arrays and a default platform. These fields exist only as type definitions with no backing implementation.
- Files: `src/types/index.ts` (lines 36-43), `src/components/Common/Header.tsx` (lines 22-29)
- Impact: The data model promises features (custom tags, hidden tags, per-user settings) that do not exist. Import/export serializes placeholders.
- Fix approach: Either implement the features behind these fields or remove them from the type to avoid confusion. If keeping them as future placeholders, add explicit comments marking them as unimplemented.

**`setWeight` only works on positive tags:**
- Issue: `setWeight` in `src/stores/usePromptStore.ts` (line 82-87) only maps over `selectedTags`. Negative tags also carry the `weight` field in the `SelectedTag` type, but there is no way to adjust weight on negative tags. The `WorkspaceTag` component in `src/components/Workspace/WorkspaceTag.tsx` (line 51) deliberately hides the +/- weight buttons when `isNegative` is true.
- Files: `src/stores/usePromptStore.ts` line 82-87, `src/components/Workspace/WorkspaceTag.tsx` line 51
- Impact: Negative prompt weights cannot be adjusted. For SD-format users who rely on negative prompt weighting, this is a missing capability.
- Fix approach: Add a `setNegativeWeight` action or make `setWeight` check both arrays. Update `WorkspaceTag` to show weight controls for negative tags.

## Known Bugs

**Import creates presets with wrong tags:**
- Symptoms: When importing a backup file, each imported preset is first created with the *current* workspace tags (via `savePreset`), then patched. If `setState` in the patch step fails silently or races, presets end up with workspace tags instead of imported tags.
- Files: `src/components/Common/Header.tsx` lines 46-63
- Trigger: Import a JSON backup while having tags selected in the workspace.
- Workaround: Clear workspace before importing.

**`navigator.clipboard.writeText` has no error handling:**
- Symptoms: Copy-to-clipboard in `src/components/Preview/Preview.tsx` line 26 uses `await navigator.clipboard.writeText(full)` without a try/catch. If clipboard permission is denied (common in non-HTTPS contexts or iframe embeds), the promise rejects unhandled and the "Copied!" feedback never shows. No error feedback is displayed.
- Files: `src/components/Preview/Preview.tsx` lines 22-29
- Trigger: Use the app over HTTP (not HTTPS) or in a restricted iframe context.
- Workaround: None. The copy silently fails.

**Context menu can render off-screen:**
- Symptoms: The preset context menu in `src/components/TagLibrary/PresetGroup.tsx` (line 64) positions itself at the raw `clientX`/`clientY` coordinates without boundary checks. If a preset is near the bottom-right of the viewport, the menu renders partially outside the visible area.
- Files: `src/components/TagLibrary/PresetGroup.tsx` lines 62-76
- Trigger: Right-click a preset near the bottom or right edge of the viewport.
- Workaround: None.

## Security Considerations

**Import validation is insufficient:**
- Risk: `validateImport` in `src/utils/importExport.ts` (lines 13-26) only checks for valid JSON and the presence of a `version` field, then casts the result as `UserData` with `as UserData`. No schema validation is performed on nested structures (`presets`, `tags`, `customTags`). Malformed data could cause runtime crashes when downstream code accesses expected properties.
- Files: `src/utils/importExport.ts` lines 13-26
- Current mitigation: The app is pure client-side with no server. Malformed data only affects the importing user's own session.
- Recommendations: Add structural validation (check that `presets` is an array, each preset has required fields, etc.) or use a schema validation library like Zod. At minimum, wrap the import merge logic in a try/catch with user-facing error feedback.

**localStorage has no integrity check:**
- Risk: Zustand persist deserializes `localStorage` data without validation. If a user (or browser extension) corrupts the `nekoPrompt:workspace` key, the app could crash on load with no recovery path.
- Files: `src/stores/usePromptStore.ts` (persist config, lines 122-129)
- Current mitigation: Zustand persist has basic error handling, but corrupt shapes (e.g., `selectedTags` is a string instead of array) would propagate.
- Recommendations: Add a `merge` function to the Zustand persist config that validates the deserialized shape. Add a "reset to defaults" escape hatch accessible even when the app crashes.

**No CSP or security headers:**
- Risk: The static site deployment (GitHub Pages) relies on platform defaults. No Content Security Policy is defined in `index.html`. This is low-risk for a static SPA with no external API calls, but becomes relevant if external integrations are added.
- Files: `index.html`
- Current mitigation: No external API calls, no user-generated content rendered as HTML.
- Recommendations: Add a basic CSP meta tag if the app ever loads external resources.

## Performance Bottlenecks

**Linear tag lookup on every render:**
- Problem: `builtinTags.find((t) => t.id === tagId)` is called per `WorkspaceTag` render in `src/components/Workspace/WorkspaceTag.tsx` line 17, and per tag in `findTag` within `src/components/Preview/Preview.tsx` line 9-10. With 97 builtin tags this is negligible, but scales poorly if custom tags grow the list.
- Files: `src/components/Workspace/WorkspaceTag.tsx` line 17, `src/components/Preview/Preview.tsx` line 9-10
- Cause: Tags are stored as an array. Lookup is O(n) per call, O(n*m) per render where m is the number of selected tags.
- Improvement path: Create a `Map<string, Tag>` index once (e.g., `const tagMap = new Map(builtinTags.map(t => [t.id, t]))`) and import that instead of using `.find()`.

**`getStorageSize()` iterates all localStorage keys on every StatusBar render:**
- Problem: `src/components/Common/StatusBar.tsx` lines 3-14 compute total localStorage size by iterating every key. This runs on every render since it is called directly in the component body (not memoized, not in a useEffect).
- Files: `src/components/Common/StatusBar.tsx` lines 3-14
- Cause: No memoization or throttling. Any state change that triggers StatusBar re-render recalculates storage size.
- Improvement path: Memoize or throttle the calculation. Alternatively, only recalculate after write operations (import, preset save).

**`TagLibrary` filters all tags on every search keystroke without debounce:**
- Problem: `filterTags` in `src/components/TagLibrary/TagLibrary.tsx` line 11 runs on every render, which triggers on every keystroke in the search bar since `searchQuery` state is lifted to `App`.
- Files: `src/components/TagLibrary/TagLibrary.tsx` line 11, `src/hooks/useTagSearch.ts`
- Cause: No debounce on search input. With 97 tags this is fast, but will degrade with larger tag sets.
- Improvement path: Add `useMemo` around the filter call, or debounce the search input in `src/components/Common/SearchBar.tsx`.

## Fragile Areas

**Store action chaining in `moveToNegative` / `moveToPositive`:**
- Files: `src/stores/usePromptStore.ts` lines 72-79
- Why fragile: These actions call two separate store actions sequentially (`removeTag` + `addNegativeTag`). Each triggers an independent `set()` call, causing two re-renders. If a subscriber reacts between the two calls, it sees an inconsistent intermediate state (tag removed from positive but not yet in negative).
- Safe modification: Refactor to a single `set()` call that removes from one array and adds to the other atomically.
- Test coverage: One test covers `moveToNegative` in `src/stores/__tests__/usePromptStore.test.ts`. No test covers `moveToPositive`.

**`WorkspaceTag` returns null for unknown tagId:**
- Files: `src/components/Workspace/WorkspaceTag.tsx` line 18
- Why fragile: If a tag ID in `selectedTags` does not match any `builtinTags` entry (e.g., it was a custom tag that got removed, or an imported preset references an unknown ID), the component returns `null` silently. The tag remains in the store but is invisible in the UI. The user has no way to remove an orphaned invisible tag.
- Safe modification: Show a fallback "unknown tag" chip with a remove button instead of returning null.
- Test coverage: No test covers this case.

**`Preview.findTag` fallback creates an incomplete Tag object:**
- Files: `src/components/Preview/Preview.tsx` lines 9-10
- Why fragile: The fallback `{ id, text: id, category: '' }` has an empty `category` string, which is not a valid category ID. This is used only by the formatter and works because formatters only read `text`, but any future code that depends on `category` being valid will break.
- Safe modification: Use a shared fallback tag factory or ensure the fallback tag is clearly typed as partial.
- Test coverage: No test covers the fallback path.

## Scaling Limits

**localStorage 5MB cap:**
- Current capacity: Presets and workspace state are small. 97 builtin tags stored by ID reference, not full tag objects.
- Limit: localStorage has a ~5MB cap per origin. If users accumulate many presets with large tag sets, or if custom tags with long descriptions are added, the cap can be hit. The `StatusBar` displays usage but there is no warning or prevention when approaching the limit.
- Scaling path: Add a warning when storage exceeds 4MB. For larger data needs, migrate to IndexedDB.

**Fixed 3-panel layout with hardcoded widths:**
- Current capacity: `src/App.tsx` uses `w-64` (256px) for the tag library and `w-80` (320px) for the preview panel.
- Limit: On screens narrower than ~900px, the workspace panel gets squeezed. No responsive breakpoints exist. The app is unusable on mobile.
- Scaling path: Add responsive breakpoints or a collapsible sidebar pattern. Consider a mobile-first layout with tabs.

## Dependencies at Risk

**No linting or formatting tools configured:**
- Risk: No `.eslintrc`, `.prettierrc`, `biome.json`, or equivalent config files exist. Code style consistency relies entirely on developer discipline.
- Impact: As the project grows or accepts contributions, style drift is inevitable. No automated checks catch issues.
- Migration plan: Add ESLint + Prettier or Biome. Minimal config to enforce consistent formatting and catch common React issues.

## Missing Critical Features

**No error boundary:**
- Problem: No React error boundary exists anywhere in the component tree. If any component throws during render (e.g., corrupt localStorage data causing a runtime error in the store), the entire app white-screens with no recovery.
- Blocks: Production reliability. Users would need to manually clear localStorage to recover.

**No drag-and-drop reordering:**
- Problem: Tags in the workspace cannot be reordered. The prompt output order matches insertion order only. Users who need a specific tag order must remove and re-add tags.
- Blocks: Fine-grained prompt crafting, which is the core use case.

**No undo/redo:**
- Problem: Destructive actions (clear all, delete preset, remove tag) have no undo mechanism. The `clearAll` action in `src/stores/usePromptStore.ts` line 89 wipes both arrays instantly.
- Blocks: User confidence in making changes. Accidental clears lose all work.

## Test Coverage Gaps

**No component tests:**
- What's not tested: Zero React component tests exist. All 27 tests are pure function or store tests. No tests verify that clicking a tag adds it to workspace, that the copy button works, that import/export UI functions, or that context menus behave correctly.
- Files: All files in `src/components/` (8 components, 0 tests)
- Risk: UI regressions go undetected. The `@testing-library/react` and `@testing-library/user-event` packages are installed but unused.
- Priority: High -- components contain significant logic (import flow, context menu, weight adjustment).

**`moveToPositive` not tested:**
- What's not tested: The `moveToPositive` store action has no test. Only `moveToNegative` is tested.
- Files: `src/stores/__tests__/usePromptStore.test.ts`
- Risk: Low -- the logic mirrors `moveToNegative`, but the gap means the reverse path has no regression protection.
- Priority: Low

**Preset save/load/delete not tested:**
- What's not tested: `savePreset`, `loadPreset`, `deletePreset` store actions have no tests.
- Files: `src/stores/__tests__/usePromptStore.test.ts`
- Risk: Medium -- preset logic includes ID generation and state replacement. The `loadPreset` action replaces workspace state entirely, which could lose unsaved work.
- Priority: Medium

**Import validation edge cases not tested:**
- What's not tested: `validateImport` tests cover invalid JSON and missing `version`, but not malformed structures like `{ version: 1, presets: "not-an-array" }` or deeply nested corrupt data.
- Files: `src/utils/__tests__/importExport.test.ts`
- Risk: Medium -- directly related to the insufficient validation concern above.
- Priority: Medium

---

*Concerns audit: 2026-03-08*
