"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export function AuthCard({ compact }: { compact?: boolean }) {
  const { user, status, signIn, signOut } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signIn(name, email);
    setName("");
    setEmail("");
    router.push("/add-debt");
  }

  if (status === "authenticated" && user) {
    return (
      <div className={`section auth-card ${compact ? "compact" : ""}`}>
        <div>
          <p className="eyebrow">Account</p>
          <h2>{user.name}</h2>
          <p className="muted compact">Signed in as {user.email}. Your debts stay linked to this device.</p>
          <p className="muted compact">Joined on {new Date(user.createdAt).toLocaleDateString()}.</p>
        </div>
        <div className="auth-card__actions">
          <button className="cta-button" type="button" onClick={() => router.push("/add-debt")}>Continue to add debt</button>
          <button className="text-button" type="button" onClick={signOut}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`section auth-card ${compact ? "compact" : ""}`}>
      <header className="section-header">
        <div>
          <p className="eyebrow">PWA account</p>
          <h2>Save your debts to this device</h2>
          <p className="muted compact">Sign in with a name and email to keep your session alive between visits.</p>
        </div>
        <div className="pill muted-chip">Offline-ready</div>
      </header>

      <form className="auth-card__form" onSubmit={handleSubmit}>
        <label className="input-group" htmlFor="name">
          <span>Name</span>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Casey, Alex, or team name"
            required
          />
        </label>

        <label className="input-group" htmlFor="email">
          <span>Email</span>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <button className="cta-button" type="submit">
          Sign in on this device
        </button>
      </form>
    </div>
  );
}
