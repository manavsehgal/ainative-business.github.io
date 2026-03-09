export const SITE = {
  name: 'Stagent',
  url: 'https://stagent.io',
  description:
    'AI-powered task management where Claude agents execute tasks with human-in-the-loop oversight. Local-first, open source.',
  logo: 'https://stagent.io/favicon.svg',
  ogImage: 'https://stagent.io/og-image.png',
  themeColor: '#1a1a2e',
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
    'https://github.com/stagent',
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
