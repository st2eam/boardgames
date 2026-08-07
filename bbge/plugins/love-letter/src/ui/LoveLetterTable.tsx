"use client";

import { useMemo, useState } from "react";
import type { LoveLetterAction } from "../state";
import type { ArenaView } from "./types";
import { cardLabel } from "./cardArt";
import { CardTile } from "./bga/CardTile";
import { CardLightbox } from "./bga/CardLightbox";
import { PriestRevealModal } from "./bga/PriestRevealModal";
import { StatusBar } from "./bga/StatusBar";
import { PlayerPanels } from "./bga/PlayerPanels";
import type { AiChatMessage } from "@bbge/runtime";

type ZoomCard = {
  rank: number;
  name?: { en: string; zh: string };
  subtitle?: string;
};

type LogLine = { id: string; text: string; tone?: "info" | "warn" | "win" };

interface Props {
  locale: string;
  view: unknown;
  myId: string;
  hotseat: boolean;
  disabled?: boolean;
  thinkingId?: string | null;
  onAction: (action: LoveLetterAction) => void;
  playLog?: LogLine[];
  chat?: AiChatMessage[];
  onChat?: (text: string) => void;
  nameOf?: (id: string) => string;
}

export function LoveLetterTable({
  locale,
  view: viewUnknown,
  myId,
  hotseat,
  disabled,
  thinkingId,
  onAction,
  playLog = [],
  chat = [],
  onChat,
  nameOf,
}: Props) {
  const view = viewUnknown as ArenaView;
  const zh = locale === "zh";
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [guessRank, setGuessRank] = useState(9);
  const [chatText, setChatText] = useState("");
  const [zoom, setZoom] = useState<ZoomCard | null>(null);

  const actorId = hotseat ? view.currentPlayerId : myId;
  const priestPending =
    view.pending?.type === "priestReveal" ? view.pending : null;
  const myPriestReveal =
    priestPending &&
    priestPending.playerId === actorId &&
    priestPending.rank !== undefined;

  const isMyTurn =
    view.currentPlayerId === actorId && view.phase === "playing";
  const interactive = Boolean(
    isMyTurn && !disabled && !priestPending && view.pending?.type !== "chancellor",
  );

  const selected = useMemo(() => {
    if (!selectedCardId) return null;
    const held =
      view.pending?.type === "chancellor" ? view.pending.held : undefined;
    return (
      view.you?.hand.find((c) => c.id === selectedCardId) ??
      held?.find((c) => c.id === selectedCardId) ??
      null
    );
  }, [selectedCardId, view.you?.hand, view.pending]);

  const needsTarget =
    selected != null && [1, 2, 3, 5, 7].includes(selected.rank);
  const needsGuess = selected?.rank === 1;
  const canPlay =
    interactive &&
    selectedCardId &&
    (!needsTarget || selectedTargetId);

  const status = useMemo(() => {
    if (view.phase === "finished") {
      return {
        tone: "done" as const,
        text: zh
          ? `本局结束 · 胜者 ${view.winners.map((id) => nameOf?.(id) ?? id).join("、")}`
          : `Round over · ${view.winners.map((id) => nameOf?.(id) ?? id).join(", ")}`,
      };
    }
    if (priestPending) {
      if (myPriestReveal) {
        return {
          tone: "you" as const,
          text: zh
            ? "神父：查看偷看结果，确认后回合继续"
            : "Priest: review the peeked card, then confirm",
        };
      }
      return {
        tone: "wait" as const,
        text: zh
          ? `等待 ${nameOf?.(priestPending.playerId) ?? priestPending.playerId} 确认偷看…`
          : `Waiting for ${nameOf?.(priestPending.playerId) ?? priestPending.playerId} to finish peeking…`,
      };
    }
    if (view.pending?.type === "chancellor" && view.pending.playerId === actorId) {
      return {
        tone: "you" as const,
        text: zh
          ? "大臣：点击中央一张牌保留，其余沉入牌堆底"
          : "Chancellor: click a center card to keep",
      };
    }
    if (thinkingId) {
      return {
        tone: "wait" as const,
        text: zh
          ? `${nameOf?.(thinkingId) ?? thinkingId} 正在思考…`
          : `${nameOf?.(thinkingId) ?? thinkingId} is thinking…`,
      };
    }
    if (!isMyTurn) {
      return {
        tone: "wait" as const,
        text: zh
          ? `等待 ${nameOf?.(view.currentPlayerId) ?? view.currentPlayerId} 行动`
          : `Waiting for ${nameOf?.(view.currentPlayerId) ?? view.currentPlayerId}`,
      };
    }
    if (!selectedCardId) {
      return {
        tone: "you" as const,
        text: zh ? "轮到你了：点击手牌选择要打出的牌" : "Your turn: click a card in your hand",
      };
    }
    if (needsTarget && !selectedTargetId) {
      return {
        tone: "you" as const,
        text: zh
          ? `已选「${cardLabel(selected!, locale)}」— 点击右侧玩家作为目标`
          : `Selected ${cardLabel(selected!, locale)} — click a player panel to target`,
      };
    }
    if (needsGuess) {
      return {
        tone: "you" as const,
        text: zh
          ? `守卫：选择猜测的点数，然后打出`
          : `Guard: pick a guess rank, then play`,
      };
    }
    return {
      tone: "you" as const,
      text: zh ? "确认无误后点击「打出」" : "Confirm, then press Play",
    };
  }, [
    view,
    actorId,
    thinkingId,
    isMyTurn,
    selectedCardId,
    selectedTargetId,
    needsTarget,
    needsGuess,
    selected,
    locale,
    zh,
    nameOf,
    priestPending,
    myPriestReveal,
  ]);

  const playCard = () => {
    if (!selectedCardId || !canPlay) return;
    onAction({
      type: "playCard",
      playerId: actorId,
      payload: {
        cardId: selectedCardId,
        targetId: selectedTargetId ?? undefined,
        guessRank: needsGuess ? guessRank : undefined,
      },
    });
    setSelectedCardId(null);
    setSelectedTargetId(null);
  };

  const acknowledgePriest = () => {
    onAction({ type: "acknowledgePriest", playerId: actorId, payload: {} });
  };

  const chancellorKeep = (cardId: string) => {
    if (view.pending?.type !== "chancellor") return;
    const held = view.pending.held ?? [];
    if (!held.some((c) => c.id === cardId)) return;
    const rest = held.filter((c) => c.id !== cardId);
    onAction({
      type: "resolveChancellor",
      playerId: actorId,
      payload: {
        keepCardId: cardId,
        bottomOrderIds: rest.map((c) => c.id),
      },
    });
    setSelectedCardId(null);
  };

  const lastDiscard =
    view.selfDiscarded?.[view.selfDiscarded.length - 1] ??
    view.others.flatMap((o) => o.discarded).slice(-1)[0] ??
    null;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#3E2723]/25 bg-[#efe6d8] shadow-card">
      {myPriestReveal && priestPending.rank !== undefined && (
        <PriestRevealModal
          locale={locale}
          targetName={nameOf?.(priestPending.targetId) ?? priestPending.targetId}
          rank={priestPending.rank}
          name={priestPending.name}
          onConfirm={acknowledgePriest}
          onZoom={() =>
            setZoom({
              rank: priestPending.rank!,
              name: priestPending.name,
              subtitle: zh
                ? `${nameOf?.(priestPending.targetId) ?? priestPending.targetId} 的手牌`
                : `${nameOf?.(priestPending.targetId) ?? priestPending.targetId}'s hand`,
            })
          }
        />
      )}
      {zoom && (
        <CardLightbox
          locale={locale}
          rank={zoom.rank}
          name={zoom.name}
          subtitle={zoom.subtitle}
          onClose={() => setZoom(null)}
        />
      )}

      {/* Top chrome — BGA-like title strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3E2723]/15 bg-[#5D4037] px-4 py-2.5 text-amber-50">
        <p className="font-heading text-sm font-bold tracking-wide">
          {zh ? "情书 · 在线桌" : "Love Letter · Table"}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-amber-100/85">
          <span>
            {zh ? "牌堆" : "Deck"}{" "}
            <strong className="font-heading text-accent">{view.deckCount}</strong>
          </span>
          <span>
            {zh ? "公开牌" : "Face-up"} {view.faceUp.length}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <StatusBar locale={locale} text={status.text} tone={status.tone} />

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* Main board column */}
          <div className="space-y-3">
            {/* Felt table */}
            <div
              className="relative overflow-hidden rounded-2xl border-[6px] border-[#4E342E] shadow-inner"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 40%, #2e7d32 0%, #1b5e20 55%, #0d3b12 100%)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none' stroke='%23fff' stroke-width='.4'/%3E%3C/svg%3E\")",
                }}
              />

              <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-5 px-4 py-8 sm:min-h-[260px]">
                {/* Face-up (2p) */}
                {view.faceUp.length > 0 && (
                  <div className="flex flex-col items-center gap-1.5">
                    <p className="font-heading text-[11px] font-semibold uppercase tracking-wider text-emerald-100/80">
                      {zh ? "公开牌" : "Removed from game"}
                    </p>
                    <div className="flex gap-2">
                      {view.faceUp.map((c) => (
                        <CardTile
                          key={c.id}
                          locale={locale}
                          rank={c.rank}
                          name={c.name}
                          size="md"
                          disabled
                          onZoom={() =>
                            setZoom({
                              rank: c.rank,
                              name: c.name,
                              subtitle: zh ? "公开牌" : "Face-up",
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Center piles */}
                {view.pending?.type === "chancellor" && view.pending.held ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-heading text-xs font-bold text-amber-100">
                      {zh ? "大臣 — 点选保留" : "Chancellor — tap to keep"}
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {view.pending.held.map((c) => (
                        <CardTile
                          key={c.id}
                          locale={locale}
                          rank={c.rank}
                          name={c.name}
                          size="lg"
                          selected={selectedCardId === c.id}
                          disabled={
                            !(
                              isMyTurn &&
                              !disabled &&
                              view.pending?.playerId === actorId
                            )
                          }
                          onClick={() => setSelectedCardId(c.id)}
                          onZoom={() =>
                            setZoom({
                              rank: c.rank,
                              name: c.name,
                              subtitle: zh ? "大臣选留" : "Chancellor",
                            })
                          }
                        />
                      ))}
                    </div>
                    {selectedCardId &&
                      isMyTurn &&
                      !disabled &&
                      view.pending.playerId === actorId && (
                        <button
                          type="button"
                          onClick={() => chancellorKeep(selectedCardId)}
                          className="cursor-pointer rounded-xl bg-accent px-6 py-2.5 font-heading text-sm font-bold text-white shadow-card hover:bg-accent-dark"
                        >
                          {zh ? "确认保留这张" : "Keep this card"}
                        </button>
                      )}
                  </div>
                ) : (
                  <div className="flex items-end gap-6">
                    <div className="flex flex-col items-center gap-1">
                      <CardTile locale={locale} faceDown size="md" disabled />
                      <span className="font-heading text-[11px] font-semibold text-emerald-50/90">
                        {zh ? "牌堆" : "Deck"} · {view.deckCount}
                      </span>
                    </div>
                    {lastDiscard && (
                      <div className="flex flex-col items-center gap-1">
                        <CardTile
                          locale={locale}
                          rank={lastDiscard.rank}
                          name={lastDiscard.name}
                          size="lg"
                          disabled
                          onZoom={() =>
                            setZoom({
                              rank: lastDiscard.rank,
                              name: lastDiscard.name,
                              subtitle: zh ? "最近弃牌" : "Last discard",
                            })
                          }
                        />
                        <span className="font-heading text-[11px] font-semibold text-emerald-50/90">
                          {zh ? "最近弃牌" : "Last discard"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Hand dock — whiteblock */}
            <div className="rounded-2xl border border-border bg-white/95 p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="font-heading text-sm font-bold text-primary-dark">
                  {zh ? "你的手牌" : "Your hand"}
                </p>
                {isMyTurn && !disabled && (
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[11px] font-semibold text-accent-dark">
                    {zh ? "可操作" : "Active"}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-end justify-center gap-5 py-3">
                {(view.you?.hand ?? []).map((c) => (
                  <CardTile
                    key={c.id}
                    locale={locale}
                    rank={c.rank}
                    name={c.name}
                    size="xl"
                    selected={selectedCardId === c.id}
                    disabled={!interactive}
                    onClick={() => {
                      setSelectedCardId(c.id);
                      setSelectedTargetId(null);
                    }}
                    onZoom={() =>
                      setZoom({
                        rank: c.rank,
                        name: c.name,
                        subtitle: zh ? "你的手牌" : "Your hand",
                      })
                    }
                    title={`${cardLabel(c, locale)} (${c.rank})`}
                  />
                ))}
                {(view.you?.hand.length ?? 0) === 0 && (
                  <p className="py-8 text-sm text-stone-400">
                    {zh ? "手牌为空" : "No cards in hand"}
                  </p>
                )}
              </div>

              {/* Action row */}
              <div className="mt-3 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {needsTarget && selected?.rank === 5 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTargetId(actorId)}
                      className={`cursor-pointer rounded-lg px-3 py-2 font-heading text-xs font-bold transition-colors ${
                        selectedTargetId === actorId
                          ? "bg-accent text-white"
                          : "bg-surface text-primary-dark hover:bg-primary-light"
                      }`}
                    >
                      {zh ? "目标：自己" : "Target self"}
                    </button>
                  )}
                  {needsGuess &&
                    [0, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setGuessRank(r)}
                        className={`cursor-pointer rounded-md px-2.5 py-1.5 font-heading text-sm font-bold transition-colors ${
                          guessRank === r
                            ? "bg-accent text-white"
                            : "bg-surface text-primary-dark hover:bg-primary-light"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                </div>
                <button
                  type="button"
                  disabled={!canPlay}
                  onClick={playCard}
                  className="cursor-pointer rounded-xl bg-accent px-8 py-3 font-heading text-sm font-bold text-white shadow-card transition-all duration-200 hover:bg-accent-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {zh ? "打出此牌" : "Play card"}
                </button>
              </div>
            </div>
          </div>

          {/* Right column — player panels + log + chat (BGA style) */}
          <aside className="space-y-3">
            <div className="rounded-2xl border border-border bg-white/95 p-3 shadow-sm">
              <PlayerPanels
                locale={locale}
                view={view}
                actorId={actorId}
                selectedTargetId={selectedTargetId}
                thinkingId={thinkingId}
                targetMode={Boolean(interactive && needsTarget)}
                onSelectTarget={setSelectedTargetId}
              />
            </div>

            <div className="rounded-2xl border border-border bg-white/95 shadow-sm">
              <div className="border-b border-border px-3 py-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-stone-500">
                  {zh ? "对局记录" : "Game log"}
                </p>
              </div>
              <div className="max-h-52 space-y-1 overflow-y-auto px-2 py-2">
                {playLog.length === 0 && (
                  <p className="px-1 py-3 text-xs text-stone-400">
                    {zh ? "行动会出现在这里" : "Actions appear here"}
                  </p>
                )}
                {playLog.map((e) => (
                  <div
                    key={e.id}
                    className={[
                      "rounded-lg px-2 py-1.5 text-[12px] leading-snug",
                      e.tone === "warn"
                        ? "bg-red-50 text-red-900"
                        : e.tone === "win"
                          ? "bg-amber-50 text-amber-950"
                          : "bg-surface text-primary-dark",
                    ].join(" ")}
                  >
                    {e.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white/95 shadow-sm">
              <div className="border-b border-border px-3 py-2">
                <p className="font-heading text-xs font-bold uppercase tracking-wide text-stone-500">
                  {zh ? "桌边聊天" : "Table talk"}
                </p>
              </div>
              <div className="max-h-36 space-y-1.5 overflow-y-auto px-2 py-2">
                {chat.length === 0 && (
                  <p className="px-1 text-[11px] text-stone-400">
                    {zh
                      ? "可在此发言；接了 LLM 的 AI 才会说话"
                      : "Say something — only LLM AI seats talk"}
                  </p>
                )}
                {chat.map((m, i) => (
                  <div key={`${m.at}-${i}`} className="rounded-lg bg-surface px-2 py-1.5 text-[12px]">
                    <span className="font-heading text-[10px] font-bold text-accent">
                      {nameOf?.(m.playerId) ?? m.playerId}
                    </span>
                    <p className="text-primary-dark">{m.text}</p>
                  </div>
                ))}
              </div>
              {onChat && (
                <form
                  className="flex gap-1.5 border-t border-border p-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatText.trim()) return;
                    onChat(chatText.trim());
                    setChatText("");
                  }}
                >
                  <input
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2 py-1.5 text-xs"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder={zh ? "说一句…" : "Say…"}
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-primary px-3 py-1.5 font-heading text-xs font-bold text-white"
                  >
                    {zh ? "发" : "Go"}
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export type { ArenaView } from "./types";
