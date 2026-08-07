import type { PluginPlayModule } from "./plugin-types";

const modules = new Map<string, PluginPlayModule>();

export function registerPlayModule(mod: PluginPlayModule): void {
  if (!mod.id) throw new Error("PluginPlayModule.id is required");
  if (modules.has(mod.id) && modules.get(mod.id) !== mod) {
    // Hot reload / double import — last write wins
  }
  modules.set(mod.id, mod);
}

export function getPlayModule(id: string): PluginPlayModule | undefined {
  return modules.get(id);
}

export function requirePlayModule(id: string): PluginPlayModule {
  const mod = modules.get(id);
  if (!mod) {
    throw new Error(
      `Unknown BBGE play plugin "${id}". Register it with registerPlayModule().`,
    );
  }
  return mod;
}

export function listPlayModuleIds(): string[] {
  return [...modules.keys()];
}
