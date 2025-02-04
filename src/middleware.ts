import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

function generateVisitorId(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent}`;
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const visitorId = generateVisitorId(request);

  // Obtener cliente
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('domain', hostname)
    .single();

  if (error || !client) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // Verificar última visita del usuario
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const { data: recentVisit } = await supabase
    .from('page_visits')
    .select('*')
    .eq('visitor_id', visitorId)
    .eq('client_id', client.id)
    .gte('created_at', thirtyMinutesAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  // Si no hay visita reciente, registrar una nueva
  if (!recentVisit || recentVisit.length === 0) {
    await supabase.from('page_visits').insert([
      {
        client_id: client.id,
        visitor_id: visitorId,
      },
    ]);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-client-data', JSON.stringify(client));

  if (
    userAgent.includes('whatsapp') ||
    userAgent.includes('facebook') ||
    userAgent.includes('twitter')
  ) {
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
