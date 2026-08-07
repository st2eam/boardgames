"use client";

import { cardBackUrl } from "../cardArt";
import type { ArenaView } from "../types";
import { DiscardStrip } from "./DiscardStrip";

type DiscCard = {
  id: string;
  rank: number;
  name?: { en: string; zh: string };
};

interface Props {
  locale: string;
  view: ArenaView;
  actorId: string;
  selectedTargetId: string | null;
  thinkingId?: string | null;
  targetMode: boolean;
  onSelectTarget: (id: string) => void;
  onZoomDiscard?: (card: DiscCard, ownerName: string) => void;
}

function Panel({
  locale,
  id,
  name,
  you,
  handCount,
  discarded,
  eliminated,
  protected: isProtected,
  active,
  thinking,
  selected,
  targetMode,
  seenRank,
  onSelect,
  onZoomDiscard,
}: {
  locale: string;
  id: string;
  name: string;
  you?: boolean;
  handCount: number;
  discarded: DiscCard[];
  eliminated: boolean;
  protected: boolean;
  active: boolean;
  thinking: boolean;
  selected: boolean;
  targetMode: boolean;
  seenRank?: number;
  onSelect: () => void;
  onZoomDiscard?: (card: DiscCard, ownerName: string) => void;
}) {
  const zh = locale === "zh";
  const clickable = targetMode && !eliminated && !you;

  return (
    <div
      className={[
        "w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
        eliminated
          ? "border-stone-200 bg-stone-100 opacity-55"
          : selected
            ? "border-accent bg-amber-50 shadow-md ring-2 ring-accent/40"
            : active
              ? "border-accent/70 bg-white shadow-sm"
              : "border-border bg-white/90",
      ].join(" ")}
    >
      <button
        type="button"
        disabled={!clickable}
        onClick={onSelect}
        className={[
          "flex w-full items-center gap-2.5 text-left",
          clickable ? "cursor-pointer" : "cursor-default",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white",
            eliminated
              ? "bg-stone-400"
              : you
                ? "bg-primary"
                : "bg-linear-to-br from-[#6D4C41] to-[#3E2723]",
            thinking ? "ring-2 ring-sky-400 ring-offset-1 animate-pulse" : "",
            active && !eliminated ? "ring-2 ring-accent ring-offset-1" : "",
          ].join(" ")}
        >
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-heading text-sm font-bold text-primary-dark">
              {name}
            </p>
            {you && (
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {zh ? "你" : "You"}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-stone-500">
            {eliminated
              ? zh
                ? "已出局"
                : "Eliminated"
              : thinking
                ? zh
                  ? "思考中…"
                  : "Thinking…"
                : active
                  ? zh
                    ? "行动中"
                    : "Active"
                  : zh
                    ? "等待"
                    : "Waiting"}
            {isProtected && !eliminated
              ? zh
                ? " · 侍女保护"
                : " · Protected"
              : ""}
          </p>
          {seenRank !== undefined && !eliminated && (
            <p className="mt-0.5 text-[11px] font-semibold text-violet-700">
              {zh ? `偷看过：${seenRank}` : `Peeked: ${seenRank}`}
            </p>
          )}
        </div>
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(handCount, 2) }).map((_, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${id}-h-${i}`}
              src={cardBackUrl()}
              alt=""
              className="h-8 w-5 rounded border border-[#3E2723]/40 object-cover shadow-sm"
            />
          ))}
        </div>
      </button>

      <div className="mt-2 border-t border-border/70 pt-2">
        <div className="mb-1 flex items-center justify-between">
          <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-stone-500">
            {zh ? "出牌记录" : "Discards"}
          </p>
          <span className="text-[10px] text-stone-400">{discarded.length}</span>
        </div>
        <DiscardStrip
          locale={locale}
          cards={discarded}
          compact
          onZoom={
            onZoomDiscard
              ? (c) => onZoomDiscard(c, name)
              : undefined
          }
        />
      </div>

      {clickable && (
        <p className="mt-1.5 text-[10px] font-semibold text-accent">
          {selected
            ? zh
              ? "✓ 已选为目标"
              : "✓ Targeted"
            : zh
              ? "点击头像选择为目标"
              : "Click avatar to target"}
        </p>
      )}
    </div>
  );
}

export function PlayerPanels({
  locale,
  view,
  actorId,
  selectedTargetId,
  thinkingId,
  targetMode,
  onSelectTarget,
  onZoomDiscard,
}: Props) {
  const zh = locale === "zh";
  const you = view.you;

  return (
    <div className="space-y-2">
      <p className="px-0.5 font-heading text-xs font-bold uppercase tracking-wide text-stone-500">
        {zh ? "玩家" : "Players"}
      </p>
      {you && (
        <Panel
          locale={locale}
          id={you.id}
          name={zh ? "你" : "You"}
          you
          handCount={you.hand.length}
          discarded={view.selfDiscarded ?? []}
          eliminated={you.eliminated}
          protected={you.protected}
          active={view.currentPlayerId === actorId}
          thinking={thinkingId === actorId}
          selected={false}
          targetMode={false}
          onSelect={() => {}}
          onZoomDiscard={onZoomDiscard}
        />
      )}
      {view.others.map((o) => (
        <Panel
          key={o.id}
          locale={locale}
          id={o.id}
          name={o.name}
          handCount={o.handCount}
          discarded={o.discarded}
          eliminated={o.eliminated}
          protected={o.protected}
          active={view.currentPlayerId === o.id}
          thinking={thinkingId === o.id}
          selected={selectedTargetId === o.id}
          targetMode={targetMode}
          seenRank={view.you?.seen?.[o.id]}
          onSelect={() => onSelectTarget(o.id)}
          onZoomDiscard={onZoomDiscard}
        />
      ))}
    </div>
  );
}
