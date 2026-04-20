import MMALanding from './MMALanding';

export const metadata = {
  title: 'MMA Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Train MMA under Coach Kantharaj — Indian MMA Pioneer with 12 pro wins. Integrated striking, grappling, and ground game. Free trial class. Koramangala, Bangalore.',
  keywords: 'mma bangalore, mma classes koramangala, mixed martial arts bangalore, mma academy bangalore, mma coach bangalore',
  openGraph: {
    title: 'MMA Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Train MMA under Coach Kantharaj — Indian MMA Pioneer with 12 pro wins. Integrated striking, grappling, and ground game. Free trial class. Koramangala, Bangalore.',
    url: 'https://nammacombat.com/mma',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/mma',
  },
};

export default function Page() {
  return <MMALanding />;
}
