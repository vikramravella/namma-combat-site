'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { db } from '@/lib/db';
import { updateVendor } from '@/lib/vendor';

const schema = z.object({
  legalName: z.string().trim().min(1).max(120),
  brandName: z.string().trim().min(1).max(120),
  brandShort: z.string().trim().min(1).max(40),
  address: z.string().trim().min(1).max(300),
  gstin: z.string().trim().regex(/^[0-9A-Z]{15}$/, 'GSTIN must be 15 chars'),
  sac: z.string().trim().min(1).max(20),
  sacDescription: z.string().trim().min(1).max(200),
  placeOfSupply: z.string().trim().min(1).max(80),
  pan: z.string().trim().min(1).max(20),
  phone: z.string().trim().min(1).max(40),
  email: z.string().trim().min(1).max(120),
  whatsappNumber: z.string().trim().min(1).max(20),
});

export async function saveVendor(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { ok: false, error: 'Not authenticated' };
  const raw = Object.fromEntries(formData);
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const before = await db.vendorSetting.findUnique({ where: { id: 'main' } });
  await updateVendor(parsed.data);
  await logAudit({
    actorUserId: session.user.id,
    action: 'update',
    entity: 'VendorSetting',
    entityId: 'main',
    before,
    after: parsed.data,
  });
  revalidatePath('/admin/settings/vendor');
  // Receipt detail pages render vendor — bust their cache too.
  revalidatePath('/admin/receipts');
  return { ok: true };
}
