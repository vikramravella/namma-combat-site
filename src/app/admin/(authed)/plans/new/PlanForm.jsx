'use client';
import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { reverseCalc } from '@/lib/calc';
import { fullName, formatRupees, formatDate, rupeesInputToPaise } from '@/lib/format';
import { createPlan } from '../actions';

export function PlanForm({ member, types }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const defaultType = types.find((t) => /Gold Quarterly/i.test(t.name)) || types[0];
  const [typeId, setTypeId] = useState(defaultType.id);
  const [startDate, setStartDate] = useState(today());
  const [bonusDays, setBonusDays] = useState(0);
  const [agreedRupees, setAgreedRupees] = useState('');
  const [gstin, setGstin] = useState('');
  const [notes, setNotes] = useState('');
  const [floorChoice, setFloorChoice] = useState('');

  const selected = types.find((t) => t.id === typeId) || types[0];
  // Single-floor tiers (e.g. Silver) need an explicit Arena/Sanctuary pick.
  const requiresFloorChoice = selected.tier === 'Silver' || /\bOR\b/.test(selected.floorAccess || '');
  const baseRup = selected.basePriceRupees;
  const basePaise = baseRup * 100;
  const agreedPaise = rupeesInputToPaise(agreedRupees);
  const calc = useMemo(() => reverseCalc(basePaise, agreedPaise), [basePaise, agreedPaise]);
  const endDate = useMemo(() => {
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + selected.durationDays + (Number(bonusDays) || 0));
      return end;
    } catch { return null; }
  }, [startDate, selected, bonusDays]);

  // Group types by tier for the dropdown
  const grouped = useMemo(() => {
    const m = new Map();
    for (const t of types) {
      if (!m.has(t.tier)) m.set(t.tier, []);
      m.get(t.tier).push(t);
    }
    return [...m.entries()];
  }, [types]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (requiresFloorChoice && !floorChoice) {
      setError('Pick which floor: Arena or Sanctuary.');
      return;
    }
    const fd = new FormData();
    fd.set('memberId', member.id);
    fd.set('membershipTypeId', selected.id);
    fd.set('startDate', startDate);
    fd.set('bonusDays', String(bonusDays || 0));
    if (agreedRupees) fd.set('agreedFinal', agreedRupees);
    if (gstin) fd.set('customerGstin', gstin.toUpperCase());
    if (notes) fd.set('notes', notes);
    if (requiresFloorChoice && floorChoice) fd.set('floorChoice', floorChoice);
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
        <h2 className="adm-card-title">Membership type</h2>
        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label" htmlFor="typeId">Type</label>
            <select id="typeId" value={typeId} onChange={(e) => setTypeId(e.target.value)} className="adm-select">
              {grouped.map(([tier, list]) => (
                <optgroup key={tier} label={tier}>
                  {list.map((t) => (
                    <option key={t.id} value={t.id}>{t.cycle} · ₹{t.basePriceRupees.toLocaleString('en-IN')} pre-GST</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="adm-help">
              {selected.durationDays} days · {selected.freezeDaysAllowed}d freeze
              {selected.floorAccess ? ` · ${selected.floorAccess}` : ''}
            </span>
          </div>
          {requiresFloorChoice && (
            <div className="adm-field">
              <label className="adm-label">Floor *</label>
              <div className="prv-chips">
                {['Arena', 'Sanctuary'].map((f) => (
                  <button key={f} type="button" onClick={() => setFloorChoice(f)} className={`prv-chip ${floorChoice === f ? 'prv-chip-on' : ''}`}>
                    {f}
                  </button>
                ))}
              </div>
              <span className="adm-help">This tier covers one floor only — pick which one.</span>
            </div>
          )}
          <div className="adm-form-row">
            <Field label="Start date" name="startDate" type="date" value={startDate} onChange={setStartDate} required />
            <Field label="Bonus days" name="bonusDays" type="number" value={bonusDays} onChange={(v) => setBonusDays(v)} />
          </div>
          {endDate && <p className="adm-help">End date: <strong>{formatDate(endDate)}</strong></p>}
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
              <span className="adm-help">Enter the round number you agreed. System reverse-calculates GST + discount.</span>
            </div>
          </div>

          <div className="adm-field">
            <label className="adm-label">Quick discount</label>
            <div className="prv-chips">
              {[0, 5, 10, 15, 20, 25].map((pct) => {
                const fullIncl = Math.round(baseRup * 1.05);
                const target = pct === 0 ? '' : String(Math.round(fullIncl * (100 - pct) / 100));
                const isOn = pct === 0 ? !agreedRupees : Number(agreedRupees) === Number(target);
                return (
                  <button key={pct} type="button" onClick={() => setAgreedRupees(target)} className={`prv-chip ${isOn ? 'prv-chip-on' : ''}`}>
                    {pct === 0 ? 'No discount' : `${pct}% off`}
                    {pct > 0 && <span className="prv-chip-count">₹{Number(target).toLocaleString('en-IN')}</span>}
                  </button>
                );
              })}
            </div>
            <span className="adm-help">Or type any custom amount in &ldquo;Final amount agreed&rdquo; above.</span>
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
