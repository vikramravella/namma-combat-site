import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { fullName } from '@/lib/format';
import { Booker } from './Booker';

export default async function NewTrialPage({ searchParams }) {
  const sp = await searchParams;
  const inquiryId = sp?.inquiryId;

  if (!inquiryId) {
    // No inquiry chosen yet — show a picker
    const recent = await db.inquiry.findMany({
      where: { stage: { in: ['new', 'following_up'] } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    return (
      <>
        <div className="adm-page-header">
          <div>
            <p className="prv-eyebrow"><Link href="/admin/trials" className="prv-back">← Trials</Link></p>
            <h1 className="adm-page-title">Schedule a trial</h1>
            <p className="adm-page-subtitle">Pick the inquiry to book for, then choose a slot.</p>
          </div>
        </div>
        <div className="prv-table-wrap">
          {recent.length === 0 ? (
            <div className="prv-empty">
              <p>No open inquiries. Add one first.</p>
              <Link href="/admin/inquiries/new" className="adm-btn">+ New inquiry</Link>
            </div>
          ) : (
            <table className="prv-table">
              <thead><tr><th>Name</th><th>Phone</th><th>Interested in</th><th></th></tr></thead>
              <tbody>
                {recent.map((i) => (
                  <tr key={i.id}>
                    <td>{fullName(i)}</td>
                    <td className="adm-mono">{i.phone}</td>
                    <td>{Array.isArray(i.interestedIn) && i.interestedIn.length > 0 ? i.interestedIn.join(', ') : <span className="adm-muted">—</span>}</td>
                    <td><Link href={`/admin/trials/new?inquiryId=${i.id}`} className="adm-btn adm-btn-secondary adm-btn-sm">Pick →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </>
    );
  }

  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) notFound();

  return (
    <>
      <div className="adm-page-header">
        <div>
          <p className="prv-eyebrow"><Link href={`/admin/inquiries/${inquiry.id}`} className="prv-back">← {fullName(inquiry)}</Link></p>
          <h1 className="adm-page-title">Book a trial</h1>
          <p className="adm-page-subtitle">Click any session to schedule into that slot.</p>
        </div>
      </div>

      <Booker inquiry={inquiry} />
    </>
  );
}
