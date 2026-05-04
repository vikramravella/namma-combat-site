-- Maintenance: enforce "no two live memberships per member overlap" at the
-- DB level via a Postgres EXCLUDE constraint. Belt-and-suspenders for the
-- application-level interval-intersection check in plans/actions.js — if a
-- race condition ever slipped two overlapping plans through the app, the
-- DB would still reject the second insert.
--
-- The constraint uses a daterange built from startDate / endDate and the
-- &&  (range overlap) operator, scoped to live statuses. Idempotent: the
-- DROP guards against re-creation noise.

-- GIST is needed for range exclusion. It's a built-in extension; CREATE
-- EXTENSION IF NOT EXISTS is a no-op when already installed.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- A range-typed expression index is required for the EXCLUDE clause.
-- We coerce dates to a half-open daterange [startDate, endDate + 1 day).
-- The +1 day makes the intervals match how the app treats endDate as
-- inclusive (a plan ending on the 1st is "live" through the 1st).
ALTER TABLE "Plan" DROP CONSTRAINT IF EXISTS plan_no_member_overlap;
ALTER TABLE "Plan"
  ADD CONSTRAINT plan_no_member_overlap
  EXCLUDE USING gist (
    "memberId" WITH =,
    daterange("startDate"::date, ("endDate"::date + INTERVAL '1 day')::date, '[)') WITH &&
  )
  WHERE ("status" IN ('active', 'on_freeze'));
