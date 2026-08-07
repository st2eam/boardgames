"use client";

import { useMemo, useState } from "react";
import type { LoveLetterAction } from "../state";
import { PlayingCard } from "@bbge/ui";

type CardV = { id: string; rank: number; name?: { en: string; zh: string } };
type View = {
  phase: string;
  winners: string[];
  currentPlayerId: string;
  deckCount: number;
  faceUp: CardV[];
  pending: {
    type: string;
    playerId: string;
    held?: CardV[];
  } | null;
  you: {
    id: string;
    hand: CardV[];
    eliminated: boolean;
    protected: boolean;
  } | null;
  others: {
    id: string;
    name: string;
    handCount: number;
    discarded: CardV[];
    eliminated: boolean;
    protected: boolean;
  }[];
};

interface Props {
  locale: string;
  view: unknown;
  myId: string;
  hotseat: boolean;
  disabled?: boolean;
  thinkingId?: string | null;
  onAction: (action: LoveLetterAction) => void;
}

function cardName(c: CardV, locale: string) {
  return c.name?.[locale === "zh" ? "zh" : "en"] ?? String(c.rank);
}

function SeatOrb({
  name,
  active,
  eliminated,
  protected: isProtected,
  thinking,
  selected,
  disabled,
  onClick,
  children,
}: {
  name: string;
  active?: boolean;
  eliminated?: boolean;
  protected?: boolean;
  thinking?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled || !onClick}
      onClick={onClick}
      className={[
        "group relative flex w-[7.5rem] flex-col items-center gap-2 rounded-2xl p-2 transition-all duration-200",
        onClick && !disabled ? "cursor-pointer" : "cursor-default",
        selected ? "bg-accent/20 ring-2 ring-accent" : "bg-black/10 hover:bg-black/15",
        eliminated ? "opacity-35 grayscale" : "",
        active ? "ring-2 ring-amber-300/80 shadow-[0_0_24px_rgba(196,149,42,0.35)]" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex h-12 w-12 items-center justify-center rounded-full border-2 font-heading text-sm font-bold text-white shadow-md",
          thinking
            ? "animate-pulse border-amber-300 bg-amber-600"
            : active
              ? "border-amber-200 bg-primary"
              : "border-white/30 bg-primary-dark/80",
        ].join(" ")}
      >
        {name.slice(0, 1).toUpperCase()}
      </div>
      <div className="w-full truncate text-center font-heading text-xs font-semibold text-amber-50">
        {name}
      </div>
      {isProtected && (
        <span className="absolute -top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-white shadow" title="protected">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
          </svg>
        </span>
      )}
      {thinking && (
        <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5 rounded-full bg-amber-100 px-2 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-700" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-700 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-700 [animation-delay:300ms]" />
        </span>
      )}
      <div className="flex min-h-[5.5rem] items-end justify-center gap-1">{children}</div>
    </button>
  );
}

