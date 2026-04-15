import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Namma Combat — Bangalore\'s Premier Combat Sports Academy',
  description: 'Boxing, MMA, Kickboxing, Wrestling, Judo, Strength & Conditioning in Koramangala, Bangalore. National-level coaches. Free trial class. Book now.',
  keywords: 'boxing bangalore, mma bangalore, kickboxing bangalore, wrestling bangalore, judo bangalore, combat sports koramangala, gym koramangala, strength conditioning bangalore, namma combat',
  openGraph: {
    title: 'Namma Combat — Skill | Strength | Sanctuary',
    description: 'Bangalore\'s premier combat sports academy. Boxing, MMA, Kickboxing, Wrestling, Judo, S&C. National-level coaches. Book your free trial.',
    url: 'https://nammacombat.com',
    siteName: 'Namma Combat',
    locale: 'en_IN',
    type: 'website',
  },
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
