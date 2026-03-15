import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const sqlDir = path.join(__dirname, "..", "sql");

  // 1) is_approved + site_settings
  const migrationPath = path.join(sqlDir, "event-approval-and-popup.sql");
  const migration = fs.readFileSync(migrationPath, "utf8");
  await pool.query(migration);
  console.log("Uygulandı: event-approval-and-popup.sql");

  // 2) Tüm etkinlikleri onaylı yap
  await pool.query(`
    update events
    set is_approved = true
    where is_deleted = false and is_cancelled = false
  `);
  console.log("Tüm etkinlikler is_approved = true yapıldı.");

  await pool.end();
  console.log("Bitti.");
}

main().catch(async (err) => {
  console.error("Hata:", err);
  try {
    await pool.end();
  } catch {
    // ignore
  }
  process.exit(1);
});
