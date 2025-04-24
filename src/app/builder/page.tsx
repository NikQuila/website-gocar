'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import useClientStore from '@/store/useClientStore';
import { Skeleton } from '@heroui/react';
import Link from 'next/link';

export default function BuilderPage() {
  const { client, isLoading: isClientLoading } = useClientStore();
  const [homeHtml, setHomeHtml] = useState<string | null>(null);
  const [homeCss, setHomeCss] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const fetchHomeContent = async () => {
      if (!client?.id) return;

      try {
        console.log('Fetching website configuration for client ID:', client.id);

        const { data, error } = await supabase
          .from('client_website_config')
          .select('home_html, home_css')
          .eq('client_id', client.id)
          .single();

        if (error) {
          console.error('Error loading website configuration:', error);
          setError('Error al cargar la configuración del sitio web.');
          setIsLoading(false);
          return;
        }

        console.log('Website config loaded:', data);
        setHomeHtml(data.home_html || null);
        setHomeCss(data.home_css || null);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch website configuration:', err);
        setError('Error al cargar la configuración del sitio web.');
        setIsLoading(false);
      }
    };

    if (client?.id) {
      fetchHomeContent();
    } else if (!isClientLoading) {
      setIsLoading(false);
    }
  }, [client?.id, isClientLoading]);

  // Efecto para cargar el HTML en el iframe cuando esté disponible
  useEffect(() => {
    if (iframeRef.current && homeHtml) {
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Website Preview</title>
              <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
              
              <!-- Tailwind CSS -->
              <script src="https://cdn.tailwindcss.com"></script>
              
              <style>
                body { 
                  margin: 0; 
                  padding: 0; 
                  font-family: 'Poppins', sans-serif;
                }
                
                /* Asegurarse de que el contenido ocupe todo el espacio */
                html, body {
                  height: 100%;
                  width: 100%;
                  overflow-x: hidden;
                }
                
                /* Estilos específicos para Shadcn UI básicos */
                :root {
                  --background: 0 0% 100%;
                  --foreground: 222.2 84% 4.9%;
                  --card: 0 0% 100%;
                  --card-foreground: 222.2 84% 4.9%;
                  --popover: 0 0% 100%;
                  --popover-foreground: 222.2 84% 4.9%;
                  --primary: 221.2 83.2% 53.3%;
                  --primary-foreground: 210 40% 98%;
                  --secondary: 210 40% 96.1%;
                  --secondary-foreground: 222.2 47.4% 11.2%;
                  --muted: 210 40% 96.1%;
                  --muted-foreground: 215.4 16.3% 46.9%;
                  --accent: 210 40% 96.1%;
                  --accent-foreground: 222.2 47.4% 11.2%;
                  --destructive: 0 84.2% 60.2%;
                  --destructive-foreground: 210 40% 98%;
                  --border: 214.3 31.8% 91.4%;
                  --input: 214.3 31.8% 91.4%;
                  --ring: 221.2 83.2% 53.3%;
                  --radius: 0.5rem;
                }
                
                /* Estilos CSS específicos del cliente (si existen) */
                ${homeCss || ''}
              </style>
            </head>
            <body>
              ${homeHtml}
            </body>
          </html>
        `);
        iframeDocument.close();
      }
    }
  }, [homeHtml, homeCss]);

  // Renderizar la barra de navegación
  const renderNavbar = () => {
    return (
      <header className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='container mx-auto px-4 py-3 flex justify-between items-center'>
          <div className='flex items-center space-x-4'>
            <h1 className='text-xl font-bold text-gray-800'>Website Builder</h1>
            {client && (
              <span className='text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full'>
                {client.name}
              </span>
            )}
          </div>
          <div className='flex items-center space-x-3'>
            <Link
              href='/'
              className='text-blue-600 hover:text-blue-800 text-sm font-medium'
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>
    );
  };

  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      {renderNavbar()}

      {isLoading ? (
        <div className='container mx-auto py-8 px-4'>
          <Skeleton className='h-96 w-full rounded-lg'>
            <div className='h-96 w-full rounded-lg bg-default-300 dark:bg-dark-border'></div>
          </Skeleton>
        </div>
      ) : error ? (
        <div className='container mx-auto py-8 px-4'>
          <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>
            <h2 className='text-lg font-semibold mb-2'>Error</h2>
            <p>{error}</p>
          </div>
        </div>
      ) : !homeHtml ? (
        <div className='container mx-auto py-8 px-4'>
          <div className='bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-lg text-center'>
            <h2 className='text-xl font-semibold mb-3'>
              No hay contenido HTML disponible
            </h2>
            <p className='mb-4'>
              No se encontró contenido HTML para este cliente en la columna
              home_html de la tabla client_website_config.
            </p>
            <p className='text-sm'>
              Por favor, asegúrate de que el cliente tenga una configuración de
              sitio web válida con contenido HTML.
            </p>
          </div>
        </div>
      ) : (
        <div
          className='flex-grow w-full'
          style={{ height: 'calc(100vh - 57px)' }}
        >
          <iframe
            ref={iframeRef}
            className='w-full h-full border-0'
            title='Website Preview'
            sandbox='allow-same-origin allow-scripts'
          />
        </div>
      )}
    </div>
  );
}
