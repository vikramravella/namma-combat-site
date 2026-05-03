import { db } from '@/lib/db';
import { fullName } from '@/lib/format';
import { HealthFormClient } from './HealthFormClient';
import { submitHealthForm } from './actions';

export const metadata = {
  title: 'Health declaration · Namma Combat',
  robots: { index: false, follow: false },
};

export default async function PublicFormPage({ params }) {
  const { token } = await params;
  const tokenRow = await db.healthFormToken.findUnique({
    where: { token },
    include: { trial: { include: { inquiry: true, healthDecl: true, coach: true } } },
  });

  if (!tokenRow) return <ErrorShell title="Link not found">This form link doesn't match anything in our system. Please request a fresh link from us.</ErrorShell>;
  if (tokenRow.expiresAt && tokenRow.expiresAt < new Date()) return <ErrorShell title="Link expired">This link expired. Please WhatsApp us for a fresh one.</ErrorShell>;
  if (tokenRow.usedAt || tokenRow.trial.healthDecl) {
    const submittedOn = tokenRow.usedAt
      ? tokenRow.usedAt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : null;
    return (
      <ErrorShell title="Already submitted">
        Thank you — your form was already received{submittedOn ? ` on ${submittedOn}` : ''}.
        This is a one-time form. To make any change, please contact Namma Combat on{' '}
        <a href="https://wa.me/917770087700" target="_blank" rel="noreferrer" style={{ color: 'var(--rust)', fontWeight: 600 }}>WhatsApp +91 77700 87700</a>.
      </ErrorShell>
    );
  }

  return (
    <main className="form-public-wrap">
      <div className="form-public-frame">
        <HealthFormClient inquiry={tokenRow.trial.inquiry} trial={tokenRow.trial} action={submitHealthForm.bind(null, token)} />
      </div>
    </main>
  );
}

function ErrorShell({ title, children }) {
  return (
    <main className="form-public-wrap">
      <div className="form-public-frame" style={{ textAlign: 'center', padding: '60px 28px' }}>
        <img src="/seal.svg" alt="Namma Combat" style={{ width: 56, height: 56, margin: '0 auto 16px', display: 'block' }} />
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: 'var(--text)', margin: 0 }}>{title}</h1>
        <p style={{ color: 'var(--text-light)', marginTop: 12, fontSize: 14 }}>{children}</p>
      </div>
    </main>
  );
}
