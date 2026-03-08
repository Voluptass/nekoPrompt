# Phase 1: 交互修复 - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

修正负面标签归类逻辑（点击"负面常用"分类标签自动进入 Negative 区域），为工作区标签添加可见的正/负移动按钮替代右键菜单，左侧标签库负面分类标签提供视觉区分，加固 Zustand persist 数据迁移机制。

</domain>

<decisions>
## Implementation Decisions

### 工作区标签操作按钮
- Hover 时显示箭头图标按钮（↑移至正面 / ↓移至负面）
- 按钮位置在标签卡片右侧，与 ✕ 删除按钮相邻
- 移除现有右键上下文菜单（onContextMenu），交互统一为可见按钮
- 正面标签显示 ↓ 按钮（移至负面），负面标签显示 ↑ 按钮（移至正面）

### 负面分类视觉区分
- 左侧标签库中"负面常用"分类下的标签使用红色色调（bg-red-900/30 text-red-300 或类似），与工作区 Negative 区域标签颜色一致
- "负面常用"分类标题也使用红色文字，整个分组视觉统一
- 负面标签被选中后（已在工作区 Negative 区域），在标签库中红色色调加深，与正面标签的紫色选中态明确区分
- 点击负面分类标签自动归入 Negative 区域（不进 Positive）

### 数据迁移策略
- Zustand persist version 从 0 开始，本次 store 结构变更后升至 1
- 迁移失败时弹提示告知用户，然后重置为默认值
- 删除 useLocalStorage.ts 及其测试文件（死代码，Zustand persist 是唯一持久化层）
- moveToNegative/moveToPositive 重构为单次 set() 原子操作（当前是两次分开的 set() 调用，存在中间态）

### Claude's Discretion
- 箭头图标的具体 SVG 设计
- 红色色调的精确 Tailwind 色值
- migrate 函数中字段映射的具体实现细节
- 迁移失败提示的措辞

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TagItem` 组件（src/components/TagLibrary/TagItem.tsx）：当前统一调用 toggleTag，需要根据分类判断调用 toggleTag 还是 addNegativeTag
- `WorkspaceTag` 组件（src/components/Workspace/WorkspaceTag.tsx）：已有 moveToNegative/moveToPositive 引用，需要替换 onContextMenu 为可见按钮
- `builtinCategories` 数据（src/data/categories.ts）：负面分类 id 为 'negative'，可用于判断标签所属分类

### Established Patterns
- Zustand persist middleware（src/stores/usePromptStore.ts）：当前 partialize 只持久化 selectedTags, negativeTags, presets
- TailwindCSS 条件样式：使用模板字面量 + 三元表达式（TagItem, WorkspaceTag 均如此）
- Inline SVG 小图标：项目中已有 SearchBar、PresetGroup 使用 inline SVG，箭头按钮应延续此模式
- 颜色体系：zinc 为中性色，violet 为主色调，red 为负面/危险色

### Integration Points
- `TagItem` 需要知道标签所属分类以决定点击行为和样式 → 可通过 Tag.category 字段获取
- `CategoryGroup` 组件中分类标题样式需根据 category.id === 'negative' 条件化
- Store 的 persist 配置需添加 version 和 migrate 字段

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-interaction-fix*
*Context gathered: 2026-03-08*
