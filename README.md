# Cue CRM

## Try CRM Now

**[Try CRM Now](https://crm-ten-theta-26.vercel.app/dashboard)**

A full stack CRM built with Next.js, Supabase, and Tailwind CSS. Designed for managing leads, routes, tasks, deals, demos, and outreach for a local digital marketing agency.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL via `postgres` driver)
- **Styling:** Tailwind CSS
- **Auth:** Custom JWT (bcrypt + jose), httpOnly cookie
- **AI:** OpenAI GPT-4o-mini (route planning, pitch generation, research)
- **Maps:** Google Maps Directions API (route optimization), Google Geocoding API

---

## Local Development

### 1. Clone and install

```bash
git clone <repo-url>
cd crm
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase connection string (see below) |
| `JWT_SECRET` | Random string, minimum 32 characters |
| `AUTH_USERNAME` | Login username for the app |
| `AUTH_PASSWORD_HASH` | bcrypt hash of your login password |
| `OPENAI_API_KEY` | OpenAI API key (for AI route planner and pitch generator) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key (for geocoding and route optimization) |

### 3. Generate credentials

**JWT_SECRET** (run once, paste result into `.env.local`):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**AUTH_PASSWORD_HASH** (replace `yourpassword` with your actual password):
```bash
node -e "const b=require('bcryptjs');b.hash('yourpassword',12).then(console.log)"
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your `AUTH_USERNAME` and password.

---

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings > Database > Connection string** and copy the **Session mode** URI (port 5432) or Transaction mode URI (port 6543 for serverless).
3. Paste the URI as `DATABASE_URL` in `.env.local`.
4. Run the schema in the Supabase SQL editor:
   - Open **SQL Editor** in your Supabase dashboard.
   - Paste the contents of `supabase-schema.sql` and run it.

---

## Seed Data

To seed sample lawn care leads for testing:

```bash
node scripts/seed-lawn-care.mjs
```

To verify the seed worked:

```bash
node scripts/verify-seed.cjs
```

---

## Deployment (Vercel)

1. Push your repo to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Under **Settings > Environment Variables**, add all variables from `.env.example` with production values.
4. Deploy. Vercel builds with `npm run build` automatically.

> The app uses a single-user login. There is no sign-up flow. Set `AUTH_USERNAME` and `AUTH_PASSWORD_HASH` as Vercel environment variables before your first deploy.

---

## Project Structure

```
src/
  app/
    api/          # Next.js route handlers (REST API)
    (pages)/      # Page components (leads, routes, deals, tasks, etc.)
  components/
    layout/       # AppLayout, Header, Sidebar
    ui/           # Reusable UI components
  lib/
    db.ts         # Supabase/postgres connection
    types.ts      # TypeScript interfaces
    utils.ts      # Constants and helpers
```

