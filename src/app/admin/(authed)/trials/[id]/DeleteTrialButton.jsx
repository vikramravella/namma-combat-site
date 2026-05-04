'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteTrial } from '../actions';

export function DeleteTrialButton({ trialId, summary, hasConvertedMember }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const extra = hasConvertedMember
      ? '\n\nThe linked member record stays — only this trial entry is removed.'
      : '\n\nThe linked inquiry stays — only this trial entry is removed.';
    if (!confirm(`Delete this trial (${summary})?${extra}\n\nUse this only for duplicates or trials created by mistake.`)) return;
    startTransition(async () => {
      const r = await deleteTrial(trialId);
      if (r?.ok === false) alert(r.error || 'Could not delete.');
      else router.push('/admin/trials');
    });
  }

  return (
    <button type="button" onClick={handleClick} disabled={isPending} className="adm-btn adm-btn-danger adm-btn-sm">
      {isPending ? 'Deleting…' : 'Delete trial'}
    </button>
  );
}
