import type { PlayerId } from "@bbge/core";
import type { RummikubTile } from "./cards";
import { isValidSet, setPoints } from "./sets";
import type { RummikubAction, TableSet } from "./state";

export const INITIAL_MELD = 30;

export type CommitTile = {
  id: string;
  color: string | null;
  number: number | null;
  joker: boolean;
};

export type CommitTableSet = {
  id: string;
  tiles: CommitTile[];
};

export type CommitOk = {
  ok: true;
  groups: RummikubTile[][];
  remainingRack: RummikubTile[];
  playedCount: number;
  points: number;
};

export type CommitFail = { ok: false; error: string };

export type CommitResult = CommitOk | CommitFail;

function asTile(t: CommitTile): RummikubTile {
  return t as RummikubTile;
}

function membershipKey(ids: string[]): string {
  return ids.slice().sort().join(",");
}

function sameMembership(a: string[], b: string[]): boolean {
  return membershipKey(a) === membershipKey(b);
}

/**
 * Validate a proposed table layout against the start-of-turn table + rack.
 * UI and applyAction share this so drag-draft and Host agree.
 */
export function evaluateCommit(args: {
  table: CommitTableSet[];
  rack: CommitTile[];
  initialMeldDone: boolean;
  groups: string[][];
}): CommitResult {
  const { table, rack, initialMeldDone, groups } = args;

  if (groups.length === 0) return { ok: false, error: "no groups" };
  if (groups.some((g) => g.length === 0)) {
    return { ok: false, error: "empty group" };
  }

  const seen = new Set<string>();
  for (const g of groups) {
    for (const id of g) {
      if (seen.has(id)) return { ok: false, error: "duplicate tile" };
      seen.add(id);
    }
  }

  const byId = new Map<string, RummikubTile>();
  for (const s of table) {
    for (const t of s.tiles) byId.set(t.id, asTile(t));
  }
  for (const t of rack) byId.set(t.id, asTile(t));

  const tableIds = new Set<string>();
  for (const s of table) {
    for (const t of s.tiles) tableIds.add(t.id);
  }
  const rackIds = new Set(rack.map((t) => t.id));

  for (const id of seen) {
    if (!byId.has(id)) return { ok: false, error: "unknown tile" };
    if (!tableIds.has(id) && !rackIds.has(id)) {
      return { ok: false, error: "unknown tile" };
    }
  }

  for (const id of tableIds) {
    if (!seen.has(id)) return { ok: false, error: "table tile removed" };
  }

  const resolved: RummikubTile[][] = [];
  for (const g of groups) {
    const tiles = g.map((id) => byId.get(id)!);
    if (!isValidSet(tiles)) return { ok: false, error: "invalid set" };
    resolved.push(tiles);
  }

  const playedIds = [...seen].filter((id) => rackIds.has(id));
  if (playedIds.length === 0) {
    return { ok: false, error: "no rack tiles played" };
  }

  if (!initialMeldDone) {
    const used = new Array(groups.length).fill(false);
    for (const old of table) {
      const ids = old.tiles.map((t) => t.id);
      const idx = groups.findIndex(
        (g, i) => !used[i] && sameMembership(g, ids),
      );
      if (idx < 0) {
        return { ok: false, error: "initial meld cannot use table tiles" };
      }
      used[idx] = true;
    }
    let points = 0;
    for (let i = 0; i < groups.length; i++) {
      if (used[i]) continue;
      const ids = groups[i]!;
      if (ids.some((id) => tableIds.has(id))) {
        return { ok: false, error: "initial meld cannot use table tiles" };
      }
      points += setPoints(resolved[i]!);
    }
    if (points < INITIAL_MELD) {
      return { ok: false, error: "initial meld needs 30" };
    }
  }

  const remainingRack = rack
    .filter((t) => !seen.has(t.id))
    .map((t) => asTile(t));

  let points = 0;
  for (const g of resolved) {
    if (g.some((t) => rackIds.has(t.id))) points += setPoints(g);
  }

  return {
    ok: true,
    groups: resolved,
    remainingRack,
    playedCount: playedIds.length,
    points,
  };
}

function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > arr.length) return [];
  const out: T[][] = [];
  const rec = (start: number, acc: T[]) => {
    if (acc.length === k) {
      out.push(acc.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      acc.push(arr[i]!);
      rec(i + 1, acc);
      acc.pop();
    }
  };
  rec(0, []);
  return out;
}

