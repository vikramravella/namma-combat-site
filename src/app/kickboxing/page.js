import KickboxingLanding from './KickboxingLanding';

export const metadata = {
  title: 'Kickboxing Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Authentic Muay Thai and K-1 style kickboxing. Teep, plum clinch, Dutch-style combos. Elite coaching. Free trial class in Koramangala, Bangalore.',
  keywords: 'kickboxing bangalore, muay thai bangalore, kickboxing koramangala, kickboxing classes bangalore, k1 kickboxing bangalore',
  openGraph: {
    title: 'Kickboxing Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Authentic Muay Thai and K-1 style kickboxing. Teep, plum clinch, Dutch-style combos. Elite coaching. Free trial class in Koramangala, Bangalore.',
    url: 'https://nammacombat.com/kickboxing',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/kickboxing',
  },
};

export default function Page() {
  return <KickboxingLanding />;
}
