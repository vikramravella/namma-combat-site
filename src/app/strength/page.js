import StrengthLanding from './StrengthLanding';

export const metadata = {
  title: 'Strength & Conditioning in Koramangala, Bangalore | Namma Combat',
  description: 'Performance S&C under Coach Naeem (Setanta College MSc). Postural assessment, Olympic lifting, periodised programs. Not a lifting gym — performance training.',
  keywords: 'strength and conditioning bangalore, s&c koramangala, personal training bangalore, olympic lifting bangalore, sports performance bangalore',
  openGraph: {
    title: 'Strength & Conditioning in Koramangala, Bangalore | Namma Combat',
    description: 'Performance S&C under Coach Naeem (Setanta College MSc). Postural assessment, Olympic lifting, periodised programs. Not a lifting gym — performance training.',
    url: 'https://nammacombat.com/strength',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/strength',
  },
};

export default function Page() {
  return <StrengthLanding />;
}
