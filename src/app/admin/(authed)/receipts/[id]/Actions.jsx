'use client';
import { useState, useTransition } from 'react';
import { voidReceipt, editReceipt } from '../actions';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/DatePicker';

export function ReceiptActions({ receipt, member }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  function handleWhatsApp() {
    const phoneDigits = (member?.phone || '').replace(/\D/g, '').slice(-10);
    if (!phoneDigits) {
      alert('No phone on file for this member.');
      return;
    }
    const link = `${window.location.origin}/admin/receipts/${receipt.id}`;
    const msg = encodeURIComponent(`Receipt ${receipt.invoiceNumber} — ₹${(receipt.totalPaise / 100).toLocaleString('en-IN')}. View: ${link}`);
    window.open(`https://wa.me/91${phoneDigits}?text=${msg}`, '_blank');
  }

  function handleVoid() {
    const reason = prompt('Void this receipt? Optional reason:');
    if (reason === null) return;
    startTransition(async () => {
      await voidReceipt(receipt.id, reason);
      router.refresh();
    });
  }

  return (
    <>
      <div className="prv-action-row">
        <button type="button" onClick={handlePrint} className="adm-btn adm-btn-secondary">Download / Print</button>
        <button type="button" onClick={handleWhatsApp} className="adm-btn">Send via WhatsApp</button>
        {receipt.status !== 'void' && (
          <button type="button" onClick={() => setEditing((v) => !v)} className="adm-btn adm-btn-secondary">
            {editing ? 'Close edit' : 'Edit'}
          </button>
        )}
        {receipt.status !== 'void' && (
          <button type="button" onClick={handleVoid} disabled={isPending} className="adm-btn adm-btn-danger">Void</button>
        )}
      </div>
      {editing && receipt.status !== 'void' && (
        <EditReceiptCard receipt={receipt} onClose={() => setEditing(false)} />
      )}
    </>
  );
}

function EditReceiptCard({ receipt, onClose }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [issueDate, setIssueDate] = useState(toIsoDate(receipt.issueDate));
  const [customerName, setCustomerName] = useState(receipt.customerNameSnapshot || '');
  const [customerGstin, setCustomerGstin] = useState(receipt.customerGstinSnapshot || '');
  const [notes, setNotes] = useState(receipt.notes || '');
  const [planStartDate, setPlanStartDate] = useState(toIsoDate(receipt.plan?.startDate));
  const [planBonusDays, setPlanBonusDays] = useState(
    receipt.plan?.bonusDays > 0 ? String(receipt.plan.bonusDays) : ''
  );

  const baseDays = (receipt.plan?.durationDays || 0) - (receipt.plan?.bonusDays || 0);
  const previewEnd = (() => {
    if (!planStartDate || !receipt.plan) return null;
    const start = new Date(planStartDate);
    const end = new Date(start);
    end.setDate(end.getDate() + baseDays + (Number(planBonusDays) || 0));
    return end;
  })();

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!issueDate) { setError('Issue date is required.'); return; }
    if (!customerName.trim()) { setError('Customer name is required.'); return; }
    const fd = new FormData();
    fd.set('issueDate', issueDate);
    fd.set('customerNameSnapshot', customerName.trim());
    if (customerGstin) fd.set('customerGstinSnapshot', customerGstin.toUpperCase());
    if (notes) fd.set('notes', notes);
    if (planStartDate) {
      fd.set('planStartDate', planStartDate);
      fd.set('planBonusDays', String(Number(planBonusDays) || 0));
    }
    startTransition(async () => {
      const r = await editReceipt(receipt.id, fd);
      if (r?.ok === false) {
        setError(r.error);
      } else {
        onClose();
        router.refresh();
      }
    });
  }

  return (
    <div className="adm-card" style={{ marginTop: 12 }}>
      <h2 className="adm-card-title">Edit receipt</h2>
      <p className="adm-help" style={{ marginTop: 0 }}>
        Money fields stay locked (the totals are issued tax data). Changing the issue date into a
        different fiscal year will reissue the invoice number under the new year&rsquo;s next
        sequence — required for GST compliance.
      </p>
      <form onSubmit={handleSubmit} className="adm-form">
        {error && <p className="adm-error">{error}</p>}
        <div className="adm-form-row">
          <div className="adm-field">
            <label className="adm-label">Issue date *</label>
            <DatePicker value={issueDate} onChange={setIssueDate} required />
          </div>
          <div className="adm-field">
            <label className="adm-label">Customer GSTIN</label>
            <input
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
              placeholder="29ABCDE1234F1Z5"
              className="adm-input"
              maxLength={15}
            />
          </div>
        </div>
        <div className="adm-field">
          <label className="adm-label">Customer name on invoice *</label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="adm-input"
            required
          />
          <span className="adm-help">For B2B you can override with the company name. Otherwise leave as the member name.</span>
        </div>

        {receipt.plan && (
          <>
            <h3 className="adm-card-title" style={{ marginTop: 8 }}>Membership term</h3>
            <div className="adm-form-row">
              <div className="adm-field">
                <label className="adm-label">Start date</label>
                <DatePicker value={planStartDate} onChange={setPlanStartDate} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Bonus days</label>
                <input
                  type="number"
                  value={planBonusDays}
                  onChange={(e) => setPlanBonusDays(e.target.value)}
                  placeholder="0"
                  min="0"
                  max="180"
                  className="adm-input"
                />
              </div>
            </div>
            {previewEnd && (
              <p className="adm-help">
                New end date: <strong>{previewEnd.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
                {' '}({baseDays + (Number(planBonusDays) || 0)} days)
              </p>
            )}
          </>
        )}

        <div className="adm-field">
          <label className="adm-label">Internal notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="adm-textarea"
            rows={2}
            placeholder="Not printed on the receipt."
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} className="adm-btn adm-btn-secondary">Cancel</button>
          <button type="submit" disabled={isPending} className="adm-btn">
            {isPending ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function toIsoDate(d) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}
