import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

const globalForPool = globalThis as unknown as { pool?: Pool };

export const pool: Pool | undefined = (() => {
  if (!connectionString) {
    console.warn(
      "DATABASE_URL is not set; running without a database connection. Online features will be unavailable.",
    );
    return undefined;
  }

  if (!globalForPool.pool) {
    globalForPool.pool = new Pool({ connectionString });
  }

  return globalForPool.pool;
})();

export const isDatabaseConfigured = Boolean(connectionString);

export async function verifyDatabaseConnection() {
  if (!pool) {
    console.warn(
      "Cannot verify database connection because DATABASE_URL is missing. Treating the app as offline-only.",
    );
    return false;
  }

  const client = await pool.connect();
  try {
    const result = await client.query("select 1 as ok");
    return result.rows[0]?.ok === 1;
  } finally {
    client.release();
  }
}
