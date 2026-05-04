'use client';
import { useState, useTransition, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { recordPayment } from '../actions';
import { PAYMENT_METHODS } from '@/lib/constants';
import { DatePicker } from '@/components/DatePicker';
import { formatRupees } from '@/lib/format';

export function PaymentForm({ receipt, balance }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  // Re-entry guard: useTransition's isPending only flips on the NEXT render,
  // so two clicks within the same event microtask can both fire recordPayment
  // and create duplicate Payment rows. The ref blocks a second submit
  // synchronously regardless of when isPending has updated.
  const submittingRef = useRef(false);
  const [method, setMethod] = useState('upi');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState('');
  // Default the payment date to the membership's START date — that's
  // the day staff actually expect the customer to have paid. The receipt's
  // issueDate would also work, but on receipts created via the normal flow
  // the issueDate is "now" (auto-default) and not necessarily the start.
  // Falls back to issueDate if plan isn't available for some reason.
  const [receivedAt, setReceivedAt] = useState(toIsoDate(receipt.plan?.startDate || receipt.issueDate));
  const [nextDate, setNextDate] = useState('');
  const [nextNote, setNextNote] = useState('');

  const balanceRupees = balance / 100;
  const paidInFull = useMemo(() => {
    if (!amount || balance <= 0) return false;
    return Math.round(Number(amount) * 100) === balance;
  }, [amount, balance]);

  if (balance <= 0 || receipt.status === 'void') {
    return (
      <p className="adm-muted">
        {receipt.status === 'void' ? 'Receipt voided.' : 'Fully paid — no further payments to record.'}
      </p>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError('');
    const fd = new FormData();
    fd.set('method', method);
    if (reference) fd.set('reference', reference);
    fd.set('amount', amount);
    fd.set('receivedAt', receivedAt);
    if (nextDate) fd.set('nextAgreedDate', nextDate);
    if (nextNote) fd.set('nextAgreedNote', nextNote);
    startTransition(async () => {
      try {
        const r = await recordPayment(receipt.id, fd);
        if (r?.ok === false) setError(r.error);
        else router.refresh();
      } finally {
        submittingRef.current = false;
      }
    });
  }

  const partialAfter = Number(amount) > 0 && Number(amount) < balanceRupees;

  return (
    <form onSubmit={handleSubmit} className="adm-form">
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-form-row">
        <div className="adm-field">
          <label className="adm-label">Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="adm-select">
            {PAYMENT_METHODS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        <div className="adm-field">
          <label className="adm-label">Reference</label>
          <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="UPI ref, txn id, cheque no…" className="adm-input adm-mono" />
        </div>
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 0 }}>
        <input
          type="checkbox"
          checked={paidInFull}
          onChange={(e) => setAmount(e.target.checked ? balanceRupees.toFixed(2) : '')}
        />
        <span>Paid in full ({formatRupees(balance)})</span>
      </label>
      <div className="adm-form-row">
        <div className="adm-field">
          <label className="adm-label">Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} max={balanceRupees.toFixed(2)} step="0.01" placeholder={balanceRupees.toFixed(2)} className="adm-input" />
          <span className="adm-help">Tick &ldquo;Paid in full&rdquo; above, or type a partial amount.</span>
        </div>
        <div className="adm-field">
          <label className="adm-label">Received on</label>
          <DatePicker value={receivedAt} onChange={setReceivedAt} />
          <span className="adm-help">Defaults to the membership start date.</span>
        </div>
      </div>

      {partialAfter && (
        <div className="adm-form-row" style={{ background: 'var(--gold-soft)', padding: 12, borderRadius: 8 }}>
          <div className="adm-field">
            <label className="adm-label">Next agreed date</label>
            <DatePicker value={nextDate} onChange={setNextDate} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Note</label>
            <input value={nextNote} onChange={(e) => setNextNote(e.target.value)} placeholder="e.g. Will close balance after April salary" className="adm-input" />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="submit" disabled={isPending} className="adm-btn">
          {isPending ? 'Recording…' : 'Record payment'}
        </button>
      </div>
    </form>
  );
}

function toIsoDate(d) {
  if (!d) return new Date().toISOString().slice(0, 10);
  return new Date(d).toISOString().slice(0, 10);
}
