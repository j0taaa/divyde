"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppTabs } from "./AppTabs";
import { DebtModal } from "./DebtModal";
import { Friend, FriendDebt, FriendDebtDirection, loadFriends, persistFriends } from "@/lib/friendsStore";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Props = {
  friendId: string;
  storageKey: string;
  mode: "offline" | "online";
  seedFriends?: Friend[];
};

type DebtEditor = {
  direction: FriendDebtDirection;
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

export function FriendDetail({ friendId, storageKey, mode, seedFriends }: Props) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [ready, setReady] = useState(false);
  const [debtEditor, setDebtEditor] = useState<DebtEditor | null>(null);
  const seeds = useMemo(() => seedFriends ?? [], [seedFriends]);
  const router = useRouter();

  useEffect(() => {
    setFriends(loadFriends(storageKey, seeds));
    setReady(true);
  }, [seeds, storageKey]);

  useEffect(() => {
    if (ready) {
      persistFriends(storageKey, friends);
    }
  }, [friends, ready, storageKey]);

  const friend = friends.find((entry) => entry.id === friendId);
  const summary = friend ? summarize(friend) : null;
  const friendsPath = mode === "offline" ? "/offline/friends" : "/online/friends";

  function handleAddDebt(direction: FriendDebtDirection, title: string, amount: number, description: string) {
    if (!friend) return;

    const entry: FriendDebt = {
      id: crypto.randomUUID(),
      title,
      amount,
      description,
      direction,
      createdAt: new Date().toISOString(),
    };

    setFriends((existing) =>
      existing.map((current) =>
        current.id === friend.id ? { ...current, debts: [entry, ...current.debts] } : current,
      ),
    );
    setDebtEditor(null);
  }

  return (
    <main>
      <AppTabs />

      <header className="page-header friend-detail__header">
        <div>
          <button className="text-button" type="button" onClick={() => router.push(friendsPath)}>
            ← Back to friends
          </button>
          <p className="eyebrow">{mode === "offline" ? "Offline workspace" : "Online workspace"}</p>
          <h1>{friend ? friend.name : "Friend not found"}</h1>
          <p className="muted">Review the full debt history with this friend.</p>
        </div>
        {summary ? (
          <div className="totals compact">
            <div className="totals-card">
              <p className="label">They owe me</p>
              <p className="total">{currencyFormatter.format(summary.owedToMe)}</p>
            </div>
            <div className="totals-card owed">
              <p className="label">I owe them</p>
              <p className="total">{currencyFormatter.format(summary.iOwe)}</p>
            </div>
          </div>
        ) : null}
      </header>

      {!friend ? (
        <section className="section">
          <p className="muted">We couldn&apos;t find that friend in your {mode} list.</p>
          <Link className="cta-button" href={friendsPath}>
            Back to friends
          </Link>
        </section>
      ) : (
        <>
          <section className="section friend-detail__actions">
            <h2>Log a debt</h2>
              <div className="friend-card__actions">
                <button
                  type="button"
                  className="outline-button action-from"
                  onClick={() => setDebtEditor({ direction: "fromFriend" })}
                >
                  Debt from
                </button>
                <button
                  type="button"
                  className="outline-button action-to"
                  onClick={() => setDebtEditor({ direction: "toFriend" })}
                >
                  Debt to
                </button>
            </div>
          </section>

          <section className="section">
            <h2>Debt history</h2>
            <div className="debt-list">
              {friend.debts.length === 0 ? (
                <p className="muted">No debts logged yet for {friend.name}.</p>
              ) : (
                friend.debts.map((debt) => (
                  <article key={debt.id} className="debt-card">
                    <header className="debt-card__header">
                      <div>
                        <p className="label">{new Date(debt.createdAt).toLocaleString()}</p>
                        <h4>{debt.title}</h4>
                        <p className="muted">{debt.direction === "fromFriend" ? "They owe me" : "I owe them"}</p>
                      </div>
                      <span className={`chip ${debt.direction === "fromFriend" ? "lent" : "borrowed"}`}>
                        {debt.direction === "fromFriend" ? "From friend" : "To friend"}
                      </span>
                    </header>
                    <p className="debt-card__amount">{currencyFormatter.format(debt.amount)}</p>
                    {debt.description ? <p className="muted">{debt.description}</p> : null}
                  </article>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {debtEditor && friend ? (
        <DebtModal
          friend={friend}
          direction={debtEditor.direction}
          onSave={(title, amount, description) => handleAddDebt(debtEditor.direction, title, amount, description)}
          onClose={() => setDebtEditor(null)}
        />
      ) : null}
    </main>
  );
}
