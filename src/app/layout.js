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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#9A3520',
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
        <Script id="local-business-schema" type="application/ld+json" strategy="afterInteractive">
          {`
          {
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "SportsActivityLocation", "ExerciseGym"],
            "name": "Namma Combat",
            "description": "India's premier combat sports academy in Koramangala, Bangalore. Boxing, MMA, Kickboxing, BJJ, Wrestling, Judo, Olympic Weightlifting, and Strength & Conditioning under one roof.",
            "url": "https://nammacombat.com",
            "telephone": "+917770087700",
            "email": "privacy@nammacombat.com",
            "image": "https://nammacombat.com/og-image.png",
            "logo": "https://nammacombat.com/logo.svg",
            "priceRange": "₹₹",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "10, 80 Feet Road, 4th Block, Koramangala",
              "addressLocality": "Bangalore",
              "addressRegion": "Karnataka",
              "postalCode": "560034",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "12.9352",
              "longitude": "77.6245"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "06:00",
                "closes": "21:00"
              }
            ],
            "areaServed": {
              "@type": "City",
              "name": "Bangalore"
            },
            "sport": ["Boxing", "Mixed Martial Arts", "Kickboxing", "Brazilian Jiu-Jitsu", "Wrestling", "Judo", "Olympic Weightlifting"],
            "sameAs": [
              "https://nammacombat.com"
            ],
            "slogan": "Skill · Strength · Sanctuary"
          }
          `}
        </Script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
