function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      out[key] = sortKeys(obj[key]);
    }
    return out;
  }
  return value;
}

/** Stable hash for determinism tests (djb2 over sorted JSON). */
export function stableHash(value: unknown): string {
  const json = JSON.stringify(sortKeys(value));
  let h = 5381;
  for (let i = 0; i < json.length; i++) {
    h = ((h << 5) + h) ^ json.charCodeAt(i);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}
