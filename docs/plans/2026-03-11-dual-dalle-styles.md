# Dual DALL·E Styles Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add two distinct DALL·E prompt styles, Illustration and Photo, while preserving the existing SD formatter.

**Architecture:** Extend the formatter layer to accept a DALL·E style variant and generate positive and negative text from shared category-aware tag grouping. Update the preview UI to manage both the top-level output format and the DALL·E sub-style, then cover the behavior with focused formatter and preview tests.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library

---

### Task 1: Lock the Two DALL·E Styles with Failing Formatter Tests

**Files:**
- Modify: `src/utils/__tests__/formatPrompt.test.ts`
- Modify: `src/utils/formatPrompt.ts`

**Step 1: Write the failing test**

Add tests that require:
- Illustration style to produce illustration-brief wording
- Photo style to produce photography wording
- The two styles to differ for the same selected tags
- Negative text to differ between illustration and photo styles

**Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/__tests__/formatPrompt.test.ts`
Expected: FAIL because the current formatter only has one DALL·E style.

**Step 3: Write minimal implementation**

Add a DALL·E style variant and style-specific positive/negative builders without changing `formatSD`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/utils/__tests__/formatPrompt.test.ts`
Expected: PASS

### Task 2: Add the DALL·E Style Toggle to Preview

**Files:**
- Modify: `src/components/Preview/Preview.tsx`
- Test: `src/App.test.tsx` or a new preview-focused test if needed

**Step 1: Write the failing test**

Add a test that requires:
- the Illustration / Photo sub-toggle appears only in DALL·E mode
- switching sub-styles changes preview text

**Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the preview currently exposes only SD and DALL·E.

**Step 3: Write minimal implementation**

Add DALL·E sub-style state and render the style-specific formatter output.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

### Task 3: Full Verification

**Files:**
- Verify only

**Step 1: Run full suite**

Run: `npm test`
Expected: PASS

**Step 2: Run production build**

Run: `npm run build`
Expected: PASS
