export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Hybrid', 'Electric', 'Gas'];
export const TRANSMISSION_TYPES = ['Automatic', 'Manual'];
export const CONDITION_TYPES = ['New', 'Used', 'Certified Pre-Owned'];

export const DEFAULT_CONFIG = {
  hero_cta: 'Explorar vehículos',
  hero_title: 'Encuentra tu próximo vehículo en',
  hero_subtitle:
    'Describe el vehículo de tus sueños y deja que nuestra IA encuentre las mejores opciones para ti.',
  why_us_title: 'Por qué elegirnos',
  why_us_subtitle: 'Descubre por qué somos la mejor opción',
  why_us_items: [
    {
      id: '1',
      icon: 'mdi:check-circle',
      title: 'Calidad garantizada',
      description: 'Todos nuestros vehículos pasan por rigurosas inspecciones',
    },
    {
      id: '2',
      icon: 'mdi:currency-usd',
      title: 'Mejores precios',
      description: 'Ofrecemos los precios más competitivos del mercado',
    },
    {
      id: '3',
      icon: 'mdi:handshake',
      title: 'Atención personalizada',
      description: 'Te ayudamos a encontrar el vehículo perfecto para ti',
    },
  ],
  theme: {
    primary_color: '#000000',
    secondary_color: '#ffffff',
    typography: 'Inter',
  },
  media: {
    background_image_url: '',
    video_url: '',
  },
  integrations: {
    google_reviews_enabled: false,
    pixel_id: '',
    gtm_id: '',
  },
};
