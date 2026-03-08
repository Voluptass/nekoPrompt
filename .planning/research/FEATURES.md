# Feature Landscape

**Domain:** AI Image Prompt Tag Manager -- UI/UX Polish & Feature Enhancement
**Researched:** 2026-03-08
**Overall confidence:** HIGH (based on analysis of 10+ competing tools and extensions)

## Competitive Landscape Surveyed

Tools analyzed for feature patterns:
- **tags.novelai.dev** -- Danbooru tag picker with categories, click-to-add, weight adjustment
- **Autocue (tinygeeker/autocue)** -- Chinese AI painting tag prompt builder, Vue-based, category browsing
- **sd-webui-prompt-all-in-one (Physton)** -- SD WebUI extension: drag-sort, weight GUI, translation, history, bookmarks
- **sd-webui-better-prompt (eideehi)** -- SD WebUI extension: drag-drop reorder, weight popup, tag suggestions
- **Prompt Visualizer (Chrome ext)** -- Chip-based tag input, Danbooru autocomplete, token counting, presets
- **Prompt Generator Pro (Civitai)** -- Drag-drop workspace, weight mastery, dedup, professional mode
- **NovelAI native** -- Tag suggestions, emphasis brackets, token/context limit bar
- **MikuTools NovelAI Tag Selector** -- Chinese/English bilingual tag picker
- **wolfchen.top NovelAI Tag Generator** -- Drag reorder, weight editing, quick delete
- **A.Tools SD Prompt Generator** -- Drag-sort tags, bracket weight, category selection

---

## Table Stakes

Features users expect. Missing any and the product feels unfinished compared to alternatives.

### Functional Table Stakes (Feature Gaps)

| # | Feature | Why Expected | Complexity | nekoPrompt Status |
|---|---------|--------------|------------|-------------------|
| 1 | **Negative tag auto-routing** | Tags in a "negative common" category (lowres, bad hands, watermark) should auto-route to the negative prompt area on click. Every competing tool does this. Right-click is not discoverable. This is THE #1 UX bug. | Low | MISSING |
| 2 | **Full Chinese UI** | For a Chinese-targeted tool, ALL labels, placeholders, hints, and button text must be in Chinese. English remnants feel unfinished. MikuTools, Autocue, and every Chinese-market tool does this. | Low | MISSING (mixed English/Chinese) |
| 3 | **Category collapse/expand** | Tag libraries get large. Users must be able to collapse categories they don't need. Standard in tags.novelai.dev, Autocue, MikuTools, and every sidebar-based tag browser. | Low | MISSING |
| 4 | **Tag Chinese description on hover** | Chinese users need to understand what English tags mean. MikuTools shows "masterpiece (大师作品)". The Tag type already has a `description` field but it's barely populated. | Low | PARTIAL |
| 5 | **Visible move-to-negative/positive button** | Right-click to move tags between positive/negative is undiscoverable. sd-webui-better-prompt uses Shift+Enter. A visible arrow or toggle icon is standard. | Low | MISSING (right-click only) |

### UX Polish Table Stakes

| # | Feature | Why Expected | Complexity | nekoPrompt Status |
|---|---------|--------------|------------|-------------------|
| 6 | **Hover/focus visual feedback on all interactive elements** | Standard web UX; without it buttons/tags feel dead | Low | PARTIAL |
| 7 | **Smooth transitions on state changes** | Jarring instant changes feel broken. CSS `transition` on color, scale, opacity. | Low | PARTIAL |
| 8 | **Visual distinction between positive/negative tags** | Core UX -- users must instantly see tag polarity at a glance. Color coding (violet vs red) in workspace. Negative-category tags in the library sidebar should also look distinct. | Low | PARTIAL (workspace only, not library) |
| 9 | **Copy success feedback** | Users need confirmation clipboard action worked. Current "Copied!" text swap is functional but could be more polished. | Low | DONE (basic) |
| 10 | **Reduced motion support** | Accessibility standard. TailwindCSS `motion-reduce:` variant. | Low | MISSING |

### Already Complete

These are done and match competitive standards:
- Category-based tag browsing (10 categories)
- Click-to-add tags (single click)
- Positive/Negative prompt separation (two sections)
- Tag weight adjustment (+/- buttons on hover)
- One-click copy to clipboard
- Selected state visual feedback (violet highlight)
- Remove tag from workspace (X button)
- Clear all workspace
- Preset save/load
- SD / DALL-E format output
- Data persistence (localStorage)
- Import/Export (JSON)

---

## Differentiators

Features that set the product apart. Not expected by casual users, but valued by regular users. These create competitive advantage over simpler tools like tags.novelai.dev.

### High Priority Differentiators

