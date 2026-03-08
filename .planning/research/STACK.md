# Technology Stack Additions for UI/UX Polish

**Project:** nekoPrompt (AI image prompt tag manager)
**Researched:** 2026-03-08
**Scope:** UI polish, animation, transitions, drag-and-drop for existing React 19 + TailwindCSS 4 SPA

## Current Stack (Do Not Change)

| Technology | Version | Role |
|------------|---------|------|
| React | ^19.2.4 | UI framework |
| React DOM | ^19.2.4 | DOM binding |
| Zustand | ^5.0.11 | State management |
| TailwindCSS | ^4.2.1 | Styling |
| Vite | ^7.3.1 | Build tool |
| TypeScript | ^5.9.3 | Type safety |

Production dependencies: exactly 3. The project explicitly prefers "no new deps" where possible.

---

## Recommended Additions

### Tier 1: Zero-Dependency (CSS-Only) -- USE FIRST

These require no npm packages. Use TailwindCSS 4's built-in capabilities before reaching for libraries.

#### TailwindCSS 4 Built-in Transitions & Animations

| Utility | Purpose | Example |
|---------|---------|---------|
| `transition` | Smooth hover/focus state changes | Tag hover glow, button press |
| `transition-colors` | Color property transitions | Category tab switching |
| `duration-200` / `duration-300` | Transition timing | Snappy (200ms) vs smooth (300ms) |
| `ease-in-out` | Timing function | Natural-feeling transitions |
| `animate-pulse` | Skeleton/loading state | Empty workspace placeholder |
| `animate-spin` | Loading indicator | Copy confirmation spinner |
| Custom `@theme` keyframes | Project-specific animations | Tag enter/exit, panel slide |

**Confidence:** HIGH -- verified in TailwindCSS 4 official docs

**Why this first:** Zero cost. Already installed. TailwindCSS 4's `@theme` block lets you define custom animations in pure CSS without plugins:

```css
@import "tailwindcss";

@theme {
  --animate-fade-in: fade-in 200ms ease-out;
  --animate-slide-up: slide-up 250ms ease-out;
  --animate-tag-pop: tag-pop 150ms ease-out;

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes tag-pop {
    0% { transform: scale(0.8); opacity: 0; }
    70% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
}
```

Then use as `animate-fade-in`, `animate-slide-up`, `animate-tag-pop` in JSX.

#### CSS `@starting-style` for Entry Animations

| Feature | Browser Support | Safe to Use? |
|---------|-----------------|-------------|
| `@starting-style` | ~88% (Chrome 117+, Firefox 129+, Safari 17.4+) | Yes, progressive enhancement |
| `transition-behavior: allow-discrete` | ~85% | Yes, degrades gracefully |

**Confidence:** HIGH -- Baseline Newly Available since Aug 2024

**Why:** Enables `display: none` to visible transitions in pure CSS. Perfect for modal/popover entry animations. Unsupported browsers simply skip the animation -- element still appears instantly.

#### Native HTML `draggable` + CSS Transitions

For simple tag reordering within positive/negative prompt areas, native `draggable` attribute with `onDragStart`/`onDragOver`/`onDrop` handlers plus CSS `transform` transitions provides a zero-dependency drag-and-drop experience.

**Confidence:** HIGH -- native browser API, well-documented

**Limitation:** No built-in accessibility (keyboard reorder), no touch device drag preview customization. Acceptable for a v1 polish pass; upgrade to a library only if users need those features.

---

### Tier 2: Minimal Dependencies (Add Only If CSS Alone Falls Short)

#### tw-animate-css ^1.4.0

| Attribute | Value |
|-----------|-------|
| Package | `tw-animate-css` |
| Version | ^1.4.0 (latest stable) |
| Type | devDependency (CSS import only) |
| Size | ~5KB CSS, zero JS runtime |
| Purpose | Enter/exit animation utilities for TailwindCSS 4 |
| Confidence | HIGH |

**Why:** TailwindCSS 4 native replacement for `tailwindcss-animate`. Adopted by shadcn/ui as the default. Pure CSS -- no JS runtime cost. Provides `animate-in`, `animate-out`, `fade-in`, `slide-in-from-*`, `zoom-in` etc. as Tailwind utility classes.

**When to add:** If custom `@theme` keyframes feel repetitive for enter/exit patterns. This library is a convenience wrapper, not a necessity.

**Installation:**
```bash
npm install -D tw-animate-css
```

**Usage in `src/index.css`:**
```css
@import "tailwindcss";
@import "tw-animate-css";
```

**Why not `tailwindcss-animate`:** Deprecated for TailwindCSS 4. Uses legacy JS plugin system. `tw-animate-css` is the CSS-first replacement.

---

### Tier 3: Libraries (Add Only When Native Solutions Are Insufficient)

#### Motion for React (formerly Framer Motion) ^12.35.x

| Attribute | Value |
|-----------|-------|
| Package | `motion` |
| Version | ^12.35.x (latest, React 19 compatible) |
| Type | production dependency |
| Min Size | ~4.6KB (using `m` + `LazyMotion`) |
| Full Size | ~34KB |
| Purpose | Gesture-driven animations, layout transitions, drag reorder |
| Confidence | HIGH |

