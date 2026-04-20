import KidsLanding from './KidsLanding';

export const metadata = {
  title: 'Kids Combat Sports & Fitness Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Age-based programs for ages 6-15. Boxing, Judo, BJJ, Wrestling, S&C. NIS Patiala certified coaches. BLS-trained staff. Safe, supervised. Free trial in Bangalore.',
  keywords: 'kids martial arts bangalore, kids boxing bangalore, kids judo bangalore, youth combat sports koramangala, kids fitness classes bangalore',
  openGraph: {
    title: 'Kids Combat Sports & Fitness Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Age-based programs for ages 6-15. Boxing, Judo, BJJ, Wrestling, S&C. NIS Patiala certified coaches. BLS-trained staff. Safe, supervised. Free trial in Bangalore.',
    url: 'https://nammacombat.com/kids',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/kids',
  },
};

export default function Page() {
  return <KidsLanding />;
}
