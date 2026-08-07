import { Container, Graphics, Text } from "pixi.js";

export const CARD_W = 72;
export const CARD_H = 100;

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

/** Procedural face-up or face-down card container. */
export function createCardVisual(opts: {
  cardId: string;
  rank: number;
  name: string;
  faceDown?: boolean;
}): CardVisual {
  const root = new Container() as CardVisual;
  root.cardId = opts.cardId;
  root.rank = opts.rank;
  root.faceDown = Boolean(opts.faceDown);
  root.baseY = 0;
  root.eventMode = "static";
  root.cursor = "pointer";
  root.pivot.set(CARD_W / 2, CARD_H / 2);

  const bg = new Graphics();
  root.addChild(bg);

  if (opts.faceDown) {
    roundRect(bg, 0, 0, CARD_W, CARD_H, 10, 0x3e2723);
    const stripe = new Graphics();
    for (let i = 0; i < 8; i++) {
      stripe.moveTo(8 + i * 8, 8);
      stripe.lineTo(8 + i * 8, CARD_H - 8);
    }
    stripe.stroke({ width: 2, color: 0xc4952a, alpha: 0.45 });
    root.addChild(stripe);
    const heart = new Graphics();
    heart.star(CARD_W / 2, CARD_H / 2, 5, 10, 5);
    heart.fill({ color: 0xc4952a, alpha: 0.85 });
    root.addChild(heart);
  } else {
    const color = RANK_COLORS[opts.rank] ?? 0x5d4037;
    roundRect(bg, 0, 0, CARD_W, CARD_H, 10, color);
    const gloss = new Graphics();
    gloss.ellipse(CARD_W * 0.35, CARD_H * 0.28, 22, 14);
    gloss.fill({ color: 0xffffff, alpha: 0.18 });
    root.addChild(gloss);

    const rankText = new Text({
      text: String(opts.rank),
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
      text: opts.name,
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

  const border = new Graphics();
  border.roundRect(1, 1, CARD_W - 2, CARD_H - 2, 9);
  border.stroke({ width: 2, color: 0xffffff, alpha: 0.35 });
  root.addChild(border);

  return root;
}

export function setCardSelected(card: CardVisual, selected: boolean) {
  card.scale.set(selected ? 1.08 : 1);
}
