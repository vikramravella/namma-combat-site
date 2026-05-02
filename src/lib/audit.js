// Append-only audit logger. Wrap mutations to record before/after diffs.
import { db } from '@/lib/db';

export async function logAudit({ actorUserId, action, entity, entityId, before, after, ip }) {
  try {
    await db.auditLog.create({
      data: {
        actorUserId,
        action,
        entity,
        entityId,
        before: before == null ? null : JSON.stringify(before),
        after: after == null ? null : JSON.stringify(after),
        ip,
      },
    });
  } catch (e) {
    console.error('audit log failed', e);
  }
}
