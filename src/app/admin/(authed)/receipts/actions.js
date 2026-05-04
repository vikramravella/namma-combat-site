'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { PAYMENT_METHODS } from '@/lib/constants';
import { rupeesInputToPaise } from '@/lib/format';
import { fiscalYearOf, formatInvoiceNumber } from '@/lib/calc';

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

// 99 paise tolerance: GST math (CGST + SGST on a discounted base) rounds to the
// paise and can leave a balance of 1-99 paise that the customer never sees on
// the receipt total. Without this tolerance, paying the displayed total flagged
// the receipt as "Part Paid" with a ₹0.01 balance forever.
const PAID_TOLERANCE_PAISE = 99;

function recomputeStatus(totalPaise, paidPaise) {
  if (paidPaise <= 0) return 'issued';
  if (paidPaise + PAID_TOLERANCE_PAISE >= totalPaise) return 'paid';
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

// Edits the editable parts of an issued receipt:
//   - issueDate (critical for backdated paper entries)
//   - customerGstinSnapshot (forgot at create time)
//   - customerNameSnapshot (B2B: company name override)
//   - notes
// Money fields stay locked. If issueDate moves into a different fiscal year
// the invoiceNumber is reissued under the new FY's next sequence — that's
// the GST-compliant move (sequences must be monotonic per FY).
const editReceiptSchema = z.object({
  issueDate: z.string().min(1, 'Issue date required'),
  customerNameSnapshot: z.string().trim().min(1).max(160),
  customerGstinSnapshot: z.string().trim().regex(/^[0-9A-Z]{15}$/, 'GSTIN must be 15 chars').optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export async function editReceipt(receiptId, formData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = editReceiptSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { issueDate, customerNameSnapshot, customerGstinSnapshot, notes } = parsed.data;

  const receipt = await db.receipt.findUnique({ where: { id: receiptId } });
  if (!receipt) return { ok: false, error: 'Receipt not found' };
  if (receipt.status === 'void') return { ok: false, error: 'Voided receipts cannot be edited. Issue a fresh one.' };

  const newIssueDate = new Date(issueDate);
  const newFy = fiscalYearOf(newIssueDate);
  const fyChanged = newFy !== receipt.fiscalYear;

  try {
    const result = await db.$transaction(async (tx) => {
      const data = {
        issueDate: newIssueDate,
        customerNameSnapshot,
        customerGstinSnapshot: customerGstinSnapshot || null,
        notes: notes || null,
        revisionCount: { increment: 1 },
      };

      if (fyChanged) {
        // Mint a fresh invoiceNumber in the new FY. The old number is
        // released back to its FY but never reused (sequence is monotonic).
        const max = await tx.receipt.aggregate({
          where: { fiscalYear: newFy },
          _max: { sequence: true },
        });
        const nextSeq = (max._max.sequence ?? 0) + 1;
        data.fiscalYear = newFy;
        data.sequence = nextSeq;
        data.invoiceNumber = formatInvoiceNumber(newFy, nextSeq);
      }

      return tx.receipt.update({ where: { id: receiptId }, data });
    });

    await logAudit({
      actorUserId: session.user.id,
      action: 'update',
      entity: 'Receipt',
      entityId: receiptId,
      before: {
        issueDate: receipt.issueDate,
        invoiceNumber: receipt.invoiceNumber,
        fiscalYear: receipt.fiscalYear,
        customerNameSnapshot: receipt.customerNameSnapshot,
        customerGstinSnapshot: receipt.customerGstinSnapshot,
        notes: receipt.notes,
      },
      after: {
        issueDate: result.issueDate,
        invoiceNumber: result.invoiceNumber,
        fiscalYear: result.fiscalYear,
        customerNameSnapshot: result.customerNameSnapshot,
        customerGstinSnapshot: result.customerGstinSnapshot,
        notes: result.notes,
      },
    });
    revalidatePath('/admin/receipts');
    revalidatePath(`/admin/receipts/${receiptId}`);
    return { ok: true, invoiceNumber: result.invoiceNumber };
  } catch (err) {
    console.error('editReceipt failed', err);
    return { ok: false, error: 'Could not save changes.' };
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
