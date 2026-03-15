import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production: dist/ icinden calisirken .. = b/, tsx/script b/ icinden calisirken __dirname = b/
const envPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, __dirname.endsWith("dist") ? ".." : ".", ".env.production")
    : path.join(__dirname, ".env.development");
dotenv.config({ path: envPath });

function getDatabaseConfig(): pg.PoolConfig {
  if (
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD &&
    process.env.DB_NAME
  ) {
    return {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    };
  }

  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  throw new Error(
    "DB config bulunamadı. DATABASE_URL veya DB_HOST/DB_USER/DB_PASSWORD/DB_NAME set et."
  );
}

export const pool = new pg.Pool(getDatabaseConfig());

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  const result = await pool.query<T>(text, params);
  return result;
}

