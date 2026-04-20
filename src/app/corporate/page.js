import CorporateLanding from './CorporateLanding';

export const metadata = {
  title: 'Corporate Wellness & Team Programs in Bangalore | Namma Combat',
  description: 'Corporate wellness programs, leadership cohorts, team-building events. Combat sports, S&C, Animal Flow. Real coaches, real credentials. Bangalore Koramangala.',
  keywords: 'corporate wellness bangalore, corporate fitness programs bangalore, team building bangalore, corporate gym membership bangalore',
  openGraph: {
    title: 'Corporate Wellness & Team Programs in Bangalore | Namma Combat',
    description: 'Corporate wellness programs, leadership cohorts, team-building events. Combat sports, S&C, Animal Flow. Real coaches, real credentials. Bangalore Koramangala.',
    url: 'https://nammacombat.com/corporate',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/corporate',
  },
};

export default function Page() {
  return <CorporateLanding />;
}
