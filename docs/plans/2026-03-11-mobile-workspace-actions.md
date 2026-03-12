# Mobile Workspace Actions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a mobile-only bottom sheet for workspace tag actions so users can adjust weight and move tags between positive and negative sections on touch devices.

**Architecture:** Keep the existing workspace store and desktop hover behavior intact. Add a small mobile interaction layer in the workspace UI that tracks the active tag and renders a bottom action sheet with context-aware actions for positive and negative tags.

**Tech Stack:** React 19, TypeScript, Zustand, Vitest, Testing Library

---

### Task 1: Add Failing Tests for Mobile Workspace Actions

**Files:**
- Create: `src/components/Workspace/Workspace.test.tsx`
- Modify: `src/components/Workspace/Workspace.tsx`
- Modify: `src/components/Workspace/WorkspaceTag.tsx`

**Step 1: Write the failing test**

Add tests that require:
- tapping a positive workspace tag on mobile opens an action sheet
- tapping `+0.1` updates displayed weight
- tapping `Move to Negative` moves the tag to the negative section
- tapping a negative tag shows `Move to Positive`

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Workspace/Workspace.test.tsx`
Expected: FAIL because the current controls are hidden behind desktop hover.

**Step 3: Write minimal implementation**

Add mobile tap handling and a bottom action sheet without changing store behavior.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/Workspace/Workspace.test.tsx`
Expected: PASS

### Task 2: Refine Mobile Sheet UI

**Files:**
- Modify: `src/components/Workspace/Workspace.tsx`
- Modify: `src/components/Workspace/WorkspaceTag.tsx`
- Optionally create: `src/components/Workspace/MobileTagActionSheet.tsx`

**Step 1: Write the failing test**

Add assertions for:
- the action sheet closes after an action
- desktop hover controls still exist in desktop rendering
- negative tags do not expose weight buttons in the mobile sheet

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/Workspace/Workspace.test.tsx`
Expected: FAIL until the mobile sheet behavior is completed.

**Step 3: Write minimal implementation**

Polish the sheet layout, labels, and close behavior while keeping the implementation small.

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/Workspace/Workspace.test.tsx`
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
