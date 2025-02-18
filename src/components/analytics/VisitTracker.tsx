'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import useClientStore from '@/store/useClientStore';
import { supabase } from '@/lib/supabase';

function generateVisitorId(): string {
  // Generar un ID único para el visitante
  const storedId = localStorage.getItem('visitor_id');
  if (storedId) return storedId;

  const newId = crypto.randomUUID();
  localStorage.setItem('visitor_id', newId);
  return newId;
}

export function VisitTracker() {
  const pathname = usePathname();
  const { client } = useClientStore();
  const isTrackingRef = useRef(false);

  useEffect(() => {
    if (!client?.id || isTrackingRef.current) return;

    const trackVisit = async () => {
      const visitorId = generateVisitorId();
      const sessionKey = `visit_${client.id}_${pathname}`;

      // Verificar si ya se registró una visita en esta sesión
      if (sessionStorage.getItem(sessionKey)) return;

      try {
        isTrackingRef.current = true;

        const { error } = await supabase.from('page_visits').insert([
          {
            client_id: client.id,
            visitor_id: visitorId,
            pathname: pathname,
          },
        ]);

        if (error) {
          console.error('Error tracking visit:', error);
          return;
        }

        // Marcar la visita en sessionStorage
        sessionStorage.setItem(sessionKey, 'true');
      } catch (error) {
        console.error('Error tracking visit:', error);
      } finally {
        isTrackingRef.current = false;
      }
    };

    trackVisit();
  }, [pathname, client]);

  return null;
}
