import ShippingPolicyPage from './ShippingPolicyPage';

export const metadata = {
  title: 'Shipping & Delivery Policy | Namma Combat',
  description: 'Service delivery information for Namma Combat. We provide in-person training services in Koramangala, Bangalore.',
  keywords: 'namma combat shipping policy',
  openGraph: {
    title: 'Shipping & Delivery Policy | Namma Combat',
    description: 'Service delivery information for Namma Combat. We provide in-person training services in Koramangala, Bangalore.',
    url: 'https://nammacombat.com/shipping',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/shipping',
  },
};

export default function Page() {
  return <ShippingPolicyPage />;
}
