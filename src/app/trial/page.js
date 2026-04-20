import TrialLanding from './TrialLanding';

export const metadata = {
  title: 'Book Your Free Trial Class | Namma Combat Koramangala, Bangalore',
  description: 'Complimentary trial class + postural assessment (worth Rs 7,000). Boxing, MMA, BJJ, Kickboxing, Wrestling, Judo, S&C. Koramangala, Bangalore.',
  keywords: 'free trial bangalore gym, free trial martial arts bangalore, trial class koramangala, combat sports trial bangalore',
  openGraph: {
    title: 'Book Your Free Trial Class | Namma Combat Koramangala, Bangalore',
    description: 'Complimentary trial class + postural assessment (worth Rs 7,000). Boxing, MMA, BJJ, Kickboxing, Wrestling, Judo, S&C. Koramangala, Bangalore.',
    url: 'https://nammacombat.com/trial',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/trial',
  },
};

export default function Page() {
  return <TrialLanding />;
}