/** All valid groups/runs that can be formed from the rack alone. */
export function enumerateRackSets(rack: RummikubTile[]): RummikubTile[][] {
  const out: RummikubTile[][] = [];
  const seen = new Set<string>();
  const add = (tiles: RummikubTile[]) => {
    if (!isValidSet(tiles)) return;
    const key = membershipKey(tiles.map((t) => t.id));
    if (seen.has(key)) return;
    seen.add(key);
    out.push(tiles);
  };

  const jokers = rack.filter((t) => t.joker);

  const byNumber = new Map<number, RummikubTile[]>();
  for (const t of rack) {
    if (t.joker || t.number == null) continue;
    const list = byNumber.get(t.number) ?? [];
    list.push(t);
    byNumber.set(t.number, list);
  }
  for (const group of byNumber.values()) {
    const pool = [...group, ...jokers];
    for (const size of [3, 4]) {
      if (pool.length < size) continue;
      for (const combo of combinations(pool, size)) add(combo);
    }
  }

  const byColor = new Map<string, RummikubTile[]>();
  for (const t of rack) {
    if (t.joker || t.color == null) continue;
    const list = byColor.get(t.color) ?? [];
    list.push(t);
    byColor.set(t.color, list);
  }
  for (const colorTiles of byColor.values()) {
    const unique = new Map<number, RummikubTile>();
    for (const t of colorTiles) {
      if (t.number != null && !unique.has(t.number)) unique.set(t.number, t);
    }
    const nums = [...unique.keys()].sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i; j < nums.length; j++) {
        const min = nums[i]!;
        const max = nums[j]!;
        const span = max - min + 1;
        if (span < 3) continue;
        const picked: RummikubTile[] = [];
        for (let n = min; n <= max; n++) {
          const t = unique.get(n);
          if (t) picked.push(t);
        }
        const need = span - picked.length;
        if (need > jokers.length) continue;
        add(picked.concat(jokers.slice(0, need)));
      }
    }
  }

  return out;
}

function disjointCombos(
  sets: RummikubTile[][],
  minPoints: number,
  maxCombos: number,
): RummikubTile[][][] {
  const combos: RummikubTile[][][] = [];
  const ranked = sets
    .slice()
    .sort((a, b) => b.length - a.length || setPoints(b) - setPoints(a));

  let visits = 0;
  const dfs = (
    start: number,
    used: Set<string>,
    acc: RummikubTile[][],
    pts: number,
  ) => {
    if (combos.length >= maxCombos || ++visits > 2000) return;
    if (acc.length > 0 && pts >= minPoints) {
      combos.push(acc.map((s) => s.slice()));
    }
    if (acc.length >= 5) return;
    for (let i = start; i < ranked.length; i++) {
      const s = ranked[i]!;
      if (s.some((t) => used.has(t.id))) continue;
      for (const t of s) used.add(t.id);
      acc.push(s);
      dfs(i + 1, used, acc, pts + setPoints(s));
      acc.pop();
      for (const t of s) used.delete(t.id);
      if (combos.length >= maxCombos) return;
    }
  };
  dfs(0, new Set(), [], 0);
  return combos;
}

function greedyPack(sets: RummikubTile[][]): RummikubTile[][] {
  const used = new Set<string>();
  const packed: RummikubTile[][] = [];
  const ranked = sets
    .slice()
    .sort((a, b) => b.length - a.length || setPoints(b) - setPoints(a));
  for (const s of ranked) {
    if (s.some((t) => used.has(t.id))) continue;
    packed.push(s);
    for (const t of s) used.add(t.id);
  }
  return packed;
}

const MAX_AI_COMMITS = 12;

function tableGroups(table: TableSet[]): string[][] {
  return table.map((s) => s.tiles.map((t) => t.id));
}

function tableAsTiles(table: TableSet[]): RummikubTile[][] {
  return table.map((s) => s.tiles.slice());
}

function idsOf(groups: RummikubTile[][]): string[][] {
  return groups.map((g) => g.map((t) => t.id));
}

export function commitRackPlayed(
  groups: string[][] | undefined,
  rackIds: Set<string>,
): number {
  if (!groups) return 0;
  return groups.flat().filter((id) => rackIds.has(id)).length;
}

