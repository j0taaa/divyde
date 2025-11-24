export default function Home() {
  return (
    <main>
      <div className="badge">Web</div>
      <h1>Welcome to Divyde</h1>
      <p>
        This is the beginning of the Divyde web experience. The Next.js app is
        ready for feature development, with TypeScript, linting, and container
        support out of the box.
      </p>
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
        <h2>API & data layer</h2>
        <p>
          A health-check endpoint at <code>/api/health</code> now verifies database
          connectivity. Update your <code>DATABASE_URL</code> in <code>.env</code> or compose
          overrides to point at your PostgreSQL instance before hitting the route.
        </p>
      </div>
    </main>
  );
}
