# Tag Translation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Chinese translation display and editing for built-in and custom tags while preserving English-only prompt output.

**Architecture:** Extend the shared `Tag` model with an optional `translation` field and keep translations inline with tag records. Reuse the existing custom tag store so persisted custom tags naturally carry translations, then update search and UI consumers to render translation metadata without changing formatter behavior.

**Tech Stack:** React 19, TypeScript, Zustand persist, Vite, Vitest, Testing Library

---

### Task 1: Lock translation-aware tag behavior with failing hook and search tests

**Files:**
- Modify: `src/hooks/__tests__/useAllTags.test.ts`
- Modify: `src/hooks/__tests__/useTagSearch.test.ts`

**Step 1: Write the failing hook assertions**

In `src/hooks/__tests__/useAllTags.test.ts`, extend the custom tag fixture to include `translation: '赛博朋克城市'` and assert that:

- `useAllTags()` returns the custom tag with `translation`
- `useFindTag('custom-tag-1')` returns the same `translation`

**Step 2: Write the failing search assertion**

In `src/hooks/__tests__/useTagSearch.test.ts`, add a fixture tag with `translation: '蓝色眼睛'` and a test that `filterTags(tags, '蓝色')` returns that tag.

**Step 3: Run the targeted tests to verify they fail**

Run: `npx vitest run src/hooks/__tests__/useAllTags.test.ts src/hooks/__tests__/useTagSearch.test.ts`
Expected: FAIL because the current fixtures and search logic do not preserve or match `translation`

**Step 4: Implement the minimal production changes**

- Modify `src/types/index.ts` to add `translation?: string` to `Tag`
- Modify `src/hooks/useTagSearch.ts` so `filterTags()` also matches `t.translation?.toLowerCase().includes(q)`

**Step 5: Run the targeted tests to verify they pass**

Run: `npx vitest run src/hooks/__tests__/useAllTags.test.ts src/hooks/__tests__/useTagSearch.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/types/index.ts src/hooks/useTagSearch.ts src/hooks/__tests__/useAllTags.test.ts src/hooks/__tests__/useTagSearch.test.ts
git commit -m "feat: add translation-aware tag search"
```

---

### Task 2: Add built-in translation coverage with regression tests

**Files:**
- Modify: `src/data/__tests__/data.test.ts`
- Modify: `src/data/tags.ts`

**Step 1: Write the failing regression test**

In `src/data/__tests__/data.test.ts`, add a test named `includes representative Chinese translations for built-in tags` that checks examples such as:

- `masterpiece -> 杰作级`
- `1girl -> 一个女孩`
- `blue eyes -> 蓝色眼睛`
- `school uniform -> 校服`
- `smile -> 微笑`
- `street -> 街道`
- `anime style -> 动漫风格`
- `volumetric lighting -> 体积光`
- `cowboy shot -> 牛仔镜头`
- `extra fingers -> 多余手指`

Use `expect.objectContaining({ text, translation })` assertions.

**Step 2: Run the data test to verify it fails**

Run: `npx vitest run src/data/__tests__/data.test.ts`
Expected: FAIL because built-in tags do not yet define `translation`

**Step 3: Implement the minimal data update**

Modify `src/data/tags.ts` and add concise Chinese translations to the built-in tags used by the new regression test. Prefer short noun phrases over full explanations.

**Step 4: Run the data test to verify it passes**

Run: `npx vitest run src/data/__tests__/data.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/data/tags.ts src/data/__tests__/data.test.ts
git commit -m "feat: add built-in Chinese tag translations"
```

---

### Task 3: Add custom translation entry and display with failing tag-library tests first

**Files:**
- Modify: `src/components/TagLibrary/TagLibrary.test.tsx`
- Modify: `src/components/Common/CreateTagModal.tsx`
- Modify: `src/components/Common/ManageModal.tsx`
- Modify: `src/components/TagLibrary/TagItem.tsx`

**Step 1: Write the failing creation test**

In `src/components/TagLibrary/TagLibrary.test.tsx`, extend `creates a custom tag and category from the tag library controls` so the user also fills `汉语翻译` with `赛博朋克城市`, then assert the stored custom tag contains `translation: '赛博朋克城市'`.

**Step 2: Write the failing search-and-render test**

