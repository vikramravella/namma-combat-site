import WrestlingLanding from './WrestlingLanding';

export const metadata = {
  title: 'Wrestling Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Train wrestling under Coach Venkatesh — NIS Patiala certified. Freestyle, Greco-Roman, folkstyle. Hand fighting, takedowns, par terre. Free trial class in Bangalore.',
  keywords: 'wrestling bangalore, wrestling classes koramangala, freestyle wrestling bangalore, wrestling coach bangalore, wrestling academy',
  openGraph: {
    title: 'Wrestling Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Train wrestling under Coach Venkatesh — NIS Patiala certified. Freestyle, Greco-Roman, folkstyle. Hand fighting, takedowns, par terre. Free trial class in Bangalore.',
    url: 'https://nammacombat.com/wrestling',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/wrestling',
  },
};

export default function Page() {
  return <WrestlingLanding />;
}
