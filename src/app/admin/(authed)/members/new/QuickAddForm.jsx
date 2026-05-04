'use client';
import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { reverseCalc } from '@/lib/calc';
import { rupeesInputToPaise, formatRupees, formatDate } from '@/lib/format';
import { quickAddMember } from '../actions';
import { DatePicker } from '@/components/DatePicker';
import { DESIGNATIONS, PAYMENT_METHODS } from '@/lib/constants';

export function QuickAddForm({ types }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  // Member
  const [designation, setDesignation] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');

  // Membership
  const defaultType = types.find((t) => /Gold Quarterly/i.test(t.name)) || types[0];
  const [typeId, setTypeId] = useState(defaultType?.id || '');
  const [startDate, setStartDate] = useState(today());
  const [bonusDays, setBonusDays] = useState('');
  const [agreedRupees, setAgreedRupees] = useState('');
  const [gstin, setGstin] = useState('');
  const [floorChoice, setFloorChoice] = useState('');
  const [notes, setNotes] = useState('');

  // Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentReceivedAt, setPaymentReceivedAt] = useState(today());
  const [paymentReference, setPaymentReference] = useState('');

  const selected = types.find((t) => t.id === typeId) || defaultType;
  const requiresFloorChoice = selected && (selected.tier === 'Silver' || /\bOR\b/.test(selected.floorAccess || ''));
  const baseRup = selected?.basePriceRupees || 0;
  const basePaise = baseRup * 100;
  const agreedPaise = rupeesInputToPaise(agreedRupees);
  const calc = useMemo(() => reverseCalc(basePaise, agreedPaise), [basePaise, agreedPaise]);
  const endDate = useMemo(() => {
    if (!startDate || !selected) return null;
    try {
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + selected.durationDays + (Number(bonusDays) || 0));
      return end;
    } catch { return null; }
  }, [startDate, selected, bonusDays]);

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
    if (!firstName.trim() || !lastName.trim()) { setError('First and last name required.'); return; }
    if (!phone.trim()) { setError('Phone is required.'); return; }
    if (requiresFloorChoice && !floorChoice) { setError('Pick which floor: Arena or Sanctuary.'); return; }

    const fd = new FormData();
    if (designation) fd.set('designation', designation);
    fd.set('firstName', firstName.trim());
    fd.set('lastName', lastName.trim());
    fd.set('phone', phone.trim());
    if (dob) fd.set('dob', dob);
    if (gender) fd.set('gender', gender);

    fd.set('membershipTypeId', selected.id);
    fd.set('startDate', startDate);
    fd.set('bonusDays', String(bonusDays || 0));
    if (agreedRupees) fd.set('agreedFinal', agreedRupees);
    if (gstin) fd.set('customerGstin', gstin.toUpperCase());
    if (requiresFloorChoice && floorChoice) fd.set('floorChoice', floorChoice);
    if (notes) fd.set('notes', notes);

    if (paymentAmount && Number(paymentAmount) > 0) {
      fd.set('paymentAmount', paymentAmount);
      fd.set('paymentMethod', paymentMethod);
      fd.set('paymentReceivedAt', paymentReceivedAt);
      if (paymentReference) fd.set('paymentReference', paymentReference);
    }

    startTransition(async () => {
      const r = await quickAddMember(fd);
      if (r?.ok === false) setError(r.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">Member</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <div className="adm-field" style={{ maxWidth: 120 }}>
              <label className="adm-label">Title</label>
              <select value={designation} onChange={(e) => setDesignation(e.target.value)} className="adm-select">
                <option value="">—</option>
                {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">First name *</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="adm-input" />
            </div>
            <div className="adm-field">
              <label className="adm-label">Last name *</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required className="adm-input" />
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Phone *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" required className="adm-input adm-mono" />
            </div>
            <div className="adm-field">
              <label className="adm-label">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="adm-select">
                <option value="">—</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div className="adm-field">
              <label className="adm-label">DOB</label>
              <DatePicker value={dob} onChange={setDob} />
            </div>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Membership</h2>
        <div className="adm-form">
          <div className="adm-field">
            <label className="adm-label">Type *</label>
            <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className="adm-select" required>
              {grouped.map(([tier, list]) => (
                <optgroup key={tier} label={tier}>
                  {list.map((t) => (
                    <option key={t.id} value={t.id}>{t.cycle} · ₹{t.basePriceRupees.toLocaleString('en-IN')} pre-GST</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selected && (
              <span className="adm-help">
                {selected.durationDays} days · {selected.freezeDaysAllowed}d freeze
                {selected.floorAccess ? ` · ${selected.floorAccess}` : ''}
              </span>
            )}
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
            </div>
          )}
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Start date *</label>
              <DatePicker value={startDate} onChange={setStartDate} required />
              <span className="adm-help">For a backdated paper entry, set this to the actual paid date.</span>
            </div>
            <div className="adm-field">
              <label className="adm-label">Bonus days</label>
              <input type="number" value={bonusDays} onChange={(e) => setBonusDays(e.target.value)} placeholder="0" min="0" max="180" className="adm-input" />
            </div>
          </div>
          {endDate && <p className="adm-help">End date: <strong>{formatDate(endDate)}</strong></p>}
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Agreed final (incl GST)</label>
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
            </div>
            <div className="adm-field">
              <label className="adm-label">GSTIN (B2B only)</label>
              <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="29ABCDE1234F1Z5" maxLength={15} className="adm-input adm-mono" />
            </div>
          </div>
          <p className="adm-help">
            Total billed: <strong>{formatRupees(calc.totalPaise)}</strong>
            {calc.discountFinalPaise > 0 && <> · Discount: {formatRupees(calc.discountFinalPaise)}</>}
          </p>
          <div className="adm-field">
            <label className="adm-label">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Anything worth keeping with this membership." className="adm-textarea" />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Payment (optional — leave blank to record later)</h2>
        <div className="adm-form">
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Amount paid (₹)</label>
              <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder={(calc.totalPaise / 100).toFixed(2)} step="0.01" min="0" className="adm-input" />
              <span className="adm-help">Leave blank to skip — receipt will sit as &ldquo;issued&rdquo; until you record it.</span>
            </div>
            <div className="adm-field">
              <label className="adm-label">Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="adm-select">
                {PAYMENT_METHODS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="adm-form-row">
            <div className="adm-field">
              <label className="adm-label">Received on</label>
              <DatePicker value={paymentReceivedAt} onChange={setPaymentReceivedAt} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Reference</label>
              <input value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="UPI ref, txn id, cheque no…" className="adm-input adm-mono" />
            </div>
          </div>
        </div>
      </div>

      <div className="adm-form-actions">
        <Link href="/admin/members" className="adm-btn adm-btn-secondary">Cancel</Link>
        <button type="submit" disabled={isPending} className="adm-btn">
          {isPending ? 'Saving…' : 'Create member + membership + receipt'}
        </button>
      </div>
    </form>
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
