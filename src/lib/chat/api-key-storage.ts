import { get, set } from "idb-keyval";

const LS_KEY = "deepseek-api-key";
const IDB_KEY = "deepseek-api-key";

export async function loadApiKey(): Promise<string | null> {
  let key: string | null = null;

  try {
    key = localStorage.getItem(LS_KEY);
  } catch {
    // localStorage unavailable
  }

  if (!key) {
    try {
      key = (await get<string>(IDB_KEY)) ?? null;
      if (key) {
        try {
          localStorage.setItem(LS_KEY, key);
        } catch {
          // sync back failed, not critical
        }
      }
    } catch {
      // IndexedDB unavailable
    }
  }

  return key;
}

export async function saveApiKey(key: string): Promise<void> {
  try {
    localStorage.setItem(LS_KEY, key);
  } catch {
    // localStorage unavailable
  }

  try {
    await set(IDB_KEY, key);
  } catch {
    // IndexedDB unavailable
  }
}