**Why (if needed):** The only library that handles animated layout transitions (tag reorder with smooth position animation), gesture-aware drag-and-drop, spring physics, and `AnimatePresence` for exit animations -- all in one package. React 19 fully supported since v11+. Hybrid engine uses Web Animations API for 120fps GPU-accelerated performance with JS fallback for springs.

**When to add:** Only if you need:
- Animated list reordering (`Reorder` component) where tags smoothly glide into new positions
- Spring-physics-based drag with momentum
- Complex choreographed enter/exit sequences
- Scroll-linked animations

**When NOT to add:** For simple hover transitions, fade-ins, slide-ins. CSS handles those fine.

**Bundle size strategy:** Use `m` + `LazyMotion` to keep initial load at ~4.6KB instead of ~34KB.

**Installation:**
```bash
npm install motion
```

---

## What NOT to Use

| Library | Why Not |
|---------|---------|
| `framer-motion` | Deprecated package name. Use `motion` instead. |
| `tailwindcss-animate` | Deprecated for TailwindCSS 4. Use `tw-animate-css` or native `@theme`. |
| `react-beautiful-dnd` | Archived and deprecated by Atlassian. |
| `@dnd-kit/core` (v6) | Last updated 1+ year ago, React 19 compatibility issues. |
| `@dnd-kit/react` (v0.3.x) | Still v0.x, unstable API, maintenance concerns. |
| `pragmatic-drag-and-drop` | Overkill for tag reordering. Its strength is cross-window/file drops -- irrelevant here. |
| `react-spring` | Motion for React covers same use cases with better DX and wider adoption (30M+ monthly downloads). |
| `gsap` | Imperative API, commercial license complexity, not React-idiomatic. |
| `Floating UI` | Only needed for tooltip/popover positioning. Use native CSS `popover` attribute or manual absolute positioning instead -- this project's tooltips are simple enough. |
| `Radix UI` / `Headless UI` | Component libraries are overkill. This project has custom UI already. Adding a component library mid-project creates style conflicts and learning overhead. |
| `shadcn/ui` | Copy-paste component library. Brings in Radix, adds complexity. Not appropriate for polishing an existing custom UI. |

---

## React 19 Experimental: View Transitions API

| Attribute | Value |
|-----------|-------|
| Status | `react@experimental` / `react@canary` |
| API | `<ViewTransition>` component |
| Browser Support | Chrome 111+, Firefox 133+, Safari 18+ |
| Confidence | LOW -- experimental, API may change |

**Assessment:** React's `<ViewTransition>` wraps the browser's `startViewTransition()` API declaratively. Provides automatic enter/exit/update/shared-element transitions. However, it is experimental and not in React 19 stable. Do NOT depend on this for production. Monitor for React 20 inclusion.

**For now:** Use CSS transitions + optional `tw-animate-css` / Motion. When `<ViewTransition>` ships in stable React, it could replace Motion for many animation needs.

---

## Decision Matrix: What to Reach For

| Need | Solution | Dependency? |
|------|----------|-------------|
| Button hover/press feedback | TailwindCSS `transition` + `active:scale-95` | No |
| Tag appear animation | `@theme` keyframes (`animate-tag-pop`) | No |
| Panel slide in/out | `@theme` keyframes or `tw-animate-css` | Optional |
| Tag list reorder (basic) | Native `draggable` + CSS `transform` transition | No |
| Tag list reorder (smooth, animated) | Motion `<Reorder>` component | Yes (`motion`) |
| Modal/dialog entry | CSS `@starting-style` | No |
| Copy-to-clipboard feedback | TailwindCSS `animate-pulse` or custom keyframe | No |
| Skeleton loading states | TailwindCSS `animate-pulse` | No |
| Reduced motion support | TailwindCSS `motion-reduce:` variant | No |

---

## Installation Summary

### Minimal (recommended starting point)
```bash
# No new packages. Use TailwindCSS 4 built-in features only.
# Add custom @theme keyframes in src/index.css
```

### If enter/exit patterns get repetitive
```bash
npm install -D tw-animate-css
```

### If animated drag reorder is needed
```bash
npm install motion
```

---

## Sources

- [TailwindCSS 4 Animation Docs](https://tailwindcss.com/docs/animation) -- HIGH confidence
- [TailwindCSS 4 Transition Docs](https://tailwindcss.com/docs/transition-property) -- HIGH confidence
- [tw-animate-css GitHub](https://github.com/Wombosvideo/tw-animate-css) -- HIGH confidence
- [Motion for React Official](https://motion.dev/docs/react) -- HIGH confidence
- [Motion Bundle Size Guide](https://motion.dev/docs/react-reduce-bundle-size) -- HIGH confidence
- [Motion npm](https://www.npmjs.com/package/motion) -- version 12.35.x confirmed
- [CSS @starting-style MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) -- HIGH confidence
- [View Transitions in React Labs](https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more) -- HIGH confidence (experimental status)
- [dnd-kit Maintenance Concerns](https://github.com/clauderic/dnd-kit/issues/1194) -- MEDIUM confidence
- [Pragmatic DnD by Atlassian](https://github.com/atlassian/pragmatic-drag-and-drop) -- HIGH confidence
- [react-beautiful-dnd Deprecated](https://github.com/atlassian/react-beautiful-dnd) -- HIGH confidence
