import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Namma Combat — India\'s Premier Combat Sports Academy',
  description: 'India\'s premier combat sports academy in Koramangala, Bangalore. Boxing, MMA, Kickboxing, Wrestling, Judo, S&C. National-level coaches. Free trial class. Book now.',
  keywords: 'boxing bangalore, mma bangalore, kickboxing bangalore, wrestling bangalore, judo bangalore, combat sports koramangala, gym koramangala, strength conditioning bangalore, namma combat',
  openGraph: {
    title: 'Namma Combat — Skill | Strength | Sanctuary',
    description: 'India\'s premier combat sports academy. Boxing, MMA, Kickboxing, Wrestling, Judo, S&C. National-level coaches. Book your free trial.',
    url: 'https://nammacombat.com',
    siteName: 'Namma Combat',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://nammacombat.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Namma Combat — Skill, Strength, Sanctuary',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Namma Combat — Skill | Strength | Sanctuary',
    description: 'India\'s premier combat sports academy. Free trial available.',
    images: ['https://nammacombat.com/og-image.png'],
  },
  metadataBase: new URL('https://nammacombat.com'),
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-WLF5WZ9HRS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-WLF5WZ9HRS');
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
