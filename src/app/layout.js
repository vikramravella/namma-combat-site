import './globals.css';

export const metadata = {
  title: 'Namma Combat | The Institute of Mastery — Bangalore\'s Premier Combat Sports & Conditioning Academy',
  description: 'Elite combat sports training — Boxing, MMA, BJJ, Kickboxing, Wrestling, Judo — plus world-class Strength & Conditioning. National medalist coaches. Zero intimidation. Book your free trial at Koramangala, Bangalore.',
  keywords: 'boxing bangalore, mma bangalore, bjj bangalore, kickboxing bangalore, combat sports koramangala, gym koramangala, strength and conditioning bangalore, martial arts bangalore, namma combat',
  openGraph: {
    title: 'Namma Combat | The Institute of Mastery',
    description: 'Bangalore\'s premier combat sports & conditioning academy. Elite coaching from national medalists. Zero intimidation. Book your free trial.',
    url: 'https://nammacombat.com',
    siteName: 'Namma Combat',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Namma Combat | The Institute of Mastery',
    description: 'Bangalore\'s premier combat sports & conditioning academy. Book your free trial.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://nammacombat.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/seal.svg" />
        <meta name="theme-color" content="#FEF8EE" />
        <meta name="google-site-verification" content="REPLACE_WITH_YOUR_CODE" />
      </head>
      <body>{children}</body>
    </html>
  );
}
