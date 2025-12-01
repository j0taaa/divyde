"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppTabs } from "@/components/AppTabs";
import { AuthCard } from "@/components/AuthCard";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/add-debt");
    }
  }, [router, status]);

  return (
    <main className="home">
      <section className="hero-panel">
        <div className="badge">PWA</div>
        <div className="hero-heading">
          <h1>Divyde lives as a PWA</h1>
          <p>
            Install the web app, stay signed in, and track shared expenses from anywhere. Debts stay on your
            device and sync when you come back.
          </p>
        </div>

        <AppTabs />
      </section>

      <div className="section-grid stretch">
        <div className="section highlight">
          <h2>Quick add</h2>
          <p>
            Jump right into logging a debt with autocomplete for existing friends. Your session is stored so
            you can open the PWA and start typing immediately.
          </p>
          <Link className="cta-button" href="/add-debt">
            Open quick add
          </Link>
        </div>

        <div className="section highlight">
          <h2>Friends workspace</h2>
          <p>
            Review balances, edit debts, and manage your friend list. Everything is saved locally for a fast
            PWA experience.
          </p>
          <Link className="cta-button" href="/friends">
            Open friends
          </Link>
        </div>
      </div>

      <div className="section callout">
        <h2>How debts work</h2>
        <p className="muted">
          Each friend has quick buttons for adding a debt from them or to them. The quick add screen lets you
          log a single entry and get back to your day while the PWA keeps your session alive.
        </p>
      </div>

      <AuthCard compact />
    </main>
  );
}
