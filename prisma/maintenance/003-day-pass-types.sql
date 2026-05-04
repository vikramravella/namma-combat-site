-- Maintenance: seed Day Pass membership types into the catalog.
-- Pricing source: nammacombat.com FAQ ("Single class passes: ₹788
-- regular / ₹1,050 elite 90-minute"). Pre-GST base price = incl-GST / 1.05,
-- rounded to a clean number so reverse-calc on receipts ends at the
-- advertised total.
--
-- Idempotent: ON CONFLICT updates the row instead of erroring on re-run.

INSERT INTO "MembershipType" (
  "id", "name", "tier", "cycle", "durationDays", "freezeDaysAllowed",
  "basePriceRupees", "floorAccess", "notes", "active", "sortOrder",
  "createdAt", "updatedAt"
) VALUES
  (
    'mt_day_pass_regular',
    'Day Pass — Regular',
    'Day Pass',
    'Single Day',
    1,
    0,
    750,
    'Both floors',
    'Single class drop-in. ₹788 incl GST. For travelers or members from other academies trying us out.',
    true,
    900,
    NOW(),
    NOW()
  ),
  (
    'mt_day_pass_elite',
    'Day Pass — Elite 90-min',
    'Day Pass',
    'Elite 90min',
    1,
    0,
    1000,
    'Both floors',
    'Single 90-minute elite class drop-in. ₹1,050 incl GST.',
    true,
    901,
    NOW(),
    NOW()
  )
ON CONFLICT ("name") DO UPDATE SET
  "tier" = EXCLUDED."tier",
  "cycle" = EXCLUDED."cycle",
  "durationDays" = EXCLUDED."durationDays",
  "freezeDaysAllowed" = EXCLUDED."freezeDaysAllowed",
  "basePriceRupees" = EXCLUDED."basePriceRupees",
  "floorAccess" = EXCLUDED."floorAccess",
  "notes" = EXCLUDED."notes",
  "active" = EXCLUDED."active",
  "sortOrder" = EXCLUDED."sortOrder",
  "updatedAt" = NOW();
