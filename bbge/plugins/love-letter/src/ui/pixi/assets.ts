import { Assets, Texture } from "pixi.js";

/** Files under `public/images/bbge/love-letter/` (from love-letter-cards.zip). */
const RANK_FILES: Record<number, string> = {
  0: "0-spy.png",
  1: "1-guard.png",
  2: "2-priest.png",
  3: "3-baron.png",
  4: "4-handmaid.png",
  5: "5-prince.png",
  6: "6-chancellor.png",
  7: "7-king.png",
  8: "8-countess.png",
  9: "9-princess.png",
};

const BACK_FILE = "back.png";

function assetBase(): string {
  // Next static export basePath
  const base =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/boardgames")
      ? "/boardgames"
      : "";
  return `${base}/images/bbge/love-letter`;
}

export type LoveLetterTextures = {
  back: Texture;
  ranks: Map<number, Texture>;
};

let cache: LoveLetterTextures | null = null;
let loading: Promise<LoveLetterTextures> | null = null;

export async function loadLoveLetterTextures(): Promise<LoveLetterTextures> {
  if (cache) return cache;
  if (loading) return loading;

  loading = (async () => {
    const base = assetBase();
    const bundle: Record<string, string> = {
      back: `${base}/${BACK_FILE}`,
    };
    for (const [rank, file] of Object.entries(RANK_FILES)) {
      bundle[`rank-${rank}`] = `${base}/${file}`;
    }

    await Assets.load(Object.values(bundle));

    const ranks = new Map<number, Texture>();
    for (const rank of Object.keys(RANK_FILES).map(Number)) {
      ranks.set(rank, Assets.get(bundle[`rank-${rank}`]!));
    }

    cache = {
      back: Assets.get(bundle.back!),
      ranks,
    };
    return cache;
  })();

  try {
    return await loading;
  } catch (e) {
    loading = null;
    throw e;
  }
}

export function textureForCard(
  textures: LoveLetterTextures | null,
  rank: number,
  faceDown: boolean,
): Texture | null {
  if (!textures) return null;
  if (faceDown) return textures.back;
  return textures.ranks.get(rank) ?? null;
}
