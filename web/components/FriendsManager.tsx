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
  seedFriends?: Friend[];
  helperBadges?: string[];
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
  seedFriends,
  helperBadges = ["Private to your device", "One tap to update debts"],
}: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendName, setFriendName] = useState("");
  const [ready, setReady] = useState(false);
  const [debtEditor, setDebtEditor] = useState<DebtEditor | null>(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
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
      existing.map((friend) => (friend.id === friendId ? { ...friend, debts: [entry, ...friend.debts] } : friend)),
    );
  }

  function handleDeleteFriend(friendId: string) {
    const friend = friends.find((entry) => entry.id === friendId);
    const confirmed = window.confirm(
      `Delete ${friend?.name ?? "this friend"}? This will also remove their debt history.`,
    );

    if (!confirmed) return;

    setFriends((existing) => existing.filter((friend) => friend.id !== friendId));

    if (debtEditor?.friendId === friendId) {
      setDebtEditor(null);
    }
  }

  const friendsPath = "/friends";

  return (
    <main>
      <AppTabs />

      <header className="page-header">
        <div>
          <p className="eyebrow">PWA workspace</p>
          <h1>{title}</h1>
          <div className="helper-banner">
            <p className="muted compact">{helperText}</p>
            <div className="helper-banner__badges">
              {helperBadges.map((badge) => (
                <span key={badge} className="chip pill subtle">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="totals compact totals-panel">
          <div className="totals-card">
            <p className="label">Others owe me</p>
            <p className="total">{currencyFormatter.format(totals.owedToMe)}</p>
            <p className="muted compact">Keep this positive to stay ahead.</p>
          </div>
          <div className="totals-card owed">
            <p className="label">I owe others</p>
            <p className="total">{currencyFormatter.format(totals.iOwe)}</p>
            <p className="muted compact">Pay these down to stay balanced.</p>
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
            const lastUpdated = lastDebt
              ? new Date(lastDebt.createdAt).toLocaleDateString()
              : "No activity yet";

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
                  <div className="friend-avatar" aria-hidden="true">
                    {friend.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-card__title">
                    <div className="friend-card__row">
                      <h3>{friend.name}</h3>
                      <span className={`pill ${summary.balance >= 0 ? "positive" : "negative"}`}>
                        {summary.balance >= 0 ? "They owe" : "I owe"}
                      </span>
                    </div>
                    <p className="muted compact">
                      {lastDebt
                        ? `Latest: ${lastDebt.title}`
                        : "No debts yet. Open this card to start tracking."}
                    </p>
                  </div>
                  <div className="friend-card__menu" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Friend actions"
                      onClick={() => setMenuOpenId((current) => (current === friend.id ? null : friend.id))}
                    >
                      ⋯
                    </button>
                    {menuOpenId === friend.id ? (
                      <div className="friend-card__menu-items">
                        <button
                          type="button"
                          className="text-button danger"
                          onClick={() => {
                            handleDeleteFriend(friend.id);
                            setMenuOpenId(null);
                          }}
                        >
                          Delete friend
                        </button>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            router.push(`${friendsPath}/${friend.id}`);
                            setMenuOpenId(null);
                          }}
                        >
                          Open details
                        </button>
                      </div>
                    ) : null}
                  </div>
                </header>

                <div className="friend-card__stats">
                  <div>
                    <p className="label">They owe me</p>
                    <p className="stat-value positive">{currencyFormatter.format(summary.owedToMe)}</p>
                  </div>
                  <div>
                    <p className="label">I owe them</p>
                    <p className="stat-value negative">{currencyFormatter.format(summary.iOwe)}</p>
                  </div>
                  <div>
                    <p className="label">Last update</p>
                    <p className="muted compact">{lastUpdated}</p>
                  </div>
                </div>

                <div className="friend-card__actions" onClick={(event) => event.stopPropagation()}>
                  <button
                    type="button"
                    className="outline-button action-from"
                    onClick={() => setDebtEditor({ friendId: friend.id, direction: "fromFriend" })}
                  >
                    Debt from
                  </button>
                  <button
                    type="button"
                    className="outline-button action-to"
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
