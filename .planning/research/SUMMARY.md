# Research Summary: nekoPrompt UI/UX Polish

**Domain:** UI/UX refinement for AI image prompt tag manager SPA
**Researched:** 2026-03-08
**Overall confidence:** HIGH

## Executive Summary

The nekoPrompt project has a deliberately minimal dependency footprint (3 production deps) and the project constraints prefer avoiding new npm packages. This research confirms that the 2025-2026 React + TailwindCSS 4 ecosystem strongly supports a CSS-first approach to UI polish, making heavy animation libraries unnecessary for the majority of this project's needs.

TailwindCSS 4's `@theme` block provides a native way to define custom keyframe animations in CSS without plugins. The built-in transition utilities (`transition`, `duration-*`, `ease-*`) plus animation utilities (`animate-*`) cover hover feedback, tag enter animations, panel transitions, and loading states. The CSS `@starting-style` at-rule (Baseline since Aug 2024, ~88% support) enables display:none-to-visible entry transitions in pure CSS, eliminating the need for JavaScript animation libraries for modal/popover entrances.

For enter/exit animation patterns that would become repetitive to hand-write, `tw-animate-css` (v1.4.0) is the TailwindCSS 4 native replacement for the deprecated `tailwindcss-animate`. It is a devDependency -- pure CSS, zero runtime cost -- and is adopted by shadcn/ui as the default. This is the only recommended addition for the polish pass.

Competitive analysis of 10+ AI prompt tag manager tools (tags.novelai.dev, Autocue, sd-webui-prompt-all-in-one, sd-webui-better-prompt, Prompt Visualizer, MikuTools, and others) reveals that nekoPrompt's core features are complete, but several table-stakes UX patterns are missing. The most critical gap is negative tag auto-routing: every competing tool routes negative-category tags directly to the negative prompt area, but nekoPrompt requires a right-click (undiscoverable). Secondary gaps include lack of category collapse/expand, incomplete Chinese localization, and no visible button to move tags between positive/negative areas.

