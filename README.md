# 🃏 Maha Latthbandhan — Card Table Scorekeeper

A premium, mobile-first companion app for tracking cumulative scores across
sessions of a custom rummy-style card game (3–8 players). It runs **entirely in
the browser** — no backend, no database, no accounts. Everything is stored in
your phone's LocalStorage and survives refreshes.

Designed to sit open beside the table: dark green felt, casino-gold accents,
large readable numbers, and one-handed entry.

---

## ✨ Features

- **Three scoring events**, each calculated automatically and locked in:
  - **Opening Value Cards** — every player declares value cards held.
    `score = playerCards × numberOfPlayers − totalCards`
  - **Winner Settlement** — pick a winner; losers enter points lost; the
    winner collects the sum.
  - **Closing Value Cards** — same formula as the opening declaration.
- **Live session scores** with a compact **lifetime** strip.
- **Lifetime leaderboard** — rank, name, lifetime score, sessions played, and
  last-played date. Sorted high to low and persisted forever (until you clear
  data).
- **Undo Last Event** — reverses the most recent event everywhere, with a
  confirmation step.
- **Edit any event** (active or historical) — recalculates and re-reconciles
  all session and lifetime totals automatically, as if it had always held the
  corrected values.
- **Full session history**, each event timestamped with its inputs and computed
  changes.
- **Player name normalization** — `"Aaryan"`, `"aaryan"`, `" Aaryan "`, and
  `"AARYAN"` all merge into one lifetime profile while showing the preferred
  capitalization.

---

## 🚀 Run locally

Requires [Node.js](https://nodejs.org/) 18+.

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). To test on your phone over
the same Wi-Fi, run `npm run dev -- --host` and open the Network URL it prints.

Production build / preview:

```bash
npm run build     # type-checks then bundles into dist/
npm run preview   # serves the built app locally
```

---

## 🛠 Tech

- **React 18 + TypeScript** (strict)
- **Vite 6**
- **Tailwind CSS 3**
- **LocalStorage** for all persistence

```
src/
  lib/         scoring engine, name normalization, storage, formatting
  store/       reducer + context (state, persistence)
  components/
    ui/        Button, Modal, NumberInput, ConfirmDialog, ScreenHeader
    events/    event entry modals + event card + modal host
    screens/   Home, NewSession, Session, Leaderboard, History
  types.ts     the data model
```

The scoring engine in `src/lib/scoring.ts` is pure and reusable; session and
lifetime totals are **derived** from the event list, which is what makes undo
and edit reconcile with zero manual bookkeeping.

---

## ☁️ Deployment

The app is 100% static after building (`dist/`). Two ready-to-go options:

### Option A — Vercel (fastest)

1. Push this project to a GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects Vite; the included [`vercel.json`](vercel.json) sets the
   build command (`npm run build`) and output directory (`dist`). Just click
   **Deploy**.
4. You'll get a public HTTPS URL — open it in Safari/Chrome on your phone.

Or from the CLI:

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

### Option B — GitHub Pages (free, from this repo)

A workflow is included at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Create a GitHub repo and push this project to the **`main`** branch:

   ```bash
   git init
   git add .
   git commit -m "Felt scorekeeper"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```

2. In the repo on GitHub: **Settings → Pages → Build and deployment →
   Source → "GitHub Actions"**.
3. The workflow builds and publishes automatically on every push to `main`.
   When it finishes, your site is at
   `https://<you>.github.io/<repo>/`.

> The Vite config uses a **relative base (`base: './'`)**, so the same build
> works at a domain root (Vercel) *and* under a repo sub-path (GitHub Pages)
> with no extra configuration.

### Add it to your phone's home screen

Open the deployed URL in Safari (iOS) or Chrome (Android) → Share → **Add to
Home Screen**. It launches full-screen like a native app, and your data stays in
that browser's LocalStorage.

---

## 🔒 Data & privacy

All data lives only in your browser's LocalStorage on the device you use. There
are no servers and nothing leaves your phone. Clearing the browser's site data
(or tapping **Reset all data** on the Leaderboard screen) erases everything
permanently.
