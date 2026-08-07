import { registerPlayModule } from "@bbge/ui";
import { loveLetterPlayModule } from "@bbge/love-letter";
import { texasHoldemPlayModule } from "@bbge/texas-holdem";
import { sixNimmtPlayModule } from "@bbge/six-nimmt";
import { goPlayModule } from "@bbge/go";
import { caboPlayModule } from "@bbge/cabo";
import { unoPlayModule } from "@bbge/uno";

let registered = false;

/** Idempotent: register first-party BBGE play modules for PlayShell lookup. */
export function ensurePlayPluginsRegistered(): void {
  if (registered) return;
  registerPlayModule(loveLetterPlayModule);
  registerPlayModule(texasHoldemPlayModule);
  registerPlayModule(sixNimmtPlayModule);
  registerPlayModule(goPlayModule);
  registerPlayModule(caboPlayModule);
  registerPlayModule(unoPlayModule);
  registered = true;
}
