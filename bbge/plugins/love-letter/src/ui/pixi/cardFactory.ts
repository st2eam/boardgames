import { Container, Graphics, Sprite, Text, type Texture } from "pixi.js";
import type { LoveLetterTextures } from "./assets";
import { textureForCard } from "./assets";

export const CARD_W = 78;
export const CARD_H = 110;

const RANK_COLORS: Record<number, number> = {
  0: 0x546e7a,
  1: 0xc62828,
  2: 0x3949ab,
  3: 0x5d4037,
  4: 0xad1457,
  5: 0x00695c,
  6: 0x6a1b9a,
  7: 0xef6c00,
  8: 0x1565c0,
  9: 0xc4952a,
};

export type CardVisual = Container & {
  cardId: string;
  rank: number;
  faceDown: boolean;
  baseY: number;
};

function roundRect(
  g: Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: number,
  alpha = 1,
) {
  g.roundRect(x, y, w, h, r);
  g.fill({ color, alpha });
}

function addProceduralFace(
  root: Container,
  rank: number,
  name: string,
  faceDown: boolean,
) {
  const bg = new Graphics();
  root.addChild(bg);
  if (faceDown) {
    roundRect(bg, 0, 0, CARD_W, CARD_H, 10, 0x3e2723);
    const stripe = new Graphics();
    for (let i = 0; i < 8; i++) {
      stripe.moveTo(8 + i * 8, 8);
      stripe.lineTo(8 + i * 8, CARD_H - 8);
    }
    stripe.stroke({ width: 2, color: 0xc4952a, alpha: 0.45 });
    root.addChild(stripe);
  } else {
    const color = RANK_COLORS[rank] ?? 0x5d4037;
    roundRect(bg, 0, 0, CARD_W, CARD_H, 10, color);
    const rankText = new Text({
      text: String(rank),
      style: {
        fontFamily: "Fredoka, Nunito, sans-serif",
        fontSize: 28,
        fontWeight: "700",
        fill: 0xfff8e1,
      },
    });
    rankText.x = 8;
    rankText.y = 6;
    root.addChild(rankText);
    const nameText = new Text({
      text: name,
      style: {
        fontFamily: "Fredoka, Nunito, sans-serif",
        fontSize: 11,
        fontWeight: "600",
        fill: 0xfff8e1,
        wordWrap: true,
        wordWrapWidth: CARD_W - 12,
      },
    });
    nameText.x = 6;
    nameText.y = CARD_H - 28;
    root.addChild(nameText);
  }
}

function addAssetFace(root: Container, texture: Texture) {
  const sprite = new Sprite(texture);
  sprite.width = CARD_W;
  sprite.height = CARD_H;
  // Soft mask corners via rounded rect overlay border only
  root.addChild(sprite);
  const frame = new Graphics();
  frame.roundRect(0, 0, CARD_W, CARD_H, 8);
  frame.stroke({ width: 2, color: 0xffffff, alpha: 0.35 });
  root.addChild(frame);
}

/** Card visual from downloadable asset pack, with procedural fallback. */
export function createCardVisual(opts: {
  cardId: string;
  rank: number;
  name: string;
  faceDown?: boolean;
  textures?: LoveLetterTextures | null;
}): CardVisual {
  const root = new Container() as CardVisual;
  root.cardId = opts.cardId;
  root.rank = opts.rank;
  root.faceDown = Boolean(opts.faceDown);
  root.baseY = 0;
  root.eventMode = "static";
  root.cursor = "pointer";
  root.pivot.set(CARD_W / 2, CARD_H / 2);

  const tex = textureForCard(
    opts.textures ?? null,
    opts.rank,
    Boolean(opts.faceDown),
  );
  if (tex) {
    addAssetFace(root, tex);
  } else {
    addProceduralFace(root, opts.rank, opts.name, Boolean(opts.faceDown));
    const border = new Graphics();
    border.roundRect(1, 1, CARD_W - 2, CARD_H - 2, 9);
    border.stroke({ width: 2, color: 0xffffff, alpha: 0.35 });
    root.addChild(border);
  }

  return root;
}

export function setCardSelected(card: CardVisual, selected: boolean) {
  card.scale.set(selected ? 1.08 : 1);
}
