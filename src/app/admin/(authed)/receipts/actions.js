'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { PAYMENT_METHODS } from '@/lib/constants';
import { rupeesInputToPaise } from '@/lib/format';

const methodKeys = PAYMENT_METHODS.map((m) => m.key);

const paymentSchema = z.object({
  method: z.enum(methodKeys),
  reference: z.string().trim().max(120).optional().or(z.literal('')),
  amount: z.string().min(1, 'Amount required'),
  receivedAt: z.string().optional().or(z.literal('')),
  nextAgreedDate: z.string().optional().or(z.literal('')),
  nextAgreedNote: z.string().trim().max(500).optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

async function requireSession() {
  const s = await getServerSession(authOptions);
  if (!s) throw new Error('Not authenticated');
  return s;
}

function recomputeStatus(totalPaise, paidPaise) {
  if (paidPaise <= 0) return 'issued';
  if (paidPaise >= totalPaise) return 'paid';
  return 'partial';
}

export async function recordPayment(receiptId, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { method, reference, amount, receivedAt, nextAgreedDate, nextAgreedNote, notes } = parsed.data;

  const amountPaise = rupeesInputToPaise(amount);
  if (!amountPaise || amountPaise <= 0) return { ok: false, error: 'Invalid amount' };

  try {
    const receipt = await db.receipt.findUnique({ where: { id: receiptId }, include: { payments: true } });
    if (!receipt) return { ok: false, error: 'Receipt not found' };

    const newPaidPaise = receipt.payments.reduce((s, p) => s + p.amountPaise, 0) + amountPaise;
    if (newPaidPaise > receipt.totalPaise) {
      return { ok: false, error: `Amount exceeds remaining balance. Max: ₹${((receipt.totalPaise - receipt.payments.reduce((s, p) => s + p.amountPaise, 0)) / 100).toFixed(2)}` };
    }
    const newStatus = recomputeStatus(receipt.totalPaise, newPaidPaise);

    await db.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          receiptId,
          method,
          reference: reference || null,
          amountPaise,
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
          notes: notes || null,
        },
      });
      await tx.receipt.update({
        where: { id: receiptId },
        data: {
          status: newStatus,
          nextAgreedDate: newStatus === 'partial' && nextAgreedDate ? new Date(nextAgreedDate) : (newStatus === 'paid' ? null : undefined),
          nextAgreedNote: newStatus === 'partial' ? (nextAgreedNote || null) : null,
        },
      });
    });

    await logAudit({ actorUserId: session.user.id, action: 'record_payment', entity: 'Receipt', entityId: receiptId, after: { method, amountPaise, newStatus } });
    revalidatePath('/admin');
    revalidatePath('/admin/receipts');
    revalidatePath(`/admin/receipts/${receiptId}`);
    return { ok: true };
  } catch (err) {
    console.error('recordPayment failed', err);
    return { ok: false, error: 'Could not record payment.' };
  }
}

export async function deletePayment(paymentId) {
  const session = await requireSession();
  try {
    const payment = await db.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return { ok: false, error: 'Payment not found' };
    const receiptId = payment.receiptId;
    await db.$transaction(async (tx) => {
      await tx.payment.delete({ where: { id: paymentId } });
      const receipt = await tx.receipt.findUnique({ where: { id: receiptId }, include: { payments: true } });
      const totalPaid = receipt.payments.reduce((s, p) => s + p.amountPaise, 0);
      const newStatus = recomputeStatus(receipt.totalPaise, totalPaid);
      await tx.receipt.update({
        where: { id: receiptId },
        data: { status: newStatus, nextAgreedDate: newStatus === 'paid' ? null : receipt.nextAgreedDate },
      });
    });
    await logAudit({ actorUserId: session.user.id, action: 'delete_payment', entity: 'Payment', entityId: paymentId, before: payment });
    revalidatePath(`/admin/receipts/${receiptId}`);
    return { ok: true };
  } catch (err) {
    console.error('deletePayment failed', err);
    return { ok: false, error: 'Could not delete payment.' };
  }
}

export async function voidReceipt(receiptId, reason) {
  const session = await requireSession();
  try {
    const receipt = await db.receipt.findUnique({ where: { id: receiptId } });
    if (!receipt) return { ok: false, error: 'Receipt not found' };
    await db.receipt.update({
      where: { id: receiptId },
      data: { status: 'void', notes: [receipt.notes, `Voided: ${reason || 'no reason'}`].filter(Boolean).join('\n') },
    });
    await logAudit({ actorUserId: session.user.id, action: 'void', entity: 'Receipt', entityId: receiptId, before: { status: receipt.status }, after: { status: 'void', reason } });
    revalidatePath('/admin/receipts');
    revalidatePath(`/admin/receipts/${receiptId}`);
    return { ok: true };
  } catch (err) {
    console.error('voidReceipt failed', err);
    return { ok: false, error: 'Could not void.' };
  }
}
