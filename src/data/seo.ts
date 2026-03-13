export const SITE = {
  name: 'Stagent',
  url: 'https://stagent.io',
  description:
    'AI agent operations workspace with governed execution, reusable profiles, workflow blueprints, schedules, and local-first oversight.',
  logo: 'https://stagent.io/stagent-s-128.png',
  ogImage: 'https://stagent.io/og-image.png',
  themeColor: '#0f172a',
  license: 'Apache-2.0',
};

export const ORGANIZATION = {
  '@type': 'Organization',
  name: 'Stagent',
  url: SITE.url,
  logo: SITE.logo,
  description: SITE.description,
  founder: {
    '@type': 'Person',
    name: 'Manav',
  },
  foundingDate: '2026',
  sameAs: [
    'https://github.com/manavsehgal/stagent.github.io',
    'https://x.com/stagent',
  ],
};

export const PUBLISHER = {
  '@type': 'Organization',
  name: SITE.name,
  url: SITE.url,
  logo: {
    '@type': 'ImageObject',
    url: SITE.logo,
  },
};
