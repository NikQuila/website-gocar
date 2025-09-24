'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { TranslationKeys } from '../types';

/**
 * Hook personalizado para usar traducciones con tipado fuerte
 */
export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  // Función tipada para acceder a las traducciones
  const translate = (key: keyof TranslationKeys | string): string => {
    return t(key);
  };

  // Función para cambiar idioma
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return {
    t: translate,
    changeLanguage,
    currentLanguage: i18n.language,
    languages: i18n.languages,
    isReady: i18n.isInitialized,
  };
}

// === HOOKS PARA PÁGINAS ===

/**
 * Hook para traducciones de páginas
 */
export function usePageTranslations() {
  const { t } = useTranslation();

  return {
    home: {
      title: t('pages.home.title'),
      description: t('pages.home.description'),
    },
    vehicles: {
      title: t('pages.vehicles.title'),
      found: t('pages.vehicles.found'),
      searchPlaceholder: t('pages.vehicles.searchPlaceholder'),
      noResults: t('pages.vehicles.noResults'),
      noResultsDescription: t('pages.vehicles.noResultsDescription'),
      orderBy: t('pages.vehicles.orderBy'),
    },
    vehicleDetails: {
      loading: t('pages.vehicleDetails.loading'),
      notFound: t('pages.vehicleDetails.notFound'),
      backToVehicles: t('pages.vehicleDetails.backToVehicles'),
    },
    contact: {
      title: t('pages.contact.title'),
      subtitle: t('pages.contact.subtitle'),
      form: {
        name: t('pages.contact.form.name'),
        email: t('pages.contact.form.email'),
        phone: t('pages.contact.form.phone'),
        message: t('pages.contact.form.message'),
        send: t('pages.contact.form.send'),
        success: t('pages.contact.form.success'),
        error: t('pages.contact.form.error'),
      },
    },
    financing: {
      title: t('pages.financing.title'),
      subtitle: t('pages.financing.subtitle'),
      description: t('pages.financing.description'),
    },
    consignments: {
      title: t('pages.consignments.title'),
      subtitle: t('pages.consignments.subtitle'),
      description: t('pages.consignments.description'),
    },
    buyDirect: {
      title: t('pages.buyDirect.title'),
      subtitle: t('pages.buyDirect.subtitle'),
      description: t('pages.buyDirect.description'),
    },
    weSearchForYou: {
      title: t('pages.weSearchForYou.title'),
      subtitle: t('pages.weSearchForYou.subtitle'),
      description: t('pages.weSearchForYou.description'),
    },
  };
}

// === HOOKS PARA SECCIONES ===

/**
 * Hook para secciones de home
 */
export function useHomeSectionsTranslations() {
  const { t } = useTranslation();

  return {
    welcome: {
      title: t('sections.home.welcome.title'),
      description: t('sections.home.welcome.description'),
    },
    contactCTA: {
      title: t('sections.home.contactCTA.title'),
      subtitle: t('sections.home.contactCTA.subtitle'),
      button: t('sections.home.contactCTA.button'),
    },
    whyUs: {
      title: t('sections.home.whyUs.title'),
      subtitle: t('sections.home.whyUs.subtitle'),
    },
    howToArrive: {
      title: t('sections.home.howToArrive.title'),
      subtitle: t('sections.home.howToArrive.subtitle'),
      button: t('sections.home.howToArrive.button'),
    },
  };
}

/**
 * Hook para secciones de vehículos
 */
export function useVehicleSectionsTranslations() {
  const { t } = useTranslation();

  return {
    filters: {
      title: t('sections.vehicles.filters.title'),
      clearFilters: t('sections.vehicles.filters.clearFilters'),
      applyFilters: t('sections.vehicles.filters.applyFilters'),
      priceRange: t('sections.vehicles.filters.priceRange'),
      brand: t('sections.vehicles.filters.brand'),
      category: t('sections.vehicles.filters.category'),
      year: t('sections.vehicles.filters.year'),
      fuelType: t('sections.vehicles.filters.fuelType'),
      condition: t('sections.vehicles.filters.condition'),
      color: t('sections.vehicles.filters.color'),
    },
    categories: {
      all: t('sections.vehicles.categories.all'),
      suv: t('sections.vehicles.categories.suv'),
      sedan: t('sections.vehicles.categories.sedan'),
      hatchback: t('sections.vehicles.categories.hatchback'),
      pickup: t('sections.vehicles.categories.pickup'),
      van: t('sections.vehicles.categories.van'),
      coupe: t('sections.vehicles.categories.coupe'),
      wagon: t('sections.vehicles.categories.wagon'),
    },
    sorting: {
      dateDesc: t('sections.vehicles.sorting.dateDesc'),
      dateAsc: t('sections.vehicles.sorting.dateAsc'),
      priceAsc: t('sections.vehicles.sorting.priceAsc'),
      priceDesc: t('sections.vehicles.sorting.priceDesc'),
      yearDesc: t('sections.vehicles.sorting.yearDesc'),
      yearAsc: t('sections.vehicles.sorting.yearAsc'),
      mileageAsc: t('sections.vehicles.sorting.mileageAsc'),
    },
  };
}

