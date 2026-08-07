"use client";

import { cardBackUrl } from "../cardArt";
import type { ArenaView } from "../types";
import { DiscardStrip } from "./DiscardStrip";
import { SpeechBubble } from "./SpeechBubble";

type DiscCard = {
  id: string;
  rank: number;
  role?: string;
  name?: { en: string; zh: string };
};

export type SeatBubble = {
  id: string;
  text: string;
};

interface Props {
  locale: string;
  view: ArenaView;
  actorId: string;
  selectedTargetIds: string[];
  thinkingId?: string | null;
  targetMode: boolean;
  /** Active speech bubbles keyed by seat id */
  bubbles?: Record<string, SeatBubble>;
  /** stack = desktop list; rail = mobile horizontal scroll */
  variant?: "stack" | "rail";
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
  revealedRank,
  bubble,
  rail,
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
  /** Final-hand reveal at round end */
  revealedRank?: number;
  bubble?: SeatBubble | null;
  rail?: boolean;
  onSelect: () => void;
  onZoomDiscard?: (card: DiscCard, ownerName: string) => void;
}) {
  const zh = locale === "zh";
  const clickable = targetMode && !eliminated && !you;

  return (
    <div
      className={[
        "rounded-lg border px-2 py-1.5 text-left transition-all duration-200",
        rail ? "w-[9.5rem] shrink-0" : "w-full",
        eliminated
          ? "border-stone-200 bg-stone-100 opacity-55"
          : selected
            ? "border-accent bg-amber-50 shadow-md ring-2 ring-accent/40"
            : active
              ? "border-accent/70 bg-white shadow-sm"
              : "border-border bg-white/90",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          disabled={!clickable}
          onClick={onSelect}
          className={[
            "flex min-w-0 flex-1 items-start gap-2 text-left",
            clickable ? "cursor-pointer" : "cursor-default",
          ].join(" ")}
        >
          <div
            className={[
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold text-white",
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
            <div className="flex items-center gap-1">
              <p className="truncate font-heading text-[13px] font-bold text-primary-dark">
                {name}
              </p>
              {you && (
                <span className="shrink-0 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold text-primary">
                  {zh ? "你" : "You"}
                </span>
              )}
            </div>
            <p className="truncate text-[10px] text-stone-500">
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
                  ? " · 侍女"
                  : " · Prot."
                : ""}
            </p>
            {seenRank !== undefined && !eliminated && revealedRank === undefined && (
              <p className="text-[10px] font-semibold text-violet-700">
                {zh ? `偷看：${seenRank}` : `Peeked: ${seenRank}`}
              </p>
            )}
            {revealedRank !== undefined && !eliminated && (
              <p className="text-[10px] font-semibold text-amber-800">
                {zh ? `终局：${revealedRank}` : `Final: ${revealedRank}`}
              </p>
            )}
          </div>
          <div className="mt-0.5 flex -space-x-1.5">
            {revealedRank !== undefined && !eliminated ? (
              <span className="flex h-7 min-w-5 items-center justify-center rounded border border-amber-400 bg-amber-50 px-1 font-heading text-[11px] font-bold text-amber-900 shadow-sm">
                {revealedRank}
              </span>
            ) : (
              Array.from({ length: Math.min(handCount, 2) }).map((_, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${id}-h-${i}`}
                  src={cardBackUrl()}
                  alt=""
                  className="h-7 w-4 rounded border border-[#3E2723]/40 object-cover shadow-sm"
                />
              ))
            )}
          </div>
        </button>
        {bubble ? (
          <div className="shrink-0 pt-0.5">
            <SpeechBubble text={bubble.text} bubbleKey={bubble.id} />
          </div>
        ) : null}
      </div>

      {!rail && (
        <div className="mt-1.5 border-t border-border/60 pt-1.5">
          <DiscardStrip
            locale={locale}
            cards={discarded}
            compact
            onZoom={
              onZoomDiscard ? (c) => onZoomDiscard(c, name) : undefined
            }
          />
        </div>
      )}
      {rail && discarded.length > 0 && (
        <p className="mt-1 truncate text-[9px] text-stone-400">
          {zh ? `弃 ${discarded.map((c) => c.rank).join("·")}` : `disc ${discarded.map((c) => c.rank).join("·")}`}
        </p>
      )}

      {clickable && (
        <p className="mt-1 text-[9px] font-semibold text-accent">
          {selected
            ? zh
              ? "✓ 已选为目标"
              : "✓ Targeted"
            : zh
              ? "点选为目标"
              : "Tap to target"}
        </p>
      )}
    </div>
  );
}

export function PlayerPanels({
  locale,
  view,
  actorId,
  selectedTargetIds,
  thinkingId,
  targetMode,
  bubbles = {},
  variant = "stack",
  onSelectTarget,
  onZoomDiscard,
}: Props) {
  const zh = locale === "zh";
  const you = view.you;
  const rail = variant === "rail";

  return (
    <div className={rail ? "flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "space-y-1.5"}>
      {!rail && (
        <p className="px-0.5 font-heading text-[11px] font-bold uppercase tracking-wide text-stone-500">
          {zh ? "玩家" : "Players"}
        </p>
      )}
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
          revealedRank={
            view.phase === "finished" && !you.eliminated
              ? you.hand[0]?.rank
              : undefined
          }
          bubble={bubbles[you.id]}
          rail={rail}
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
          selected={selectedTargetIds.includes(o.id)}
          targetMode={targetMode}
          seenRank={view.you?.seen?.[o.id]}
          revealedRank={
            view.phase === "finished" && !o.eliminated
              ? o.hand?.[0]?.rank
              : undefined
          }
          bubble={bubbles[o.id]}
          rail={rail}
          onSelect={() => onSelectTarget(o.id)}
          onZoomDiscard={onZoomDiscard}
        />
      ))}
    </div>
  );
}
