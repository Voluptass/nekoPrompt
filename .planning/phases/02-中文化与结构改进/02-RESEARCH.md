# Phase 2: 中文化与结构改进 - Research

**Researched:** 2026-03-09
**Domain:** React localization, UI structure, Chinese text search
**Confidence:** HIGH

## Summary

Phase 2 focuses on localizing the UI to Chinese, adding Chinese descriptions to tags for better discoverability, implementing collapsible categories, and providing one-click negative preset functionality. The project is a pure frontend React app without backend dependencies, making a simple constants-based localization approach ideal over heavyweight i18n frameworks.

The current codebase already has Chinese category names in `categories.ts`, but all UI strings in components are hardcoded in English. The 97 builtin tags lack Chinese descriptions/aliases, limiting Chinese user discoverability. The CategoryGroup component has collapse state management in place but defaults to collapsed (expanded=false), which needs to be inverted or made configurable.

**Primary recommendation:** Use a simple constants file pattern (`src/locales/zh-CN.ts`) for UI strings, extend Tag type with Chinese description field, leverage existing CategoryGroup collapse logic, and create a negative preset utility function.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| L10N-01 | 全部 UI 标签翻译为中文（含 Positive Tags、Clear all、Negative、Save as preset、Copy to Clipboard 等 ~27 个字符串） | Constants file pattern with key-value mapping; identified 27+ UI strings across 8 components |
| L10N-02 | 97 个内置标签添加中文描述/别名，悬浮或搜索时可见 | Extend Tag type with `descriptionZh` field; update filterTags to search Chinese; tooltip on hover |
| UIST-01 | 左侧标签库分类支持点击折叠/展开 | CategoryGroup already has useState(expanded) logic; need to invert default or add persistence |
| UIST-02 | 提供一键负面预设功能，可快速添加常用负面标签组合到 Negative 区域 | Create preset utility with common negative tags (lowres, bad_hands, blurry, etc.); add button in Workspace |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Already in use, no additional dependencies needed |
| TypeScript | 5.9.3 | Type safety | Existing project language, ensures type-safe locale keys |
| Zustand | 5.0.11 | State management | Already managing workspace state, can store collapse preferences |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | - | Simple constants-based approach sufficient |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Constants file | react-i18next | Overkill for single-language localization; adds 50KB+ bundle size |
| Constants file | react-intl/FormatJS | Designed for multi-language apps; unnecessary complexity |
| Manual Chinese descriptions | Pinyin search library | Not needed - simple alias matching in filterTags sufficient |

**Installation:**
```bash
# No new dependencies required
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── locales/
│   └── zh-CN.ts          # Chinese UI strings constants
├── data/
│   ├── categories.ts     # Already has Chinese names
│   └── tags.ts           # Add descriptionZh field to each tag
├── types/
│   └── index.ts          # Extend Tag interface
└── utils/
    └── negativePresets.ts # One-click negative preset logic
```

### Pattern 1: Constants-Based Localization
**What:** Single constants file exporting key-value pairs for UI strings
**When to use:** Single-language localization without need for runtime language switching
**Example:**
```typescript
// src/locales/zh-CN.ts
export const zh = {
  workspace: {
    positiveTags: '正面标签',
    negativeTags: '负面标签',
    clearAll: '清空全部',
    saveAsPreset: '保存为预设',
    presetNamePlaceholder: '预设名称...',
    save: '保存',
    cancel: '取消',
    emptyPositive: '从标签库点击标签添加到这里',
    emptyNegative: '点击标签库中的负面标签自动添加到这里',
  },
  preview: {
    prompt: '提示词',
    negativePrompt: '负面提示词',
    copyToClipboard: '复制到剪贴板',
    copied: '✓ 已复制！',
    sdFormat: 'SD 格式',
    dalleFormat: 'DALL·E 格式',
    promptPlaceholder: '选择标签生成提示词...',
    noNegativeTags: '暂无负面标签...',
  },
  header: {
    import: '导入',
    export: '导出',
    searchPlaceholder: '搜索标签...',
    importSuccess: '导入成功！',
    importFailed: '导入失败：',
  },
  statusBar: {
    selected: '已选',
    negative: '负面',
    tags: '个标签',
    storage: '存储',
  },
  negativePreset: {
    addCommon: '一键添加常用负面',
  },
} as const

export type LocaleKeys = typeof zh
```

