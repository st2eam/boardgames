# The Game Shelf

> [English version](README-en.md)

[在线站点](https://st2eam.github.io/boardgames/) · 中英双语桌游规则参考站。桌边查规则、跟流程、少量记分/训练/对局，以及用站内规则问 AI。

当前规模（以 `content/games/` 为准）：**59** 款游戏（含扩展/变体）、**53** 决策树、**4** 记分器、**5** 训练器、**1** 番符计算器、**5** 款可在线对局。数量可用 `node scripts/print-project-stats.mjs` 核对。

## 能做什么

- **规则**：每款游戏中英 Markdown，首页按分类、标签、人数筛选；同系列堆叠展示。
- **决策树**：逐步跳转，带目录和返回。
- **记分器**：只做多人、跨回合累计（CABO、海盐折纸、牛头王、荒野之王），不做终局填数字。
- **训练 / 计算**：麻将听牌、21 点基本策略、德州扑克翻前、围棋死活；日麻番符计算。
- **在线对局（BBGE）**：情书、德州扑克、谁是牛头王、围棋、CABO（Host + 链接 / AI）。
- **AI 问答**：浏览器直连 DeepSeek，可查站内规则或网页搜索；Key 和历史存在本地。
- **离线**：PWA；规则和工具可离线，对话在离线时降级。

## 怎么跑

需要 Node.js >= 20。

```bash
npm install
npm run dev    # 本地预览
npm run build  # 静态导出到 out/
```

`main` 推送后由 [GitHub Actions](.github/workflows/deploy.yml) 发到 GitHub Pages（`/boardgames/`）。

## 技术与结构（概要）

纯静态站：Next.js App Router + `output: "export"`，无后端、无 API routes。样式是 Tailwind v4，token 在 [`src/app/globals.css`](src/app/globals.css)。

游戏正文在 `content/games/<slug>/`（`meta.json`、`en|zh/rules.md`，以及可选的 `flow` / `score` / `trainer` / `calculator` / `play`）。页面在 `src/app/[locale]/`，界面在 `src/features/`。构建时读文件生成 `public/data/`，不要手改生成物。

## 想改代码或加游戏

| 文档 | 用途 |
|------|------|
| [`docs/architecture.md`](docs/architecture.md) | 分层、数据流、红线 |
| [`docs/development-guide.md`](docs/development-guide.md) | 怎么改、禁止事项 |
| [`AGENTS.md`](AGENTS.md) | Agent 入口（先读哪份 skill） |
| [`.cursor/skills/add-game`](.cursor/skills/add-game/SKILL.md) | 加一款游戏 |
| [`docs/score-system.md`](docs/score-system.md) | 记分器准入（默认不做） |
| [`docs/games/`](docs/games/) | 在线对局设计 |
