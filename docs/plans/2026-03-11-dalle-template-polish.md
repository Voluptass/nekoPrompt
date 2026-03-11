# DALL·E Template Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Turn DALL·E preview output into category-aware English natural-language prompts while keeping SD formatting unchanged.

**Architecture:** Extend the formatter utility with separate DALL·E positive and negative builders. Reuse the existing tag category metadata to group phrases into sentence segments, then wire `Preview` to call the appropriate formatter based on the active mode.

**Tech Stack:** React 19, TypeScript, Vitest

---

### Task 1: Lock the Desired DALL·E Output with Tests

**Files:**
- Modify: `src/utils/__tests__/formatPrompt.test.ts`
- Modify: `src/utils/formatPrompt.ts`

**Step 1: Write the failing test**

Add tests that require:
- DALL·E positive output to start as a full sentence
- DALL·E output to avoid SD weight syntax
- DALL·E negative output to use an `Avoid ...` sentence

**Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/__tests__/formatPrompt.test.ts`
Expected: FAIL because the current implementation still returns comma-joined tags.

**Step 3: Write minimal implementation**

Add natural-language DALL·E formatter helpers without changing `formatSD`.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/utils/__tests__/formatPrompt.test.ts`
Expected: PASS

### Task 2: Wire Preview to the New DALL·E Formatters

**Files:**
- Modify: `src/components/Preview/Preview.tsx`

**Step 1: Write the failing test**

Reuse formatter coverage to ensure the preview wiring can distinguish positive and negative DALL·E phrasing.

**Step 2: Run test to verify it fails**

Run: `npm test -- src/utils/__tests__/formatPrompt.test.ts`
Expected: FAIL until the preview uses separate positive/negative DALL·E builders.

**Step 3: Write minimal implementation**

Update the preview to use DALL·E positive wording for the main prompt and DALL·E negative wording for the negative prompt.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/utils/__tests__/formatPrompt.test.ts`
Expected: PASS

### Task 3: Final Verification

**Files:**
- Verify only

**Step 1: Run full suite**

Run: `npm test`
Expected: PASS

**Step 2: Run production build**

Run: `npm run build`
Expected: PASS
