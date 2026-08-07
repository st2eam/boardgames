function basePath(): string {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/boardgames")
  ) {
    return "/boardgames";
  }
  return "";
}

export function cardFaceUrl(value: number): string {
  const n = Math.max(0, Math.min(13, Math.floor(value)));
  const file = `cabo_${String(n).padStart(2, "0")}.webp`;
  return `${basePath()}/images/bbge/cabo/${file}`;
}

export function cardBackUrl(): string {
  return `${basePath()}/images/bbge/cabo/cabo_back.webp`;
}
