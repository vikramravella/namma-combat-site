import WomensLanding from './WomensLanding';

export const metadata = {
  title: 'Women\'s Combat Sports & Fitness in Koramangala, Bangalore | Namma Combat',
  description: 'Combat sports and S&C for women. Self-defence, Boxing, BJJ, Wrestling. Women\'s-health-informed training. Separate changing areas. Free trial in Koramangala.',
  keywords: 'womens fitness bangalore, self defence classes bangalore women, womens gym koramangala, womens combat sports bangalore',
  openGraph: {
    title: 'Women\'s Combat Sports & Fitness in Koramangala, Bangalore | Namma Combat',
    description: 'Combat sports and S&C for women. Self-defence, Boxing, BJJ, Wrestling. Women\'s-health-informed training. Separate changing areas. Free trial in Koramangala.',
    url: 'https://nammacombat.com/womens',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/womens',
  },
};

export default function Page() {
  return <WomensLanding />;
}
