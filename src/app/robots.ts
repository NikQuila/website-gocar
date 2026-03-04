import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function robots(): Promise<MetadataRoute['robots']> {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const baseUrl = `https://${host}`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/builder/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
