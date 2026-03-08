# nekoPrompt - 文生图提示词管理器设计文档

> 一个纯前端的文生图提示词管理器，通过分类标签点选快速组装提示词，支持权重调节、预设保存、多格式导出。

## 概述

### 目标用户

多平台文生图用户（SD / DALL·E 等），需要一个高效的提示词组装和管理工具。

### 核心痛点

- 组装提示词费时，需反复手打标签
- 收藏的提示词模板管理混乱
- 不熟悉常用标签和搭配

### 产品定位

- **形态：** 纯前端 Web 应用（SPA）
- **场景：** 个人工具，无需登录
- **存储：** 浏览器 localStorage
- **部署：** GitHub Pages，零运维

## 技术选型

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | React 19 + TypeScript | 组件化适合标签/分类 UI，TS 保证数据结构安全 |
| 构建 | Vite | 快、轻、开箱即用 |
| 样式 | TailwindCSS 4 | 原子化快速出 UI，响应式零成本 |
| 存储 | localStorage | 纯文本提示词，5MB 绰绰有余 |
| 部署 | GitHub Pages | 零成本，自动 CI/CD |

## 项目结构

```
nekoPrompt/
├── src/
│   ├── components/      # UI 组件
│   │   ├── TagLibrary/  # 左侧标签库（分类+标签列表）
│   │   ├── Workspace/   # 中间工作区（已选标签管理）
│   │   ├── Preview/     # 右侧输出预览
│   │   └── Common/      # 通用组件（搜索栏、模态框等）
│   ├── data/            # 内置预设标签数据
│   ├── hooks/           # 自定义 hooks（存储、搜索等）
│   ├── stores/          # 状态管理（Zustand 或 useContext）
│   ├── types/           # TypeScript 类型定义
│   └── utils/           # 工具函数（导出、格式转换等）
├── public/
└── index.html
```

## 数据模型

```typescript
// 标签
interface Tag {
  id: string
  text: string           // 标签文本，如 "1girl"
  category: string       // 所属分类 ID
  aliases?: string[]     // 别名，方便搜索
  description?: string   // 简要说明
  platforms?: Platform[] // 适用平台
}

// 分类
interface Category {
  id: string
  name: string           // 显示名，如 "人物"
  icon?: string          // 分类图标
  order: number          // 排列顺序
}

// 用户保存的预设组合
interface Preset {
  id: string
  name: string           // 预设名，如 "赛博朋克少女"
  tags: SelectedTag[]    // 正面已选标签
  negativeTags: SelectedTag[] // 负面已选标签
  createdAt: number
}

// 已选中的标签（带权重）
interface SelectedTag {
  tagId: string
  weight?: number        // SD 权重，如 1.2（默认 1.0 不显示）
}

// 用户数据
interface UserData {
  version: number
  customTags: Tag[]
  customCategories: Category[]
  hiddenBuiltinTags: string[]
  presets: Preset[]
  settings: UserSettings
}

// 工作区状态
interface WorkspaceState {
  selectedTags: SelectedTag[]
  negativeTags: SelectedTag[]
}

type Platform = 'sd' | 'dalle' | 'mj' | 'general'
```

## 存储策略

```
localStorage keys:
  "nekoPrompt:userData"    → UserData JSON（用户自定义数据）
  "nekoPrompt:workspace"   → WorkspaceState JSON（当前工作区，防刷新丢失）
```

- 导出：将 UserData 序列化为 `.json` 文件下载
- 导入：读取 `.json` → 校验 version → 合并或覆盖（让用户选）
- 内置标签不参与导入导出

## UI 布局

### 三栏布局（桌面端）

```
┌─────────────────────────────────────────────────────────┐
│  nekoPrompt                 [搜索...]     [导入] [导出]  │
├──────────┬──────────────────────┬────────────────────────┤
│ 标签库    │  工作区              │  输出预览              │
│          │                      │                        │
│ ▸ 质量    │  ✕masterpiece       │  masterpiece,          │
│ ▾ 人物    │  ✕1girl             │  1girl,                │
│   •1girl  │  ✕long hair (1.2)   │  (long hair:1.2),      │
│   •1boy   │  ✕blue eyes         │  blue eyes             │
│ ▸ 服装    │                      │                        │
│ ▸ 场景    │  [保存为预设]        │  ── 负面提示词 ──      │
│ ▸ 风格    │                      │  lowres, bad hands     │
│ ▸ 光影    │  ── 负面提示词 ──    │                        │
│          │  ✕lowres             │  [一键复制] [SD格式]    │
│ ▾ 预设    │  ✕bad hands          │  [DALL·E格式]          │
│   •赛博少女│                      │                        │
├──────────┴──────────────────────┴────────────────────────┤
│  状态栏: 已选 5 个标签 | 负面 2 个 | 存储已用 12KB/5MB    │
└─────────────────────────────────────────────────────────┘
```

### 响应式（窄屏）

- 标签库折叠为侧边抽屉
- 工作区和预览合并为双行

## 交互设计

### 标签选择

- 点击左侧标签 → 加入工作区正面区域 → 预览实时更新
- 再次点击已选标签 → 取消选择
- 已选中标签在左侧高亮显示

### 权重调节

- 工作区标签上鼠标滚轮 / 点击 +- 按钮
- 权重 1.0 时不显示，非 1.0 时显示为 `tag (1.2)`

### 负面提示词

- 工作区分正面/负面两个区域
- 右键标签 → "移到负面"

### 搜索

- 顶部搜索栏实时过滤标签（匹配 text + aliases）

### 预设管理

- "保存为预设" → 输入名称 → 存到左侧预设分类
- 点击预设 → 一键加载整套标签
- 长按/右键 → 删除/重命名

### 导出格式

- **SD 格式：** `masterpiece, (long hair:1.2), 1girl`
- **DALL·E 格式：** 自然语言拼接模板
- **JSON：** 完整数据备份

## 内置标签库

| 分类 | 示例标签 |
|------|---------|
| 质量 | masterpiece, best quality, highres |
| 人物 | 1girl, 1boy, solo, multiple girls |
| 外貌 | long hair, blue eyes, blonde hair |
| 服装 | school uniform, dress, armor |
| 表情/动作 | smile, sitting, looking at viewer |
| 场景 | outdoors, classroom, city, night |
| 风格 | anime, realistic, watercolor, pixel art |
| 光影 | dramatic lighting, soft light, backlight |
| 构图 | close-up, full body, from above |
| 负面常用 | lowres, bad hands, blurry, watermark |

## MVP 功能范围

### P0（必须有）

- 标签库浏览（分类折叠展开、点选添加）
- 工作区管理（已选标签展示、删除、正/负面切换）
- 实时预览（右侧实时生成提示词文本）
- 一键复制
- SD 格式输出

### P1（应该有）

- 权重调节
- 预设保存/加载
- 搜索过滤
- 导入/导出 JSON

### P2（可以有）

- DALL·E 格式输出
- 自定义标签/分类
- 响应式布局

### 非目标

- 后端服务 / 数据库
- 用户账号 / 登录注册
- 云同步
- AI 智能推荐
- 图片预览 / 生图功能
- 国际化
