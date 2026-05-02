import CoachClientPage from './CoachClientPage';
import { notFound } from 'next/navigation';

export const COACHES = {
  kantharaj: {
    slug: 'kantharaj',
    name: 'Kantharaj Agasa',
    role: 'Co-founder & Head Coach',
    subhead: 'Pioneer of Indian MMA on the global stage. Most international pro fights by any Indian fighter. NIS Patiala Diploma — Judo, First Division.',
    bio: [
      "Head coach across Namma Combat's grappling and striking program — MMA, BJJ, Judo, Wrestling, and Kickboxing — taught by someone who has competed at every one of them.",
      'Methodical and patient on technique. Traditional where it matters, modern where it counts, and uncompromising on safety. Members keep saying the same thing: they came in for one discipline and stayed for the coaching.',
      "The depth shows in how every class connects to the next — there's no isolated drill, no movement without context.",
    ],
    coachingCredentials: [
      'Sports Authority of India — Netaji Subhas National Institute of Sports, Patiala. Diploma in Sports Coaching (Judo), First Division.',
    ],
    competitionRecord: [
      'Pioneer of Indian MMA on the global stage',
      'Most international pro fights by any Indian MMA fighter',
      'Pro promotions fought in: ONE Championship, Brave CF, UAE Warriors, SFL, MFN, Kumite 1 League',
      'BJJ — Gold Medalist (South-East Asia)',
      'Judo — National Gold Medalist',
      'National-level wrestler',
    ],
    professionalExperience: [
      'Coach — Sports Authority of India (SAI). 7 years.',
    ],
    classes: [
      { label: 'MMA', href: '/mma' },
      { label: 'BJJ', href: '/bjj' },
      { label: 'Judo', href: '/judo' },
      { label: 'Wrestling', href: '/wrestling' },
      { label: 'Kickboxing', href: '/kickboxing' },
    ],
    metaTitle: 'Coach Kantharaj Agasa — MMA, BJJ, Judo Coach Bangalore | Namma Combat',
    metaDescription: 'Train under Coach Kantharaj Agasa — Indian MMA Pioneer with 13 pro wins, NIS Patiala Diploma in Judo (First Division), Gold medals in BJJ and Judo. Free trial at Namma Combat, Koramangala.',
    metaKeywords: 'Kantharaj Agasa, Indian MMA pioneer, MMA coach Bangalore, BJJ coach Bangalore, Judo coach Bangalore, NIS Patiala Judo coach, wrestling coach Bangalore',
  },
  bhagyarajan: {
    slug: 'bhagyarajan',
    name: 'D. Bhagyarajan',
    firstName: 'Bhagyarajan',
    role: 'Boxing Lead',
    subhead: 'NIS Kolkata Diploma in Boxing Coaching. Indian Army Subedar (21 years). 19 Gold · 9 Silver · 4 Bronze across 16 National + 17 International championships. 5 Best Boxer Awards.',
    bio: [
      'Boxing lead at Namma Combat.',
      'A Subedar in the Indian Army for 21 years (Feb 2000 – Oct 2020) and an active competitor across both civilian and military circuits throughout. After hanging up the gloves, he coached the Northern Command boxing team, Tamil Nadu Police, and professional academies before joining Namma Combat.',
      'His sessions move at the pace the student needs. Nothing is rushed. Everything is built step by step — stance, footwork, jab, then the rest. The basics get attention until they are right, and that is the point.',
    ],
    coachingCredentials: [
      'Sports Authority of India — Netaji Subhas National Institute of Sports, Eastern Centre, Kolkata. Diploma in Sports Coaching (Boxing).',
      'Platoon Commander Course — Indian Army.',
      'Improvised Explosive Device (IED) Course — Indian Army (2020).',
      'Graduated from the Indian Army, Ministry of Defence.',
    ],
    competitionRecord: [
      { year: '1993', title: 'All India YMCA, Delhi — GOLD + Best Boxer' },
      { year: '1995', title: 'Sub Junior National, Assam — GOLD + Best Boxer' },
      { year: '1997', title: 'South Zone National, Hyderabad — GOLD + Best Boxer' },
      { year: '1998', title: 'Junior World Championship U-19, Buenos Aires (Argentina) — International appearance' },
      { year: '1998', title: 'Youth International Championship, Azerbaijan — SILVER' },
      { year: '2000', title: 'Senior National Championship, Pune — GOLD' },
      { year: '2002', title: 'National Games, Hyderabad — GOLD' },
      { year: '2002', title: 'All India YMCA Championship, Delhi — GOLD + Best Boxer' },
      { year: '2004', title: '1st Super Cup Championship, Mumbai — GOLD + Best Boxer' },
      { year: '2005', title: '49th World Military Boxing Championships, Pretoria (South Africa) — INTERNATIONAL SILVER, Lightweight Division' },
      { year: '2005', title: 'Senior National Championship, Tamil Nadu — GOLD' },
      { year: '2007', title: '4th Military World Games, India (Hyderabad) — INTERNATIONAL BRONZE, 69kg' },
    ],
    competitionFooter: 'Plus additional national gold medals (1994, 1996, 1998, 2003), Services Championship golds (2001–2007), and World Military Boxing appearances across Germany, Hungary, Kazakhstan, and Bulgaria. Career totals: 19 Gold · 9 Silver · 4 Bronze · 5 Best Boxer Awards across 16 National and 17 International championships.',
    professionalExperience: [
      'Subedar — Indian Army (Feb 2000 – Oct 2020). 21 years of service across Ladakh, Kupwara (J&K), Delhi, Nagrota, Ranchi, and Bangalore.',
      'Coach — D.R.V. Boxing Academy (2023–2024)',
      'Coach — Tamil Nadu Police Boxing Team (2022–2023)',
      'Coach — Amjad Khan Professional Boxing Academy (2020–2021)',
      'Coach — Northern Command Boxing Team, Indian Army (2014–2016)',
      'Coach — Command Boxing Team, Indian Army (2011–2014)',
      'Coach — Army / Service Team, Indian Army (2010–2011)',
    ],
    classes: [
      { label: 'Boxing', href: '/boxing' },
    ],
    metaTitle: 'Coach Bhagyarajan — Boxing Coach Bangalore | Namma Combat',
    metaDescription: 'Learn boxing under Coach D. Bhagyarajan — NIS Kolkata Diploma, Indian Army Subedar (21 years), 19 Gold + 9 Silver medals across 16 National + 17 International championships, 5 Best Boxer Awards. Free trial at Namma Combat, Koramangala.',
    metaKeywords: 'Bhagyarajan, boxing coach Bangalore, NIS Kolkata boxing coach, boxing classes Koramangala, national gold boxer India, world military boxing, ex army boxing coach',
  },
  venkatesh: {
    slug: 'venkatesh',
    name: 'Venkatesh A',
    role: 'Wrestling Coach',
    subhead: 'NIS Patiala Diploma — Wrestling, First Division. Senior National wrestler. Indo-Bhutan international silver. MBA in Sports Management.',
    bio: [
      'Wrestling coach at Namma Combat.',
      "Patient on form, fast on context. Comfortable taking complete beginners through to whatever level they want — fitness through wrestling, MMA support, or actual competition wrestling if that's where they're headed.",
      'A wrestler\'s wrestler — the technical depth comes from years on the mat, not from a textbook. The way he was taught is the way he teaches: spend the time on basics, the rest follows.',
    ],
    coachingCredentials: [
      'Sports Authority of India — Netaji Subhas National Institute of Sports, Patiala. Diploma in Sports Coaching (Wrestling), First Division.',
      'Sports Authority of India — Netaji Subhas National Institute of Sports, Patiala. Six-Week Certificate Course in Sports Coaching (Wrestling).',
      'MBA in Sports Management — Tamil Nadu Physical Education and Sports University, Chennai. First Class, 2020.',
    ],
    competitionRecord: [
      { year: '2017', title: '62nd Senior National Wrestling Championship — Free Style 86kg, Indore' },
      { year: '2019', title: 'All-India Inter-University Wrestling — represented TNPESU, Hisar (Haryana)' },
      { year: '2018', title: 'All-India Inter-University Wrestling — represented TNPESU, Bhiwani (Haryana)' },
      { year: '2017', title: 'Inter-Zone Rural Games (Maharashtra) — GOLD, Wrestling 86kg' },
      { year: '2017', title: 'Tamil Nadu State Senior Wrestling Championship — SILVER, 86kg' },
      { year: '2016', title: 'Indo-Bhutan Rural Games (Phuentsholing, Bhutan) — INTERNATIONAL SILVER, Wrestling 84kg' },
      { year: '2016', title: 'National Rural Games — BRONZE, Wrestling 74kg, Cuddalore' },
      { year: '2015', title: '4th Erode District Wrestling Championship — GOLD, Greco-Roman 76kg' },
      { year: '2014', title: 'Tamil Nadu State Wrestling Tournament — GOLD, Sub-Junior 49kg' },
    ],
    competitionFooter: 'Plus state and district wrestling medals across Tamil Nadu junior and sub-junior categories, 2008–2017.',
    professionalExperience: [
      'Trainer — Altitude Holistic Fitness Studio, Chennai (2019)',
    ],
    classes: [
      { label: 'Wrestling', href: '/wrestling' },
    ],
    metaTitle: 'Coach Venkatesh A — Wrestling Coach Bangalore | Namma Combat',
    metaDescription: 'Train wrestling under Coach Venkatesh A — NIS Patiala Diploma (First Division), Senior National wrestler, All-India Inter-University, Indo-Bhutan international silver. MBA in Sports Management. Free trial at Namma Combat, Koramangala.',
    metaKeywords: 'Venkatesh wrestling coach, wrestling coach Bangalore, NIS Patiala wrestling, wrestling classes Koramangala, freestyle greco roman Bangalore',
  },
};

export function generateStaticParams() {
  return Object.keys(COACHES).map(slug => ({ slug }));
}

export function generateMetadata({ params }) {
  const coach = COACHES[params.slug];
  if (!coach) return {};
  return {
    title: coach.metaTitle,
    description: coach.metaDescription,
    keywords: coach.metaKeywords,
    openGraph: {
      title: coach.metaTitle,
      description: coach.metaDescription,
      url: `https://nammacombat.com/coaches/${coach.slug}`,
      type: 'profile',
      images: ['https://nammacombat.com/og-image.png'],
    },
    alternates: {
      canonical: `https://nammacombat.com/coaches/${coach.slug}`,
    },
  };
}

export default function CoachPage({ params }) {
  const coach = COACHES[params.slug];
  if (!coach) notFound();
  return <CoachClientPage coach={coach} />;
}
