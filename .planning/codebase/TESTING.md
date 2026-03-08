# Testing Patterns

**Analysis Date:** 2026-03-08

## Test Framework

**Runner:**
- Vitest 4.x
- Config: `vite.config.ts` (test config embedded, not a separate vitest config file)
- Requires `/// <reference types="vitest/config" />` at top of `vite.config.ts`

**Environment:**
- jsdom (configured in `vite.config.ts` under `test.environment`)
- Globals enabled (`test.globals: true`) -- `describe`, `it`, `expect` available without import, though all test files explicitly import them from `vitest`

**Assertion Library:**
- Vitest built-in `expect`
- `@testing-library/jest-dom` matchers extended via setup file

**Setup File:**
- `src/test/setup.ts` -- imports `@testing-library/jest-dom/vitest` for DOM matchers

**Run Commands:**
```bash
npm test              # Run all tests (vitest run)
npm run test:watch    # Watch mode (vitest)
```

## Test File Organization

**Location:**
- Co-located `__tests__/` directories next to the source files they test
- Pattern: `src/{module}/__tests__/{name}.test.ts`

**Naming:**
- Test files: `{sourceFileName}.test.ts` (not `.spec.ts`)
- Pure logic tests use `.test.ts` (not `.test.tsx`) -- no component rendering tests exist

**Structure:**
```
src/
  data/
    __tests__/
      data.test.ts          # Tests for builtin data integrity
  hooks/
    __tests__/
      useLocalStorage.test.ts  # Tests for localStorage helpers
      useTagSearch.test.ts     # Tests for filterTags utility
  stores/
    __tests__/
      usePromptStore.test.ts   # Tests for Zustand store actions
  utils/
    __tests__/
      formatPrompt.test.ts     # Tests for SD/DALL-E formatters
      importExport.test.ts     # Tests for import/export/validation
```

**Coverage:**
- 6 test files, 27 tests total
- All tests pass
- No component rendering tests (no `@testing-library/react` usage in tests despite being installed)

## Test Structure

**Suite Organization:**
```typescript
// Standard pattern: import from vitest, import module under test
import { describe, it, expect } from 'vitest'
import { functionUnderTest } from '../moduleUnderTest'

describe('functionUnderTest', () => {
  it('describes expected behavior', () => {
    const result = functionUnderTest(input)
    expect(result).toBe(expected)
  })
})
```

**Nested Describes for Grouping (store tests):**
```typescript
// From src/stores/__tests__/usePromptStore.test.ts
describe('usePromptStore', () => {
  beforeEach(() => {
    usePromptStore.getState().reset()
  })

  describe('tag selection', () => {
    it('adds a tag to selected', () => { /* ... */ })
    it('removes a tag from selected', () => { /* ... */ })
    it('does not add duplicate tags', () => { /* ... */ })
  })

  describe('negative tags', () => {
    it('adds a tag to negative', () => { /* ... */ })
    it('moves tag from selected to negative', () => { /* ... */ })
  })

  describe('weight', () => {
    it('sets weight on a selected tag', () => { /* ... */ })
    it('clamps weight between 0.1 and 2.0', () => { /* ... */ })
  })
})
```

**Patterns:**
- `beforeEach` for state reset (store tests, localStorage tests)
- No `afterEach` or `afterAll` used
- No async tests (all tests are synchronous)
- Test names use plain English descriptions starting with a verb: "adds a tag", "returns all when query is empty", "rejects invalid JSON"

## Mocking

**Framework:** No mocking framework used. Tests operate on real implementations.

**Patterns:**
- Zustand store tested directly via `getState()` and action calls -- no React rendering needed:
```typescript
// From src/stores/__tests__/usePromptStore.test.ts
usePromptStore.getState().addTag('masterpiece')
expect(usePromptStore.getState().selectedTags).toEqual([{ tagId: 'masterpiece' }])
```

- Inline lookup functions as lightweight test doubles:
```typescript
// From src/utils/__tests__/formatPrompt.test.ts
const mockTags: Tag[] = [
  { id: 'masterpiece', text: 'masterpiece', category: 'quality' },
  { id: '1girl', text: '1girl', category: 'character' },
]
const findTag = (id: string) => mockTags.find((t) => t.id === id)!
```

