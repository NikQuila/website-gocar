import { Poppins } from 'next/font/google';
import './globals.css';
import { getClient } from '../hooks/useClient';
import { HeroUIProvider } from '@/providers/HeroUIProvider';
import { ClientProvider } from '@/providers/ClientProvider';
import Navbar from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ThemeProvider from '@/providers/ThemeProvider';

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
    <html lang='es'>
      <body className={`${poppins.variable} antialiased`}>
        <HeroUIProvider>
          <ClientProvider>
            <ThemeProvider>
              <Navbar />
              {children}
              <Footer />
            </ThemeProvider>
          </ClientProvider>
        </HeroUIProvider>
      </body>
    </html>
  );
}
