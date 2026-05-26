# Full CRM Demo

A full stack CRM demo built with Next.js and Tailwind CSS. This repository is configured to run locally from GitHub with local PostgreSQL and no dependency on Vercel or Supabase.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Local PostgreSQL (Docker)
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

### 2. Start local PostgreSQL

```bash
docker compose up -d
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in every value:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Local PostgreSQL connection string |
| `ALLOW_REMOTE_DB` | Keep `false` to block remote databases |
| `DB_SSL_MODE` | Use `disable` for local Docker PostgreSQL |
| `JWT_SECRET` | Random string, minimum 32 characters |
| `AUTH_USERNAME` | Login username for the app |
| `AUTH_PASSWORD_HASH` | bcrypt hash of your login password |
| `OPENAI_API_KEY` | OpenAI API key (for AI route planner and pitch generator) |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key (for geocoding and route optimization) |

### 4. Generate credentials

**JWT_SECRET** (run once, paste result into `.env.local`):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**AUTH_PASSWORD_HASH** (replace `yourpassword` with your actual password):
```bash
node -e "const b=require('bcryptjs');b.hash('yourpassword',12).then(console.log)"
```

### 5. Seed demo data

```bash
$env:ALLOW_DEMO_RESET="YES_I_UNDERSTAND_THIS_DELETES_DATA"
npm run seed:demo
```

### 6. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your `AUTH_USERNAME` and password.

---

## Notes

- Database schema is auto loaded on first Docker startup from `supabase-schema.sql`.
- To reset local database volume and reinitialize schema:

```bash
docker compose down -v
docker compose up -d
```

- The app blocks Supabase URLs by default. Set `ALLOW_REMOTE_DB=true` only if you intentionally want a remote database.

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

