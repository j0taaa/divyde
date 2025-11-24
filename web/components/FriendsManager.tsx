"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppTabs } from "./AppTabs";
import { DebtModal } from "./DebtModal";
import { Friend, FriendDebt, FriendDebtDirection, loadFriends, persistFriends } from "@/lib/friendsStore";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type DebtEditor = {
  friendId: string;
  direction: FriendDebtDirection;
};

type Props = {
  storageKey: string;
  title: string;
  helperText: string;
  emptyHint: string;
  mode: "offline" | "online";
  seedFriends?: Friend[];
};

function summarize(friend: Friend) {
  return friend.debts.reduce(
    (acc, debt) => {
      if (debt.direction === "fromFriend") {
        acc.owedToMe += debt.amount;
      } else {
        acc.iOwe += debt.amount;
      }
      acc.balance = acc.owedToMe - acc.iOwe;
      return acc;
    },
    { owedToMe: 0, iOwe: 0, balance: 0 },
  );
}

function AddFriendModal({
  friendName,
  onChange,
  onClose,
  onSubmit,
}: {
  friendName: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal__header">
          <div>
            <p className="eyebrow">Add friend</p>
            <h3>Create someone to track debts with</h3>
          </div>
          <button className="text-button" onClick={onClose} type="button">
            Close
          </button>
        </header>
        <form
          className="modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <label className="input-group" htmlFor="newFriendName">
            <span>Name</span>
            <input
              id="newFriendName"
              name="newFriendName"
              value={friendName}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Roommate, travel buddy, or vendor"
              required
            />
          </label>

          <div className="modal__actions">
            <button className="cta-button" type="submit">
              Save friend
            </button>
            <button className="text-button" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FriendsManager({
  storageKey,
  title,
  helperText,
  emptyHint,
  mode,
  seedFriends,
}: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendName, setFriendName] = useState("");
  const [ready, setReady] = useState(false);
  const [debtEditor, setDebtEditor] = useState<DebtEditor | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const router = useRouter();

  const seeds = useMemo(() => seedFriends ?? [], [seedFriends]);

  useEffect(() => {
    setFriends(loadFriends(storageKey, seeds));
    setReady(true);
  }, [seeds, storageKey]);

  useEffect(() => {
    if (ready) {
      persistFriends(storageKey, friends);
    }
  }, [friends, ready, storageKey]);

  const totals = useMemo(() => {
    return friends.reduce(
      (acc, friend) => {
        const summary = summarize(friend);
        acc.owedToMe += summary.owedToMe;
        acc.iOwe += summary.iOwe;
        return acc;
      },
      { owedToMe: 0, iOwe: 0 },
    );
  }, [friends]);

  function handleAddFriend() {
    const name = friendName.trim();
    if (!name) return;

    setFriends((existing) => [{ id: crypto.randomUUID(), name, debts: [] }, ...existing]);
    setFriendName("");
    setShowAddFriend(false);
  }

  function handleAddDebt(
    friendId: string,
    direction: FriendDebtDirection,
    title: string,
    amount: number,
    description: string,
  ) {
    const entry: FriendDebt = {
      id: crypto.randomUUID(),
      title,
      amount,
      description,
      direction,
      createdAt: new Date().toISOString(),
    };

    setFriends((existing) =>
      existing.map((friend) =>
        friend.id === friendId ? { ...friend, debts: [entry, ...friend.debts] } : friend,
      ),
    );
  }

  const friendsPath = mode === "offline" ? "/offline/friends" : "/online/friends";

  return (
    <main>
      <AppTabs />

      <header className="page-header">
        <div>
          <p className="eyebrow">{mode === "offline" ? "Works without network" : "Cloud ready"}</p>
          <h1>{title}</h1>
          <p>{helperText}</p>
        </div>
        <div className="totals compact">
          <div className="totals-card">
            <p className="label">Others owe me</p>
            <p className="total">{currencyFormatter.format(totals.owedToMe)}</p>
          </div>
          <div className="totals-card owed">
            <p className="label">I owe others</p>
            <p className="total">{currencyFormatter.format(totals.iOwe)}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <header className="section-header">
          <div>
            <h2>Friends</h2>
            <p className="muted">Tap a friend to open their full debt history.</p>
          </div>
        </header>

        <div className="friend-list-grid">
          <button
            type="button"
            className="friend-card add-friend-card"
            onClick={() => setShowAddFriend(true)}
            aria-label="Add friend"
          >
            <span className="add-friend-card__icon">＋</span>
            <div>
              <p className="label">Add friend</p>
              <p className="muted">Create a new friend to track debts.</p>
            </div>
          </button>

          {friends.length === 0 ? <p className="muted friend-grid__empty">{emptyHint}</p> : null}

          {friends.map((friend) => {
            const summary = summarize(friend);
            const lastDebt = friend.debts[0];

            return (
              <article
                key={friend.id}
                className="friend-card clickable"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`${friendsPath}/${friend.id}`)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`${friendsPath}/${friend.id}`);
                  }
                }}
              >
                <header className="friend-card__header">
                  <div>
                    <p className="label">{friend.debts.length} debt{friend.debts.length === 1 ? "" : "s"}</p>
                    <h3>{friend.name}</h3>
                    <p className="muted">
                      {lastDebt ? `Latest: ${lastDebt.title}` : "No debts yet. Open to add one."}
                    </p>
                  </div>
                  <div className="balance">
                    <span className={`pill ${summary.balance >= 0 ? "positive" : "negative"}`}>
                      {summary.balance >= 0 ? "They owe" : "I owe"}
                    </span>
                    <strong className="balance__value">{currencyFormatter.format(Math.abs(summary.balance))}</strong>
                  </div>
                </header>

                <div className="friend-card__actions" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setDebtEditor({ friendId: friend.id, direction: "fromFriend" })}
                  >
                    Debt from
                  </button>
                  <button
                    type="button"
                    className="outline-button"
                    onClick={() => setDebtEditor({ friendId: friend.id, direction: "toFriend" })}
                  >
                    Debt to
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {debtEditor ? (
        <DebtModal
          friend={friends.find((friend) => friend.id === debtEditor.friendId)!}
          direction={debtEditor.direction}
          onSave={(title, amount, description) =>
            handleAddDebt(debtEditor.friendId, debtEditor.direction, title, amount, description)
          }
          onClose={() => setDebtEditor(null)}
        />
      ) : null}

      {showAddFriend ? (
        <AddFriendModal
          friendName={friendName}
          onChange={setFriendName}
          onClose={() => {
            setFriendName("");
            setShowAddFriend(false);
          }}
          onSubmit={handleAddFriend}
        />
      ) : null}
    </main>
  );
}
