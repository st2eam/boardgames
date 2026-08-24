"use client";

import { useEffect, useRef, useState } from "react";
import { Application, Container, Graphics, Text } from "pixi.js";
import { createCardVisual, type CardVisual } from "./pixi/cardFactory";
import {
  loadLoveLetterTextures,
  type LoveLetterTextures,
} from "./pixi/assets";
import {
  chancellorFanPositions,
  handFanPositions,
  OPP_CARD_SCALE,
  opponentHandPositions,
  opponentSeatPositions,
  tableGeom,
} from "./pixi/layout";
import {
  dealIn,
  killCardTweens,
  moveTo,
  pulseGlow,
  selectLift,
  fadeInOverlay,
} from "./pixi/animate";

export type ArenaView = {
  phase: string;
  winners: string[];
  currentPlayerId: string;
  deckCount: number;
  faceUp: { id: string; rank: number; name?: { en: string; zh: string } }[];
  pending: {
    type: string;
    playerId: string;
    held?: { id: string; rank: number; name?: { en: string; zh: string } }[];
  } | null;
  you: {
    id: string;
    hand: { id: string; rank: number; name?: { en: string; zh: string } }[];
    eliminated: boolean;
    protected: boolean;
  } | null;
  others: {
    id: string;
    name: string;
    handCount: number;
    discarded: { id: string; rank: number }[];
    eliminated: boolean;
    protected: boolean;
  }[];
};

export interface LoveLetterPixiArenaProps {
  locale: string;
  view: ArenaView;
  selectedCardId: string | null;
  selectedTargetId: string | null;
  thinkingId?: string | null;
  interactive: boolean;
  onSelectCard: (cardId: string) => void;
  onSelectTarget: (playerId: string) => void;
  width?: number;
  height?: number;
}

function label(
  c: { rank: number; name?: { en: string; zh: string } },
  locale: string,
) {
  return c.name?.[locale === "zh" ? "zh" : "en"] ?? String(c.rank);
}

function drawFelt(g: Graphics, w: number, h: number) {
  g.clear();
  g.rect(0, 0, w, h);
  g.fill(0x1a120e);
  const { cx, cy, rx, ry } = tableGeom({ width: w, height: h });
  g.ellipse(cx, cy, rx + 28, ry + 36);
  g.fill(0x3e2723);
  g.ellipse(cx, cy, rx + 18, ry + 26);
  g.fill(0x2e7d32);
  g.ellipse(cx, cy, rx, ry);
  g.fill(0x1b5e20);
}

type Layers = {
  felt: Graphics;
  seats: Container;
  cards: Container;
  ui: Container;
  overlay: Container;
};

