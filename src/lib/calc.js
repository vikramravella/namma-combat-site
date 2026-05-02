// Money math for plans + receipts.
// All inputs/outputs are in PAISE (integer). Convert to rupees only at display.
// GST: CGST 2.5% + SGST 2.5% (5% total) under SAC 999723.

import { VENDOR, PRICE_TABLE, CYCLES } from '@/lib/constants';

export const CGST_RATE = VENDOR.cgstRate; // 0.025
export const SGST_RATE = VENDOR.sgstRate; // 0.025
export const GST_RATE  = VENDOR.totalGstRate; // 0.05

/**
 * Reverse-calculate the breakdown given Vinod's agreed final amount.
 * If `agreedFinalPaise` is null, returns the full-price breakdown.
 *
 * @param {number} basePricePaise - catalog price (pre-GST)
 * @param {number|null} agreedFinalPaise - final amount Vinod agreed to take, incl GST
 * @returns {object} breakdown — all paise integers (rounded)
 */
export function reverseCalc(basePricePaise, agreedFinalPaise) {
  const grossTaxable = basePricePaise;
  const fullTotal = Math.round(grossTaxable * (1 + GST_RATE));
  const agreedFinal = (agreedFinalPaise == null || agreedFinalPaise === '')
    ? fullTotal
    : Number(agreedFinalPaise);
  const discountFinal = Math.max(0, fullTotal - agreedFinal);
  // Pre-tax discount = discountFinal / 1.05
  const discountPreTax = Math.round(discountFinal / (1 + GST_RATE));
  const netTaxable = grossTaxable - discountPreTax;
  const cgst = Math.round(netTaxable * CGST_RATE);
  const sgst = Math.round(netTaxable * SGST_RATE);
  const total = netTaxable + cgst + sgst;
  return {
    grossTaxablePaise: grossTaxable,
    fullTotalPaise: fullTotal,
    agreedFinalPaise: agreedFinal,
    discountFinalPaise: discountFinal,
    discountPreTaxPaise: discountPreTax,
    netTaxablePaise: netTaxable,
    cgstPaise: cgst,
    sgstPaise: sgst,
    totalPaise: total,
  };
}

/** Look up the catalog base price (rupees) for a tier+cycle. */
export function basePriceRupees(tier, cycle) {
  return PRICE_TABLE[tier]?.[cycle] ?? 0;
}
export function basePricePaise(tier, cycle) {
  return basePriceRupees(tier, cycle) * 100;
}

/** Cycle metadata (days, freeze cap) */
export function cycleMeta(cycle) {
  return CYCLES.find((c) => c.key === cycle);
}

/** Compute end date given start + cycle (+ optional bonus days). */
export function computeEndDate(startDate, cycle, bonusDays = 0) {
  const meta = cycleMeta(cycle);
  if (!meta) throw new Error(`Unknown cycle: ${cycle}`);
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + meta.days + bonusDays);
  return end;
}

/** Fiscal year string from a date — Indian FY runs April → March.
 *  e.g. 2026-04-01 → "2627" ; 2026-03-31 → "2526" */
export function fiscalYearOf(date) {
  const d = new Date(date);
  const month = d.getMonth(); // 0 = Jan
  const year = d.getFullYear();
  const startYear = month >= 3 ? year : year - 1; // April or later → this year is start
  const endYear = startYear + 1;
  // 2-digit short form: "2526"
  const a = String(startYear).slice(-2);
  const b = String(endYear).slice(-2);
  return `${a}${b}`;
}

/** Format an invoice number: NCA/{fy}/{seq:0000} */
export function formatInvoiceNumber(fiscalYear, sequence) {
  return `NCA/${fiscalYear}/${String(sequence).padStart(4, '0')}`;
}
