export async function executeToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<string> {
  switch (name) {
    case "get_game_rules": {
      const slug = args.slug as string;
      const locale = (args.locale as string) || "en";
      try {
        const resp = await fetch("/data/games-index.json");
        const games = await resp.json();
        const game = games.find((g: { slug: string }) => g.slug === slug);
        if (!game) {
          return `Game not found: ${slug}. Available games: ${games.map((g: { slug: string }) => g.slug).join(", ")}`;
        }
        const rules = game.rules?.[locale] ?? game.rules?.en;
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
