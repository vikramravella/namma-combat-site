# Database maintenance scripts

This project uses `prisma db push` (no migrations history), so one-off data
fixes need a separate home. Each `.sql` file in this directory must be:

- **Idempotent** — running it twice has the same effect as running it once.
- **Numbered** — `NNN-short-name.sql`, monotonic.
- **Documented** — a header comment explaining when and why it ran.

## Running a script

The Prisma Postgres production DB is reached through Prisma Accelerate
(HTTPS, no direct connection string). Two options:

1. **Prisma Studio** — `npx prisma studio` and run the equivalent edits in the
   GUI.
2. **Direct connection** — set `DIRECT_DATABASE_URL` (the non-Accelerated
   connection from the Vercel dashboard) and run the file with `psql`.

Never run a non-idempotent fix here; rewrite it first.