export function LoveLetterPixiArena({
  locale,
  view,
  selectedCardId,
  selectedTargetId,
  thinkingId,
  interactive,
  onSelectCard,
  onSelectTarget,
  width = 900,
  height = 560,
}: LoveLetterPixiArenaProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const layersRef = useRef<Layers | null>(null);
  const cardsRef = useRef<Map<string, CardVisual>>(new Map());
  const seatNodesRef = useRef<Map<string, Container>>(new Map());
  const callbacksRef = useRef({ onSelectCard, onSelectTarget, interactive });
  const firstSync = useRef(true);
  const texturesRef = useRef<LoveLetterTextures | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    callbacksRef.current = { onSelectCard, onSelectTarget, interactive };
  }, [onSelectCard, onSelectTarget, interactive]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let destroyed = false;
    const app = new Application();

    (async () => {
      try {
        texturesRef.current = await loadLoveLetterTextures();
      } catch {
        texturesRef.current = null;
      }
      if (destroyed) return;

      await app.init({
        width,
        height,
        background: 0x1a120e,
        antialias: true,
        resolution:
          typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
        autoDensity: true,
      });
      if (destroyed) {
        app.destroy(true);
        return;
      }
      host.innerHTML = "";
      host.appendChild(app.canvas);
      app.canvas.style.width = "100%";
      app.canvas.style.height = "100%";
      app.canvas.style.display = "block";
      appRef.current = app;

      const felt = new Graphics();
      drawFelt(felt, width, height);
      const seats = new Container();
      const cards = new Container();
      const ui = new Container();
      const overlay = new Container();
      overlay.eventMode = "none";
      app.stage.addChild(felt, seats, cards, ui, overlay);
      layersRef.current = { felt, seats, cards, ui, overlay };
      firstSync.current = true;
      setReady(true);
    })();

    return () => {
      destroyed = true;
      setReady(false);
      for (const card of cardsRef.current.values()) killCardTweens(card);
      for (const seat of seatNodesRef.current.values()) killCardTweens(seat);
      cardsRef.current.clear();
      seatNodesRef.current.clear();
      layersRef.current = null;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [width, height]);

  useEffect(() => {
    if (!ready) return;
    const layers = layersRef.current;
    if (!layers) return;

    const size = { width, height };
    const geom = tableGeom(size);
    const animateIn = firstSync.current;
    firstSync.current = false;

    const others = view.others;
    const seatPts = opponentSeatPositions(size, others.length);
    const seenSeats = new Set<string>();

    others.forEach((o, i) => {
      seenSeats.add(o.id);
      let node = seatNodesRef.current.get(o.id);
      if (!node) {
        node = new Container();
        node.eventMode = "static";
        node.cursor = "pointer";
        const ring = new Graphics();
        node.addChild(ring);
        const name = new Text({
          text: o.name,
          style: {
            fontFamily: "Fredoka, sans-serif",
            fontSize: 12,
            fontWeight: "700",
            fill: 0xfff8e1,
          },
        });
        name.anchor.set(0.5, 0);
        name.y = 26;
        name.style.wordWrap = true;
        name.style.wordWrapWidth = 88;
        name.style.align = "center";
        node.addChild(name);
        const seatId = o.id;
        node.on("pointertap", () => {
          if (callbacksRef.current.interactive) {
            callbacksRef.current.onSelectTarget(seatId);
          }
        });
        layers.seats.addChild(node);
        seatNodesRef.current.set(o.id, node);
      }

      const pt = seatPts[i]!;
      node.x = pt.x;
      node.y = pt.y;

      const ring = node.children[0] as Graphics;
      ring.clear();
      const active = view.currentPlayerId === o.id;
      const selected = selectedTargetId === o.id;
      ring.circle(0, 0, 22);
      ring.fill(o.eliminated ? 0x455a64 : active ? 0xc4952a : 0x5d4037);
      if (selected) {
        ring.circle(0, 0, 28);
        ring.stroke({ width: 3, color: 0xffe082 });
      }
      if (o.protected) {
        ring.circle(18, -18, 7);
        ring.fill(0xec407a);
      }
      (node.children[1] as Text).text = o.name;
      node.alpha = o.eliminated ? 0.35 : 1;
      pulseGlow(node, thinkingId === o.id);
    });

    for (const [id, node] of seatNodesRef.current) {
      if (!seenSeats.has(id)) {
        killCardTweens(node);
        layers.seats.removeChild(node);
        node.destroy({ children: true });
        seatNodesRef.current.delete(id);
      }
    }

    const deckKey = "__deck__";
    let deckNode = cardsRef.current.get(deckKey);
    if (!deckNode) {
      deckNode = createCardVisual({
        cardId: deckKey,
        rank: 0,
        name: "",
        faceDown: true,
        textures: texturesRef.current,
      });
      deckNode.eventMode = "none";
      layers.cards.addChild(deckNode);
      cardsRef.current.set(deckKey, deckNode);
    }
    deckNode.x = geom.deck.x;
    deckNode.y = geom.deck.y;
    deckNode.visible = view.phase === "playing" || view.deckCount > 0;

    type Place = {
      id: string;
      rank: number;
      name: string;
      faceDown: boolean;
      x: number;
      y: number;
      rotation: number;
      selectable: boolean;
      baseY: number;
    };
    const places: Place[] = [];

    view.faceUp.forEach((c, i) => {
      places.push({
        id: `face-${c.id}`,
        rank: c.rank,
        name: label(c, locale),
        faceDown: false,
        x: geom.deck.x - 100 - i * 22,
        y: geom.deck.y,
        rotation: -0.12 + i * 0.06,
        selectable: false,
        baseY: geom.deck.y,
      });
    });

    others.forEach((o, oi) => {
      const pt = seatPts[oi]!;
      const handPts = opponentHandPositions(pt, o.handCount);
      handPts.forEach((hp, i) => {
        places.push({
          id: `opp-${o.id}-${i}`,
          rank: 0,
          name: "",
          faceDown: true,
          x: hp.x,
          y: hp.y,
          rotation: hp.rotation,
          selectable: false,
          baseY: hp.y,
        });
      });
    });

    if (view.pending?.type === "chancellor" && view.pending.held) {
      const held = view.pending.held;
      const pts = chancellorFanPositions(size, held.length);
      held.forEach((c, i) => {
        places.push({
          id: c.id,
          rank: c.rank,
          name: label(c, locale),
          faceDown: false,
          x: pts[i]!.x,
          y: pts[i]!.y,
          rotation: 0,
          selectable: interactive,
          baseY: pts[i]!.y,
        });
      });
    } else {
      const hand = view.you?.hand ?? [];
      const fan = handFanPositions(size, hand.length);
      hand.forEach((c, i) => {
        const f = fan[i]!;
        places.push({
          id: c.id,
          rank: c.rank,
          name: label(c, locale),
          faceDown: false,
          x: f.x,
          y: f.y,
          rotation: f.rotation,
          selectable: interactive,
          baseY: f.y,
        });
      });
    }

    const seenCards = new Set(places.map((p) => p.id));
    seenCards.add(deckKey);

    for (const p of places) {
      let card = cardsRef.current.get(p.id);
      const needRebuild =
        card &&
        (card.faceDown !== p.faceDown || (!p.faceDown && card.rank !== p.rank));
      if (needRebuild && card) {
        killCardTweens(card);
        layers.cards.removeChild(card);
        card.destroy({ children: true });
        cardsRef.current.delete(p.id);
        card = undefined;
      }
      if (!card) {
        card = createCardVisual({
          cardId: p.id,
          rank: p.rank,
          name: p.name,
          faceDown: p.faceDown,
          textures: texturesRef.current,
        });
        const cid = p.id;
        card.on("pointertap", () => {
          if (!callbacksRef.current.interactive) return;
          if (cid.startsWith("opp-") || cid.startsWith("face-")) return;
          callbacksRef.current.onSelectCard(cid);
        });
        layers.cards.addChild(card);
        cardsRef.current.set(p.id, card);
        const isOpp = p.id.startsWith("opp-");
        if (animateIn && !isOpp) {
          card.x = geom.deck.x;
          card.y = geom.deck.y;
          dealIn(
            card,
            { x: p.x, y: p.y, rotation: p.rotation },
            Math.random() * 0.12,
          );
        } else {
          card.x = p.x;
          card.y = p.y;
          card.rotation = p.rotation;
          card.alpha = 1;
          card.scale.set(isOpp ? OPP_CARD_SCALE : 1);
        }
      } else if (!p.id.startsWith("opp-")) {
        moveTo(card, { x: p.x, y: p.y, rotation: p.rotation });
      } else {
        card.x = p.x;
        card.y = p.y;
        card.rotation = p.rotation;
        card.scale.set(OPP_CARD_SCALE);
      }
      card.baseY = p.baseY;
      card.eventMode = p.selectable ? "static" : "none";
      card.cursor = p.selectable ? "pointer" : "default";
      if (!p.id.startsWith("opp-") && !p.id.startsWith("face-") && p.id !== "__deck__") {
        selectLift(card, selectedCardId === p.id, p.baseY);
      }
    }

    for (const [id, card] of cardsRef.current) {
      if (!seenCards.has(id)) {
        killCardTweens(card);
        layers.cards.removeChild(card);
        card.destroy({ children: true });
        cardsRef.current.delete(id);
      }
    }

    layers.ui.removeChildren();
    // Turn banner sits on the felt rim — not over opponent avatars / hand cards
    const banner = new Text({
      text:
        view.phase === "finished"
          ? locale === "zh"
            ? `胜者 · ${view.winners.join(" · ")}`
            : `Winner · ${view.winners.join(" · ")}`
          : locale === "zh"
            ? `回合 · ${view.currentPlayerId} · 牌堆 ${view.deckCount}`
            : `Turn · ${view.currentPlayerId} · Deck ${view.deckCount}`,
      style: {
        fontFamily: "Fredoka, sans-serif",
        fontSize: 13,
        fontWeight: "700",
        fill: 0xfff8e1,
      },
    });
    banner.anchor.set(0.5, 0.5);
    banner.x = geom.cx;
    banner.y = geom.cy - geom.ry - 18;
    layers.ui.addChild(banner);

    layers.overlay.removeChildren();
    if (view.phase === "finished") {
      const veil = new Graphics();
      veil.rect(0, 0, width, height);
      veil.fill({ color: 0x1a120e, alpha: 0.75 });
      layers.overlay.addChild(veil);
      fadeInOverlay(veil);
      const win = new Text({
        text: locale === "zh" ? "本局结束" : "Round over",
        style: {
          fontFamily: "Fredoka, sans-serif",
          fontSize: 36,
          fontWeight: "700",
          fill: 0xc4952a,
        },
      });
      win.anchor.set(0.5);
      win.x = width / 2;
      win.y = height / 2 - 10;
      layers.overlay.addChild(win);
    }
  }, [
    ready,
    view,
    locale,
    selectedCardId,
    selectedTargetId,
    thinkingId,
    interactive,
    width,
    height,
  ]);

  return (
    <div
      ref={hostRef}
      className="relative w-full overflow-hidden rounded-[1.5rem] border-4 border-[#3E2723] bg-[#1a120e] shadow-dialog"
      style={{
        height,
        maxWidth: width,
        margin: "0 auto",
        touchAction: "none",
      }}
      aria-label="Love Letter game table"
    />
  );
}
