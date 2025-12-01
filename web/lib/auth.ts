export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const STORAGE_KEY = "divyde:session";

function isStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadSession(): AuthUser | null {
  if (!isStorageAvailable()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.createdAt !== "string"
    ) {
      return null;
    }
    return parsed as AuthUser;
  } catch (error) {
    console.warn("Failed to parse saved session", error);
    return null;
  }
}

export function persistSession(user: AuthUser) {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn("Failed to persist session", error);
  }
}

export function clearSession() {
  if (!isStorageAvailable()) return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear session", error);
  }
}
