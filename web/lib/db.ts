import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize the database pool");
}

// Reuse the same pool across hot reloads in development to avoid exhausting connections.
const globalForPool = globalThis as unknown as { pool?: Pool };

export const pool = globalForPool.pool ?? new Pool({ connectionString });

if (!globalForPool.pool) {
  globalForPool.pool = pool;
}

export async function verifyDatabaseConnection() {
  const client = await pool.connect();
  try {
    const result = await client.query("select 1 as ok");
    return result.rows[0]?.ok === 1;
  } finally {
    client.release();
  }
}
