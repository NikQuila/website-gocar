export const BUILDER_PAGES = [
  { slug: 'home', label: 'Inicio', route: '/' },
  { slug: 'financing', label: 'Financiamiento', route: '/financing' },
  { slug: 'consignments', label: 'Consignaciones', route: '/consignments' },
  { slug: 'buy-direct', label: 'Compra Directa', route: '/buy-direct' },
  { slug: 'we-search-for-you', label: 'Buscamos por Ti', route: '/we-search-for-you' },
  { slug: 'contact', label: 'Contacto', route: '/contact' },
  { slug: 'about', label: 'Nosotros', route: '/about' },
] as const;

export type PageSlug = typeof BUILDER_PAGES[number]['slug'];
