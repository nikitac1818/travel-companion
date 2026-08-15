# Travel Companion

AI-powered travel app — trip planning, flight/train/hotel booking, safety (SOS/emergency contacts), and a community review feed.

Originally built on Base44 (no-code). This is a fully rebuilt version as a real, deployable full-stack app:

- **Frontend:** React + Vite + Tailwind
- **Backend:** Express (proxies LLM calls to Claude)
- **Database + Auth:** Supabase (Postgres)

```
travel-companion/
├── frontend/     React app (deploy to Vercel)
├── backend/      Express API (deploy to Render)
└── supabase_schema.sql   Run this in your Supabase project first
```

## 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → sign up → **New Project**
2. Name it `travel-companion`, set a database password (save it), pick a nearby region
3. Once it's ready: **SQL Editor → New query** → paste the contents of `supabase_schema.sql` → **Run**
4. Go to **Project Settings → API** and copy:
   - `Project URL` → this is your `VITE_SUPABASE_URL`
   - `anon public` key → this is your `VITE_SUPABASE_ANON_KEY`
5. Go to **Authentication → Providers** and make sure **Email** is enabled (it is by default)

## 2. Set up the backend locally

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env`:
- `ANTHROPIC_API_KEY` — get one at [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys). This powers trip planning, AI chat, flight/hotel search, and weather (all the features that used Base44's `InvokeLLM` before).
- Leave `FRONTEND_URL=*` for now.

```bash
npm run dev
```

Should print `Travel Companion backend listening on http://localhost:4000`.

## 3. Set up the frontend locally

```bash
cd frontend
cp .env.example .env
npm install
```

Edit `.env` with your Supabase URL/key from step 1, and leave `VITE_BACKEND_URL=http://localhost:4000`.

```bash
npm run dev
```

Opens at `http://localhost:5173`. Sign up for an account on the Auth page — this creates a real user in your Supabase project.

## 4. Deploy — all free

### Backend → Render
1. Push this project to a **private** GitHub repo (see note on secrets below)
2. [render.com](https://render.com) → New → Web Service → connect your repo
3. **Root directory:** `backend`
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. Add environment variables in the Render dashboard: `ANTHROPIC_API_KEY`, and `FRONTEND_URL` (fill this in after step 5 with your Vercel URL)
7. Deploy — note the URL Render gives you (e.g. `https://travel-companion-backend.onrender.com`)

### Frontend → Vercel
1. [vercel.com](https://vercel.com) → New Project → import your repo
2. **Root directory:** `frontend`
3. Framework preset: Vite (should auto-detect)
4. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_BACKEND_URL` (your Render URL from above)
5. Deploy

### Final step
Go back to Render and set `FRONTEND_URL` to your actual Vercel URL (e.g. `https://travel-companion.vercel.app`) so CORS only allows your real frontend, then redeploy the backend.

## Notes

- **Never commit `.env` files.** Both `frontend/.env` and `backend/.env` are gitignored. Only the `.env.example` files (with placeholder values) should be in the repo.
- Render's free tier spins down after inactivity — the first request after idle can take ~30s to wake up. Fine for a personal project/portfolio piece.
- `WeatherWidget.jsx` and `SeatSelection.jsx` were empty files in the original Base44 export (never actually saved) — both were rebuilt from scratch based on how the rest of the app calls them.
