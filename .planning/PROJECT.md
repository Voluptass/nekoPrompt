# nekoPrompt — 修缮计划

## What This Is

纯前端文生图提示词管理器，面向 AI 绘图用户（主要是中文用户），提供标签选取、分类浏览、正/负面提示词管理、预设保存和导入导出功能。基于 React 19 + TypeScript + Vite + TailwindCSS 4 + Zustand 构建的纯客户端 SPA。

## Core Value

让中文用户能够直观、快速地组合和管理文生图提示词，零门槛上手。

## Requirements

### Validated

<!-- 已有功能，经代码库映射确认 -->

- ✓ 标签库浏览（10 个分类，97 个内置标签）— existing
- ✓ 左键点击添加标签到正面提示词 — existing
- ✓ 右键点击移动标签到负面区域 — existing
- ✓ SD / DALL-E 双格式输出 — existing
- ✓ 一键复制提示词到剪贴板 — existing
- ✓ 预设保存与加载 — existing
- ✓ 用户数据 JSON 导入/导出 — existing
- ✓ 搜索标签 — existing
- ✓ localStorage 持久化 — existing
- ✓ GitHub Pages 部署 — existing

### Active

<!-- 本次修缮范围 -->

- [ ] 全界面中文化 — 所有 UI 标签、提示文案翻译为中文
- [ ] 负面标签自动归类 — 点击"负面常用"分类的标签自动进入 Negative 区域
- [ ] UI/UX 整体打磨 — 交互更直观、视觉更精致

### Out of Scope

- 后端/数据库 — 纯前端项目，不引入服务端
- 多语言国际化(i18n) — 本次只做中文化，不搭建 i18n 框架
- 新增标签分类/大规模标签库扩展 — 本次聚焦 UX 修缮

## Context

- 项目已完成 v1 全部 15 个 Task，代码可运行、测试通过、可部署
- 当前 UI 存在英中混杂问题，用户体验有提升空间
- 负面标签交互逻辑不直观：用户需右键操作才能将标签移入 Negative 区域
- "负面常用"分类标签点击后错误地进入 Positive 区域

## Constraints

- **Tech stack**: 维持现有技术栈不变（React 19 + TS + Vite + TailwindCSS 4 + Zustand）
- **No new deps**: 尽量不引入新的 npm 依赖
- **Backward compatible**: 不破坏现有 localStorage 中用户数据的兼容性

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 负面标签点击自动归类 | 减少用户操作步骤，逻辑更直观 | — Pending |
| 界面全中文化（非 i18n） | 目标用户为中文群体，简单直接 | — Pending |

---
*Last updated: 2026-03-08 after initialization*
