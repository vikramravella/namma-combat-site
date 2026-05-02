'use client';
import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { TIERS, CYCLES, PRICE_TABLE } from '@/lib/constants';
import { reverseCalc, basePricePaise, computeEndDate, cycleMeta } from '@/lib/calc';
import { fullName, formatRupees, formatDate, rupeesInputToPaise } from '@/lib/format';
import { createPlan } from '../actions';

export function PlanForm({ member }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [tier, setTier] = useState('Gold');
  const [cycle, setCycle] = useState('Quarterly');
  const [startDate, setStartDate] = useState(today());
  const [bonusDays, setBonusDays] = useState(0);
  const [agreedRupees, setAgreedRupees] = useState('');
  const [gstin, setGstin] = useState('');
  const [notes, setNotes] = useState('');

  const meta = cycleMeta(cycle);
  const baseRup = PRICE_TABLE[tier]?.[cycle] ?? 0;
  const basePaise = basePricePaise(tier, cycle);
  const agreedPaise = rupeesInputToPaise(agreedRupees);
  const calc = useMemo(() => reverseCalc(basePaise, agreedPaise), [basePaise, agreedPaise]);
  const endDate = useMemo(() => {
    try { return computeEndDate(startDate, cycle, Number(bonusDays) || 0); } catch { return null; }
  }, [startDate, cycle, bonusDays]);

  const tierMeta = TIERS.find((t) => t.key === tier);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('memberId', member.id);
    fd.set('tier', tier);
    fd.set('cycle', cycle);
    fd.set('startDate', startDate);
    fd.set('bonusDays', String(bonusDays || 0));
    if (agreedRupees) fd.set('agreedFinal', agreedRupees);
    if (gstin) fd.set('customerGstin', gstin.toUpperCase());
    if (notes) fd.set('notes', notes);
    startTransition(async () => {
      const r = await createPlan(fd);
      if (r?.ok === false) setError(r.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">Member</h2>
        <p style={{ margin: 0 }}>
          <strong>{fullName(member)}</strong>
          <span className="prv-divider">·</span>
          <span className="adm-mono">{member.phone}</span>
        </p>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Plan</h2>
        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label">Tier</label>
            <div className="prv-chips">
              {TIERS.map((t) => (
                <button key={t.key} type="button" onClick={() => setTier(t.key)} className={`prv-chip ${tier === t.key ? 'prv-chip-on' : ''}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <span className="adm-help">{tierMeta?.notes}</span>
          </div>
          <div className="adm-field">
            <label className="adm-label">Billing cycle</label>
            <div className="prv-chips">
              {CYCLES.map((c) => (
                <button key={c.key} type="button" onClick={() => setCycle(c.key)} className={`prv-chip ${cycle === c.key ? 'prv-chip-on' : ''}`}>
                  {c.label}
                  <span className="prv-chip-count">₹{(PRICE_TABLE[tier]?.[c.key] || 0).toLocaleString('en-IN')}</span>
                </button>
              ))}
            </div>
            <span className="adm-help">{meta?.days} days · {meta?.freezeDays} days freeze allowance</span>
          </div>
          <div className="adm-form-row">
            <Field label="Start date" name="startDate" type="date" value={startDate} onChange={setStartDate} required />
            <Field label="Bonus days" name="bonusDays" type="number" value={bonusDays} onChange={(v) => setBonusDays(v)} />
          </div>
          {endDate && (
            <p className="adm-help">End date: <strong>{formatDate(endDate)}</strong></p>
          )}
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Money</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Catalog price (incl GST)</label>
              <input value={`₹${(baseRup * 1.05).toLocaleString('en-IN')}`} disabled className="adm-input" />
              <span className="adm-help">Base ₹{baseRup.toLocaleString('en-IN')} + 5% GST</span>
            </div>
            <div className="adm-field">
              <label className="adm-label">Final amount agreed (incl GST)</label>
              <input
                type="number"
                value={agreedRupees}
                onChange={(e) => setAgreedRupees(e.target.value)}
                placeholder={`Leave blank for full ₹${(baseRup * 1.05).toLocaleString('en-IN')}`}
                className="adm-input"
                step="1"
                min="0"
                max={baseRup * 1.05}
              />
              <span className="adm-help">Enter the round number you agreed (e.g. 21000). System reverse-calculates GST.</span>
            </div>
          </div>

          <BreakdownPreview calc={calc} />

          <Field label="GSTIN (only for B2B invoice)" name="customerGstin" value={gstin} onChange={(v) => setGstin(v.toUpperCase())} placeholder="29ABCDE1234F1Z5" />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Notes</h2>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="adm-textarea" rows={3} placeholder="Any context worth keeping with this plan." />
      </div>

      <div className="adm-form-actions">
        <Link href={`/admin/members/${member.id}`} className="adm-btn adm-btn-secondary">Cancel</Link>
        <button type="submit" disabled={isPending} className="adm-btn">
          {isPending ? 'Creating…' : 'Create plan + receipt'}
        </button>
      </div>
    </form>
  );
}

function BreakdownPreview({ calc }) {
  const hasDiscount = calc.discountFinalPaise > 0;
  return (
    <div className="plan-breakdown">
      <div className="plan-breakdown-row"><span>Subtotal (taxable)</span><span>{formatRupees(calc.grossTaxablePaise)}</span></div>
      {hasDiscount && (
        <>
          <div className="plan-breakdown-row plan-breakdown-discount">
            <span>Discount (pre-tax)</span><span>−{formatRupees(calc.discountPreTaxPaise)}</span>
          </div>
          <div className="plan-breakdown-row"><span>Net taxable</span><span>{formatRupees(calc.netTaxablePaise)}</span></div>
        </>
      )}
      <div className="plan-breakdown-row"><span>CGST 2.5%</span><span>{formatRupees(calc.cgstPaise)}</span></div>
      <div className="plan-breakdown-row"><span>SGST 2.5%</span><span>{formatRupees(calc.sgstPaise)}</span></div>
      <div className="plan-breakdown-row plan-breakdown-total"><span>Total</span><span>{formatRupees(calc.totalPaise)}</span></div>
    </div>
  );
}

function Field({ label, name, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div className="adm-field">
      <label className="adm-label">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder} className="adm-input" />
    </div>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
