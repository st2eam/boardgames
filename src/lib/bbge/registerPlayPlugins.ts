import { registerPlayModule } from "@bbge/ui";
import { loveLetterPlayModule } from "@bbge/love-letter";

let registered = false;

/** Idempotent: register first-party BBGE play modules for PlayShell lookup. */
export function ensurePlayPluginsRegistered(): void {
  if (registered) return;
  registerPlayModule(loveLetterPlayModule);
  registered = true;
}
