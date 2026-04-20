import BJJLanding from './BJJLanding';

export const metadata = {
  title: 'Brazilian Jiu-Jitsu (BJJ) Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Learn BJJ under Coach Kantharaj — BJJ Gold medalist. Gi and no-gi, guard development, submission chains, IBJJF competition prep. Free trial class in Koramangala.',
  keywords: 'bjj bangalore, brazilian jiu jitsu bangalore, bjj classes koramangala, jiu jitsu bangalore, bjj academy bangalore',
  openGraph: {
    title: 'Brazilian Jiu-Jitsu (BJJ) Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Learn BJJ under Coach Kantharaj — BJJ Gold medalist. Gi and no-gi, guard development, submission chains, IBJJF competition prep. Free trial class in Koramangala.',
    url: 'https://nammacombat.com/bjj',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/bjj',
  },
};

export default function Page() {
  return <BJJLanding />;
}