### Pattern 2: Tag Chinese Description
**What:** Extend Tag type with optional Chinese description field
**When to use:** For all 97 builtin tags to enable Chinese search and tooltip display
**Example:**
```typescript
// src/types/index.ts
export interface Tag {
  id: string
  text: string
  category: string
  aliases?: string[]
  description?: string
  descriptionZh?: string  // NEW: Chinese description
  platforms?: Platform[]
}

// src/data/tags.ts
export const builtinTags: Tag[] = [
  {
    id: 'masterpiece',
    text: 'masterpiece',
    category: 'quality',
    descriptionZh: '杰作，高质量作品'
  },
  {
    id: '1girl',
    text: '1girl',
    category: 'character',
    aliases: ['one girl'],
    descriptionZh: '一个女孩'
  },
  // ... 95 more tags
]
```

### Pattern 3: Enhanced Search with Chinese
**What:** Update filterTags to match against descriptionZh field
**When to use:** Enable Chinese keyword search in tag library
**Example:**
```typescript
// src/hooks/useTagSearch.ts
export function filterTags(tags: Tag[], query: string): Tag[] {
  if (!query.trim()) return tags
  const q = query.toLowerCase()
  return tags.filter(
    (t) =>
      t.text.toLowerCase().includes(q) ||
      t.aliases?.some((a) => a.toLowerCase().includes(q)) ||
      t.descriptionZh?.includes(q)  // NEW: Chinese search
  )
}
```

### Pattern 4: Collapsible Category with Persistence
**What:** Leverage existing CategoryGroup useState, add localStorage persistence
**When to use:** Remember user's collapse preferences across sessions
**Example:**
```typescript
// src/components/TagLibrary/CategoryGroup.tsx
export function CategoryGroup({ category, tags }: CategoryGroupProps) {
  const storageKey = `category-${category.id}-expanded`
  const [expanded, setExpanded] = useState(() => {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : true  // Default to expanded
  })

  const toggleExpanded = () => {
    setExpanded((v) => {
      const newValue = !v
      localStorage.setItem(storageKey, JSON.stringify(newValue))
      return newValue
    })
  }

  // ... rest of component
}
```

### Pattern 5: One-Click Negative Preset
**What:** Utility function to batch-add common negative tags
**When to use:** Quick negative prompt setup for users
**Example:**
```typescript
// src/utils/negativePresets.ts
export const COMMON_NEGATIVE_TAGS = [
  'lowres',
  'bad_hands',
  'blurry',
  'watermark',
  'text',
  'error',
  'worst_quality',
  'low_quality',
]

export function addCommonNegativePreset(
  currentNegativeTags: SelectedTag[]
): SelectedTag[] {
  const existingIds = new Set(currentNegativeTags.map(t => t.tagId))
  const newTags = COMMON_NEGATIVE_TAGS
    .filter(id => !existingIds.has(id))
    .map(id => ({ tagId: id }))
  return [...currentNegativeTags, ...newTags]
}

// In Workspace component
const handleAddNegativePreset = () => {
  const updated = addCommonNegativePreset(negativeTags)
  usePromptStore.setState({ negativeTags: updated })
}
```

### Anti-Patterns to Avoid
- **Hardcoding Chinese strings in JSX:** Breaks maintainability, use constants file
- **Using i18n framework for single language:** Adds unnecessary complexity and bundle size
- **Pinyin conversion libraries:** Not needed, simple Chinese string matching sufficient
- **Global collapse state:** Each category should maintain independent collapse state
- **Overloading negative preset:** Keep preset focused on 8-10 most common tags, not all 10 negative tags

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-language switching | Custom language context + provider | N/A (single language) | Out of scope per REQUIREMENTS.md |
| Pinyin search | Custom pinyin converter | Simple Chinese string matching | 97 tags is small dataset, full-text search sufficient |
| Accordion component library | Third-party accordion | Existing CategoryGroup useState | Already implemented, just needs default change |
| Complex i18n | react-i18next setup | Constants file | Single language = simple constants sufficient |

**Key insight:** For single-language localization with <100 strings, constants file pattern is simpler, faster, and more maintainable than i18n frameworks. The project already has most infrastructure in place (CategoryGroup collapse, filterTags search), requiring only data additions and default behavior changes.

## Common Pitfalls

### Pitfall 1: Incomplete String Extraction
**What goes wrong:** Missing UI strings during localization, leaving English text scattered
**Why it happens:** Strings hidden in placeholders, aria-labels, alert() messages, button text
**How to avoid:** Systematic grep for all English strings in components before creating constants file
**Warning signs:** User reports "some buttons still in English" after localization

