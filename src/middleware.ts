import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

  // Lista de crawlers conocidos (incluyendo WhatsApp)
  const isCrawler =
    userAgent.includes('whatsapp') ||
    userAgent.includes('facebook') ||
    userAgent.includes('twitter');

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('domain', hostname)
    .single();

  if (error || !client) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-client-data', JSON.stringify(client));

  // Si es un crawler, aseguramos que los metadatos estén disponibles
  if (isCrawler) {
    requestHeaders.set('x-is-crawler', '1');
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
