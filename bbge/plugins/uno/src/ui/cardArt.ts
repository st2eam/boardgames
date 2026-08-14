function basePath(): string {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/boardgames")
  ) {
    return "/boardgames";
  }
  return "";
}

export function unoBackUrl(edition?: string): string {
  const file = edition === "no-mercy" ? "uno_back_no_mercy.webp" : "uno_back.webp";
  return `${basePath()}/images/bbge/uno/${file}`;
}