The competitive landscape also shows clear differentiators worth pursuing: drag-and-drop tag reorder (supported by sd-webui-better-prompt, wolfchen.top, sd-webui-prompt-all-in-one), one-click negative preset (analogous to SD's popular EasyNegative embedding), and Chinese-language tag search. These features are achievable without new dependencies.

## Key Findings

**Stack:** Start with zero new dependencies. TailwindCSS 4 built-in features handle 80%+ of UI polish needs. Add `tw-animate-css` (devDep only) if enter/exit patterns get repetitive. Reserve `motion` for animated drag reorder only.

**Features:** Five table-stakes gaps need closing: (1) negative tag auto-routing, (2) full Chinese UI, (3) category collapse/expand, (4) visible move-to-negative button, (5) tag Chinese descriptions. Three high-value differentiators: drag reorder, one-click negative preset, negative tag visual distinction in library.

**Architecture:** No architectural changes needed for UI polish. Custom animations defined in `@theme` block in `src/index.css`. Timing constants centralized as CSS custom properties.

**Critical pitfall:** Performance death by animation -- applying transitions to 50-100+ tag elements in lists causes jank. Use GPU-composited properties only (`transform`, `opacity`), never `transition: all`.

## Implications for Roadmap

Based on research, suggested phase structure for UI polish:

1. **Interaction fixes first** - Fix negative tag auto-categorization, add visible move button, negative tag visual distinction
   - Addresses: Core interaction bugs and the #1 UX complaint
   - Avoids: Pitfall of polishing broken behavior

2. **Chinese localization + tag descriptions** - Replace all user-facing English strings, populate Chinese descriptions in tag data
   - Addresses: Table stakes for target users (Chinese AI art community)
   - Avoids: Having to re-test visual polish after text changes

3. **UI structure improvements** - Category collapse/expand, one-click negative preset, tag count badges
   - Addresses: Sidebar usability at scale, workflow efficiency
   - Avoids: Building on incomplete structural foundation

4. **CSS foundation + element polish** - Define animation timing scale and `@theme` keyframes, hover states, focus rings, tag animations, transitions
   - Addresses: Consistent animation language, table stakes visual feedback
   - Avoids: Performance pitfall via GPU-composited-only rule

5. **Advanced interactions** (optional) - Drag reorder, micro-animations, smooth transitions
   - Addresses: Differentiator features
   - Avoids: Over-engineering DnD by starting with native HTML5 Drag API

**Phase ordering rationale:**
- Interaction logic must be correct before adding polish (wrong behavior + animation = polished confusion)
- Localization before visual polish so polish work doesn't need text change re-testing
- UI structure changes before animation so animated elements don't need restructuring
- CSS foundation before element polish so all elements use consistent timing
- Advanced interactions last because they may require the only new dependency (Motion)

**Research flags for phases:**
- Phase 1 (interaction fixes): Does not need additional research -- store changes are straightforward
- Phase 2 (Chinese localization): No research needed -- string replacement and data enrichment
- Phase 3 (UI structure): Category collapse is standard accordion pattern, no research needed
- Phase 5 (drag reorder): May need research if Motion library is added -- investigate `LazyMotion` + `Reorder` component API

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack (CSS-first approach) | HIGH | TailwindCSS 4 docs verified, well-established patterns |
| Stack (tw-animate-css) | HIGH | npm verified v1.4.0, adopted by shadcn/ui |
| Stack (Motion library) | HIGH | npm verified v12.35.x, React 19 compatible since v11+ |
| Features (table stakes gaps) | HIGH | Verified against 10+ competing tools, consistent patterns |
| Features (differentiators) | HIGH | Multiple tools implement these; proven value |
| Features (anti-features) | HIGH | Clear scope boundaries from PROJECT.md + competitive analysis |
| Architecture | HIGH | No structural changes needed |
| Pitfalls | HIGH | Standard web UX patterns, well-documented gotchas |

## Gaps to Address

- Exact browser support for target user base (Chinese AI art community) -- if primarily desktop Chrome, @starting-style support is 100%
- Touch device support requirements -- if mobile is important, native `draggable` has limitations
- Performance benchmarking with actual tag counts -- research recommends testing with 100+ tags
- Tag data enrichment: Chinese descriptions need to be written for all 97 tags -- this is content work, not research

## Sources

### Stack/Architecture
- [TailwindCSS 4 Animation Docs](https://tailwindcss.com/docs/animation)
- [TailwindCSS 4 Transition Docs](https://tailwindcss.com/docs/transition-property)
- [tw-animate-css GitHub](https://github.com/Wombosvideo/tw-animate-css)
- [tw-animate-css npm](https://www.npmjs.com/package/tw-animate-css)
- [Motion for React Official](https://motion.dev/docs/react)
- [Motion Bundle Size Guide](https://motion.dev/docs/react-reduce-bundle-size)
- [CSS @starting-style MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@starting-style)

### Competitive Feature Analysis
- [tags.novelai.dev (GIGAZINE)](https://gigazine.net/gsc_news/en/20221111-tags-novelai-dev/)
- [Autocue (GitHub)](https://github.com/tinygeeker/autocue)
- [sd-webui-prompt-all-in-one (GitHub)](https://github.com/Physton/sd-webui-prompt-all-in-one)
- [sd-webui-better-prompt (GitHub)](https://github.com/eideehi/sd-webui-better-prompt)
- [NovelAI Image Basics](https://docs.novelai.net/en/image/basics/)
- [Prompt Generator Pro (Civitai)](https://civitai.com/articles/23638/prompt-generator-pro-advanced-tool-for-stable-diffusion-and-more)
- [MikuTools NovelAI Tag Selector](https://tools.miku.ac/novelai_tag/)
- [a1111-sd-webui-tagcomplete (GitHub)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)
