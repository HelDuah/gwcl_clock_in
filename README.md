# GWL Ashanti South — Entry Post Attendance System

A staff clock-in/clock-out system for Ghana Water Limited, Ashanti South District, built with
Next.js (App Router), TypeScript, Tailwind CSS, Prisma, and Supabase (Postgres).

## Features

- **Clocking** — search an employee by Employee ID or Name, then Clock In / Clock Out with a timestamp.
  An employee cannot be clocked out unless already clocked in that day, and cannot be clocked in twice
  (enforced both by the API and a database-level unique constraint).
- **Register** — add, edit, and delete employees. Fields: Name, Department, Role
  (Senior Staff / Junior Staff / National Service Personnel). Employee ID is required for Senior/Junior
  Staff and intentionally not collected for National Service Personnel (they are found by name only).
- **Generate** — export attendance as CSV, filtered by month or by year.
- **Settings** — change the single access password used to open the system.
- Password-protected (one shared password for the entry-post device/operator).
- Light and dark mode toggle.
- Works from any device via a Vercel-hosted link, backed by a shared Supabase database via Prisma.

## Architecture

All database access happens through **Prisma**, called only from **server-side API routes**
(`app/api/**`). Page components are client components that call these API routes with `fetch` —
they never talk to the database directly. This is why `DATABASE_URL` / `DIRECT_URL` (and later, the
database password) never need to be exposed to the browser.

## 1. Get your database connection strings (Supabase)

1. In your Supabase project, go to **Project Settings → Database → Connection string**, and switch
   to the **Prisma** tab. You'll see two URLs:
   - A **pooled** connection string (port `6543`, includes `?pgbouncer=true`) — this is `DATABASE_URL`.
   - A **direct** connection string (port `5432`) — this is `DIRECT_URL`, used only for migrations.
2. Copy both — you'll need your database password, which you set when creating the project.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in:
```
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...:5432/postgres"
SESSION_SECRET=...   # any long random string
```

## 3. Install dependencies and create the database schema

```bash
npm install
npm run db:migrate
```

`db:migrate` reads `prisma/schema.prisma`, creates the `employees`, `attendance`, and `app_settings`
tables in your Supabase database, and generates the Prisma Client. You'll be prompted to name the
migration — anything like `init` is fine.

Then seed the default password:

```bash
npm run db:seed
```

This inserts the default access password: **`gwl2026`**.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000 — you'll be redirected to the login page. Log in with `gwl2026`, then
change it right away from **Settings**.

## 5. Deploy to Vercel (via GitHub)

1. Push this project to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit — GWL Ashanti South clock-in system"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
2. In Vercel, click **Add New Project** and import that GitHub repository.
3. Under **Environment Variables**, add `DATABASE_URL`, `DIRECT_URL`, and `SESSION_SECRET`
   (same values as your `.env.local`).
4. Vercel's build command already runs `prisma generate` automatically (via the `postinstall` and
   `build` scripts in `package.json`), so no extra configuration is needed there.
5. Click **Deploy**. You'll get a live URL (e.g. `gwl-ashanti-south.vercel.app`) that works from
   any device, anywhere.
6. From then on, every `git push` to `main` auto-deploys the latest version. If you ever change
   `prisma/schema.prisma`, run `npm run db:migrate` locally first (it applies the change to Supabase
   directly), then push your code.

## Notes on the password

The access password is stored in the `app_settings` table and is only ever read/written through
server-side API routes via Prisma — it is never exposed to the browser. This is intentionally simple
(one shared password for one shared device), matching how the system is actually used at the entry
post.

## Project structure

```
prisma/
  schema.prisma       Source of truth for the database schema
  seed.ts              Inserts the default password row
app/
  login/               Login page
  (main)/              Protected pages (share the Header/nav layout)
    page.tsx           Clocking (home)
    register/          Register employees
    generate/           CSV reports
    settings/           Change password
  api/
    login/              Verifies password (Prisma), issues session cookie
    logout/             Clears session cookie
    change-password/    Updates password (Prisma)
    employees/          List/search/create employees
    employees/[id]/     Update/delete a single employee
    attendance/today/   Today's attendance record for one employee
    attendance/clock-in/   Clock in
    attendance/clock-out/  Clock out
    attendance/report/     Date-range report for CSV export
components/            Reusable UI (Header, EmployeeForm, ThemeToggle, LiveClock)
lib/
  prisma.ts             Prisma Client singleton
  serialize.ts          Converts Prisma records to the field shape the UI expects
  date-server.ts         Server-side date helpers for Prisma's Date fields
  types.ts, date.ts, csv.ts, session.ts
middleware.ts           Redirects unauthenticated requests to /login
```
