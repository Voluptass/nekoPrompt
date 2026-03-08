---
phase: 1
slug: interaction-fix
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.0.18 |
| **Config file** | vite.config.ts (test section) |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | INTR-01 | unit | `npx vitest run src/stores/__tests__/usePromptStore.test.ts -t "negative category"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | INTR-02 | unit | `npx vitest run src/stores/__tests__/usePromptStore.test.ts -t "atomic move"` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | INTR-03 | manual-only | Visual inspection in browser | N/A | ⬜ pending |
| 01-01-04 | 01 | 1 | INTR-04 | unit | `npx vitest run src/stores/__tests__/usePromptStore.test.ts -t "migration"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/stores/__tests__/usePromptStore.test.ts` — add tests for: toggleNegativeTag behavior, atomic moveToNegative/moveToPositive, persist migration v0->v1
- [ ] Delete `src/hooks/__tests__/useLocalStorage.test.ts` (dead code removal)
- [ ] Delete `src/hooks/useLocalStorage.ts` (dead code)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Negative tags visually distinct in tag library | INTR-03 | CSS color/styling is visual, not testable by unit tests | Open app, navigate to tag library, verify "负面常用" category tags display with red color scheme distinct from positive tags |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
