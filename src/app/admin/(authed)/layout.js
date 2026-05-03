import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from './SignOutButton';
import { HeaderSearch } from './HeaderSearch';
import { HeaderHistory } from './HeaderHistory';

export default async function AuthedLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/admin/login');

  return (
    <>
      <header className="adm-header">
        <div className="adm-header-inner">
          <div className="adm-header-left">
            <Link href="/admin" className="adm-brand">
              <img src="/logo.svg" alt="Namma Combat" className="adm-brand-logo" />
              <span className="adm-brand-mark">Admin</span>
            </Link>
            <nav className="adm-nav">
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/inquiries">Inquiries</Link>
              <Link href="/admin/trials">Trials</Link>
              <Link href="/admin/members">Members</Link>
            </nav>
          </div>
          <div className="adm-header-right">
            <HeaderSearch />
            <HeaderHistory />
            <span className="adm-user-email">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="adm-main">{children}</main>
    </>
  );
}
