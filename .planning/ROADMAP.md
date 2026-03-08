# Roadmap: nekoPrompt 修缮

## Overview

修缮一个已完成的文生图提示词管理器：先修复交互逻辑错误和数据安全隐患，再完成中文化和结构改进，最后做视觉打磨和高级交互。三个阶段递进，每个阶段交付一个完整、可验证的能力层。

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: 交互修复** - 修正负面标签归类逻辑，添加可见操作按钮，加固数据迁移
- [ ] **Phase 2: 中文化与结构改进** - 全界面中文化、标签中文描述、分类折叠、负面预设
- [ ] **Phase 3: 视觉打磨与拖拽排序** - hover反馈、过渡动画、焦点环、拖拽排序

## Phase Details

### Phase 1: 交互修复
**Goal**: 用户对标签的点击行为符合直觉，负面标签自动归类正确，标签移动操作可见可发现
**Depends on**: Nothing (first phase)
**Requirements**: INTR-01, INTR-02, INTR-03, INTR-04
**Success Criteria** (what must be TRUE):
  1. 用户点击"负面常用"分类中的标签，标签直接出现在 Negative 区域而非 Positive 区域
  2. 工作区每个标签旁有可见按钮可将其移至正面/负面区域，无需右键操作
  3. 左侧标签库中"负面常用"分类的标签在视觉上与正面分类标签有明显区分（颜色或边框不同）
  4. 修改 store 结构后，已有 localStorage 数据自动迁移，用户不丢失已保存的标签和预设
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Store foundation: atomic move operations, persist migration, dead code cleanup
- [ ] 01-02-PLAN.md — UI fixes: category-aware TagItem click/styling, CategoryGroup red title, WorkspaceTag visible move buttons

### Phase 2: 中文化与结构改进
**Goal**: 界面全部呈现为中文，标签有中文描述辅助理解，标签库分类可折叠管理，负面预设一键添加
**Depends on**: Phase 1
**Requirements**: L10N-01, L10N-02, UIST-01, UIST-02
**Success Criteria** (what must be TRUE):
  1. 界面上所有用户可见的英文标签、按钮、提示文案均已替换为中文
  2. 标签库中任意标签悬浮时可看到中文描述，搜索框输入中文可匹配到对应标签
  3. 左侧标签库每个分类可点击折叠/展开，折叠后隐藏该分类下所有标签
  4. 用户可通过"一键负面预设"按钮将常用负面标签组合批量添加到 Negative 区域
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: 视觉打磨与拖拽排序
**Goal**: 交互反馈流畅自然，标签操作有视觉动效，用户可通过拖拽自由排列标签顺序
**Depends on**: Phase 2
**Requirements**: CSSP-01, CSSP-02, CSSP-03, CSSP-04, DND-01, DND-02
**Success Criteria** (what must be TRUE):
  1. 鼠标悬浮标签时有明显的视觉反馈（缩放、高亮或阴影变化）
  2. 使用键盘 Tab 导航时，所有可交互元素显示统一的焦点环样式
  3. 标签添加到工作区或从工作区移除时有进入/退出过渡动画，面板操作有平滑过渡
  4. 用户可在 Positive 区域拖拽标签改变顺序，拖拽结果反映在最终提示词输出中
  5. 用户可在 Negative 区域拖拽标签改变顺序
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 交互修复 | 0/2 | Planned | - |
| 2. 中文化与结构改进 | 0/? | Not started | - |
| 3. 视觉打磨与拖拽排序 | 0/? | Not started | - |
