const LOCALE_KEY = "preferred-locale";

export function saveLocalePreference(locale: string): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    // Storage unavailable (private browsing, quota exceeded, etc.)
  }
}

export function getLocalePreference(): string | null {
  try {
    return localStorage.getItem(LOCALE_KEY);
  } catch {
    return null;
  }
}