- jsdom provides `localStorage` automatically -- no mock needed:
```typescript
// From src/hooks/__tests__/useLocalStorage.test.ts
beforeEach(() => {
  localStorage.clear()
})
```

**What to Mock:**
- Nothing is mocked currently. The codebase avoids external dependencies, so real implementations are tested directly.
- `localStorage` is provided by jsdom environment.

**What NOT to Mock:**
- Zustand stores -- test via `getState()` / `setState()` pattern instead of rendering components
- Pure utility functions -- test with real inputs/outputs

## Fixtures and Factories

**Test Data:**
- Inline fixture objects defined as `const` at the top of test files:
```typescript
// From src/utils/__tests__/importExport.test.ts
const validData: UserData = {
  version: 1,
  customTags: [],
  customCategories: [],
  hiddenBuiltinTags: [],
  presets: [],
  settings: { defaultPlatform: 'sd' },
}
```

```typescript
// From src/hooks/__tests__/useTagSearch.test.ts
const tags: Tag[] = [
  { id: '1', text: '1girl', category: 'c', aliases: ['one girl'] },
  { id: '2', text: 'blue eyes', category: 'c' },
]
```

**Location:**
- No shared fixtures directory. All test data is defined inline within each test file.
- No factory functions or builders.

## Coverage

**Requirements:** None enforced. No coverage thresholds configured.

**View Coverage:**
```bash
npx vitest run --coverage    # Requires @vitest/coverage-v8 or similar (not installed)
```

## Test Types

**Unit Tests:**
- All 27 tests are unit tests
- Test pure functions (`formatSD`, `formatDallE`, `filterTags`, `exportUserData`, `validateImport`)
- Test Zustand store logic (add/remove/toggle tags, weights, presets)
- Test data integrity (unique IDs, valid category references, ordering)
- Test localStorage persistence helpers

**Integration Tests:**
- None

**E2E Tests:**
- Not used. No Playwright or Cypress configured.

**Component Rendering Tests:**
- Not used. `@testing-library/react` and `@testing-library/user-event` are installed as devDependencies but not used in any test files.

## Common Patterns

**Testing Store Actions (Zustand without React):**
```typescript
// Reset state before each test
beforeEach(() => {
  usePromptStore.getState().reset()
})

// Call actions directly, assert state
it('adds a tag to selected', () => {
  usePromptStore.getState().addTag('masterpiece')
  expect(usePromptStore.getState().selectedTags).toEqual([
    { tagId: 'masterpiece' },
  ])
})
```

**Testing Pure Functions:**
```typescript
// Define minimal input data, call function, assert output
it('joins tags with commas', () => {
  const selected: SelectedTag[] = [{ tagId: 'masterpiece' }, { tagId: '1girl' }]
  expect(formatSD(selected, findTag)).toBe('masterpiece, 1girl')
})
```

**Testing Validation/Error Paths:**
```typescript
// Test both success and failure paths of validation
it('validates correct import data', () => {
  const json = JSON.stringify(validData)
  expect(validateImport(json).success).toBe(true)
})

it('rejects invalid JSON', () => {
  expect(validateImport('not json').success).toBe(false)
})
```

**Testing Data Integrity:**
```typescript
// Validate static data arrays for uniqueness and referential integrity
it('has tags with unique ids', () => {
  const ids = builtinTags.map((t) => t.id)
  expect(new Set(ids).size).toBe(ids.length)
})

it('every tag references a valid category', () => {
  const categoryIds = new Set(builtinCategories.map((c) => c.id))
  for (const tag of builtinTags) {
    expect(categoryIds.has(tag.category)).toBe(true)
  }
})
```

## Adding New Tests

**New utility function:**
1. Create `src/utils/__tests__/{functionName}.test.ts`
2. Import from vitest: `import { describe, it, expect } from 'vitest'`
3. Import the function under test
4. Define inline test data
5. Use `describe`/`it`/`expect` pattern

**New store action:**
1. Add tests to `src/stores/__tests__/usePromptStore.test.ts`
2. Use `beforeEach` with `reset()` to isolate state
3. Call actions via `usePromptStore.getState().actionName()`
4. Assert via `usePromptStore.getState().propertyName`

**New hook/data module:**
1. Create `src/{module}/__tests__/{name}.test.ts`
2. Follow existing inline fixture pattern
3. Test the exported pure function, not the React hook wrapper

---

*Testing analysis: 2026-03-08*
