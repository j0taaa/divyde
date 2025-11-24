import Link from "next/link";
import { AppTabs } from "@/components/AppTabs";

export default function Home() {
  return (
    <main>
      <div className="badge">Web</div>
      <h1>Welcome to Divyde</h1>
      <p>
        Divyde keeps shared expenses organised with a simple split between offline and online
        workspaces. Pick a tab to jump straight into your friends list, add debts to and from each
        person, and keep balances visible at a glance.
      </p>

      <AppTabs />

      <div className="section-grid">
        <div className="section">
          <h2>Offline workspace</h2>
          <p>
            Add friends, track who owes what, and stay productive without a connection. Everything is
            saved to your device until you are ready to sync.
          </p>
          <Link className="cta-button" href="/offline/friends">
            Open offline friends
          </Link>
        </div>

        <div className="section">
          <h2>Online workspace</h2>
          <p>
            Prepare debts for cloud sync and collaboration. Start capturing entries and be ready to
            turn on online services when your account is configured.
          </p>
          <Link className="cta-button" href="/online/friends">
            Open online friends
          </Link>
        </div>
      </div>

      <div className="section">
        <h2>How debts work</h2>
        <p className="muted">
          Each friend in either tab has quick buttons for adding a debt from them or to them.
          Clicking a friend reveals the full history, a per-friend summary, and the current balance
          so you always know where things stand.
        </p>
      </div>
    </main>
  );
}
