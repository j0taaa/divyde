"use client";

import { useEffect, useMemo, useState } from "react";
import { loadLocalDebts, persistLocalDebts, type LocalDebt } from "@/lib/localDebts";

type FormState = {
  counterparty: string;
  amount: string;
  note: string;
  direction: LocalDebt["direction"];
};

function createEmptyForm(): FormState {
  return {
    counterparty: "",
    amount: "",
    note: "",
    direction: "lent",
  };
}

export function OfflineDebtManager() {
  const [debts, setDebts] = useState<LocalDebt[]>([]);
  const [form, setForm] = useState<FormState>(createEmptyForm);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDebts(loadLocalDebts());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      persistLocalDebts(debts);
    }
  }, [debts, ready]);

  const totals = useMemo(() => {
    return debts.reduce(
      (acc, debt) => {
        if (debt.direction === "lent" && !debt.settled) {
          acc.owedToMe += debt.amount;
        }
        if (debt.direction === "borrowed" && !debt.settled) {
          acc.iOwe += debt.amount;
        }
        return acc;
      },
      { owedToMe: 0, iOwe: 0 },
    );
  }, [debts]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number.parseFloat(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Enter a valid amount greater than zero");
      return;
    }

    if (!form.counterparty.trim()) {
      alert("Who is this debt with?");
      return;
    }

    setDebts((existing) => [
      {
        id: crypto.randomUUID(),
        counterparty: form.counterparty.trim(),
        amount: Number(amount.toFixed(2)),
        note: form.note.trim(),
        direction: form.direction,
        settled: false,
        createdAt: new Date().toISOString(),
      },
      ...existing,
    ]);

    setForm(createEmptyForm());
  }

  function toggleSettlement(id: string) {
    setDebts((existing) =>
      existing.map((debt) =>
        debt.id === id
          ? {
              ...debt,
              settled: !debt.settled,
            }
          : debt,
      ),
    );
  }

  function removeDebt(id: string) {
    setDebts((existing) => existing.filter((debt) => debt.id !== id));
  }

  return (
    <section className="section debt-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">Offline-first records</p>
          <h2>Track debts locally</h2>
          <p>
            Everything you add here is saved to your device. When online features
            are available, these records can sync to your account without
            blocking your progress.
          </p>
        </div>
        <div className="totals">
          <div className="totals-card">
            <p className="label">Others owe me</p>
            <p className="total">${totals.owedToMe.toFixed(2)}</p>
          </div>
          <div className="totals-card owed">
            <p className="label">I owe others</p>
            <p className="total">${totals.iOwe.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <form className="debt-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="counterparty">Who</label>
          <input
            id="counterparty"
            name="counterparty"
            value={form.counterparty}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, counterparty: event.target.value }))
            }
            placeholder="Roommate, friend, or vendor"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="amount">Amount</label>
          <div className="input-with-prefix">
            <span>$</span>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              placeholder="0.00"
              min={0}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="direction">Direction</label>
          <select
            id="direction"
            name="direction"
            value={form.direction}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, direction: event.target.value as LocalDebt["direction"] }))
            }
          >
            <option value="lent">They owe me</option>
            <option value="borrowed">I owe them</option>
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="note">Notes</label>
          <textarea
            id="note"
            name="note"
            value={form.note}
            onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Add context like receipts, due dates, or payment methods"
            rows={2}
          />
        </div>

        <button className="cta-button" type="submit">
          Save to device
        </button>
      </form>

      <div className="debt-list">
        {debts.length === 0 ? (
          <p className="muted">No debts tracked yet. Add your first entry above.</p>
        ) : (
          debts.map((debt) => (
            <article key={debt.id} className="debt-card">
              <header className="debt-card__header">
                <div>
                  <p className="label">{new Date(debt.createdAt).toLocaleDateString()}</p>
                  <h3>{debt.counterparty}</h3>
                </div>
                <span className={`chip ${debt.direction}`}>
                  {debt.direction === "lent" ? "They owe me" : "I owe them"}
                </span>
              </header>
              <p className="debt-card__amount">${debt.amount.toFixed(2)}</p>
              {debt.note ? <p className="muted">{debt.note}</p> : null}
              <div className="debt-card__actions">
                <button
                  type="button"
                  className="text-button"
                  onClick={() => toggleSettlement(debt.id)}
                >
                  {debt.settled ? "Mark as outstanding" : "Mark as settled"}
                </button>
                <button type="button" className="text-button danger" onClick={() => removeDebt(debt.id)}>
                  Remove
                </button>
              </div>
              {debt.settled ? <div className="status settled">Settled</div> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
