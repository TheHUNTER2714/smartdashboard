# Smart Dashboard — Custom Backend

Express + Postgres + JWT auth backend for the Smart Dashboard frontend.

## Run locally

```bash
cd server
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install
npm run init-db        # creates users + students tables
npm run dev            # starts on :4000
```

In the frontend project root, add `VITE_API_URL=http://localhost:4000` to `.env` and restart the dev server.

## Deploy

Any Node host works (Render, Railway, Fly.io, your own VM). You also need a Postgres database (Neon, Supabase, ElephantSQL, RDS, etc.).

1. Set env vars: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (your frontend URL).
2. Run `npm run init-db` once after first deploy.
3. Update `VITE_API_URL` in the frontend to point at your deployed API URL and redeploy the frontend.

## Endpoints

- `POST /auth/signup` — `{ email, password, fullName }` → `{ token, user }`
- `POST /auth/signin` — `{ email, password }` → `{ token, user }`
- `GET  /auth/me` (Bearer) → `{ user }`
- `GET  /students` (Bearer)
- `POST /students` (Bearer) — full student object
- `PUT  /students/:id` (Bearer)
- `DELETE /students/:id` (Bearer)