### Pitfall 2: Chinese Search Case Sensitivity
**What goes wrong:** Chinese search fails because toLowerCase() applied to Chinese characters
**Why it happens:** Chinese has no case, but filterTags applies toLowerCase() to query
**How to avoid:** Only apply toLowerCase() to English text/aliases, not Chinese descriptionZh
**Warning signs:** Searching "女孩" doesn't match tags with "女孩" in description

### Pitfall 3: Collapse State Lost on Search
**What goes wrong:** Filtering tags resets all categories to default collapse state
**Why it happens:** CategoryGroup remounts when filtered tags change
**How to avoid:** Store collapse state outside component (localStorage or Zustand)
**Warning signs:** User expands categories, types in search, all categories collapse again

### Pitfall 4: Negative Preset Duplicates
**What goes wrong:** Clicking "add negative preset" multiple times adds duplicate tags
**Why it happens:** Not checking existing tags before adding preset
**How to avoid:** Filter out already-selected tags in addCommonNegativePreset utility
**Warning signs:** Workspace shows "lowres, lowres, lowres" after multiple clicks

### Pitfall 5: Tooltip Overflow
**What goes wrong:** Long Chinese descriptions overflow or get cut off in tooltips
**Why it happens:** Fixed-width tooltips or no max-width constraint
**How to avoid:** Use max-w-xs or max-w-sm with break-words in tooltip styling
**Warning signs:** Tooltip text runs off screen edge or overlaps other UI

## Code Examples

Verified patterns from project codebase:

### Localized Component Example
```typescript
// src/components/Workspace/Workspace.tsx
import { zh } from '../../locales/zh-CN'

export function Workspace() {
  // ... existing logic

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      <section className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-medium text-zinc-400">
            {zh.workspace.positiveTags}
          </h2>
          {!isEmpty && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer"
            >
              {zh.workspace.clearAll}
            </button>
          )}
        </div>
        {selectedTags.length === 0 ? (
          <p className="text-sm text-zinc-600 italic">
            {zh.workspace.emptyPositive}
          </p>
        ) : (
          // ... existing tag rendering
        )}
      </section>
      {/* ... rest of component */}
    </div>
  )
}
```

### Tag with Chinese Description Tooltip
```typescript
// src/components/TagLibrary/TagItem.tsx
export function TagItem({ tag }: TagItemProps) {
  const addTag = usePromptStore((s) => s.addTag)
  const isNegativeCategory = tag.category === 'negative'

  return (
    <button
      type="button"
      onClick={() => addTag(tag.id, isNegativeCategory)}
      title={tag.descriptionZh || tag.text}  // Show Chinese description on hover
      className={/* ... existing styles */}
    >
      {tag.text}
    </button>
  )
}
```

