"use client";

import { useState } from "react";
import type { Friend, FriendDebtDirection } from "@/lib/friendsStore";

export function DebtModal({
  friend,
  direction,
  onSave,
  onClose,
}: {
  friend: Friend;
  direction: FriendDebtDirection;
  onSave: (title: string, amount: number, description: string) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      alert("Enter a valid amount greater than zero");
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert("Please add a debt name");
      return;
    }

    onSave(trimmedTitle, Number(parsedAmount.toFixed(2)), description.trim());
    setAmount("");
    setTitle("");
    setDescription("");
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
          <label className="input-group" htmlFor="title">
            <span>Debt name</span>
            <input
              id="title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What is this debt for?"
              required
            />
          </label>

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

          <label className="input-group" htmlFor="description">
            <span>Description</span>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
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
