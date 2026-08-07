function basePath(): string {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/boardgames")
  ) {
    return "/boardgames";
  }
  return "";
}

export function trioFaceUrl(value: number): string {
  const n = Math.max(1, Math.min(12, Math.floor(value)));
  return `${basePath()}/images/bbge/trio/trio_${String(n).padStart(2, "0")}.webp`;
}

export function trioBackUrl(): string {
  return `${basePath()}/images/bbge/trio/trio_back.webp`;
}
