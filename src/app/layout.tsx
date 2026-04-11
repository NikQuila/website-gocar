import { Poppins } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { getClient } from '../hooks/useClient';
import { HeroUIProvider } from '@/providers/HeroUIProvider';
import { ClientProvider } from '@/providers/ClientProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import ConditionalNavbar from '@/components/layout/ConditionalNavbar';
import ConditionalFooter from '@/components/layout/ConditionalFooter';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import TrackingAndConsent from '@/components/analytics/TrackingAndConsent';
import RoutePrefetcher from '@/components/routing/RoutePrefetcher';
import { ToastContainer } from 'react-toastify';
import DebugPropGuard from './DebugPropGuard';
import { headers } from 'next/headers';
import { getWebsiteConfig } from '@/lib/website-config';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export async function generateMetadata() {
  const client = await getClient();
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost';
  const baseUrl = `https://${host}`;

  const title = client?.seo?.title || 'Automotora';
  const description = client?.seo?.description || 'Descripción por defecto';
  const keywords = client?.seo?.keywords || [];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords,
    alternates: {
      canonical: '/',
    },
    icons: client?.favicon
      ? {
          icon: [
            { url: client.favicon, sizes: 'any', type: 'image/x-icon' },
            { url: client.favicon, sizes: '32x32', type: 'image/png' },
          ],
        }
      : undefined,
    verification: {
      google: 'mM5DNzGoLlVxLaeEWPJsO2lRxjqYdwjGjTVqSGKhxQ8',
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: title,
      images: (client?.logo || client?.favicon)
        ? [{ url: client.logo || client.favicon, width: 800, height: 600, alt: title }]
        : [],
      type: 'website',
      locale: 'es_CL',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: (client?.logo || client?.favicon) ? [client.logo || client.favicon] : [],
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = await getClient();
  const websiteConfig = client?.id ? await getWebsiteConfig(client.id) : null;
  const integrations = websiteConfig?.integrations ?? {
    google_reviews_enabled: false,
    pixel_id: '',
    gtm_id: '',
  };

  return (
    <html lang='es' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme_mode');
                  var theme = stored ? JSON.parse(stored).state?.theme : null;
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#141414';
                    document.body.style.backgroundColor = '#141414';
                  } else {
                    document.documentElement.style.backgroundColor = '#ffffff';
                    document.body.style.backgroundColor = '#ffffff';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${poppins.variable} antialiased bg-white dark:bg-dark-bg`}>
        {process.env.NODE_ENV !== 'production' && <DebugPropGuard />}
        <HeroUIProvider>
          <ClientProvider>
            <I18nProvider>
              <ThemeProvider>
                <div className='min-h-screen bg-white dark:bg-dark-bg transition-colors'>
                  <ToastContainer
                    position='top-right'
                    autoClose={2000}
                    hideProgressBar={false}
                    closeOnClick
                    pauseOnHover
                  />
                  <VisitTracker />
                  <TrackingAndConsent
                    pixelId={integrations.pixel_id || undefined}
                    gtmId={integrations.gtm_id || undefined}
                    ga4Id={integrations.ga4_id || undefined}
                    requireConsent={integrations.require_cookie_consent ?? true}
                  />
                  <RoutePrefetcher routes={['/', '/financing', '/consignments', '/buy-direct', '/we-search-for-you', '/contact', '/about', '/vehicles']} />
                  <ConditionalNavbar />
                  {children}
                  <ConditionalFooter />
                </div>
              </ThemeProvider>
            </I18nProvider>
          </ClientProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