export function LoveLetterTable({
  locale,
  view: viewUnknown,
  myId,
  hotseat,
  disabled,
  thinkingId,
  onAction,
}: Props) {
  const view = viewUnknown as View;
  const zh = locale === "zh";
  const [selected, setSelected] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [guessRank, setGuessRank] = useState(9);

  const actorId = hotseat ? view.currentPlayerId : myId;
  const isMyTurn = view.currentPlayerId === actorId && view.phase === "playing";
  const hand = view.you?.hand ?? [];

  const needsTarget = useMemo(() => {
    const c = hand.find((x) => x.id === selected);
    return Boolean(c && [1, 2, 3, 5, 7].includes(c.rank));
  }, [hand, selected]);

  if (view.phase === "finished") {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-amber-900/20 bg-linear-to-br from-primary via-primary-dark to-[#2a1814] px-6 py-16 text-center shadow-dialog">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 50% 30%, #C4952A, transparent 55%)",
        }} />
        <p className="font-heading text-3xl font-bold text-amber-50">
          {zh ? "本局结束" : "Round over"}
        </p>
        <p className="mt-3 font-heading text-xl text-accent">
          {zh ? "胜者" : "Winner"} · {view.winners.join(" · ")}
        </p>
      </div>
    );
  }

  if (view.pending?.type === "chancellor" && view.pending.playerId === actorId) {
    const held = view.pending.held ?? [];
    return (
      <div className="rounded-3xl border border-border bg-linear-to-b from-surface to-white p-6 shadow-card">
        <p className="mb-4 font-heading text-lg font-bold text-primary-dark">
          {zh ? "大臣：点选要保留的牌" : "Chancellor: tap the card to keep"}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {held.map((c) => (
            <PlayingCard
              key={c.id}
              rank={c.rank}
              name={cardName(c, locale)}
              size="lg"
              disabled={disabled}
              onClick={() => {
                const rest = held.filter((x) => x.id !== c.id);
                if (rest.length < 2) return;
                onAction({
                  type: "resolveChancellor",
                  playerId: actorId,
                  payload: {
                    keepCardId: c.id,
                    bottomOrderIds: [rest[0]!.id, rest[1]!.id],
                  },
                });
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Felt table */}
      <div
        className="relative overflow-hidden rounded-[2rem] border-4 border-[#3E2723] px-3 py-6 shadow-dialog sm:px-6 sm:py-8"
        style={{
          background:
            "radial-gradient(ellipse at center, #2E7D32 0%, #1B5E20 55%, #0D3B12 100%)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* Opponents around top */}
        <div className="relative z-10 flex flex-wrap items-start justify-center gap-3 sm:gap-4">
          {view.others.map((o) => (
            <SeatOrb
              key={o.id}
              name={o.name}
              active={view.currentPlayerId === o.id}
              eliminated={o.eliminated}
              protected={o.protected}
              thinking={thinkingId === o.id}
              selected={targetId === o.id}
              disabled={!needsTarget || o.eliminated || o.protected || disabled}
              onClick={
                needsTarget && !o.eliminated && !o.protected
                  ? () => setTargetId(o.id)
                  : undefined
              }
            >
              {Array.from({ length: Math.min(o.handCount, 2) }).map((_, i) => (
                <PlayingCard key={i} faceDown size="sm" />
              ))}
            </SeatOrb>
          ))}
        </div>

        {/* Center: deck + face-up */}
        <div className="relative z-10 my-6 flex flex-col items-center gap-3">
          <div className="flex items-end gap-3">
            <div className="relative">
              <PlayingCard faceDown size="md" className="translate-x-1 translate-y-1 opacity-70" />
              <PlayingCard faceDown size="md" className="absolute inset-0" />
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/40 px-2 py-0.5 font-heading text-[10px] font-semibold text-amber-50">
                {zh ? "牌堆" : "Deck"} {view.deckCount}
              </span>
            </div>
            {view.faceUp.length > 0 && (
              <div className="flex gap-1.5">
                {view.faceUp.map((c) => (
                  <PlayingCard
                    key={c.id}
                    rank={c.rank}
                    name={cardName(c, locale)}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </div>
          <p className="mt-4 font-heading text-sm font-semibold text-amber-100/90">
            {isMyTurn
              ? zh
                ? "轮到你了 — 选出一张牌"
                : "Your turn — choose a card"
              : zh
                ? `等待 ${view.currentPlayerId}`
                : `Waiting for ${view.currentPlayerId}`}
          </p>
        </div>

        {/* Self target for Prince */}
        {needsTarget && hand.find((c) => c.id === selected)?.rank === 5 && (
          <div className="relative z-10 mb-2 flex justify-center">
            <button
              type="button"
              onClick={() => setTargetId(actorId)}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-heading text-xs font-bold transition-colors duration-200 ${
                targetId === actorId
                  ? "bg-accent text-white"
                  : "bg-white/20 text-amber-50 hover:bg-white/30"
              }`}
            >
              {zh ? "目标：自己" : "Target: self"}
            </button>
          </div>
        )}
      </div>

      {/* Hand tray */}
      <div className="rounded-3xl border border-border bg-white p-4 shadow-card sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-heading text-base font-bold text-primary-dark">
            {zh ? "你的手牌" : "Your hand"}
            {hotseat ? (
              <span className="ml-2 text-sm font-medium text-accent">
                · {actorId}
              </span>
            ) : null}
          </h3>
          {view.you?.protected && (
            <span className="rounded-full bg-pink-100 px-2.5 py-1 text-xs font-semibold text-pink-800">
              {zh ? "侍女保护中" : "Handmaid protected"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {hand.map((c) => (
            <PlayingCard
              key={c.id}
              rank={c.rank}
              name={cardName(c, locale)}
              size="lg"
              selected={selected === c.id}
              disabled={disabled || !isMyTurn}
              onClick={() => setSelected(c.id)}
            />
          ))}
        </div>

        {selected && hand.find((c) => c.id === selected)?.rank === 1 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-stone-600">
              {zh ? "猜测角色" : "Guess"}
            </span>
            {[0, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setGuessRank(r)}
                className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-heading text-sm font-bold transition-colors duration-200 ${
                  guessRank === r
                    ? "bg-accent text-white"
                    : "bg-primary-light text-primary-dark hover:bg-border"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            disabled={
              disabled ||
              !isMyTurn ||
              !selected ||
              (needsTarget && !targetId)
            }
            onClick={() => {
              if (!selected) return;
              onAction({
                type: "playCard",
                playerId: actorId,
                payload: {
                  cardId: selected,
                  targetId: targetId ?? undefined,
                  guessRank:
                    hand.find((c) => c.id === selected)?.rank === 1
                      ? guessRank
                      : undefined,
                },
              });
              setSelected(null);
              setTargetId(null);
            }}
            className="cursor-pointer rounded-2xl bg-accent px-8 py-3 font-heading text-base font-bold text-white shadow-card transition-colors duration-200 hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {zh ? "打出此牌" : "Play card"}
          </button>
        </div>
      </div>
    </div>
  );
}
