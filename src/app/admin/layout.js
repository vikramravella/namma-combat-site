import './admin.css';

export const metadata = {
  title: 'Namma Combat — Admin',
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }) {
  return <div className="adm-root">{children}</div>;
}
