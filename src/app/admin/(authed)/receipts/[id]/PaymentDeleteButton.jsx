'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deletePayment } from '../actions';

export function PaymentDeleteButton({ paymentId, summary }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`Delete this payment (${summary})?\n\nThis can't be undone — only do this for entries that shouldn't have been recorded (test, duplicate, wrong amount).`)) return;
    startTransition(async () => {
      const r = await deletePayment(paymentId);
      if (r?.ok === false) alert(r.error || 'Could not delete.');
      else router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="prv-icon-btn"
      title="Delete this payment"
      style={{ opacity: 1, color: 'var(--rust, #9A3520)' }}
    >
      {isPending ? '…' : '✕'}
    </button>
  );
}