// === HOOKS PARA COMPONENTES ===

/**
 * Hook para navegación (navbar)
 */
export function useNavigationTranslations() {
  const { t } = useTranslation();

  return {
    vehicles: t('components.navbar.vehicles'),
    buyDirect: t('components.navbar.buyDirect'),
    consignments: t('components.navbar.consignments'),
    financing: t('components.navbar.financing'),
    weSearchForYou: t('components.navbar.weSearchForYou'),
    contact: t('components.navbar.contact'),
  };
}

/**
 * Hook para tarjetas de vehículos
 */
export function useVehicleCardTranslations() {
  const { t } = useTranslation();

  return {
    year: t('components.vehicleCard.year'),
    mileage: t('components.vehicleCard.mileage'),
    price: t('components.vehicleCard.price'),
    viewDetails: t('components.vehicleCard.viewDetails'),
    contact: t('components.vehicleCard.contact'),
    reserved: t('components.vehicleCard.reserved'),
    sold: t('components.vehicleCard.sold'),
  };
}

/**
 * Hook para modal de cliente
 */
export function useCustomerModalTranslations() {
  const { t } = useTranslation();

  return {
    title: t('components.customerModal.title'),
    name: t('components.customerModal.name'),
    email: t('components.customerModal.email'),
    phone: t('components.customerModal.phone'),
    message: t('components.customerModal.message'),
    send: t('components.customerModal.send'),
    cancel: t('components.customerModal.cancel'),
    success: t('components.customerModal.success'),
    error: t('components.customerModal.error'),
  };
}

// === HOOKS PARA COMUNES ===

/**
 * Hook para acciones comunes
 */
export function useActionsTranslations() {
  const { t } = useTranslation();

  return {
    save: t('common.actions.save'),
    cancel: t('common.actions.cancel'),
    delete: t('common.actions.delete'),
    edit: t('common.actions.edit'),
    view: t('common.actions.view'),
    close: t('common.actions.close'),
    next: t('common.actions.next'),
    previous: t('common.actions.previous'),
    search: t('common.actions.search'),
    filter: t('common.actions.filter'),
    clear: t('common.actions.clear'),
    apply: t('common.actions.apply'),
    contact: t('common.actions.contact'),
    send: t('common.actions.send'),
  };
}

/**
 * Hook para estados comunes
 */
export function useStatesTranslations() {
  const { t } = useTranslation();

  return {
    loading: t('common.states.loading'),
    error: t('common.states.error'),
    success: t('common.states.success'),
    empty: t('common.states.empty'),
    notFound: t('common.states.notFound'),
  };
}

/**
 * Hook para formularios
 */
export function useFormsTranslations() {
  const { t } = useTranslation();

  return {
    required: t('common.forms.required'),
    invalidEmail: t('common.forms.invalidEmail'),
    invalidPhone: t('common.forms.invalidPhone'),
    minLength: t('common.forms.minLength'),
    maxLength: t('common.forms.maxLength'),
  };
}

// === HOOKS DE COMPATIBILIDAD (para migración gradual) ===

/**
 * Hook de compatibilidad para vehículos (mantiene API anterior)
 */
export function useVehiclesTranslations() {
  const pages = usePageTranslations();
  const sections = useVehicleSectionsTranslations();

  return {
    // Páginas
    title: pages.vehicles.title,
    found: pages.vehicles.found,
    searchPlaceholder: pages.vehicles.searchPlaceholder,
    noResults: pages.vehicles.noResults,
    noResultsDescription: pages.vehicles.noResultsDescription,
    orderBy: pages.vehicles.orderBy,

    // Secciones
    filters: sections.filters.title,
    clearFilters: sections.filters.clearFilters,
    applyFilters: sections.filters.applyFilters,
    categories: sections.categories,
    sorting: sections.sorting,
  };
}

/**
 * Hook de compatibilidad para home (mantiene API anterior)
 */
export function useHomeTranslations() {
  const sections = useHomeSectionsTranslations();

  return {
    hero: sections.welcome,
    contact: sections.contactCTA,
    whyUs: sections.whyUs,
    howToArrive: sections.howToArrive,
  };
}

/**
 * Hook de compatibilidad para comunes (mantiene API anterior)
 */
export function useCommonTranslations() {
  const actions = useActionsTranslations();
  const states = useStatesTranslations();

  return {
    ...actions,
    ...states,
  };
}
