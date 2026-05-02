'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: '7d' },
  { key: 'month', label: '30d' },
  { key: 'quarter', label: '90d' },
  { key: 'year', label: '1y' },
];

export function DashFilters({ period, discipline, gender, tier, disciplines, tiers }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key, value) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value); else next.delete(key);
    router.replace(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  return (
    <div className="dash-filter-row">
      <div className="prv-chips">
        {PERIODS.map((p) => (
          <button key={p.key} type="button" onClick={() => setParam('period', p.key)} className={`prv-chip ${period === p.key ? 'prv-chip-on' : ''}`}>
            {p.label}
          </button>
        ))}
      </div>
      <select value={discipline} onChange={(e) => setParam('discipline', e.target.value)} className="adm-select prv-tool-btn" aria-label="Discipline">
        <option value="">All sports</option>
        {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
      <select value={gender} onChange={(e) => setParam('gender', e.target.value)} className="adm-select prv-tool-btn" aria-label="Gender">
        <option value="">All genders</option>
        <option value="M">Male</option>
        <option value="F">Female</option>
        <option value="Other">Other</option>
      </select>
      <select value={tier} onChange={(e) => setParam('tier', e.target.value)} className="adm-select prv-tool-btn" aria-label="Tier">
        <option value="">All tiers</option>
        {tiers.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
      </select>
    </div>
  );
}
