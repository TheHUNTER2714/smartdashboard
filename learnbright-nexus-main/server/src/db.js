import pg from "pg";
import dotenv from "dotenv";

dotenv.config(); // 👈 force load

const { Pool } = pg;

console.log("DATABASE_URL:", process.env.DATABASE_URL);

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export const query = (text, params) => pool.query(text, params);