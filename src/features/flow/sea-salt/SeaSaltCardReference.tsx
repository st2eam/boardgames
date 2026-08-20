"use client";

import {
  CrabIcon, BoatIcon, FishIcon, SwimmerIcon, SharkIcon,
  ShellIcon, OctopusIcon, PenguinIcon, SailorIcon,
  LighthouseIcon, ShoalIcon, ColonyIcon, CaptainIcon, MermaidIcon,
  JellyfishIcon, LobsterIcon, StarfishIcon, SeahorseIcon, CrabArmyIcon,
} from "./OrigamiIcons";
import { useState } from "react";

interface Props {
  locale: string;
}

const zh = (locale: string) => locale === "zh";

interface CardEntry {
  icon: React.ComponentType<{ className?: string }>;
  nameZh: string;
  nameEn: string;
  qty: string;
  descZh: string;
  descEn: string;
  expansion?: boolean;
}

interface CardSection {
  titleZh: string;
  titleEn: string;
  subtitleZh: string;
  subtitleEn: string;
  cards: CardEntry[];
}

const SECTIONS: CardSection[] = [
  {
    titleZh: "配对牌",
    titleEn: "Duo Cards",
    subtitleZh: "每组配对 1 分，打出到面前触发效果",
    subtitleEn: "1 point per pair, play face-up to trigger effect",
    cards: [
      {
        icon: CrabIcon, nameZh: "螃蟹", nameEn: "Crab", qty: "×9",
        descZh: "自由浏览一个弃牌堆，选取任意 1 张",
        descEn: "Browse one discard pile freely, take any 1 card",
      },
      {
        icon: BoatIcon, nameZh: "小船", nameEn: "Boat", qty: "×8",
        descZh: "立即再进行一个回合",
        descEn: "Take another turn immediately",
      },
      {
        icon: FishIcon, nameZh: "鱼", nameEn: "Fish", qty: "×7",
        descZh: "从牌堆顶抽 1 张加入手牌",
        descEn: "Draw 1 card from the top of the deck",
      },
      {
        icon: SwimmerIcon, nameZh: "游泳者", nameEn: "Swimmer", qty: "×5",
        descZh: "与鲨鱼配对：从另一位玩家手中随机偷取 1 张",
        descEn: "Pairs with Shark: steal 1 random card from another player",
      },
      {
        icon: SharkIcon, nameZh: "鲨鱼", nameEn: "Shark", qty: "×5",
        descZh: "与游泳者配对：从另一位玩家手中随机偷取 1 张",
        descEn: "Pairs with Swimmer: steal 1 random card from another player",
      },
      {
        icon: JellyfishIcon, nameZh: "水母", nameEn: "Jellyfish", qty: "×2",
        descZh: "与泳客配对：对手下回合只能抽 1 张，不可打牌或宣告",
        descEn: "Pairs with Swimmer: opponents' next turn — draw 1 only, no plays, no declaring",
        expansion: true,
      },
      {
        icon: LobsterIcon, nameZh: "龙虾", nameEn: "Lobster", qty: "×1",
        descZh: "与螃蟹配对：从牌堆翻 5 张选 1 张，余下放回洗混",
        descEn: "Pairs with Crab: reveal top 5 from deck, keep 1, shuffle rest back",
        expansion: true,
      },
    ],
  },
  {
    titleZh: "收集牌",
    titleEn: "Collector Cards",
    subtitleZh: "按持有数量累进计分",
    subtitleEn: "Points increase with quantity collected",
    cards: [
      {
        icon: ShellIcon, nameZh: "贝壳", nameEn: "Shell", qty: "×6",
        descZh: "1/2/3/4/5/6 张 → 0/2/4/6/8/10 分",
        descEn: "1/2/3/4/5/6 → 0/2/4/6/8/10 pts",
      },
      {
        icon: OctopusIcon, nameZh: "章鱼", nameEn: "Octopus", qty: "×5",
        descZh: "1/2/3/4/5 张 → 0/3/6/9/12 分",
        descEn: "1/2/3/4/5 → 0/3/6/9/12 pts",
      },
      {
        icon: PenguinIcon, nameZh: "企鹅", nameEn: "Penguin", qty: "×3",
        descZh: "1/2/3 张 → 1/3/5 分",
        descEn: "1/2/3 → 1/3/5 pts",
      },
      {
        icon: SailorIcon, nameZh: "水手", nameEn: "Sailor", qty: "×2",
        descZh: "1/2 张 → 0/5 分",
        descEn: "1/2 → 0/5 pts",
      },
    ],
  },
  {
    titleZh: "倍率卡",
    titleEn: "Multiplier Cards",
    subtitleZh: "各 1 张，根据对应卡牌数量加分",
    subtitleEn: "1 of each, bonus based on matching cards",
    cards: [
      {
        icon: LighthouseIcon, nameZh: "灯塔", nameEn: "Lighthouse", qty: "×1",
        descZh: "每张小船 +1 分",
        descEn: "+1 per Boat card",
      },
      {
        icon: ShoalIcon, nameZh: "鱼群", nameEn: "Shoal of Fish", qty: "×1",
        descZh: "每张鱼 +1 分",
        descEn: "+1 per Fish card",
      },
      {
        icon: ColonyIcon, nameZh: "企鹅群", nameEn: "Penguin Colony", qty: "×1",
        descZh: "每张企鹅 +2 分",
        descEn: "+2 per Penguin card",
      },
      {
        icon: CaptainIcon, nameZh: "船长", nameEn: "Captain", qty: "×1",
        descZh: "每张水手 +3 分",
        descEn: "+3 per Sailor card",
      },
    ],
  },
  {
    titleZh: "美人鱼",
    titleEn: "Mermaid",
    subtitleZh: "共 4 张，集齐立即获胜",
    subtitleEn: "4 in deck — collect all 4 to win instantly",
    cards: [
      {
        icon: MermaidIcon, nameZh: "美人鱼", nameEn: "Mermaid", qty: "×4",
        descZh: "每张 = 你最多的颜色牌数（多张用不同颜色）。本身算白色。",
        descEn: "Each = count of your most abundant color (use different colors). Counts as white.",
      },
    ],
  },
  {
    titleZh: "扩展特殊牌",
    titleEn: "Expansion Specials",
    subtitleZh: "盐趣倍增 · 不可配对打出",
    subtitleEn: "Extra Salt · Cannot be played as Duo pairs",
    cards: [
      {
        icon: StarfishIcon, nameZh: "海星", nameEn: "Starfish", qty: "×3",
        descZh: "与一组配对一起打出形成三条，总计 3 分，但取消配对效果",
        descEn: "Play with a Duo pair to form a trio: 3 pts total, but cancels Duo effect",
        expansion: true,
      },
      {
        icon: SeahorseIcon, nameZh: "海马", nameEn: "Seahorse", qty: "×1",
        descZh: "替代一张缺失的收集牌，需已持有该类至少 1 张，不超过最高分",
        descEn: "Replace a missing Collector card; must own ≥1 of that type; can't exceed max",
        expansion: true,
      },
      {
        icon: CrabArmyIcon, nameZh: "螃蟹大军", nameEn: "Crab Army", qty: "×1",
        descZh: "你拥有的每张螃蟹牌 +1 分（此牌本身不算螃蟹）",
        descEn: "+1 point per Crab card you have (this card itself is NOT a Crab)",
        expansion: true,
      },
    ],
  },
];

