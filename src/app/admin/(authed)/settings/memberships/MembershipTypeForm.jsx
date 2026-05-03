'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function MembershipTypeForm({ row, action, mode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleSubmit(formData) {
    setError(''); setSuccess('');
    startTransition(async () => {
      const r = mode === 'create' ? await action(formData) : await action(row.id, formData);
      if (r?.ok === false) setError(r.error);
      else if (r?.ok === true) { setSuccess('Saved.'); router.refresh(); }
    });
  }

  const r = row || {};
  return (
    <form action={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      {success && <p className="adm-success">{success}</p>}

      <div className="adm-card">
        <h2 className="adm-card-title">Identity</h2>
        <div className="adm-form-row">
          <div className="adm-field">
            <label className="adm-label" htmlFor="name">Name *</label>
            <input id="name" name="name" defaultValue={r.name || ''} required placeholder="e.g. Gold Quarterly" className="adm-input" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="sortOrder">Sort order</label>
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={r.sortOrder ?? 100} className="adm-input" />
          </div>
        </div>
        <div className="adm-form-row">
          <div className="adm-field">
            <label className="adm-label" htmlFor="tier">Tier *</label>
            <input id="tier" name="tier" defaultValue={r.tier || ''} required placeholder="Silver / Student / Gold / Platinum / …" className="adm-input" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="cycle">Cycle *</label>
            <input id="cycle" name="cycle" defaultValue={r.cycle || ''} required placeholder="Monthly / Quarterly / Semi-Annual / Annual / …" className="adm-input" />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Duration & freeze</h2>
        <div className="adm-form-row">
          <div className="adm-field">
            <label className="adm-label" htmlFor="durationDays">Duration (days) *</label>
            <input id="durationDays" name="durationDays" type="number" defaultValue={r.durationDays ?? 30} required className="adm-input" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="freezeDaysAllowed">Freeze allowance (days) *</label>
            <input id="freezeDaysAllowed" name="freezeDaysAllowed" type="number" defaultValue={r.freezeDaysAllowed ?? 7} required className="adm-input" />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Pricing & access</h2>
        <div className="adm-form-row">
          <div className="adm-field">
            <label className="adm-label" htmlFor="basePriceRupees">Base price (₹, pre-GST) *</label>
            <input id="basePriceRupees" name="basePriceRupees" type="number" defaultValue={r.basePriceRupees ?? 0} required className="adm-input" />
          </div>
          <div className="adm-field">
            <label className="adm-label" htmlFor="floorAccess">Floor access</label>
            <input id="floorAccess" name="floorAccess" defaultValue={r.floorAccess || ''} placeholder="e.g. Both floors" className="adm-input" />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Notes & status</h2>
        <div className="adm-field">
          <label className="adm-label" htmlFor="notes">Notes (shown on receipts)</label>
          <textarea id="notes" name="notes" defaultValue={r.notes || ''} rows={3} className="adm-textarea" />
        </div>
        <div className="adm-field">
          <label className="adm-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" name="active" defaultChecked={mode === 'create' ? true : r.active} /> Active (available in plan-creation dropdown)
          </label>
        </div>
      </div>

      <div className="adm-form-actions">
        <Link href="/admin/settings/memberships" className="adm-btn adm-btn-secondary">Cancel</Link>
        <button type="submit" disabled={isPending} className="adm-btn">
          {isPending ? 'Saving…' : mode === 'create' ? 'Create membership type' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
