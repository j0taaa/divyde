export type FriendDebtDirection = "fromFriend" | "toFriend";

export type FriendDebt = {
  id: string;
  title: string;
  amount: number;
  description?: string;
  direction: FriendDebtDirection;
  createdAt: string;
};

export type Friend = {
  id: string;
  name: string;
  debts: FriendDebt[];
};

function isStorageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sanitizeFriends(raw: unknown): Friend[] {
  if (!Array.isArray(raw)) return [];

  const sanitized: Friend[] = [];

  for (const friend of raw) {
    if (!friend || typeof friend !== "object") continue;

    const typedFriend = friend as Partial<Friend>;
    if (typeof typedFriend.id !== "string" || typeof typedFriend.name !== "string") {
      continue;
    }

    const debts: FriendDebt[] = [];

    if (Array.isArray(typedFriend.debts)) {
      for (const debt of typedFriend.debts) {
        if (!debt || typeof debt !== "object") continue;
        const typedDebt = debt as Partial<FriendDebt> & { note?: string };
        if (
          typeof typedDebt.id !== "string" ||
          typeof typedDebt.amount !== "number" ||
          !Number.isFinite(typedDebt.amount) ||
          typedDebt.amount < 0 ||
          (typedDebt.direction !== "fromFriend" && typedDebt.direction !== "toFriend") ||
          typeof typedDebt.createdAt !== "string"
        ) {
          continue;
        }

        debts.push({
          id: typedDebt.id,
          title: typedDebt.title && typeof typedDebt.title === "string"
            ? typedDebt.title
            : typedDebt.note && typeof typedDebt.note === "string"
              ? typedDebt.note
              : "Untitled debt",
          amount: Number(typedDebt.amount.toFixed(2)),
          description: typedDebt.description ?? typedDebt.note ?? "",
          direction: typedDebt.direction,
          createdAt: typedDebt.createdAt,
        });
      }
    }

    sanitized.push({
      id: typedFriend.id,
      name: typedFriend.name,
      debts,
    });
  }

  return sanitized;
}

function cloneFriends(friends: Friend[]): Friend[] {
  return friends.map((friend) => ({
    ...friend,
    debts: friend.debts.map((debt) => ({ ...debt })),
  }));
}

export function loadFriends(storageKey: string, seed: Friend[] = []): Friend[] {
  if (!isStorageAvailable()) {
    return cloneFriends(seed);
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return cloneFriends(seed);
  }

  try {
    const parsed = JSON.parse(raw);
    const sanitized = sanitizeFriends(parsed);
    if (sanitized.length === 0 && seed.length > 0) {
      return cloneFriends(seed);
    }
    return sanitized;
  } catch (error) {
    console.warn(`Failed to read friends from local storage (${storageKey})`, error);
    return cloneFriends(seed);
  }
}

export function persistFriends(storageKey: string, friends: Friend[]) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(friends));
  } catch (error) {
    console.warn(`Failed to persist friends to local storage (${storageKey})`, error);
  }
}
