const KEY = "sol-beautiful-2fa";

type Unlock = { userId: string; at: number };

function read(): Unlock | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Unlock;
    if (!parsed.userId || !parsed.at) return null;
    if (Date.now() - parsed.at > 12 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isTwoFactorUnlocked(userId: string) {
  const u = read();
  return Boolean(u && u.userId === userId);
}

export function markTwoFactorUnlocked(userId: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ userId, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function clearTwoFactorUnlock() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
