import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const gamesDir = path.join(ROOT, "content", "games");
const index = JSON.parse(
  fs.readFileSync(path.join(gamesDir, "index.json"), "utf-8")
);

function enTemplate(name) {
  return `# ${name} Rules

## Overview

${name} is a board game. Detailed rules will be added soon.

## Components

- Game components list coming soon

## Setup

Setup instructions coming soon.

## How to Play

Gameplay instructions coming soon.

## Scoring / Winning

Victory conditions coming soon.
`;
}

function zhTemplate(name) {
  return `# ${name} 规则

## 游戏概述

${name} 是一款桌游。详细规则即将补充。

## 游戏组件

- 组件列表即将补充

## 游戏准备

准备步骤即将补充。

## 游戏流程

玩法说明即将补充。

## 计分 / 胜利条件

胜利条件即将补充。
`;
}

for (const slug of index) {
  const meta = JSON.parse(
    fs.readFileSync(path.join(gamesDir, slug, "meta.json"), "utf-8")
  );

  const enPath = path.join(gamesDir, slug, "en", "rules.md");
  if (!fs.existsSync(enPath)) {
    fs.writeFileSync(enPath, enTemplate(meta.name.en));
  }

  const zhPath = path.join(gamesDir, slug, "zh", "rules.md");
  if (!fs.existsSync(zhPath)) {
    fs.writeFileSync(zhPath, zhTemplate(meta.name.zh));
  }
}

console.log(`Placeholder rules created/verified for ${index.length} games`);
