export interface LocalSimultaneousSeat {
  id: string;
  pending: boolean;
}

/** Prefer the current hotseat owner, then pass to the next local player waiting to act. */
export function nextPendingLocalSeat(
  preferredId: string,
  seats: LocalSimultaneousSeat[],
): string | null {
  if (seats.some((seat) => seat.id === preferredId && seat.pending)) {
    return preferredId;
  }
  return seats.find((seat) => seat.pending)?.id ?? null;
}
