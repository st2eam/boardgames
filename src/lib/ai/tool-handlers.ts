export async function executeToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "get_game_rules": {
      const slug = args.slug as string;
      const locale = (args.locale as string) || "en";
      try {
        // First get game metadata
        const metaResp = await fetch("/boardgames/data/games-meta.json", { cache: "no-store" });
        const games = await metaResp.json();
        const game = games.find((g: { slug: string }) => g.slug === slug);
        if (!game) {
          return `Game not found: ${slug}. Available games: ${games.map((g: { slug: string }) => g.slug).join(", ")}`;
        }
        // Load rules from per-game file
        const rulesResp = await fetch(`/boardgames/data/rules/${slug}.json`, { cache: "no-store" });
        if (!rulesResp.ok) {
          return `No rules available for ${game.name[locale] ?? game.name.en}.`;
        }
        const rulesData = await rulesResp.json();
        const rules = rulesData[locale] ?? rulesData.en;
        if (!rules) {
          return `No rules available for ${game.name[locale] ?? game.name.en} in ${locale}.`;
        }
        return `# ${game.name[locale] ?? game.name.en}\n\nPlayers: ${game.players}\nDuration: ${game.duration}\n\n${rules}`;
      } catch {
        return "Failed to load game data. Please try again.";
      }
    }
    default:
      return `Unknown tool: ${name}`;
  }
}
