import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../drizzle/schema.js";
import { env } from "../config/env.js";

const pool = new Pool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
export { pool };

export async function verifyDbConnection() {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}
