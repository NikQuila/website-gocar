import React from 'react';
import { useNode } from '@craftjs/core';

interface VideoEmbedProps {
  videoUrl?: string;
  title?: string;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '21:9';
  maxWidth?: string;
}

const getEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId;
  if (url.includes('youtube.com/watch')) {
    videoId = url.split('v=')[1]?.split('&')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } else if (url.includes('vimeo.com/')) {
    videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  }
  return null; // Retorna null si no es una URL de video válida o no soportada
};

export const VideoEmbed = ({
  videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Ejemplo por defecto
  title = 'Título del Video',
  subtitle = 'Un subtítulo descriptivo para tu video.',
  bgColor = '#f7fafc', // gray-100
  textColor = '#1a202c', // gray-800
  aspectRatio = '16:9',
  maxWidth = '800px',
}: VideoEmbedProps) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const embedUrl = getEmbedUrl(videoUrl || '');

  const aspectRatioStyles: React.CSSProperties = {};
  if (aspectRatio === '16:9')
    aspectRatioStyles.paddingBottom = '56.25%'; // 16:9
  else if (aspectRatio === '4:3')
    aspectRatioStyles.paddingBottom = '75%'; // 4:3
  else if (aspectRatio === '1:1')
    aspectRatioStyles.paddingBottom = '100%'; // 1:1
  else if (aspectRatio === '21:9') aspectRatioStyles.paddingBottom = '42.85%'; // 21:9

  return (
    <div
      ref={(ref: HTMLDivElement) => connect(drag(ref))}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        padding: '40px 20px',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
        textAlign: 'center',
      }}
      data-cy='video-embed-section'
    >
      <div style={{ maxWidth: maxWidth, margin: '0 auto' }}>
        {title && (
          <h2 className='text-3xl font-bold mb-2' style={{ color: textColor }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className='text-lg mb-6 opacity-80' style={{ color: textColor }}>
            {subtitle}
          </p>
        )}

        {embedUrl ? (
          <div
            className='relative w-full overflow-hidden shadow-xl rounded-lg'
            style={aspectRatioStyles}
          >
            <iframe
              src={embedUrl}
              className='absolute top-0 left-0 w-full h-full'
              title={title || 'Video player'}
              frameBorder='0'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className='bg-gray-200 p-8 rounded-lg text-center text-gray-600'>
            <p>Por favor, ingresa una URL de video válida (YouTube o Vimeo).</p>
            <p className='text-sm mt-2'>
              Ej: https://www.youtube.com/watch?v=VIDEO_ID
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

VideoEmbed.craft = {
  displayName: 'Video Embed',
  props: {
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Título del Video Impactante',
    subtitle: 'Atrae a tus visitantes con contenido visual atractivo.',
    bgColor: '#f7fafc',
    textColor: '#1a202c',
    aspectRatio: '16:9',
    maxWidth: '800px',
  },

  rules: {
    canDrag: () => true,
  },
};
