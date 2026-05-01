import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { pool } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "schema.sql"), "utf8");

try {
  await pool.query(sql);
  console.log("✓ Database initialized");
} catch (e) {
  console.error("✗ Failed:", e.message);
  process.exit(1);
} finally {
  await pool.end();
}