| # | Feature | Value Proposition | Complexity | Notes |
|---|---------|-------------------|------------|-------|
| 1 | **Drag-and-drop tag reorder in workspace** | Tag order affects SD generation output -- earlier tags get higher weight. sd-webui-better-prompt, sd-webui-prompt-all-in-one, wolfchen.top all support drag reorder. The highest-value power user feature. | Med | Use HTML5 Drag API or pointer events. No library needed for simple list reorder. |
| 2 | **One-click negative preset** | A single button that inserts all common negative tags (lowres, bad hands, watermark, etc.) at once. EasyNegative embedding is the most popular SD tool because nobody wants to manually pick 10 negative tags every time. | Low | Simple: button triggers `addNegativeTag()` for a predefined list. |
| 3 | **Tag search matching Chinese descriptions** | Search by Chinese name/description, not just English text. Autocue and sd-webui-prompt-all-in-one support this. Dramatically lowers barrier for Chinese users who don't know English tag names. | Low-Med | Extend `filterTags` to also match against `description` and `aliases` fields. |
| 4 | **Tag count badge on categories** | Show "3/7" next to a category name to indicate selected vs total tags. Quick overview without expanding each category. | Low | Derive from store state per category. |

### Medium Priority Differentiators

| # | Feature | Value Proposition | Complexity | Notes |
|---|---------|-------------------|------------|-------|
| 5 | **Token/character count display** | Show approximate token count for the generated prompt. NovelAI shows a context limit bar. Prompt Visualizer shows real-time counting. SD CLIP has ~75 token limit. Helps users avoid over-prompting. | Med | Simple character count is easy. Accurate CLIP tokenization would need a library -- character count is sufficient for a tag picker. |
| 6 | **Keyboard shortcuts** | Ctrl+Z undo last tag add/remove. Ctrl+C copy prompt. Power users expect keyboard-driven workflows. | Med | Would need an undo stack in the store. |
| 7 | **Smooth micro-animations** | Subtle transitions on tag add/remove (scale-in, fade-out). Makes the app feel polished. TailwindCSS transition utilities make this cheap. | Low | CSS only, no library needed. |
| 8 | **Tag weight visual indicator** | Show weighted tags with visual distinction -- larger text, thicker border, glow, or opacity variation. Makes weight visible at a glance without reading numbers. | Low | Conditional CSS classes based on weight value. |
| 9 | **Contextual tooltips in Chinese** | Help text on hover for categories, actions, and buttons. Not just tag descriptions, but "what does this button do?" | Low | Native `title` attribute or CSS tooltip. |
| 10 | **Preset management improvements** | Rename presets, delete with confirmation tooltip, show tag count per preset. Current implementation is bare-minimum. | Low | Store already has CRUD. Add rename action and UI polish. |

### Low Priority Differentiators

| # | Feature | Value Proposition | Complexity | Notes |
|---|---------|-------------------|------------|-------|
| 11 | **Empty state illustrations** | Replace plain italic text with a simple illustrated or icon-based empty state. Reduces "broken" feeling for new users. | Low | SVG icon + Chinese text. |
| 12 | **Export individual presets** | Allow exporting a single preset as a shareable JSON snippet. Community sharing is a growth vector. | Low | Already have JSON export. Subset filtering. |
| 13 | **Batch tag operations** | Select multiple tags, move/delete together. | Med | Multi-select state in Zustand. Higher complexity for modest gain. |
| 14 | **Dark/light theme toggle** | User preference. Current theme is dark only. | Med | TailwindCSS `dark:` variant. Significant CSS work. |

---

## Anti-Features

Features to explicitly NOT build. Over-engineering or scope creep traps.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **AI-powered prompt generation (ChatGPT integration)** | Adds API dependency, cost, complexity. sd-webui-prompt-all-in-one added this and it requires API keys. A tag picker tool should stay simple and offline. | Keep the tool as a zero-dependency, zero-cost client app. |
| **Full Danbooru tag database (1M+ tags)** | Massively increases bundle size and overwhelms casual users. Prompt Visualizer uses 1M+ tags but it's a Chrome extension with different constraints. A focused curated library serves the target audience better. | Keep curated library (~100-200 tags). Let users add custom tags for niche needs. |
| **Built-in image generation / preview** | Requires API integration, server costs, and shifts the product scope entirely. This is a prompt BUILDER, not a generation tool. | Output clean prompts. Users paste into SD WebUI / ComfyUI / NAI. |
| **Multi-language i18n framework** | PROJECT.md explicitly scopes this out. Building i18n infra for "maybe later" is YAGNI. | Use Chinese string constants directly. Refactor to i18n only if/when needed. |
| **Prompt syntax highlighting (LoRA, embedding detection)** | Only relevant for users running SD WebUI locally with LoRA models. sd-webui-prompt-all-in-one highlights LoRA because it runs inside SD WebUI. Not applicable for a standalone tag picker. | Output clean comma-separated text. |
| **Collaborative/social features** | Account system, cloud sync, shared presets -- all require a backend. PROJECT.md says pure frontend. | Export/import JSON files for sharing. |
| **Auto-translate tags (API-based translation)** | sd-webui-prompt-all-in-one uses translation APIs. Adds latency, API dependency, and cost. | Pre-populate Chinese descriptions in the tag data file. Static, fast, offline. |
| **Full component library integration (Radix, shadcn)** | Rewrites existing UI, adds deps, creates style conflicts with current Tailwind approach. | Polish existing components with CSS. |
| **Toast notification library** | One copy-confirmation message doesn't justify a library. | CSS-only brief flash notification. |
| **Canvas-based tag cloud visualization** | Visually interesting but irrelevant to the core workflow of building ordered prompt strings. | Keep flat tag list -- matches how prompts actually work. |
| **Responsive mobile-first layout** | This is a desktop productivity tool. Users generate images on desktop (SD WebUI, ComfyUI). | Ensure minimum usability on tablet. Don't break on mobile, but don't prioritize it. |

