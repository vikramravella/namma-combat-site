import RefundPolicyPage from './RefundPolicyPage';

export const metadata = {
  title: 'Refund & Cancellation Policy | Namma Combat',
  description: 'Refund and cancellation policy for Namma Combat memberships, trials, and packages. Freeze and medical pause rules.',
  keywords: 'namma combat refund policy',
  openGraph: {
    title: 'Refund & Cancellation Policy | Namma Combat',
    description: 'Refund and cancellation policy for Namma Combat memberships, trials, and packages. Freeze and medical pause rules.',
    url: 'https://nammacombat.com/refunds',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/refunds',
  },
};

export default function Page() {
  return <RefundPolicyPage />;
}
