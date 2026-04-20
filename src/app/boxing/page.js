import BoxingLanding from './BoxingLanding';

export const metadata = {
  title: 'Boxing Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Learn boxing under Coach Bhagyarajan — NIS Patiala certified, multiple national Gold medals. Orthodox and southpaw stance, body work, ring generalship. Free trial class. Koramangala, Bangalore.',
  keywords: 'boxing classes bangalore, boxing koramangala, boxing academy bangalore, boxing coach bangalore, boxing training koramangala, NIS Patiala boxing coach',
  openGraph: {
    title: 'Boxing Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Train under a national medalist NIS Patiala certified coach. Free trial class.',
    url: 'https://nammacombat.com/boxing',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/boxing',
  },
};

export default function BoxingPage() {
  return <BoxingLanding />;
}
