import TermsOfServicePage from './TermsOfServicePage';

export const metadata = {
  title: 'Terms of Service | Namma Combat',
  description: 'Terms of Service for Namma Combat website and services.',
  keywords: 'namma combat terms of service',
  openGraph: {
    title: 'Terms of Service | Namma Combat',
    description: 'Terms of Service for Namma Combat website and services.',
    url: 'https://nammacombat.com/terms',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/terms',
  },
};

export default function Page() {
  return <TermsOfServicePage />;
}
