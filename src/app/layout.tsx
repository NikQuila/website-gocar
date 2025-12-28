import { Poppins } from 'next/font/google';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { getClient } from '../hooks/useClient';
import { HeroUIProvider } from '@/providers/HeroUIProvider';
import { ClientProvider } from '@/providers/ClientProvider';
import { I18nProvider } from '@/providers/I18nProvider';
import Navbar from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { VisitTracker } from '@/components/analytics/VisitTracker';
import RoutePrefetcher from '@/components/routing/RoutePrefetcher';
import { ToastContainer } from 'react-toastify';
import DebugPropGuard from './DebugPropGuard';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export async function generateMetadata() {
  const client = await getClient();

  return {
    title: client?.seo?.title || 'Automotora',
    description: client?.seo?.description || 'Descripción por defecto',
    icons: {
      icon: [
        {
          url: client?.favicon || '/favicon.ico',
          sizes: 'any',
          type: 'image/x-icon',
        },
        {
          url: client?.favicon || '/favicon.ico',
          sizes: '32x32',
          type: 'image/png',
        },
      ],
    },
    verification: {
      google: 'mM5DNzGoLlVxLaeEWPJsO2lRxjqYdwjGjTVqSGKhxQ8',
    },
    openGraph: {
      title: client?.seo?.title,
      description: client?.seo?.description,
      images: [client?.logo],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: client?.seo?.title,
      description: client?.seo?.description,
      images: [client?.logo],
    },
  };
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
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
                  <RoutePrefetcher routes={['/', '/contact', '/vehicles']} />
                  <Navbar />
                  {children}
                  <Footer />
                </div>
              </ThemeProvider>
            </I18nProvider>
          </ClientProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
