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
        <div className="badge">Shared expenses</div>
        <div className="hero-heading">
          <h1>Split costs without the clutter</h1>
          <p>Keep tabs on who paid for what, settle balances quickly, and move on from the awkward math.</p>
        </div>

        <AppTabs />
      </section>

      <div className="section-grid stretch">
        <div className="section highlight">
          <h2>Quick add</h2>
          <p>
            Jump right into logging a debt with autocomplete for existing friends. Stay signed in so you can
            open the app and start typing immediately.
          </p>
          <Link className="cta-button" href="/add-debt">
            Open quick add
          </Link>
        </div>

        <div className="section highlight">
          <h2>Friends workspace</h2>
          <p>
            Review balances, edit debts, and manage your friend list. Everything stays organized so you know
            where you stand with everyone.
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
          log a single entry and get back to your day while your session stays ready for the next update.
        </p>
      </div>

      <AuthCard compact />
    </main>
  );
}
