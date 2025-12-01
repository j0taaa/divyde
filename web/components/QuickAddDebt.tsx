"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Friend, FriendDebt, FriendDebtDirection, loadFriends, persistFriends } from "@/lib/friendsStore";
import { PWA_FRIENDS_STORAGE_KEY } from "@/lib/constants";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type DebtDirectionOption = {
  value: FriendDebtDirection;
  label: string;
  helper: string;
};

const directionOptions: DebtDirectionOption[] = [
  { value: "fromFriend", label: "They owe me", helper: "You covered a cost" },
  { value: "toFriend", label: "I owe them", helper: "They paid on your behalf" },
];

export function QuickAddDebt() {
  const { status, user } = useAuth();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [ready, setReady] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState<FriendDebtDirection>("fromFriend");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [router, status]);

  useEffect(() => {
    setFriends(loadFriends(PWA_FRIENDS_STORAGE_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      persistFriends(PWA_FRIENDS_STORAGE_KEY, friends);
    }
  }, [friends, ready]);

  const friendSuggestions = useMemo(() => friends.map((friend) => friend.name), [friends]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || status !== "authenticated") return;

    const normalizedName = friendName.trim();
    const parsedAmount = Number.parseFloat(amount);

    if (!normalizedName) {
      setToast("Add who this debt is with");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setToast("Enter an amount greater than zero");
      return;
    }

    const entry: FriendDebt = {
      id: crypto.randomUUID(),
      amount: Number(parsedAmount.toFixed(2)),
      createdAt: new Date().toISOString(),
      description: note.trim(),
      direction,
      title: note.trim() ? note.trim() : "New debt",
    };

    setFriends((current) => {
      const existing = current.find((friend) => friend.name.toLowerCase() === normalizedName.toLowerCase());
      if (existing) {
        return current.map((friend) =>
          friend.id === existing.id ? { ...friend, debts: [entry, ...friend.debts] } : friend,
        );
      }

      const newFriend: Friend = {
        id: crypto.randomUUID(),
        name: normalizedName,
        debts: [entry],
      };

      return [newFriend, ...current];
    });

    setToast(`${normalizedName} updated (${currencyFormatter.format(parsedAmount)})`);
    setFriendName("");
    setAmount("");
    setNote("");
  }

  if (status !== "authenticated") {
    return (
      <section className="section">
        <p className="muted">Redirecting you to sign in so you can save your debts securely.</p>
      </section>
    );
  }

  return (
    <section className="section quick-add">
      <header className="section-header">
        <div>
          <p className="eyebrow">Welcome back{user ? `, ${user.name}` : ""}</p>
          <h1>Quickly add a debt</h1>
          <p className="muted compact">
            Capture a single debt in seconds. Pick or type a friend name, enter an amount, and choose who owes who.
          </p>
        </div>
        <div className="pill muted-chip">Signed in for PWA sync</div>
      </header>

      <form className="quick-add__form" onSubmit={handleSubmit}>
        <label className="input-group" htmlFor="friendName">
          <span>Friend</span>
          <input
            list="friend-suggestions"
            id="friendName"
            name="friendName"
            value={friendName}
            onChange={(event) => setFriendName(event.target.value)}
            placeholder="Start typing to search or create a friend"
            required
          />
          <datalist id="friend-suggestions">
            {friendSuggestions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </label>

        <label className="input-group" htmlFor="amount">
          <span>Amount</span>
          <div className="input-with-prefix">
            <span>$</span>
            <input
              id="amount"
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </label>

        <label className="input-group" htmlFor="note">
          <span>Note (optional)</span>
          <input
            id="note"
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Brunch, utilities, rideshare..."
          />
        </label>

        <div className="direction-picker" role="radiogroup" aria-label="Debt direction">
          {directionOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`direction-pill ${direction === option.value ? "active" : ""}`}
              onClick={() => setDirection(option.value)}
              aria-pressed={direction === option.value}
            >
              <span className="direction-pill__label">{option.label}</span>
              <span className="muted compact">{option.helper}</span>
            </button>
          ))}
        </div>

        <div className="quick-add__actions">
          <button className="cta-button" type="submit">
            Add debt
          </button>
          <button className="text-button" type="button" onClick={() => router.push("/friends")}>View all friends</button>
        </div>
      </form>

      {toast ? <div className="toast">{toast}</div> : null}
    </section>
  );
}