---

## Feature Dependencies

```
Independent (can be done in any order):
  - Full Chinese UI (string replacement)
  - Category collapse/expand (UI component change)
  - Reduced motion support (CSS utility)
  - Micro-animations (CSS transitions)
  - Tag Chinese descriptions (data file enrichment)
  - Empty state illustrations (UI polish)
  - Contextual tooltips (CSS/attribute)

Dependency chains:
  Negative tag auto-routing (store logic)
    --> One-click negative preset (needs auto-routing working first)

  Tag Chinese descriptions populated
    --> Tag search matching Chinese input (needs descriptions to search against)

  Workspace tag reorder (drag-drop)
    --> Tag weight visual indicator (benefits from reorder to show "position = priority")

  Move pos/neg with visible button (replaces right-click pattern)
    --> independent, but should ship alongside negative auto-routing for coherent UX
```

No hard blockers. All features can be implemented incrementally.

---

## MVP Recommendation (for this polish milestone)

### Phase 1 -- Must Ship (table stakes gaps):

1. **Negative tag auto-routing** -- Clicking negative-category tags auto-adds to negative area.
2. **Full Chinese UI** -- All English strings replaced with Chinese.
3. **Category collapse/expand** -- Collapsible category groups in sidebar.
4. **Visible move-to-negative button** -- Replace undiscoverable right-click with explicit icon.
5. **Tag Chinese tooltips** -- Add Chinese descriptions to tag data, show on hover.

### Phase 2 -- Should Ship (high-value differentiators):

6. **One-click negative preset** -- "Add common negative tags" button.
7. **Negative tag visual distinction in library** -- Red/warning color for negative-category tags.
8. **Drag-and-drop tag reorder** -- Reorder tags in workspace by dragging.
9. **Micro-animations** -- Smooth transitions on tag add/remove and state changes.
10. **Reduced motion support** -- Accessibility compliance.

### Defer to future milestone:

- Token count display
- Keyboard shortcuts / undo-redo
- Export individual presets
- Dark/light theme toggle
- Batch tag operations
- Tag search Chinese matching (depends on descriptions being populated first)

---

## Sources

### Primary Tools Analyzed
- [tags.novelai.dev (GIGAZINE article)](https://gigazine.net/gsc_news/en/20221111-tags-novelai-dev/)
- [Autocue -- AI painting tag prompt builder (GitHub)](https://github.com/tinygeeker/autocue)
- [sd-webui-prompt-all-in-one (GitHub)](https://github.com/Physton/sd-webui-prompt-all-in-one)
- [sd-webui-better-prompt (GitHub)](https://github.com/eideehi/sd-webui-better-prompt)
- [NovelAI Documentation -- Image Basics](https://docs.novelai.net/en/image/basics/)
- [Prompt Generator Pro (Civitai)](https://civitai.com/articles/23638/prompt-generator-pro-advanced-tool-for-stable-diffusion-and-more)
- [Prompt Visualizer (Chrome Web Store)](https://chromewebstore.google.com/detail/prompt-visualizer/bdacmilajeddbdgbkggoajlbjikpmpph)
- [a1111-sd-webui-tagcomplete (GitHub)](https://github.com/DominikDoom/a1111-sd-webui-tagcomplete)
- [ComfyUI-Autocomplete-Plus (GitHub)](https://github.com/newtextdoc1111/ComfyUI-Autocomplete-Plus)
- [MikuTools NovelAI Tag Selector](https://tools.miku.ac/novelai_tag/)

### Chinese Ecosystem
- [SD Negative Prompt Guide (Zhihu)](https://zhuanlan.zhihu.com/p/640546302)
- [SD Prompt Guide (CSDN)](https://blog.csdn.net/m0_71745258/article/details/134647465)
- [AI Painting Keyword Sites Roundup (CSDN)](https://blog.csdn.net/m0_74942241/article/details/139592650)

### Prompt Mechanics
- [NovelAI Strengthening/Weakening Docs](https://docs.novelai.net/en/image/strengthening-weakening/)
- [SD Negative Prompt Explained (stablediffusion-cn.com)](https://www.stablediffusion-cn.com/sd/sd-use/645.html)
- [SD Prompt Writing Guide (skycaiji.com)](https://www.skycaiji.com/aigc/ai2165.html)
