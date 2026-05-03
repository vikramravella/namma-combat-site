'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { SKILL_LEVELS, stageMeta } from '@/lib/constants';
import { setSkillLevel } from '../actions';

export function SkillLevelEditor({ memberId, current }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(current);
  const [error, setError] = useState('');
  const meta = stageMeta(SKILL_LEVELS, value);

  function handleChange(next) {
    if (next === value) return;
    setError('');
    const prev = value;
    setValue(next); // optimistic
    startTransition(async () => {
      const r = await setSkillLevel(memberId, next);
      if (r?.ok === false) { setValue(prev); setError(r.error || 'Could not update'); }
      else router.refresh();
    });
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span className={`prv-stage prv-stage-${meta.tone}`}><span className="prv-stage-dot" />{meta.label}</span>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        aria-label="Change skill level"
        title="Change skill level"
        style={{ fontSize: 12, padding: '2px 6px', border: '1px solid var(--border, #E0D6C8)', borderRadius: 4, background: 'transparent', cursor: 'pointer' }}
      >
        {SKILL_LEVELS.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>
      {error && <span style={{ color: '#9A3520', fontSize: 11 }}>{error}</span>}
    </span>
  );
}