/** Keep attaching leftover rack tiles to any valid group until stuck. */
export function greedilyAttach(
  groups: RummikubTile[][],
  leftover: RummikubTile[],
): { groups: RummikubTile[][]; leftover: RummikubTile[] } {
  const gs = groups.map((g) => g.slice());
  const left = leftover.slice();
  let progress = true;
  while (progress) {
    progress = false;
    for (let i = 0; i < left.length; i++) {
      const t = left[i]!;
      let placed = false;
      for (const g of gs) {
        if (isValidSet([...g, t])) {
          g.push(t);
          placed = true;
          break;
        }
      }
      if (placed) {
        left.splice(i, 1);
        i -= 1;
        progress = true;
      }
    }
  }
  return { groups: gs, leftover: left };
}

function toAction(
  playerId: PlayerId,
  groups: string[][],
): Extract<RummikubAction, { type: "commitTurn" }> {
  return { type: "commitTurn", playerId, payload: { groups } };
}

/**
 * Heuristic legal commits for AI: dump as many rack tiles as possible
 * (new sets + multi-tile extends). Does not enumerate full rearrangements.
 */
export function candidateCommitActions(
  table: TableSet[],
  rack: RummikubTile[],
  initialMeldDone: boolean,
  playerId: PlayerId,
): RummikubAction[] {
  const out: Extract<RummikubAction, { type: "commitTurn" }>[] = [];
  const seen = new Set<string>();
  const rackIds = new Set(rack.map((t) => t.id));
  const push = (groups: string[][]) => {
    const evald = evaluateCommit({
      table,
      rack,
      initialMeldDone,
      groups,
    });
    if (!evald.ok) return;
    const key = groups.map((g) => membershipKey(g)).sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    out.push(toAction(playerId, groups));
  };

  const rackSets = enumerateRackSets(rack);
  const minPts = initialMeldDone ? 0 : INITIAL_MELD;
  const packed = greedyPack(rackSets);
  const combos = disjointCombos(rackSets, minPts, 40);
  if (
    packed.length &&
    (initialMeldDone ||
      packed.reduce((s, g) => s + setPoints(g), 0) >= INITIAL_MELD)
  ) {
    combos.unshift(packed);
  }

  for (const combo of combos) {
    if (!combo.length) continue;
    push([...tableGroups(table), ...combo.map((s) => s.map((t) => t.id))]);
  }

  if (initialMeldDone) {
    // Pack new sets, then hang leftover tiles on table + new sets.
    if (packed.length) {
      const used = new Set(packed.flatMap((s) => s.map((t) => t.id)));
      const leftover = rack.filter((t) => !used.has(t.id));
      const attached = greedilyAttach(
        [...tableAsTiles(table), ...packed.map((s) => s.slice())],
        leftover,
      );
      push(idsOf(attached.groups));
    }

    // Hang on the existing table first, then pack remaining, then attach again.
    const attachedFirst = greedilyAttach(tableAsTiles(table), rack);
    push(idsOf(attachedFirst.groups));
    const restPacked = greedyPack(enumerateRackSets(attachedFirst.leftover));
    if (restPacked.length) {
      const used = new Set(restPacked.flatMap((s) => s.map((t) => t.id)));
      const leftover = attachedFirst.leftover.filter((t) => !used.has(t.id));
      const attached = greedilyAttach(
        [...attachedFirst.groups, ...restPacked.map((s) => s.slice())],
        leftover,
      );
      push(idsOf(attached.groups));
    }
  }

  out.sort((a, b) => {
    const na = commitRackPlayed(a.payload.groups, rackIds);
    const nb = commitRackPlayed(b.payload.groups, rackIds);
    if (nb !== na) return nb - na;
    return b.payload.groups.flat().length - a.payload.groups.flat().length;
  });

  const maxPlayed = out[0]
    ? commitRackPlayed(out[0].payload.groups, rackIds)
    : 0;
  const ranked =
    maxPlayed >= 2
      ? out.filter((a) => commitRackPlayed(a.payload.groups, rackIds) >= 2)
      : out;
  return ranked.slice(0, MAX_AI_COMMITS);
}

export function assignSetIds(
  oldTable: TableSet[],
  groups: RummikubTile[][],
  nextSeq: () => string,
): TableSet[] {
  const used = new Set<string>();
  return groups.map((tiles) => {
    const ids = new Set(tiles.map((t) => t.id));
    const match = oldTable.find(
      (s) =>
        !used.has(s.id) &&
        s.tiles.length === tiles.length &&
        s.tiles.every((t) => ids.has(t.id)),
    );
    if (match) {
      used.add(match.id);
      return { id: match.id, tiles };
    }
    return { id: nextSeq(), tiles };
  });
}
