import { TILE_COUNT, isNumbered, getTileDef } from "./tiles";
import type { Suit } from "./tiles";
import type { WinMethod, WaitType, PairType, MeldInput } from "./scoring";
import { YAKU_LIST, calculateScore } from "./scoring";
import type { CalcInput, ScoreBreakdown } from "./scoring";

// ============================================================
// Types
// ============================================================

export interface Meld {
  type: "shuntsu" | "koutsu" | "kantsu";
  tiles: number[]; // tile IDs in the meld
  isOpen: boolean;
}

export interface Decomposition {
  melds: Meld[];
  pair: number; // tile ID of the pair
  type: "standard" | "chiitoitsu" | "kokushi";
}

export interface AnalysisContext {
  agariTile: number;
  isTsumo: boolean;
  isDealer: boolean;
  roundWind: number; // 27=East, 28=South, 29=West, 30=North
  seatWind: number;
  extraYaku: string[]; // user-checked: riichi, ippatsu, etc.
  openMelds: number[][]; // groups of tile indices marked as open
}

export interface AnalysisResult {
  decomposition: Decomposition;
  detectedYaku: string[];
  allYaku: string[];
  isClosed: boolean;
  waitType: WaitType;
  pairType: PairType;
  fuMelds: MeldInput[];
  score: ScoreBreakdown;
}

// ============================================================
// Hand decomposition
// ============================================================

export function decomposeHand(hand: number[]): Decomposition[] {
  const results: Decomposition[] = [];

  // Standard: 4 melds + 1 pair
  decomposeStandard(hand, results);

  // Seven pairs
  if (checkSevenPairs(hand)) {
    const pairs: number[] = [];
    for (let i = 0; i < TILE_COUNT; i++) {
      if (hand[i] === 2) pairs.push(i);
    }
    results.push({
      melds: [],
      pair: pairs[0],
      type: "chiitoitsu",
    });
  }

  // Thirteen orphans
  if (checkKokushi(hand)) {
    let pairTile = -1;
    const terminals = [0,8,9,17,18,26,27,28,29,30,31,32,33];
    for (const t of terminals) {
      if (hand[t] === 2) pairTile = t;
    }
    results.push({
      melds: [],
      pair: pairTile,
      type: "kokushi",
    });
  }

  return results;
}

function checkSevenPairs(hand: number[]): boolean {
  let pairs = 0;
  for (let i = 0; i < TILE_COUNT; i++) {
    if (hand[i] === 2) pairs++;
    else if (hand[i] !== 0) return false;
  }
  return pairs === 7;
}

const TERMINAL_HONOR_IDS = [0,8,9,17,18,26,27,28,29,30,31,32,33];

function checkKokushi(hand: number[]): boolean {
  let pairFound = false;
  for (const id of TERMINAL_HONOR_IDS) {
    if (hand[id] === 0) return false;
    if (hand[id] === 2) {
      if (pairFound) return false;
      pairFound = true;
    } else if (hand[id] !== 1) return false;
  }
  for (let i = 0; i < TILE_COUNT; i++) {
    if (!TERMINAL_HONOR_IDS.includes(i) && hand[i] !== 0) return false;
  }
  return true;
}

function decomposeStandard(hand: number[], results: Decomposition[]) {
  const total = hand.reduce((a, b) => a + b, 0);
  if (total % 3 !== 2) return;
  const setsNeeded = (total - 2) / 3;

  const h = [...hand];
  for (let i = 0; i < TILE_COUNT; i++) {
    if (h[i] >= 2) {
      h[i] -= 2;
      const meldsList: Meld[][] = [];
      collectMelds(h, setsNeeded, [], meldsList);
      for (const melds of meldsList) {
        results.push({ melds, pair: i, type: "standard" });
      }
      h[i] += 2;
    }
  }
}

function collectMelds(hand: number[], needed: number, current: Meld[], results: Meld[][]) {
  if (needed === 0) {
    if (hand.every(c => c === 0)) {
      results.push([...current]);
    }
    return;
  }

  for (let i = 0; i < TILE_COUNT; i++) {
    if (hand[i] > 0) {
      // Triplet
      if (hand[i] >= 3) {
        hand[i] -= 3;
        current.push({ type: "koutsu", tiles: [i, i, i], isOpen: false });
        collectMelds(hand, needed - 1, current, results);
        current.pop();
        hand[i] += 3;
      }
      // Sequence (numbered tiles only)
      if (isNumbered(i)) {
        const posInSuit = i % 9;
        if (posInSuit <= 6 && hand[i + 1] > 0 && hand[i + 2] > 0) {
          hand[i]--;
          hand[i + 1]--;
          hand[i + 2]--;
          current.push({ type: "shuntsu", tiles: [i, i + 1, i + 2], isOpen: false });
          collectMelds(hand, needed - 1, current, results);
          current.pop();
          hand[i]++;
          hand[i + 1]++;
          hand[i + 2]++;
        }
      }
      return; // only process first non-zero tile to avoid duplicates
    }
  }
}

