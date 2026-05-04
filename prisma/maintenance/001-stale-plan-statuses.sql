-- Maintenance: flip plans whose endDate has passed but status still says "active"
-- to status="ended". Idempotent — safe to re-run.
--
-- Why this exists: prior to the May 4 2026 hardening pass, no scheduled job
-- transitioned plans on expiry. A backdated entry could end up in 'active'
-- with endDate in the past. Run this script after each db push if any
-- backdated plans were imported, or wire it into a daily cron later.
--
-- This file is preserved here (not in /migrations, since the project uses
-- prisma db push). To run: paste into a Postgres client connected to the
-- DATABASE_URL behind Accelerate (Prisma Studio works for the same effect
-- via the GUI).

UPDATE "Plan"
SET "status" = 'ended',
    "updatedAt" = NOW()
WHERE "status" = 'active'
  AND "endDate" < NOW();
