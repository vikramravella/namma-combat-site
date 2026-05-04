'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { seedDayPassTypes } from './actions';

export function SeedDayPassButton({ alreadyHas }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState('');

  function handleClick() {
    setMsg('');
    startTransition(async () => {
      const r = await seedDayPassTypes();
      if (r?.ok) {
        const parts = [];
        if (r.created) parts.push(`${r.created} created`);
        if (r.updated) parts.push(`${r.updated} updated`);
        setMsg(parts.join(' · ') || 'Already up to date.');
        router.refresh();
      }
    });
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button type="button" onClick={handleClick} disabled={isPending} className="adm-btn adm-btn-secondary adm-btn-sm">
        {isPending ? 'Seeding…' : alreadyHas ? 'Re-seed Day Pass types' : 'Seed Day Pass types'}
      </button>
      {msg && <span className="adm-help" style={{ margin: 0 }}>{msg}</span>}
    </div>
  );
}
