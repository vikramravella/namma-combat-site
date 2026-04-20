export default function sitemap() {
  const baseUrl = 'https://nammacombat.com';
  const lastModified = new Date('2026-04-20');

  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/trial', priority: 0.95, changeFrequency: 'monthly' },
    // Combat sports
    { path: '/boxing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/kickboxing', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/mma', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/bjj', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/wrestling', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/judo', priority: 0.9, changeFrequency: 'monthly' },
    // Strength & movement
    { path: '/strength', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/animal-flow', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/hiit', priority: 0.85, changeFrequency: 'monthly' },
    { path: '/olympic-lifting', priority: 0.85, changeFrequency: 'monthly' },
    // Audience-specific
    { path: '/womens', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/corporate', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/kids', priority: 0.8, changeFrequency: 'monthly' },
    // Legal
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/refunds', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/shipping', priority: 0.3, changeFrequency: 'yearly' },
  ];

  return routes.map(r => ({
    url: `${baseUrl}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
