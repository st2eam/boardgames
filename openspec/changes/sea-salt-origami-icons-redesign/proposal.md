## Why

当前 Sea Salt & Paper 的 SVG 图标使用了简化的手绘风格，但与游戏中实际的折纸美术风格相差较大。游戏的核心视觉特色是 **折纸纸艺 (origami)** — 单色纸张折叠成的海洋生物，带有清晰的折痕线和几何多边形。需要按照严格的艺术规范重新绘制所有图标，使其更贴近实体卡牌的视觉体验。

## What Changes

- 重新绘制 `OrigamiIcons.tsx` 中全部 19 个 SVG 图标组件
- 统一遵循折纸纸艺风格规范：
  - 白色纸张 + 淡彩阴影（pastel shadows）
  - 清晰的几何多边形和折痕线
  - 细黑轮廓线
  - 纯色填充，无渐变、无纹理
  - 友好卡通外观
- SVG 技术要求：每个图标 20–60 路径，统一描边宽度，无文字/边框/装饰
- 所有图标保持居中构图，占画布 ~75%，全系列比例一致

## Capabilities

### New Capabilities

- `origami-icon-style-guide`: 折纸图标的艺术规范定义 — 颜色、折痕、轮廓、构图约束

### Modified Capabilities

_(无现有 spec 需要修改)_

## Impact

- `src/components/game/sea-salt/OrigamiIcons.tsx` — 全部 19 个导出组件需重写 SVG 内容
- `SeaSaltCardReference.tsx` — 无需改动（仅消费图标组件）
- `DecisionTree.tsx` — 无需改动（通过 SeaSaltCardReference 间接使用）
- 无新增依赖，无 API 变更
