import FAQLanding from './FAQLanding';

export const metadata = {
  title: 'FAQ | Namma Combat — Combat Sports & S&C Academy, Bangalore',
  description: "Answers to common questions about Namma Combat — pricing, memberships, trial classes, beginner programs, coaches, schedule, and more. India's premier combat sports academy in Koramangala.",
  keywords: 'namma combat faq, combat sports bangalore faq, martial arts academy faq, namma combat pricing, namma combat trial',
  openGraph: {
    title: 'FAQ | Namma Combat',
    description: 'Answers to common questions about memberships, classes, trial, and more.',
    url: 'https://nammacombat.com/faq',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/faq',
  },
};

export default function Page() {
  return <FAQLanding />;
}
