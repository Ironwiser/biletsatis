import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(sql);
  console.log("DB şeması uygulandı:", schemaPath);
  await pool.end();
}

main().catch(async (err) => {
  console.error("DB init hata:", err);
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});

