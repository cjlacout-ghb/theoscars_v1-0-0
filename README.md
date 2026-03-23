# 🏆 TheOscars 2026

A private, real-time Oscar prediction game for two players.  
Built for the **98th Academy Awards · Dolby Theatre · March 15, 2026**.

---

## What It Does

Two pre-registered users log in, pick their predictions across all 25 Oscar categories, and compete live as winners are revealed during the ceremony. The app syncs votes and results instantly between both players and tracks who got the most right.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Vanilla CSS (custom design system — `oscars.css`) |
| Backend / DB | Supabase (Auth + PostgreSQL) |
| Deployment | Vercel |

---

## Project Structure

```
src/
├── App.jsx                   # Root: session manager + slot resolver
├── LoginScreen.jsx           # Email/password auth + slot assignment
├── supabaseClient.js         # Supabase SDK init (reads from .env)
├── lib/
│   ├── constants.js          # All 25 categories, nominees, design tokens
│   ├── supabase.js           # storageGet / storageSet helpers
│   └── logger.js             # Env-aware logger (suppressed in production)
├── styles/
│   └── oscars.css            # Full design system (Playfair Display + Cormorant Garamond)
└── components/
    ├── ErrorBoundary.jsx
    ├── oscars2026.jsx         # Main orchestrator — state + logic
    └── oscars/
        ├── AdminPanel.jsx     # Winner entry modal (password protected)
        ├── CompareTab.jsx     # Side-by-side vote comparison
        ├── PlayerHeader.jsx   # Player badges + live scores
        ├── ProfileEditor.jsx  # In-session name/emoji editing
        ├── ResultsTab.jsx     # Final winner reveal + scoreboard
        ├── SetupPhase.jsx     # Registration card (name + emoji)
        └── VotingTab.jsx      # 25-category voting list
```

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `user_slots` | Maps each Auth user ID to a slot (`p1` or `p2`) |
| `oscars_storage` | Key-value store for votes, winners, and player profiles |

**Storage keys used:**
- `oscars98_v3_votes`
- `oscars98_v3_winners`
- `oscars98_v3_players`

---

## Local Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Create your `.env` file** (use `.env.example` as a template):
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the dev server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

---

## How Players Are Set Up

Users are **pre-created manually** in the Supabase Auth dashboard — there is no public sign-up flow. On first login, the app assigns the user to slot `p1` (first login) or `p2` (second login). Slot assignments persist in the `user_slots` table so returning sessions restore the correct player.

---

## Admin Panel

The Admin Panel is where real Oscar winners are entered live during the ceremony.

- **Access:** click the "Academia" text on the login screen, or "98ª Edición · 2026" in the main hero when logged in.
- **Password:** set in `src/lib/constants.js` → `ADMIN_PASSWORD`.
- **Actions:**
  - Select the winner for each category (toggleable)
  - **Limpiar ganadores** — clears all winner entries
  - **Reset completo** — wipes all votes, winners, and player registrations and reloads the app

---

## Deployment (Vercel)

The `vercel.json` file is already configured with security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cache-Control: no-store` for `/api/*`

Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in the Vercel project dashboard before deploying.

```bash
npm run build   # produces /dist
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build → `/dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
