'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function FyFilter({ currentFy, status, fys }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function handleChange(e) {
    const next = new URLSearchParams(params.toString());
    if (e.target.value) next.set('fy', e.target.value); else next.delete('fy');
    if (status) next.set('status', status);
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  return (
    <select value={currentFy || ''} onChange={handleChange} className="adm-select prv-tool-btn" aria-label="Fiscal year">
      <option value="">All FYs</option>
      {fys.map((f) => (
        <option key={f.fiscalYear} value={f.fiscalYear}>
          FY {f.fiscalYear.slice(0, 2)}-{f.fiscalYear.slice(2)}
        </option>
      ))}
    </select>
  );
}
