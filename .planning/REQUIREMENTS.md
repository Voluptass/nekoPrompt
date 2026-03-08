# Requirements: nekoPrompt 修缮

**Defined:** 2026-03-08
**Core Value:** 让中文用户能够直观、快速地组合和管理文生图提示词

## v1 Requirements

### 交互修复 (Interaction)

- [ ] **INTR-01**: 点击"负面常用"分类的标签自动进入 Negative 区域，不进入 Positive
- [x] **INTR-02**: 工作区标签提供可见的"移至正面/负面"按钮，不依赖右键操作
- [ ] **INTR-03**: 左侧标签库中负面分类标签有明显的视觉区分（颜色/图标/边框）
- [x] **INTR-04**: Zustand persist 配置添加 version 和 migrate 函数，防止 store 结构变更破坏用户数据

### 中文化 (Localization)

- [ ] **L10N-01**: 全部 UI 标签翻译为中文（含 Positive Tags、Clear all、Negative、Save as preset、Copy to Clipboard 等 ~27 个字符串）
- [ ] **L10N-02**: 97 个内置标签添加中文描述/别名，悬浮或搜索时可见

### UI 结构 (Structure)

- [ ] **UIST-01**: 左侧标签库分类支持点击折叠/展开
- [ ] **UIST-02**: 提供一键负面预设功能，可快速添加常用负面标签组合到 Negative 区域

### CSS 打磨 (Polish)

- [ ] **CSSP-01**: 标签 hover 状态反馈（缩放/高亮/阴影变化）
- [ ] **CSSP-02**: 焦点环样式统一（键盘无障碍支持）
- [ ] **CSSP-03**: 标签添加/移除时有进入/退出过渡动画
- [ ] **CSSP-04**: 面板间切换/操作有平滑过渡效果

### 拖拽排序 (Drag & Drop)

- [ ] **DND-01**: 用户可拖拽排序工作区 Positive 区域的标签，改变标签输出顺序
- [ ] **DND-02**: 用户可拖拽排序工作区 Negative 区域的标签

## v2 Requirements

### 高级功能

- **ADV-01**: 标签权重拖拽调节（拖拽滑块调整权重数值）
- **ADV-02**: 自定义标签创建与管理
- **ADV-03**: 提示词历史记录
- **ADV-04**: 标签使用频率统计

## Out of Scope

| Feature | Reason |
|---------|--------|
| 多语言国际化 (i18n) 框架 | 本次只做中文化，不搭建翻译系统 |
| 后端/数据库 | 纯前端项目定位不变 |
| AI/API 集成 | 超出提示词管理器范畴 |
| Danbooru 规模标签库 | 维护成本过高，97 个精选标签足够 |
| 移动端适配 | 本次聚焦桌面端 UX |
| 组件库重写（shadcn/Radix） | 过度工程化，现有自定义组件足够 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INTR-01 | Phase 1 | Pending |
| INTR-02 | Phase 1 | Complete |
| INTR-03 | Phase 1 | Pending |
| INTR-04 | Phase 1 | Complete |
| L10N-01 | Phase 2 | Pending |
| L10N-02 | Phase 2 | Pending |
| UIST-01 | Phase 2 | Pending |
| UIST-02 | Phase 2 | Pending |
| CSSP-01 | Phase 3 | Pending |
| CSSP-02 | Phase 3 | Pending |
| CSSP-03 | Phase 3 | Pending |
| CSSP-04 | Phase 3 | Pending |
| DND-01 | Phase 3 | Pending |
| DND-02 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after 01-01 execution*
