'use client';
import { useTransition } from 'react';
import { voidReceipt } from '../actions';
import { useRouter } from 'next/navigation';

export function ReceiptActions({ receipt, member }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handlePrint() {
    if (typeof window !== 'undefined') window.print();
  }

  function handleWhatsApp() {
    const phoneDigits = (member?.phone || '').replace(/\D/g, '').slice(-10);
    if (!phoneDigits) {
      alert('No phone on file for this member.');
      return;
    }
    // For now, just open WhatsApp with a message including the receipt link.
    // Production: generate PDF, upload, share that URL instead.
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
    <div className="prv-action-row">
      <button type="button" onClick={handlePrint} className="adm-btn adm-btn-secondary">Download / Print</button>
      <button type="button" onClick={handleWhatsApp} className="adm-btn">Send via WhatsApp</button>
      {receipt.status !== 'void' && (
        <button type="button" onClick={handleVoid} disabled={isPending} className="adm-btn adm-btn-danger">Void</button>
      )}
    </div>
  );
}
