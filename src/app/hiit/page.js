import HIITLanding from './HIITLanding';

export const metadata = {
  title: 'HIIT Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Structured HIIT on Hammer Strength air bikes and Technogym Skill Row. Tabata, EMOM, AMRAP. Energy system training that actually works. Free trial class.',
  keywords: 'hiit bangalore, hiit classes koramangala, high intensity training bangalore, tabata classes bangalore',
  openGraph: {
    title: 'HIIT Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Structured HIIT on Hammer Strength air bikes and Technogym Skill Row. Tabata, EMOM, AMRAP. Energy system training that actually works. Free trial class.',
    url: 'https://nammacombat.com/hiit',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/hiit',
  },
};

export default function Page() {
  return <HIITLanding />;
}
