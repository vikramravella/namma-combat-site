import JudoLanding from './JudoLanding';

export const metadata = {
  title: 'Judo Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Olympic Judo under Coach Kantharaj — NIS Patiala certified, Gold medalist. Ukemi, Kuzushi, Randori, Ne-waza. IJF rules competition prep. Free trial class.',
  keywords: 'judo bangalore, judo classes koramangala, judo coach bangalore, olympic judo bangalore, judo academy bangalore',
  openGraph: {
    title: 'Judo Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Olympic Judo under Coach Kantharaj — NIS Patiala certified, Gold medalist. Ukemi, Kuzushi, Randori, Ne-waza. IJF rules competition prep. Free trial class.',
    url: 'https://nammacombat.com/judo',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/judo',
  },
};

export default function Page() {
  return <JudoLanding />;
}