// ============================================================
// Yaku detection from tiles
// ============================================================

function isTerminalOrHonor(tileId: number): boolean {
  if (tileId >= 27) return true; // honor
  const v = tileId % 9;
  return v === 0 || v === 8; // 1 or 9
}

function isHonor(tileId: number): boolean {
  return tileId >= 27;
}

function getSuit(tileId: number): string {
  if (tileId < 9) return "man";
  if (tileId < 18) return "pin";
  if (tileId < 27) return "sou";
  if (tileId < 31) return "wind";
  return "dragon";
}

function allTilesInDecomp(d: Decomposition): number[] {
  const tiles: number[] = [];
  for (const m of d.melds) tiles.push(...m.tiles);
  tiles.push(d.pair, d.pair);
  return tiles;
}

export function detectYaku(
  d: Decomposition,
  ctx: AnalysisContext,
  isClosed: boolean,
): string[] {
  const detected: string[] = [];
  const { agariTile, roundWind, seatWind, isTsumo } = ctx;

  if (d.type === "kokushi") {
    detected.push("kokushi");
    return detected;
  }

  if (d.type === "chiitoitsu") {
    detected.push("chiitoitsu");
    const allTiles = allTilesInDecomp(d);
    if (allTiles.every(t => !isTerminalOrHonor(t))) detected.push("tanyao");
    const suits = new Set(allTiles.map(getSuit));
    const numSuits = new Set([...suits].filter(s => s === "man" || s === "pin" || s === "sou"));
    const hasHonor = allTiles.some(isHonor);
    if (numSuits.size === 1 && hasHonor) detected.push("honitsu");
    if (numSuits.size === 1 && !hasHonor) detected.push("chinitsu");
    if (allTiles.every(isTerminalOrHonor)) detected.push("honroutou");
    if (allTiles.every(isHonor)) detected.push("tsuuiisou");
    return detected;
  }

  // Standard decomposition analysis
  const allTiles = allTilesInDecomp(d);
  const shuntsuMelds = d.melds.filter(m => m.type === "shuntsu");
  const koutsuMelds = d.melds.filter(m => m.type === "koutsu" || m.type === "kantsu");

  // Tanyao
  if (allTiles.every(t => !isTerminalOrHonor(t))) {
    detected.push("tanyao");
  }

  // Pinfu: all shuntsu, non-yakuhai pair, ryanmen wait, closed
  if (isClosed && shuntsuMelds.length === 4) {
    const pairIsYakuhai = d.pair >= 31 || d.pair === roundWind || d.pair === seatWind;
    if (!pairIsYakuhai) {
      const wt = getWaitTypeForTile(d, agariTile);
      if (wt === "ryanmen") {
        detected.push("pinfu");
      }
    }
  }

  // Iipeiko / Ryanpeikou
  if (isClosed) {
    const seqKeys = shuntsuMelds.map(m => m.tiles[0]).sort((a, b) => a - b);
    let pairCount = 0;
    const used = new Set<number>();
    for (let i = 0; i < seqKeys.length; i++) {
      if (used.has(i)) continue;
      for (let j = i + 1; j < seqKeys.length; j++) {
        if (used.has(j)) continue;
        if (seqKeys[i] === seqKeys[j]) {
          pairCount++;
          used.add(i);
          used.add(j);
          break;
        }
      }
    }
    if (pairCount === 2) detected.push("ryanpeikou");
    else if (pairCount === 1) detected.push("iipeiko");
  }

  // Toitoi
  if (koutsuMelds.length === 4) {
    detected.push("toitoi");
  }

  // San Ankou
  const closedKoutsu = koutsuMelds.filter(m => !m.isOpen);
  if (closedKoutsu.length === 3) detected.push("sanankou");
  if (closedKoutsu.length === 4) detected.push("suuankou");

  // Yakuhai (dragons)
  for (const m of koutsuMelds) {
    const t = m.tiles[0];
    if (t === 31) detected.push("yakuhai-haku");
    if (t === 32) detected.push("yakuhai-hatsu");
    if (t === 33) detected.push("yakuhai-chun");
    if (t === roundWind) detected.push("yakuhai-bakaze");
    if (t === seatWind) detected.push("yakuhai-jikaze");
  }

  // Shousangen (2 dragon triplets + dragon pair)
  const dragonKoutsu = koutsuMelds.filter(m => m.tiles[0] >= 31);
  if (dragonKoutsu.length === 2 && d.pair >= 31) {
    detected.push("shousangen");
  }

  // Daisangen (3 dragon triplets)
  if (dragonKoutsu.length === 3) {
    detected.push("daisangen");
  }

  // Shousuushii / Daisuushii
  const windKoutsu = koutsuMelds.filter(m => m.tiles[0] >= 27 && m.tiles[0] <= 30);
  if (windKoutsu.length === 4) detected.push("daisuushii");
  else if (windKoutsu.length === 3 && d.pair >= 27 && d.pair <= 30) detected.push("shousuushii");

  // Suit analysis
  const suits = new Set(allTiles.map(getSuit));
  const numSuits = [...suits].filter(s => s === "man" || s === "pin" || s === "sou");
  const hasHonors = allTiles.some(isHonor);

  // Honitsu (one numbered suit + honors)
  if (numSuits.length === 1 && hasHonors) detected.push("honitsu");

  // Chinitsu (one numbered suit only)
  if (numSuits.length === 1 && !hasHonors) detected.push("chinitsu");

  // Tsuuiisou (all honors)
  if (allTiles.every(isHonor)) detected.push("tsuuiisou");

  // Honroutou (only terminals + honors)
  if (allTiles.every(isTerminalOrHonor) && !allTiles.every(isHonor)) {
    detected.push("honroutou");
  }

  // Chinroutou (only terminals, no honors)
  if (allTiles.every(t => !isHonor(t) && isTerminalOrHonor(t))) {
    detected.push("chinroutou");
  }

  // Chanta / Junchan
  const allMeldsHaveTerminal = d.melds.every(m => m.tiles.some(isTerminalOrHonor));
  const pairIsTerminal = isTerminalOrHonor(d.pair);
  if (allMeldsHaveTerminal && pairIsTerminal) {
    if (hasHonors) detected.push("chanta");
    else detected.push("junchan");
  }

  // Ittsu (1-2-3, 4-5-6, 7-8-9 of same suit)
  for (const suitOffset of [0, 9, 18]) {
    const has123 = shuntsuMelds.some(m => m.tiles[0] === suitOffset);
    const has456 = shuntsuMelds.some(m => m.tiles[0] === suitOffset + 3);
    const has789 = shuntsuMelds.some(m => m.tiles[0] === suitOffset + 6);
    if (has123 && has456 && has789) {
      detected.push("ittsu");
      break;
    }
  }

  // Sanshoku Doujun (same seq across 3 suits)
  for (let v = 0; v <= 6; v++) {
    const hasMan = shuntsuMelds.some(m => m.tiles[0] === v);
    const hasPin = shuntsuMelds.some(m => m.tiles[0] === v + 9);
    const hasSou = shuntsuMelds.some(m => m.tiles[0] === v + 18);
    if (hasMan && hasPin && hasSou) {
      detected.push("sanshoku-doujun");
      break;
    }
  }

  // Sanshoku Doukou (same triplet across 3 suits)
  for (let v = 0; v < 9; v++) {
    const hasMan = koutsuMelds.some(m => m.tiles[0] === v);
    const hasPin = koutsuMelds.some(m => m.tiles[0] === v + 9);
    const hasSou = koutsuMelds.some(m => m.tiles[0] === v + 18);
    if (hasMan && hasPin && hasSou) {
      detected.push("sanshoku-doukou");
      break;
    }
  }

  // Sankantsu / Suukantsu
  const kantsuCount = d.melds.filter(m => m.type === "kantsu").length;
  if (kantsuCount === 3) detected.push("sankantsu");
  if (kantsuCount === 4) detected.push("suukantsu");

  // Ryuuiisou (all green: 2,3,4,6,8 sou + hatsu)
  const greenTiles = new Set([19, 20, 21, 23, 25, 32]); // 2s,3s,4s,6s,8s,hatsu
  if (allTiles.every(t => greenTiles.has(t))) {
    detected.push("ryuuiisou");
  }

  // Chuuren Poutou (1112345678999 + 1 of same suit, closed)
  if (isClosed && numSuits.length === 1 && !hasHonors) {
    const suitOff = numSuits[0] === "man" ? 0 : numSuits[0] === "pin" ? 9 : 18;
    const counts: number[] = [];
    for (let i = 0; i < 9; i++) {
      let c = 0;
      for (const t of allTiles) if (t === suitOff + i) c++;
      counts.push(c);
    }
    const base = [3,1,1,1,1,1,1,1,3];
    const extra = counts.map((c, i) => c - base[i]);
    if (extra.every(e => e >= 0) && extra.reduce((a, b) => a + b, 0) === 1) {
      detected.push("chuuren");
    }
  }

  // Menzen tsumo (auto if closed + tsumo)
  if (isClosed && isTsumo) {
    detected.push("menzen-tsumo");
  }

  return [...new Set(detected)]; // deduplicate
}

