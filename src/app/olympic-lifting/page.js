import OlympicLiftingLanding from './OlympicLiftingLanding';

export const metadata = {
  title: 'Olympic Weightlifting in Koramangala, Bangalore | Namma Combat',
  description: 'Olympic weightlifting under Coach Naeem. Snatch, clean & jerk, pulling derivatives. Proper progression from PVC to loaded bar. Competition prep. Free trial class.',
  keywords: 'olympic weightlifting bangalore, olympic lifting koramangala, snatch coaching bangalore, clean and jerk bangalore, weightlifting academy',
  openGraph: {
    title: 'Olympic Weightlifting in Koramangala, Bangalore | Namma Combat',
    description: 'Olympic weightlifting under Coach Naeem. Snatch, clean & jerk, pulling derivatives. Proper progression from PVC to loaded bar. Competition prep. Free trial class.',
    url: 'https://nammacombat.com/olympic-lifting',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/olympic-lifting',
  },
};

export default function Page() {
  return <OlympicLiftingLanding />;
}