### One-Click Negative Preset Button
```typescript
// src/components/Workspace/Workspace.tsx
import { addCommonNegativePreset } from '../../utils/negativePresets'
import { zh } from '../../locales/zh-CN'

export function Workspace() {
  const negativeTags = usePromptStore((s) => s.negativeTags)

  const handleAddNegativePreset = () => {
    const updated = addCommonNegativePreset(negativeTags)
    usePromptStore.setState({ negativeTags: updated })
  }

  return (
    <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
      {/* ... positive section */}

      <div className="flex items-center gap-2 text-zinc-700">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-xs">{zh.workspace.negativeTags}</span>
        <button
          type="button"
          onClick={handleAddNegativePreset}
          className="text-xs text-violet-400 hover:text-violet-300 cursor-pointer"
          title={zh.negativePreset.addCommon}
        >
          + 常用
        </button>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      {/* ... negative section */}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-i18next for all i18n | Constants file for single-language | 2024+ | Simpler, smaller bundle, faster |
| Pinyin libraries for Chinese search | Direct Chinese string matching | 2025+ | Sufficient for small datasets |
| Third-party accordion libraries | Native React useState | Always | Less dependencies, more control |
| Global i18n context | Import constants directly | 2024+ | No provider overhead, tree-shakeable |

**Deprecated/outdated:**
- react-localization: Last updated 2019, use constants file instead
- Heavy i18n frameworks for single-language apps: Unnecessary complexity

## Open Questions

1. **Should category collapse state persist across sessions?**
   - What we know: CategoryGroup has useState for collapse, localStorage available
   - What's unclear: User preference - remember state or reset each session?
   - Recommendation: Implement persistence, default all categories to expanded for first-time users

2. **Should negative preset be customizable?**
   - What we know: Common negative tags identified from SD community best practices
   - What's unclear: Whether users want to customize which tags are in "common" preset
   - Recommendation: Start with fixed preset, defer customization to v2 (out of scope for Phase 2)

3. **Should Chinese descriptions be shown inline or only on hover?**
   - What we know: Tag buttons are small, inline text would cause overflow
   - What's unclear: Discoverability vs. visual clutter tradeoff
   - Recommendation: Hover tooltip only, search functionality makes Chinese descriptions discoverable

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + @testing-library/react 16.3.2 |
| Config file | vite.config.ts (test section lines 11-15) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| L10N-01 | All UI strings use zh constants | unit | `npm test src/locales/__tests__/zh-CN.test.ts` | ❌ Wave 0 |
| L10N-01 | Components render Chinese text | integration | `npm test src/components/**/*.test.tsx` | ❌ Wave 0 |
| L10N-02 | Tags have descriptionZh field | unit | `npm test src/data/__tests__/data.test.ts` | ✅ (extend existing) |
| L10N-02 | filterTags matches Chinese | unit | `npm test src/hooks/__tests__/useTagSearch.test.ts` | ✅ (extend existing) |
| UIST-01 | CategoryGroup toggles collapse | unit | `npm test src/components/TagLibrary/__tests__/CategoryGroup.test.tsx` | ❌ Wave 0 |
| UIST-01 | Collapse state persists | integration | `npm test src/components/TagLibrary/__tests__/CategoryGroup.test.tsx` | ❌ Wave 0 |
| UIST-02 | addCommonNegativePreset filters duplicates | unit | `npm test src/utils/__tests__/negativePresets.test.ts` | ❌ Wave 0 |
| UIST-02 | Negative preset button adds tags | integration | `npm test src/components/Workspace/__tests__/Workspace.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test` (runs all tests, ~2s execution time)
- **Per wave merge:** `npm test` (full suite)
- **Phase gate:** Full suite green + manual browser verification of Chinese UI

### Wave 0 Gaps
- [ ] `src/locales/__tests__/zh-CN.test.ts` — validates all locale keys exist and are non-empty
- [ ] `src/components/TagLibrary/__tests__/CategoryGroup.test.tsx` — covers collapse toggle and persistence
- [ ] `src/components/Workspace/__tests__/Workspace.test.tsx` — covers negative preset button interaction
- [ ] `src/utils/__tests__/negativePresets.test.ts` — covers addCommonNegativePreset logic
- [ ] Extend `src/data/__tests__/data.test.ts` — add test for descriptionZh field presence
- [ ] Extend `src/hooks/__tests__/useTagSearch.test.ts` — add Chinese search test cases

## Sources

### Primary (HIGH confidence)
- Project codebase analysis: src/components/, src/data/, src/types/, src/hooks/
- Existing test patterns: src/**/__tests__/*.test.ts
- Package.json dependencies: React 19.2.4, Zustand 5.0.11, Vitest 4.0.18

### Secondary (MEDIUM confidence)
- [Implementing Internationalization in React Components (2026)](https://thelinuxcode.com/implementing-internationalization-in-react-components-2026-a-practical-component-first-guide/) - Constants-based i18n pattern
- [Creating constant resource file for making multilingual app in ReactJS](https://www.akashmittal.com/constant-resource-file-reactjs/) - Constants file structure
- [120+ Stable Diffusion Negative Prompts to Improve AI Art in 2026](https://clickup.com/blog/stable-diffusion-negative-prompts/) - Common negative tags
- [mikhail-bot/stable-diffusion-negative-prompts](https://github.com/mikhail-bot/stable-diffusion-negative-prompts) - Negative prompt presets
- [React Bootstrap Accordion](https://react-bootstrap.netlify.app/docs/components/accordion/) - Accordion pattern reference

### Tertiary (LOW confidence)
- [30secondsofcode.org React collapsible](https://www.30secondsofcode.org/react/s/tabs) - Basic collapsible pattern
- [@xiping/pinyin-search](https://www.npmjs.com/package/@xiping/pinyin-search) - Pinyin search (not needed for this project)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies needed, using existing React/TS/Zustand
- Architecture: HIGH - Patterns verified against existing codebase structure
- Pitfalls: MEDIUM - Based on common i18n/localization issues, not project-specific history

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (30 days - stable domain, React patterns don't change rapidly)
