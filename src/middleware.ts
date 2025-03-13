import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface Client {
  id: string;
  name: string;
  logo: string;
  favicon: string;
  domain: string;
  seo?: {
    title?: string;
    description?: string;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

// Configuración de rutas que necesitan SEO dinámico
export const config = {
  matcher: [
    '/',
    '/vehicles/:path*',
    '/contact',
    '/about',
    '/favicon.ico',
    '/((?!api|_next/static|_next/image).*)',
  ],
};

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const isFaviconRequest = request.nextUrl.pathname === '/favicon.ico';

  const isCrawler =
    userAgent.includes('bot') ||
    userAgent.includes('crawler') ||
    userAgent.includes('spider') ||
    userAgent.includes('whatsapp') ||
    userAgent.includes('facebook') ||
    userAgent.includes('twitter');

  const requestHeaders = new Headers(request.headers);

  try {
    const { data: client } = (await supabase
      .from('clients')
      .select(isCrawler ? '*' : 'id, name, logo, favicon, seo')
      .eq('domain', hostname)
      .single()) as { data: Client | null };

    if (!client) {
      return NextResponse.redirect(new URL('/404', request.url));
    }

    if (isFaviconRequest && client.favicon) {
      return NextResponse.redirect(new URL(client.favicon, request.url));
    }

    requestHeaders.set('x-client-data', JSON.stringify(client));
    if (isCrawler) {
      requestHeaders.set('x-is-crawler', '1');
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}
