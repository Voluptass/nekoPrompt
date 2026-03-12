# Default Tags Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the default built-in tag library with a curated set of common SD tags while keeping current UI behavior and persistence unchanged.

**Architecture:** The change stays data-driven. `src/data/tags.ts` remains the single built-in source, existing consumers continue to read from it, and tests validate that the expanded dataset contains representative common tags without breaking category integrity.

**Tech Stack:** React 19, TypeScript, Vite, Vitest

**Spec:** `docs/plans/2026-03-12-default-tags-design.md`

---

### Task 1: Add a regression test for representative common tags

**Files:**
- Modify: `src/data/__tests__/data.test.ts`

**Step 1: Write the failing test**

Add a test that asserts several new common tags exist in `builtinTags` and still point to valid existing categories.

```typescript
it('includes representative common SD tags in the built-in library', () => {
  const expected = [
    ['2girls', 'character'],
    ['silver hair', 'appearance'],
    ['hair ornament', 'appearance'],
    ['jacket', 'clothing'],
    ['happy', 'expression'],
    ['street', 'scene'],
    ['detailed eyes', 'style'],
    ['volumetric lighting', 'lighting'],
    ['cowboy shot', 'composition'],
    ['extra fingers', 'negative'],
  ] as const

  for (const [text, category] of expected) {
    expect(builtinTags).toContainEqual(
      expect.objectContaining({ text, category })
    )
  }
})
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/__tests__/data.test.ts`
Expected: FAIL because at least several representative tags do not exist yet.

### Task 2: Expand the built-in tag dataset

**Files:**
- Modify: `src/data/tags.ts`

**Step 1: Add the new curated tags**

Expand the existing category blocks with a practical set of common SD tags. Keep ids unique and categories unchanged.

Representative additions:

- `character`: `2girls`, `2boys`, `girl`, `boy`
- `appearance`: `brown hair`, `pink hair`, `silver hair`, `yellow eyes`, `hair ornament`, `hair ribbon`, `animal ears`, `fang`
- `clothing`: `jacket`, `coat`, `shirt`, `gloves`, `boots`, `thighhighs`, `ribbon`, `cape`
- `expression`: `happy`, `laughing`, `wink`, `running`, `peace sign`, `hand on hip`
- `scene`: `street`, `park`, `sky`, `clouds`, `cherry blossoms`, `library`, `bedroom`, `rain`
- `style`: `detailed eyes`, `cel shading`, `lineart`, `official art`, `vibrant colors`
- `lighting`: `volumetric lighting`, `cinematic lighting`, `glowing`, `sunlight`, `moonlight`
- `composition`: `cowboy shot`, `wide shot`, `dynamic angle`, `dutch angle`, `side profile`
- `negative`: `extra fingers`, `extra limbs`, `bad anatomy`, `bad proportions`, `poorly drawn hands`, `jpeg artifacts`

**Step 2: Run test to verify it passes**

Run: `npx vitest run src/data/__tests__/data.test.ts`
Expected: PASS with all built-in data tests green.

### Task 3: Update documentation to match the real built-in count

**Files:**
- Modify: `README.md`

**Step 1: Recount the built-in tags from source**

Run a source-based count, then update the feature summary line in `README.md` so it reflects the actual expanded total.

Suggested count command:

```bash
rg -n "^\s*\{ id:" "src/data/tags.ts" | Measure-Object | Select-Object -ExpandProperty Count
```

**Step 2: Update the README feature bullet**

Change the built-in tag count and keep the category list unchanged.

### Task 4: Final verification

**Files:**
- Verify: `src/data/__tests__/data.test.ts`
- Verify: `src/data/tags.ts`
- Verify: `README.md`

**Step 1: Run the focused test suite**

Run: `npx vitest run src/data/__tests__/data.test.ts`
Expected: PASS

**Step 2: Optionally run the full test suite if the focused test passes cleanly**

Run: `npx vitest run`
Expected: PASS

**Step 3: Confirm README count matches source**

Run the source count command again and verify the number matches the README text.
