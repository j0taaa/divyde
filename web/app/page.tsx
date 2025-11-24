import { OfflineDebtManager } from "@/components/OfflineDebtManager";

export default function Home() {
  return (
    <main>
      <div className="badge">Web</div>
      <h1>Welcome to Divyde</h1>
      <p>
        Divyde keeps your shared expenses organized. You can start tracking debts
        offline right away—no login required—and connect to the cloud later for
        online sync and collaboration.
      </p>

      <div className="section-grid">
        <div className="section">
          <h2>Getting started</h2>
          <p>
            Use <code>npm run dev</code> to start local development. The app is
            structured with the App Router and already includes styling hooks for
            call-to-action elements and page sections.
          </p>
          <a className="cta-button" href="/">
            Open the app
          </a>
        </div>

        <div className="section">
          <h2>Online features</h2>
          <p>
            A health-check endpoint at <code>/api/health</code> verifies database
            connectivity when a <code>DATABASE_URL</code> is configured. Without
            it, the app runs offline and warns that cloud features are
            unavailable instead of failing to build.
          </p>
        </div>
      </div>

      <OfflineDebtManager />
    </main>
  );
}
