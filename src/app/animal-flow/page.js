import AnimalFlowLanding from './AnimalFlowLanding';

export const metadata = {
  title: 'Animal Flow Classes in Koramangala, Bangalore | Namma Combat',
  description: 'Certified Animal Flow Level 1-3 coaching. Beast, Crab, Ape, Scorpion. Ground-based movement for mobility, joint health, and coordination. Free trial in Bangalore.',
  keywords: 'animal flow bangalore, animal flow classes koramangala, movement training bangalore, mobility training bangalore',
  openGraph: {
    title: 'Animal Flow Classes in Koramangala, Bangalore | Namma Combat',
    description: 'Certified Animal Flow Level 1-3 coaching. Beast, Crab, Ape, Scorpion. Ground-based movement for mobility, joint health, and coordination. Free trial in Bangalore.',
    url: 'https://nammacombat.com/animal-flow',
    type: 'website',
    images: ['https://nammacombat.com/og-image.png'],
  },
  alternates: {
    canonical: 'https://nammacombat.com/animal-flow',
  },
};

export default function Page() {
  return <AnimalFlowLanding />;
}
