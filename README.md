# Cognera

**Cognitive care, made human.**

An offline-first cognitive assistance and engagement platform for elderly
dementia patients in the North Eastern Region of India, built for
**Smart India Hackathon 2026: Problem Statement 26003** (Ministry of
Development of North Eastern Region).

Cognera runs on inexpensive Android tablets and has two faces:

- **Patient Mode**: a full-screen, voice-guided, chrome-free surface: a
  collection of calm, culturally-themed cognitive games, a daily-routine
  assistant, and large medicine / hydration reminders. No login, no menus.
- **Care Mode**: a dashboard for family caregivers and ASHA / PHC health
  workers: cognitive trend charts against the patient's own baseline, adherence
  tracking, alerts, assessment history, and a village-wide caseload view.

Between them sits an **adaptive engine** that keeps every game inside the
patient's ~85% success zone, and an analytics layer that turns raw play
telemetry into a trend a caregiver can act on.

> Cognera is a screening and engagement aid. It does not diagnose. Every number
> shown to a caregiver is framed as change relative to that patient's own history.

## Cognitive games

A shared game harness (`frontend/src/games/`) owns the shell, pause/exit, voice
narration, fatigue detection, the 12-minute session cap, and trial-level
telemetry. Each game focuses on one cognitive ability and starts well below the
standard benchmark difficulty.

| Domain | Games |
| --- | --- |
| Memory | Memory Match · Number Memory · Word Recall · Daily Routine Recall · Sequence Memory · Chimp Test |
| Attention | Find the Object |
| Processing speed | Reaction Time |
| Visuospatial / Executive | Pattern Complete · Odd One Out |
| Language / Auditory | Sound Recognition |
| Executive | Story Sequencing |
| Reminiscence (unscored) | Memory Lane |

## Stack

- **Frontend**: React 18, Vite 5, react-router-dom 6, plain JS/JSX, CSS custom
  properties. No TypeScript, no Tailwind, no component or charting library.
- **Backend**: Node 20, Express, ESM, raw `pg` with hand-written SQL, no ORM.
- **Database**: PostgreSQL (Neon).
- **Adaptive engine**: `shared/engine/`: pure functions (Elo/Bayesian ability
  estimate with clinical guardrails, Theil–Sen trend analysis), identical
  results in the browser offline and on the server during sync.
- **Offline-first**: games never touch the network; the harness queues sessions
  locally and syncs on reconnect.
- **Multilingual**: English, Hindi, Assamese; every patient-facing string is
  localised with an equivalent voice prompt.

## Running locally

```bash
# 1. backend
cd backend
npm install
cat > .env <<'EOF'
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
JWT_SECRET=local-dev-secret
CORS_ORIGIN=http://localhost:5173
PORT=4000
EOF
npm run dev        # http://localhost:4000

# 2. frontend (separate terminal)
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Apply `db/schema.sql` then `db/seed.sql` to a fresh database, or run
`npm run seed` from `backend/`.

## Repository layout

```
backend/        Express API, routes, middleware, sync
frontend/       React app: Patient Mode, Care Mode, game collection
shared/engine/  adaptive difficulty + trend analysis (pure functions)
db/             schema.sql, seed.sql
```
