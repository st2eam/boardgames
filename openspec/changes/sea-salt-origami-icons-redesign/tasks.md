## 1. 基础设施

- [x] 1.1 在 `OrigamiIcons.tsx` 顶部定义共用常量：统一描边颜色 (`OUTLINE`)、描边宽度 (`STROKE_W`)、折痕线透明度 (`CREASE_OPACITY`)、viewBox 尺寸 (`S`)

## 2. 配对牌 Duo Cards (7 icons)

- [x] 2.1 重绘 `CrabIcon` — 折纸螃蟹，几何多边形身体 + 折痕线 + 薄轮廓
- [x] 2.2 重绘 `BoatIcon` — 折纸小船，经典纸船造型 + 帆面折痕
- [x] 2.3 重绘 `FishIcon` — 折纸鱼，菱形身体 + 尾部三角 + 鳍折痕
- [x] 2.4 重绘 `SwimmerIcon` — 折纸游泳者，简化人形 + 水波折纸线
- [x] 2.5 重绘 `SharkIcon` — 折纸鲨鱼，流线三角体 + 背鳍折痕
- [x] 2.6 重绘 `JellyfishIcon` — 折纸水母（扩展），伞状 + 触手折痕
- [x] 2.7 重绘 `LobsterIcon` — 折纸龙虾（扩展），矩形分段身体 + 钳折痕

## 3. 收集牌 Collector Cards (4 icons)

- [x] 3.1 重绘 `ShellIcon` — 折纸贝壳，扇形折叠纹理
- [x] 3.2 重绘 `OctopusIcon` — 折纸章鱼，圆顶 + 几何触手
- [x] 3.3 重绘 `PenguinIcon` — 折纸企鹅，黑白菱形面
- [x] 3.4 重绘 `SailorIcon` — 折纸水手，三角帽 + 简化身体

## 4. 倍率卡 Multiplier Cards (4 icons)

- [x] 4.1 重绘 `LighthouseIcon` — 折纸灯塔，梯形塔身 + 条纹折面
- [x] 4.2 重绘 `ShoalIcon` — 折纸鱼群，三只小鱼几何排列
- [x] 4.3 重绘 `ColonyIcon` — 折纸企鹅群，三只企鹅简化排列
- [x] 4.4 重绘 `CaptainIcon` — 折纸船长，大帽 + 锚标 + 简化面部

## 5. 特殊牌 (4 icons)

- [x] 5.1 重绘 `MermaidIcon` — 折纸美人鱼，鱼尾 + 简化身体
- [x] 5.2 重绘 `StarfishIcon` — 折纸海星（扩展），五角星折痕
- [x] 5.3 重绘 `SeahorseIcon` — 折纸海马（扩展），卷尾 + 折痕分段
- [x] 5.4 重绘 `CrabArmyIcon` — 折纸螃蟹大军（扩展），三只几何螃蟹层叠

## 6. 验证

- [x] 6.1 确认全部 19 个组件导出名和 Props 接口不变
- [x] 6.2 运行 `npm run build` 确认编译通过
- [x] 6.3 视觉检查：所有图标在 SeaSaltCardReference 中渲染正常，风格统一
