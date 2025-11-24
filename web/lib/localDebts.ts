export type LocalDebt = {
  id: string;
  counterparty: string;
  amount: number;
  note?: string;
  direction: "lent" | "borrowed";
  settled: boolean;
  createdAt: string;
};

const STORAGE_KEY = "divyde:debts";

function isStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadLocalDebts(): LocalDebt[] {
  if (!isStorageAvailable()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LocalDebt[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry) => typeof entry.id === "string" && typeof entry.counterparty === "string");
  } catch (error) {
    console.warn("Failed to read debts from local storage", error);
    return [];
  }
}

export function persistLocalDebts(debts: LocalDebt[]) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(debts));
  } catch (error) {
    console.warn("Failed to persist debts to local storage", error);
  }
}
