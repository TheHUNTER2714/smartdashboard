import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import "dotenv/config";
import { query } from "./db.js";
import { sign, requireAuth } from "./auth.js";
console.log("DB PASSWORD:", process.env.DB_PASSWORD);

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_, res) => res.json({ ok: true }));

// ---------- Auth ----------
const signupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  fullName: z.string().trim().min(1).max(100),
});

app.post("/auth/signup", async (req, res) => {
  const p = signupSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0].message });
  const { email, password, fullName } = p.data;
  try {
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await query(
      "INSERT INTO users (email, password_hash, full_name) VALUES ($1,$2,$3) RETURNING id, email, full_name",
      [email.toLowerCase(), hash, fullName]
    );
    const user = { id: rows[0].id, email: rows[0].email, full_name: rows[0].full_name };
    res.json({ token: sign(user), user });
  } catch (e) {
    if (e.code === "23505") return res.status(409).json({ error: "Email already exists" });
    res.status(500).json({ error: e.message });
  }
});

const signinSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

app.post("/auth/signin", async (req, res) => {
  const p = signinSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0].message });
  const { rows } = await query("SELECT id, email, full_name, password_hash FROM users WHERE email=$1", [
    p.data.email.toLowerCase(),
  ]);
  if (!rows.length) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(p.data.password, rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const user = { id: rows[0].id, email: rows[0].email, full_name: rows[0].full_name };
  res.json({ token: sign(user), user });
});

app.get("/auth/me", requireAuth, async (req, res) => {
  const { rows } = await query("SELECT id, email, full_name FROM users WHERE id=$1", [req.userId]);
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json({ user: { id: rows[0].id, email: rows[0].email, full_name: rows[0].full_name } });
});

// ---------- Password reset ----------
// Note: in production, email the reset link. Here we return it in the response
// (dev-friendly) so the user/agent can complete the flow without an email server.
app.post("/auth/forgot-password", async (req, res) => {
  const schema = z.object({ email: z.string().trim().email() });
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0].message });

  const { rows } = await query("SELECT id FROM users WHERE email=$1", [p.data.email.toLowerCase()]);
  // Always return success to avoid email enumeration
  if (!rows.length) return res.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await query(
    "INSERT INTO password_resets (token, user_id, expires_at) VALUES ($1,$2,$3)",
    [token, rows[0].id, expires]
  );

  const baseUrl = process.env.APP_URL || req.headers.origin || "http://localhost:8080";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  // TODO: integrate an email service (Resend/SendGrid). For now, log + return.
  console.log(`[password-reset] ${p.data.email} => ${resetUrl}`);
  res.json({ ok: true, resetUrl, devNote: "Email service not configured — link returned for dev." });
});

app.post("/auth/reset-password", async (req, res) => {
  const schema = z.object({
    token: z.string().min(10),
    password: z.string().min(6).max(72),
  });
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0].message });

  const { rows } = await query(
    "SELECT user_id, expires_at, used FROM password_resets WHERE token=$1",
    [p.data.token]
  );
  if (!rows.length) return res.status(400).json({ error: "Invalid or expired token" });
  const r = rows[0];
  if (r.used) return res.status(400).json({ error: "Token already used" });
  if (new Date(r.expires_at) < new Date()) return res.status(400).json({ error: "Token expired" });

  const hash = await bcrypt.hash(p.data.password, 10);
  await query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, r.user_id]);
  await query("UPDATE password_resets SET used=true WHERE token=$1", [p.data.token]);
  res.json({ ok: true });
});

// ---------- Students ----------
const studentSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  course: z.string().trim().min(1).max(100),
  college: z.string().trim().max(150).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  roll_no: z.string().trim().max(50).optional().nullable(),
  location: z.string().trim().max(150).optional().nullable(),
  age: z.number().int().min(5).max(120).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

app.get("/students", requireAuth, async (req, res) => {
  const { rows } = await query(
    "SELECT * FROM students WHERE user_id=$1 ORDER BY created_at DESC",
    [req.userId]
  );
  res.json(rows);
});

app.get("/students/:id", requireAuth, async (req, res) => {
  const { rows } = await query(
    "SELECT * FROM students WHERE id=$1 AND user_id=$2",
    [req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

app.post("/students", requireAuth, async (req, res) => {
  const p = studentSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0].message });
  const d = p.data;
  const { rows } = await query(
    `INSERT INTO students (user_id, name, email, course, college, phone, roll_no, location, age, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [req.userId, d.name, d.email, d.course, d.college, d.phone, d.roll_no, d.location, d.age, d.notes]
  );
  res.json(rows[0]);
});

app.put("/students/:id", requireAuth, async (req, res) => {
  const p = studentSchema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ error: p.error.errors[0].message });
  const d = p.data;
  const { rows } = await query(
    `UPDATE students SET name=$1,email=$2,course=$3,college=$4,phone=$5,roll_no=$6,location=$7,age=$8,notes=$9,updated_at=now()
     WHERE id=$10 AND user_id=$11 RETURNING *`,
    [d.name, d.email, d.course, d.college, d.phone, d.roll_no, d.location, d.age, d.notes, req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

app.delete("/students/:id", requireAuth, async (req, res) => {
  const { rowCount } = await query("DELETE FROM students WHERE id=$1 AND user_id=$2", [
    req.params.id,
    req.userId,
  ]);
  if (!rowCount) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✓ API running on :${PORT}`));
