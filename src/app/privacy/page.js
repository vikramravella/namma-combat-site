import PrivacyPolicyPage from './PrivacyPolicyPage';

export const metadata = {
  title: 'Privacy Policy | Namma Combat',
  description: 'Privacy Policy for Namma Combat. How we collect, use, and protect your personal information. DPDP Act 2023 compliant.',
  keywords: 'namma combat privacy policy',
  openGraph: {
    title: 'Privacy Policy | Namma Combat',
    description: 'Privacy Policy for Namma Combat. How we collect, use, and protect your personal information. DPDP Act 2023 compliant.',
    url: 'https://nammacombat.com/privacy',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/privacy',
  },
};

export default function Page() {
  return <PrivacyPolicyPage />;
}
