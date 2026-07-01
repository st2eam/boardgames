## Context

Sea Salt & Paper 的卡牌速查组件 (`SeaSaltCardReference`) 通过 `OrigamiIcons.tsx` 中 19 个 React SVG 组件渲染图标。当前图标是简化手绘风格，与游戏实际的折纸纸艺风格不匹配。需要按照用户提供的严格艺术规范重绘全部图标。

现有文件结构：
- `src/components/game/sea-salt/OrigamiIcons.tsx` — 19 个导出组件，统一 `viewBox="0 0 32 32"`
- `src/components/game/sea-salt/SeaSaltCardReference.tsx` — 消费图标的速查 UI
- 图标通过 `DecisionTree` 的 flow 节点 `card-reference` 间接展示

## Goals / Non-Goals

**Goals:**
- 全部 19 个图标重绘为折纸纸艺风格
- 严格遵循艺术规范：白色纸张 + 淡彩阴影、几何多边形、折痕线、细黑轮廓、纯色填充
- 保持组件接口不变（同名导出、相同 Props）
- 每个图标 20–60 paths，统一描边宽度
- 居中构图，占画布 ~75%，系列比例一致

**Non-Goals:**
- 不更改 `SeaSaltCardReference.tsx` 的 UI 布局或逻辑
- 不添加动画或交互效果
- 不更改 viewBox 尺寸 (保持 32×32)
- 不引入外部图标库或图片资源

## Decisions

### 1. 原地重写 vs 新建文件

**选择**: 原地重写 `OrigamiIcons.tsx`

**理由**: 组件接口不变（props + 导出名），只是 SVG 内容替换。新建文件会增加不必要的迁移工作。消费方无需任何改动。

### 2. 颜色方案

**选择**: 白色纸张基底 + 单色淡彩阴影

每个图标使用：
- 主色：与卡牌对应的柔和色（如螃蟹用珊瑚色，鱼用海蓝色）
- 阴影：主色的深色变体（用于折痕和暗面）
- 高光：白色或接近白色
- 轮廓：统一的深灰色细线 (`#333` 或 `#2d2d2d`)

**理由**: 折纸风格的核心是用折痕和面的明暗变化来表现立体感，而非渐变或纹理。

### 3. 折痕线表现

**选择**: 使用虚线或低透明度细线表示折痕

- 主要折痕：`stroke-opacity="0.3"`, `stroke-width="0.5"`
- 折叠面之间的分界线用颜色深浅区分

### 4. 逐个图标重绘顺序

按 SECTIONS 定义的顺序重绘：
1. Duo Cards: Crab, Boat, Fish, Swimmer, Shark, Jellyfish, Lobster (7)
2. Collectors: Shell, Octopus, Penguin, Sailor (4)
3. Multipliers: Lighthouse, Shoal, Colony, Captain (4)
4. Special: Mermaid, Starfish, Seahorse, CrabArmy (4)

## Risks / Trade-offs

- **[路径数限制]** 20–60 paths 可能限制某些复杂图标（如 CrabArmy 三只螃蟹）的细节 → 通过简化几何形状和共用颜色面来控制路径数
- **[视觉一致性]** 19 个图标逐一重绘时风格可能漂移 → 先定义颜色 palette 常量和统一的描边/折痕参数，所有图标共用
- **[主观审美]** 折纸风格的具体表现因人而异 → 严格遵循用户提供的规范约束（无渐变、无纹理、几何多边形）
