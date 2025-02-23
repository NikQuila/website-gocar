import { Poppins } from 'next/font/google';
import './globals.css';
import { getClient } from '../hooks/useClient';
import { HeroUIProvider } from '@/providers/HeroUIProvider';
import { ClientProvider } from '@/providers/ClientProvider';
import Navbar from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { VisitTracker } from '@/components/analytics/VisitTracker';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className={`${poppins.variable} antialiased`}>
        <HeroUIProvider>
          <ClientProvider>
            <ThemeProvider>
              <div className='min-h-screen bg-white dark:bg-dark-bg transition-colors'>
                <VisitTracker />
                <Navbar />
                {children}
                <Footer />
              </div>
            </ThemeProvider>
          </ClientProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
