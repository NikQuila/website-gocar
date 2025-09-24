// Idiomas disponibles
export const AVAILABLE_LANGUAGES = {
  ES: 'es',
  EN: 'en',
} as const;

export type Language =
  (typeof AVAILABLE_LANGUAGES)[keyof typeof AVAILABLE_LANGUAGES];

// Nombres de idiomas para mostrar en UI
export const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Español',
  en: 'English',
};

// Mapeo de idiomas a iconos de banderas circulares
export const LANGUAGE_FLAGS: Record<Language, string> = {
  es: 'circle-flags:es', // España
  en: 'circle-flags:us', // Estados Unidos
};

// Estructura de traducciones granular por archivos
export interface TranslationKeys {
  // === COMÚN ===
  common: {
    actions: {
      save: string;
      cancel: string;
      delete: string;
      edit: string;
      view: string;
      close: string;
      next: string;
      previous: string;
      search: string;
      filter: string;
      clear: string;
      apply: string;
      contact: string;
      send: string;
      share: string;
    };
    states: {
      loading: string;
      error: string;
      success: string;
      empty: string;
      notFound: string;
    };
    forms: {
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      minLength: string;
      maxLength: string;
    };
    currency: {
      clp: string;
      usd: string;
      eur: string;
    };
    units: {
      km: string;
      miles: string;
      year: string;
      years: string;
    };
  };

  // === FORMULARIOS ===
  forms: {
    validation: {
      required: string;
      invalidEmail: string;
      invalidPhone: string;
      minLength: string;
      maxLength: string;
    };
    fields: {
      name: string;
      fullName: string;
      email: string;
      phone: string;
      message: string;
      subject: string;
      company: string;
      address: string;
    };
    actions: {
      submit: string;
      reset: string;
      clear: string;
      save: string;
      cancel: string;
    };
    messages: {
      success: string;
      error: string;
      processing: string;
    };
  };

  // === NAVEGACIÓN ===
  navigation: {
    links: {
      home: string;
      vehicles: string;
      buyDirect: string;
      consignments: string;
      financing: string;
      weSearchForYou: string;
      contact: string;
    };
    breadcrumbs: {
      home: string;
      vehicles: string;
      vehicleDetails: string;
      contact: string;
      financing: string;
      consignments: string;
      buyDirect: string;
      weSearchForYou: string;
    };
    buttons: {
      menu: string;
      close: string;
      back: string;
      home: string;
    };
  };

  // === VEHÍCULOS ===
  vehicles: {
    page: {
      title: string;
      found: string;
      searchPlaceholder: string;
      noResults: string;
      noResultsDescription: string;
      orderBy: string;
    };
    details: {
      loading: string;
      notFound: string;
      backToVehicles: string;
      specifications: string;
      features: string;
      contact: string;
      description: string;
    };
    filters: {
      title: string;
      clearFilters: string;
      applyFilters: string;
      priceRange: string;
      brand: string;
      category: string;
      year: string;
      fuelType: string;
      condition: string;
      color: string;
      mileage: string;
    };
    categories: {
      all: string;
      suv: string;
      sedan: string;
      hatchback: string;
      pickup: string;
      van: string;
      coupe: string;
      wagon: string;
    };
    sorting: {
      dateDesc: string;
      dateAsc: string;
      priceAsc: string;
      priceDesc: string;
      yearDesc: string;
      yearAsc: string;
      mileageAsc: string;
    };
    card: {
      year: string;
      mileage: string;
      price: string;
      viewDetails: string;
      contact: string;
      reserved: string;
      sold: string;
      features: string;
      fuel: string;
      transmission: string;
      color: string;
    };
    status: {
      available: string;
      reserved: string;
      sold: string;
      pending: string;
    };
  };

  // === HOME ===
  home: {
    welcome: {
      title: string;
      description: string;
      searchButton: string;
      aiSearchPlaceholder: string;
    };
    whyUs: {
      title: string;
      subtitle: string;
      defaultFeatures: {
        quality: {
          title: string;
          description: string;
        };
        experience: {
          title: string;
          description: string;
        };
        service: {
          title: string;
          description: string;
        };
      };
    };
    contactCTA: {
      title: string;
      subtitle: string;
      button: string;
      phone: string;
      whatsapp: string;
    };
    howToArrive: {
      title: string;
      subtitle: string;
      button: string;
      address: string;
      hours: string;
      phone: string;
    };
    featuredVehicles: {
      title: string;
      subtitle: string;
      viewAll: string;
      noVehicles: string;
    };
  };
}
