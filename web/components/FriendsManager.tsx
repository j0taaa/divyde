"use client";

import { useEffect, useMemo, useState } from "react";
import { AppTabs } from "./AppTabs";
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

function DebtModal({
  friend,
  direction,
  onSave,
  onClose,
}: {
  friend: Friend;
  direction: FriendDebtDirection;
  onSave: (amount: number, note: string) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      alert("Enter a valid amount greater than zero");
      return;
    }

    onSave(Number(parsedAmount.toFixed(2)), note.trim());
    setAmount("");
    setNote("");
    onClose();
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <header className="modal__header">
          <div>
            <p className="eyebrow">{direction === "fromFriend" ? "Debt from" : "Debt to"}</p>
            <h3>{friend.name}</h3>
          </div>
          <button className="text-button" onClick={onClose} type="button">
            Close
          </button>
        </header>
        <form className="modal__form" onSubmit={handleSubmit}>
          <label className="input-group" htmlFor="amount">
            <span>Amount</span>
            <div className="input-with-prefix">
              <span>$</span>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={amount}
                min={0}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </label>

          <label className="input-group" htmlFor="note">
            <span>Note</span>
            <textarea
              id="note"
              name="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Add details like what the debt covers or due dates"
              rows={3}
            />
          </label>

          <div className="modal__actions">
            <button className="cta-button" type="submit">
              Save debt
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
  const [expandedFriend, setExpandedFriend] = useState<string | null>(null);
  const [debtEditor, setDebtEditor] = useState<DebtEditor | null>(null);

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

  function handleAddFriend(event: React.FormEvent) {
    event.preventDefault();
    const name = friendName.trim();
    if (!name) return;

    setFriends((existing) => [{ id: crypto.randomUUID(), name, debts: [] }, ...existing]);
    setFriendName("");
  }

  function handleAddDebt(friendId: string, direction: FriendDebtDirection, amount: number, note: string) {
    const entry: FriendDebt = {
      id: crypto.randomUUID(),
      amount,
      note,
      direction,
      createdAt: new Date().toISOString(),
    };

    setFriends((existing) =>
      existing.map((friend) =>
        friend.id === friendId ? { ...friend, debts: [entry, ...friend.debts] } : friend,
      ),
    );
  }

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

      <section className="friend-grid">
        <div className="section">
          <h2>Add a friend</h2>
          <p className="muted">Keep people organised so you can assign debts quickly.</p>
          <form className="friend-form" onSubmit={handleAddFriend}>
            <label className="input-group" htmlFor="friendName">
              <span>Name</span>
              <input
                id="friendName"
                name="friendName"
                value={friendName}
                onChange={(event) => setFriendName(event.target.value)}
                placeholder="Roommate, travel buddy, or vendor"
                required
              />
            </label>
            <button className="cta-button" type="submit">
              Add friend
            </button>
          </form>
        </div>

        <div className="section">
          <h2>Friends</h2>
          {friends.length === 0 ? (
            <p className="muted">{emptyHint}</p>
          ) : (
            <div className="friend-list">
              {friends.map((friend) => {
                const summary = summarize(friend);
                const isExpanded = expandedFriend === friend.id;

                return (
                  <article key={friend.id} className={`friend-card ${isExpanded ? "expanded" : ""}`}>
                    <header className="friend-card__header" onClick={() => setExpandedFriend(isExpanded ? null : friend.id)}>
                      <div>
                        <p className="label">{friend.debts.length} debt{friend.debts.length === 1 ? "" : "s"}</p>
                        <h3>{friend.name}</h3>
                        <p className="muted">Tap to {isExpanded ? "hide" : "view"} their summary.</p>
                      </div>
                      <div className="balance">
                        <span className={`pill ${summary.balance >= 0 ? "positive" : "negative"}`}>
                          {summary.balance >= 0 ? "They owe" : "I owe"}
                        </span>
                        <strong className="balance__value">{currencyFormatter.format(Math.abs(summary.balance))}</strong>
                      </div>
                    </header>

                    <div className="friend-card__actions">
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

                    {isExpanded ? (
                      <div className="debt-breakdown">
                        <div className="debt-breakdown__totals">
                          <div>
                            <p className="label">They owe me</p>
                            <p className="total">{currencyFormatter.format(summary.owedToMe)}</p>
                          </div>
                          <div>
                            <p className="label">I owe them</p>
                            <p className="total">{currencyFormatter.format(summary.iOwe)}</p>
                          </div>
                        </div>
                        <div className="debt-list debt-list--inline">
                          {friend.debts.length === 0 ? (
                            <p className="muted">No debts yet for this friend.</p>
                          ) : (
                            friend.debts.map((debt) => (
                              <article key={debt.id} className="debt-card compact">
                                <header className="debt-card__header">
                                  <div>
                                    <p className="label">{new Date(debt.createdAt).toLocaleString()}</p>
                                    <h4>{debt.direction === "fromFriend" ? "They owe me" : "I owe them"}</h4>
                                  </div>
                                  <span className={`chip ${debt.direction === "fromFriend" ? "lent" : "borrowed"}`}>
                                    {debt.direction === "fromFriend" ? "From friend" : "To friend"}
                                  </span>
                                </header>
                                <p className="debt-card__amount">{currencyFormatter.format(debt.amount)}</p>
                                {debt.note ? <p className="muted">{debt.note}</p> : null}
                              </article>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {debtEditor ? (
        <DebtModal
          friend={friends.find((friend) => friend.id === debtEditor.friendId)!}
          direction={debtEditor.direction}
          onSave={(amount, note) => handleAddDebt(debtEditor.friendId, debtEditor.direction, amount, note)}
          onClose={() => setDebtEditor(null)}
        />
      ) : null}
    </main>
  );
}