export function SeaSaltCardReference({ locale }: Props) {
  const isZh = zh(locale);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="mt-6 rounded-xl border border-border bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left"
      >
        <h2 className="font-heading text-lg font-bold text-primary-dark">
          {isZh ? "卡牌效果速查" : "Card Effect Reference"}
        </h2>
        <svg
          className={`h-5 w-5 text-stone-400 transition-transform ${collapsed ? "" : "rotate-180"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="space-y-6 px-6 pb-6">
          {SECTIONS.map((section) => (
            <div key={section.titleEn}>
              <div className="mb-3 border-b border-stone-100 pb-2">
                <h3 className="text-sm font-semibold text-stone-800">
                  {isZh ? section.titleZh : section.titleEn}
                </h3>
                <p className="text-xs text-stone-400">
                  {isZh ? section.subtitleZh : section.subtitleEn}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {section.cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.nameEn}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        card.expansion
                          ? "border-violet-200 bg-violet-50/30"
                          : "border-stone-100 bg-stone-50/30"
                      }`}
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        card.expansion ? "bg-violet-100" : "bg-white"
                      }`}>
                        <Icon className="h-8 w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-stone-800">
                            {isZh ? card.nameZh : card.nameEn}
                          </span>
                          <span className="text-xs text-stone-400">{card.qty}</span>
                          {card.expansion && (
                            <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-600">
                              {isZh ? "扩展" : "EXP"}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                          {isZh ? card.descZh : card.descEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
