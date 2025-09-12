import { MetadataRoute } from 'next';

export function GET(): Response {
  const robots: MetadataRoute.Robots = {
    rules: {
      userAgent: '*',
      allow: ['/', '/data-deletion/', '/privacy-policy/', '/cookie-policy/', '/terms-of-service/', '/status-system/' ],
      disallow: [],
    },
    sitemap: 'https://postmatic.id/sitemap.xml',
  };

  return new Response(
    Object.entries(robots.rules)
      .map(([key, value]) => {
        if (key === 'userAgent') return `User-agent: ${value}`;
        if (key === 'allow') return Array.isArray(value) ? value.map(v => `Allow: ${v}`).join('\n') : `Allow: ${value}`;
        if (key === 'disallow') return Array.isArray(value) ? value.map(v => `Disallow: ${v}`).join('\n') : `Disallow: ${value}`;
        return '';
      })
      .filter(Boolean)
      .join('\n') + `\nSitemap: ${robots.sitemap}`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  );
}