Update `renders searchable custom categories and custom tags with their visual marker` so the custom tag fixture includes `translation: '赛博朋克城市'`, the search query is Chinese, and the expanded tag button still renders. Also assert the translation text is visible in the tag content or tooltip.

**Step 3: Write the failing manage-modal assertion**

Add or extend a test so opening the manage modal for a translated custom tag shows `赛博朋克城市` in the tag row.

**Step 4: Run the targeted UI tests to verify they fail**

Run: `npx vitest run src/components/TagLibrary/TagLibrary.test.tsx`
Expected: FAIL because the modal has no translation field, search ignores translation, and the UI does not render translation text

**Step 5: Implement the minimal production changes**

Modify `src/components/Common/CreateTagModal.tsx`:

- Add `translation` state
- Initialize it from `editTag?.translation`
- Add a labeled `汉语翻译` input near `标签文本`
- Include `translation: trimmedTranslation` in `tagData` only when non-empty

Modify `src/components/TagLibrary/TagItem.tsx`:

- Render English `text` as the primary label
- Render `translation` as a compact secondary line when present
- Update `title` to prefer `translation + text` plus description when useful

Modify `src/components/Common/ManageModal.tsx`:

- Show `translation` as a secondary line for each custom tag when present

**Step 6: Run the targeted UI tests to verify they pass**

Run: `npx vitest run src/components/TagLibrary/TagLibrary.test.tsx`
Expected: PASS

**Step 7: Commit**

```bash
git add src/components/Common/CreateTagModal.tsx src/components/Common/ManageModal.tsx src/components/TagLibrary/TagItem.tsx src/components/TagLibrary/TagLibrary.test.tsx
git commit -m "feat: add translated custom tag management"
```

---

### Task 4: Show translations in workspace interactions without changing prompt output

**Files:**
- Modify: `src/components/Workspace/Workspace.test.tsx`
- Modify: `src/components/Workspace/Workspace.tsx`
- Modify: `src/components/Workspace/WorkspaceTag.tsx`

**Step 1: Write the failing workspace test**

In `src/components/Workspace/Workspace.test.tsx`, update the custom tag fixture to include `translation: '赛博朋克城市'` and assert the mobile action sheet shows both `cyberpunk city` and `赛博朋克城市`.

**Step 2: Run the targeted workspace test to verify it fails**

Run: `npx vitest run src/components/Workspace/Workspace.test.tsx`
Expected: FAIL because the mobile action sheet only renders English `tagText`

**Step 3: Implement the minimal workspace UI change**

Modify `src/components/Workspace/Workspace.tsx`:

- Pass the full tag object or both `tag.text` and `tag.translation` into `MobileTagActionSheet`
- Render `translation` as a secondary line only when present

Modify `src/components/Workspace/WorkspaceTag.tsx`:

- Keep the chip label English-only
- Do not alter weight, remove, or move interactions

**Step 4: Run the targeted workspace test to verify it passes**

Run: `npx vitest run src/components/Workspace/Workspace.test.tsx`
Expected: PASS

**Step 5: Sanity-check prompt output remains unchanged**

Run: `npx vitest run src/utils/__tests__/formatPrompt.test.ts`
Expected: PASS because formatters still use `text`, not `translation`

**Step 6: Commit**

```bash
git add src/components/Workspace/Workspace.tsx src/components/Workspace/Workspace.test.tsx src/components/Workspace/WorkspaceTag.tsx
git commit -m "feat: surface translations in workspace UI"
```

---

### Task 5: Run full verification and polish any test selectors

**Files:**
- Modify: `README.md` (optional, only if you want the feature documented)

**Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: PASS

**Step 2: Run a type/build verification**

Run: `npm run build`
Expected: PASS

**Step 3: Optionally update README feature bullets**

If documentation should reflect the feature, add a short note that tags can display Chinese translations and search matches translated text.

**Step 4: Re-run verification if README or selectors changed**

Run: `npx vitest run && npm run build`
Expected: PASS

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: mention Chinese tag translations"
```

---

### Execution Notes

- Keep `description` separate from `translation`; do not merge them.
- Do not change Preview formatter inputs or output text.
- Prefer compact translation text in small components to avoid layout regression.
- If a UI assertion becomes brittle due to richer button content, use `within()` plus visible text checks instead of exact accessible-name matching.
