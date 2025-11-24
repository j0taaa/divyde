# Divyde

Divyde is a shared ledger for tracking debts between friends and within groups. The platform will include both a web experience (Next.js) and a mobile app (React Native with Expo), supporting online collaboration and an offline-only mode for personal tracking.

Key capabilities will include:
- Creating groups and logging debts between individual members.
- Viewing and settling shared balances, with a “graph equalization” feature for simplifying cycles using max-flow logic.
- Offline entry (local-only) and online sync for authenticated users.

## Tech stack
- **Web:** Next.js (App Router, TypeScript), Tailwind + shadcn/ui planned.
- **Mobile:** React Native with Expo (future work).
- **Database:** PostgreSQL (local container by default; you can also point to an external PostgreSQL URL when provided by your infrastructure).
- **Containers:** Docker + Docker Compose for local orchestration.

## Development quickstart
### Local (Node)
1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   cd web
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000.

### Containers
Use Docker Compose to run the web app and a local PostgreSQL instance:
```bash
docker-compose up --build
```

- The web app runs on port **3000**.
- The Compose file also starts PostgreSQL on **5432**. Set `DATABASE_URL` to override and connect to an external PostgreSQL instance instead of the local container if your environment already provides one.

## Repository map
- `plan.md` – project milestones and immediate next steps.
- `web/` – Next.js app scaffold, TypeScript, linting, and container assets.
- `docker-compose.yml` – local orchestration for web + PostgreSQL.

## Next steps
- Expand the API/data layer to connect the web app to PostgreSQL.
- Add authentication and role-based access control for online features.
- Introduce Tailwind and shadcn/ui for rapid UI development.
