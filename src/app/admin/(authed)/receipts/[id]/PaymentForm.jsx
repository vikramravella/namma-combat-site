'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { recordPayment } from '../actions';
import { PAYMENT_METHODS } from '@/lib/constants';

export function PaymentForm({ receipt, balance }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [method, setMethod] = useState('upi');
  const [reference, setReference] = useState('');
  const [amount, setAmount] = useState((balance / 100).toFixed(2));
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().slice(0, 10));
  const [nextDate, setNextDate] = useState('');
  const [nextNote, setNextNote] = useState('');

  if (balance <= 0 || receipt.status === 'void') {
    return (
      <p className="adm-muted">
        {receipt.status === 'void' ? 'Receipt voided.' : 'Fully paid — no further payments to record.'}
      </p>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const fd = new FormData();
    fd.set('method', method);
    if (reference) fd.set('reference', reference);
    fd.set('amount', amount);
    fd.set('receivedAt', receivedAt);
    if (nextDate) fd.set('nextAgreedDate', nextDate);
    if (nextNote) fd.set('nextAgreedNote', nextNote);
    startTransition(async () => {
      const r = await recordPayment(receipt.id, fd);
      if (r?.ok === false) setError(r.error);
      else router.refresh();
    });
  }

  const partialAfter = Number(amount) > 0 && Number(amount) < balance / 100;

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
      <div className="adm-form-row">
        <div className="adm-field">
          <label className="adm-label">Amount (₹)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} max={(balance / 100).toFixed(2)} step="0.01" className="adm-input" />
          <span className="adm-help">Balance: ₹{(balance / 100).toLocaleString('en-IN')}</span>
        </div>
        <div className="adm-field">
          <label className="adm-label">Received on</label>
          <input type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} className="adm-input" />
        </div>
      </div>

      {partialAfter && (
        <div className="adm-form-row" style={{ background: 'var(--gold-soft)', padding: 12, borderRadius: 8 }}>
          <div className="adm-field">
            <label className="adm-label">Next agreed date</label>
            <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} className="adm-input" />
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