// ============================================================
// Wait type detection
// ============================================================

export function getWaitTypeForTile(d: Decomposition, agariTile: number): WaitType {
  if (d.type !== "standard") return "tanki";

  // Check if agari tile completes the pair
  if (d.pair === agariTile) return "tanki";

  // Find which meld contains the agari tile
  for (const m of d.melds) {
    if (!m.tiles.includes(agariTile)) continue;

    if (m.type === "koutsu" || m.type === "kantsu") {
      return "shanpon";
    }

    if (m.type === "shuntsu") {
      const sorted = [...m.tiles].sort((a, b) => a - b);
      const pos = sorted.indexOf(agariTile);
      const posInSuit = agariTile % 9;

      // Kanchan: middle tile
      if (pos === 1) return "kanchan";

      // Penchan: edge wait (1-2 waiting for 3, or 8-9 waiting for 7)
      if (pos === 2 && sorted[0] % 9 === 0) return "penchan"; // 1-2-[3]
      if (pos === 0 && sorted[2] % 9 === 8) return "penchan"; // [7]-8-9

      // Ryanmen: two-sided wait
      return "ryanmen";
    }
  }

  return "ryanmen";
}

// ============================================================
// Full analysis: find best scoring decomposition
// ============================================================

export function analyzeHand(
  hand: number[],
  ctx: AnalysisContext,
  openMeldTiles: number[][] // each sub-array = tile IDs in an open meld
): AnalysisResult | null {
  const decomps = decomposeHand(hand);
  if (decomps.length === 0) return null;

  const isClosed = openMeldTiles.length === 0;

  let bestResult: AnalysisResult | null = null;
  let bestScore = -1;

  for (const d of decomps) {
    // Mark open melds
    for (const m of d.melds) {
      m.isOpen = false;
    }
    for (const openGroup of openMeldTiles) {
      for (const m of d.melds) {
        const mSorted = [...m.tiles].sort((a, b) => a - b);
        const oSorted = [...openGroup].sort((a, b) => a - b);
        if (mSorted.length === oSorted.length && mSorted.every((v, i) => v === oSorted[i])) {
          m.isOpen = true;
          break;
        }
      }
    }

    const detected = detectYaku(d, ctx, isClosed);
    const allYaku = [...detected, ...ctx.extraYaku.filter(y => !detected.includes(y))];

    // Filter out conflicting yaku
    const validYaku = allYaku.filter(id => {
      const def = YAKU_LIST.find(y => y.id === id);
      if (!def) return false;
      if (!isClosed && def.hanOpen === null) return false;
      return true;
    });

    if (validYaku.length === 0) continue;

    const waitType = getWaitTypeForTile(d, ctx.agariTile);
    const pairIsYakuhai = d.pair >= 31 || d.pair === ctx.roundWind || d.pair === ctx.seatWind;
    const pairType: PairType = pairIsYakuhai ? "yakuhai" : "normal";

    const fuMelds: MeldInput[] = d.melds.map(m => {
      const scoringType = (() => {
        if (m.type === "shuntsu") return "shuntsu" as const;
        if (m.type === "kantsu") return m.isOpen ? "minkan" as const : "ankan" as const;
        return m.isOpen ? "minko" as const : "anko" as const;
      })();
      return {
        type: scoringType,
        isTerminal: m.tiles.some(isTerminalOrHonor),
      };
    });

    const calcInput: CalcInput = {
      isDealer: ctx.isDealer,
      winMethod: ctx.isTsumo ? "tsumo" : "ron",
      isClosed,
      yakuIds: validYaku,
      fu: { melds: fuMelds, pairType, waitType },
    };

    const score = calculateScore(calcInput);
    const totalPoints = ctx.isDealer
      ? (ctx.isTsumo ? score.dealerTsumo * 3 : score.dealerRon)
      : (ctx.isTsumo ? score.nonDealerTsumoDealer + score.nonDealerTsumoNonDealer * 2 : score.nonDealerRon);

    if (totalPoints > bestScore) {
      bestScore = totalPoints;
      bestResult = {
        decomposition: d,
        detectedYaku: detected,
        allYaku: validYaku,
        isClosed,
        waitType,
        pairType,
        fuMelds,
        score,
      };
    }
  }

  return bestResult;
}
