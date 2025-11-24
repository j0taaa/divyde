export type FriendDebtDirection = "fromFriend" | "toFriend";

export type FriendDebt = {
  id: string;
  amount: number;
  note?: string;
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

  return raw
    .map((friend) => {
      if (!friend || typeof friend !== "object") return null;

      const typedFriend = friend as Partial<Friend>;
      if (typeof typedFriend.id !== "string" || typeof typedFriend.name !== "string") {
        return null;
      }

      const debts = Array.isArray(typedFriend.debts)
        ? typedFriend.debts
            .map((debt) => {
              if (!debt || typeof debt !== "object") return null;
              const typedDebt = debt as Partial<FriendDebt>;
              if (
                typeof typedDebt.id !== "string" ||
                typeof typedDebt.amount !== "number" ||
                !Number.isFinite(typedDebt.amount) ||
                typedDebt.amount < 0 ||
                (typedDebt.direction !== "fromFriend" && typedDebt.direction !== "toFriend") ||
                typeof typedDebt.createdAt !== "string"
              ) {
                return null;
              }

              return {
                id: typedDebt.id,
                amount: Number(typedDebt.amount.toFixed(2)),
                note: typedDebt.note ?? "",
                direction: typedDebt.direction,
                createdAt: typedDebt.createdAt,
              } satisfies FriendDebt;
            })
            .filter(Boolean)
        : [];

      return {
        id: typedFriend.id,
        name: typedFriend.name,
        debts,
      } satisfies Friend;
    })
    .filter(Boolean) as Friend[];
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
