import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getClient } from '../hooks/useClient';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export async function generateMetadata() {
  const client = await getClient();

  return {
    title: client?.name || 'Automotora',
    description: client?.seo?.description || 'Descripción por defecto',
    openGraph: {
      title: client?.name,
      description: client?.seo?.description,
      images: [client?.logo],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: client?.name,
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
